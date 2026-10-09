import datetime
import io
import tempfile
import unittest
from pathlib import Path

import jwt
from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from werkzeug.security import check_password_hash, generate_password_hash

import routes.auth as auth_route
import routes.dashboard as dashboard_route
import routes.pesquisa as pesquisa_route
import routes.pst as pst_route
import routes.usuarios as usuarios_route
import security
from models import ArquivoPST, Base, Email, Usuario


class ApiIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.session_factory = sessionmaker(bind=self.engine)
        self.session_modules = (
            auth_route,
            dashboard_route,
            pesquisa_route,
            pst_route,
            usuarios_route,
            security,
        )
        self.original_session_factories = {
            module: module.SessionLocal for module in self.session_modules
        }
        for module in self.session_modules:
            module.SessionLocal = self.session_factory

        self.upload_directory = tempfile.TemporaryDirectory()
        self.original_upload_folder = pst_route.UPLOAD_FOLDER
        pst_route.UPLOAD_FOLDER = Path(self.upload_directory.name)

        session = self.session_factory()
        admin = Usuario(
            nome="Administrador",
            email="admin@example.com",
            senha_hash="legacy-admin-password",
            nivel_de_acesso="admin",
            status=True,
        )
        standard_user = Usuario(
            nome="Pessoa",
            email="pessoa@example.com",
            senha_hash=generate_password_hash("user-password"),
            nivel_de_acesso="comum",
            status=True,
        )
        session.add_all([admin, standard_user])
        session.flush()
        self.admin_id = admin.id
        self.standard_user_id = standard_user.id
        session.add(Email(
            remetente="sender@example.com",
            destinatarios="person@example.com",
            assunto="Arquivo anual",
            corpo_texto="mensagem de teste indexada",
            tem_anexo=False,
        ))
        session.commit()
        session.close()

        self.app = Flask(__name__)
        self.app.config["SECRET_KEY"] = "integration-tests-signing-key-at-least-32-bytes"
        for blueprint in (
            auth_route.auth_bp,
            dashboard_route.dashboard_bp,
            pesquisa_route.pesquisa_bp,
            pst_route.pst_bp,
            usuarios_route.usuarios_bp,
        ):
            self.app.register_blueprint(blueprint)
        self.client = self.app.test_client()

    def tearDown(self):
        pst_route.UPLOAD_FOLDER = self.original_upload_folder
        for module, factory in self.original_session_factories.items():
            module.SessionLocal = factory
        self.upload_directory.cleanup()
        self.engine.dispose()

    def make_token(self, user_id, email, role):
        return jwt.encode({
            "usuarioId": user_id,
            "email": email,
            "nivelDeAcesso": role,
            "exp": datetime.datetime.now(datetime.timezone.utc)
            + datetime.timedelta(minutes=5),
        }, self.app.config["SECRET_KEY"], algorithm="HS256")

    def test_login_migrates_legacy_password(self):
        response = self.client.post("/api/login", json={
            "email": " ADMIN@EXAMPLE.COM ",
            "senha": "legacy-admin-password",
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["nivelDeAcesso"], "admin")

        session = self.session_factory()
        admin = session.query(Usuario).filter_by(id=self.admin_id).one()
        self.assertNotEqual(admin.senha_hash, "legacy-admin-password")
        self.assertTrue(check_password_hash(admin.senha_hash, "legacy-admin-password"))
        session.close()

    def test_user_management_requires_admin(self):
        self.assertEqual(self.client.get("/api/usuarios").status_code, 401)
        user_token = self.make_token(self.standard_user_id, "pessoa@example.com", "comum")
        admin_token = self.make_token(self.admin_id, "admin@example.com", "admin")
        self.assertEqual(self.client.get(
            "/api/usuarios",
            headers={"Authorization": f"Bearer {user_token}"},
        ).status_code, 403)
        response = self.client.get(
            "/api/usuarios",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 2)

    def test_admin_cannot_lock_or_demote_self(self):
        token = self.make_token(self.admin_id, "admin@example.com", "admin")
        headers = {"Authorization": f"Bearer {token}"}
        deactivate = self.client.patch(
            f"/api/usuarios/{self.admin_id}/status",
            headers=headers,
            json={"status": "inativo"},
        )
        demote = self.client.put(
            f"/api/usuarios/{self.admin_id}",
            headers=headers,
            json={"nivelDeAcesso": "comum"},
        )
        self.assertEqual(deactivate.status_code, 400)
        self.assertEqual(demote.status_code, 400)

    def test_last_active_admin_cannot_be_removed_or_disabled(self):
        token = self.make_token(self.admin_id, "admin@example.com", "admin")
        headers = {"Authorization": f"Bearer {token}"}
        deactivate = self.client.patch(
            f"/api/usuarios/{self.admin_id}/status",
            headers=headers,
            json={"status": "inativo"},
        )
        delete = self.client.delete(f"/api/usuarios/{self.admin_id}", headers=headers)
        self.assertEqual(deactivate.status_code, 400)
        self.assertEqual(delete.status_code, 400)

    def test_deleting_user_preserves_archived_file_metadata(self):
        user_token = self.make_token(self.standard_user_id, "pessoa@example.com", "comum")
        admin_token = self.make_token(self.admin_id, "admin@example.com", "admin")
        upload = self.client.post(
            "/api/pst/importar",
            headers={"Authorization": f"Bearer {user_token}"},
            data={"arquivo": (io.BytesIO(b"account archive fixture"), "account.pst")},
            content_type="multipart/form-data",
        )
        self.assertEqual(upload.status_code, 201)

        delete = self.client.delete(
            f"/api/usuarios/{self.standard_user_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        self.assertEqual(delete.status_code, 200)
        session = self.session_factory()
        archive = session.query(ArquivoPST).one()
        self.assertIsNone(archive.importado_por)
        self.assertTrue(Path(archive.caminho_arquivo).is_file())
        session.close()

    def test_upload_archive_download_and_dashboard(self):
        token = self.make_token(self.admin_id, "admin@example.com", "admin")
        headers = {"Authorization": f"Bearer {token}"}
        upload = self.client.post(
            "/api/pst/importar",
            headers=headers,
            data={"arquivo": (io.BytesIO(b"synthetic PST fixture"), "mailbox.pst")},
            content_type="multipart/form-data",
        )
        self.assertEqual(upload.status_code, 201)
        self.assertEqual(upload.json["arquivo"]["status_processamento"], "Armazenado")

        archive_id = upload.json["arquivo"]["id"]
        listing = self.client.get("/api/arquivos-pst", headers=headers)
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(listing.json[0]["nome_arquivo"], "mailbox.pst")

        download = self.client.get(
            f"/api/arquivos-pst/{archive_id}/download", headers=headers
        )
        self.assertEqual(download.status_code, 200)
        self.assertEqual(download.data, b"synthetic PST fixture")

        dashboard = self.client.get("/api/dashboard", headers=headers)
        self.assertEqual(dashboard.status_code, 200)
        self.assertEqual(dashboard.json["totalEmails"], 1)
        self.assertEqual(dashboard.json["totalArquivos"], 1)

    def test_delete_archive_removes_file_metadata_and_related_emails(self):
        token = self.make_token(self.admin_id, "admin@example.com", "admin")
        headers = {"Authorization": f"Bearer {token}"}
        upload = self.client.post(
            "/api/pst/importar",
            headers=headers,
            data={"arquivo": (io.BytesIO(b"delete fixture"), "delete-me.pst")},
            content_type="multipart/form-data",
        )
        self.assertEqual(upload.status_code, 201)
        archive_id = upload.json["arquivo"]["id"]

        session = self.session_factory()
        session.add(Email(
            arquivo_pst_id=archive_id,
            remetente="archive@example.com",
            assunto="Related message",
        ))
        session.commit()
        stored_path = session.query(ArquivoPST).filter_by(id=archive_id).one().caminho_arquivo
        session.close()

        response = self.client.delete(f"/api/arquivos-pst/{archive_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Path(stored_path).exists())

        session = self.session_factory()
        self.assertIsNone(session.query(ArquivoPST).filter_by(id=archive_id).first())
        self.assertEqual(session.query(Email).filter_by(arquivo_pst_id=archive_id).count(), 0)
        session.close()

    def test_non_admin_cannot_delete_archive(self):
        token = self.make_token(self.standard_user_id, "pessoa@example.com", "comum")
        response = self.client.delete(
            "/api/arquivos-pst/1",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(response.status_code, 403)

    def test_search_reads_indexed_email_data(self):
        token = self.make_token(self.standard_user_id, "pessoa@example.com", "comum")
        response = self.client.get(
            "/api/pesquisar?q=indexada",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json["resultados"]), 1)
        self.assertEqual(response.json["resultados"][0]["remetente"], "sender@example.com")

    def test_upload_rejects_non_pst(self):
        token = self.make_token(self.admin_id, "admin@example.com", "admin")
        response = self.client.post(
            "/api/pst/importar",
            headers={"Authorization": f"Bearer {token}"},
            data={"arquivo": (io.BytesIO(b"not PST"), "mailbox.txt")},
            content_type="multipart/form-data",
        )
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()