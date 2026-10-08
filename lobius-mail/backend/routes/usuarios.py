from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models import SessionLocal, Usuario, Base, engine

usuarios_bp = Blueprint("usuarios", __name__)


# =========================================================================
# SEED INICIAL DO ADMIN
# =========================================================================
def seed_admin_inicial():
    """Garante que as tabelas existam e insere o admin inicial se o banco estiver vazio."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Usuario).count() == 0:
            admin = Usuario(
                nome="Administrador",
                email="admin@escritorio.com",
                senha_hash=generate_password_hash("admin123"),
                nivel_de_acesso="admin",
                status=True
            )
            db.add(admin)
            db.commit()
            print("✅ Seed: Administrador gerado no PostgreSQL (admin@escritorio.com)")
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao executar seed_admin_inicial: {e}")
    finally:
        db.close()


# =========================================================================
# ROTAS CRUD
# =========================================================================

# READ - Listar todos os usuários
@usuarios_bp.route("/api/usuarios", methods=["GET"])
def listar_usuarios():
    db = SessionLocal()
    try:
        usuarios = db.query(Usuario).order_by(Usuario.id.asc()).all()
        return jsonify([u.to_dict() for u in usuarios]), 200
    except Exception as e:
        return jsonify({"erro": f"Erro ao listar usuários: {str(e)}"}), 500
    finally:
        db.close()


# CREATE - Cadastrar novo usuário
@usuarios_bp.route("/api/usuarios", methods=["POST"])
def criar_usuario():
    dados = request.get_json() or {}
    nome = dados.get("nome")
    email = dados.get("email")
    senha = dados.get("senha", "123456")

    if not nome or not email:
        return jsonify({"erro": "Nome e e-mail são obrigatórios."}), 400

    db = SessionLocal()
    try:
        usuario_existente = db.query(Usuario).filter(Usuario.email == email).first()
        if usuario_existente:
            return jsonify({"erro": "Este e-mail já está cadastrado."}), 400

        novo_usuario = Usuario(
            nome=nome,
            email=email,
            senha_hash=generate_password_hash(senha),
            nivel_de_acesso=dados.get("nivelDeAcesso", "comum"),
            status=True
        )
        db.add(novo_usuario)
        db.commit()
        db.refresh(novo_usuario)

        return jsonify(novo_usuario.to_dict()), 201
    except Exception as e:
        db.rollback()
        return jsonify({"erro": f"Erro ao criar usuário: {str(e)}"}), 500
    finally:
        db.close()


# UPDATE - Atualizar um usuário
@usuarios_bp.route("/api/usuarios/<int:id>", methods=["PUT"])
def atualizar_usuario(id):
    dados = request.get_json() or {}

    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter(Usuario.id == id).first()
        if not usuario:
            return jsonify({"erro": "Usuário não encontrado"}), 404

        usuario.nome = dados.get("nome", usuario.nome)
        usuario.email = dados.get("email", usuario.email)
        usuario.nivel_de_acesso = dados.get("nivelDeAcesso", usuario.nivel_de_acesso)

        db.commit()
        db.refresh(usuario)
        return jsonify(usuario.to_dict()), 200
    except Exception as e:
        db.rollback()
        return jsonify({"erro": f"Erro ao atualizar usuário: {str(e)}"}), 500
    finally:
        db.close()


# PATCH - Alternar status (ativo / inativo)
@usuarios_bp.route("/api/usuarios/<int:id>/status", methods=["PATCH"])
def alterar_status(id):
    dados = request.get_json() or {}
    novo_status = dados.get("status")  # pode vir "ativo" ou "inativo"

    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter(Usuario.id == id).first()
        if not usuario:
            return jsonify({"erro": "Usuário não encontrado"}), 404

        if novo_status is not None:
            usuario.status = True if novo_status == "ativo" else False
        else:
            usuario.status = not usuario.status

        db.commit()
        return jsonify({"id": usuario.id, "status": "ativo" if usuario.status else "inativo"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"erro": f"Erro ao alterar status: {str(e)}"}), 500
    finally:
        db.close()


# DELETE - Remover usuário
@usuarios_bp.route("/api/usuarios/<int:id>", methods=["DELETE"])
def deletar_usuario(id):
    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter(Usuario.id == id).first()
        if not usuario:
            return jsonify({"erro": "Usuário não encontrado"}), 404

        db.delete(usuario)
        db.commit()
        return jsonify({"mensagem": "Usuário apagado com sucesso"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"erro": f"Erro ao deletar usuário: {str(e)}"}), 500
    finally:
        db.close()