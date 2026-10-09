import os
import uuid
from pathlib import Path

from flask import Blueprint, current_app, g, jsonify, request, send_file
from werkzeug.utils import secure_filename

from models import ArquivoPST, Email, SessionLocal
from security import admin_required, auth_required


pst_bp = Blueprint("pst", __name__)
UPLOAD_FOLDER = Path(__file__).resolve().parents[1] / "temp_uploads"
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

@pst_bp.route("/api/pst/importar", methods=["POST"])
@auth_required
def importar_pst():
    if "arquivo" not in request.files:
        return jsonify({"mensagem": "Nenhum arquivo foi enviado."}), 400

    arquivo = request.files["arquivo"]
    nome_original = secure_filename(arquivo.filename or "")
    if not nome_original:
        return jsonify({"mensagem": "Nome de arquivo inválido."}), 400
    if Path(nome_original).suffix.lower() != ".pst":
        return jsonify({"mensagem": "Apenas arquivos .pst são permitidos."}), 400

    identificador_arquivo = f"{uuid.uuid4().hex}.pst"
    caminho = UPLOAD_FOLDER / identificador_arquivo
    db = SessionLocal()
    try:
        arquivo.save(caminho)
        tamanho_real_bytes = caminho.stat().st_size
        registro = ArquivoPST(
            nome_arquivo=nome_original,
            tamanho_bytes=tamanho_real_bytes,
            status_processamento="Armazenado",
            importado_por=g.usuario_atual["id"],
            caminho_arquivo=str(caminho),
        )
        db.add(registro)
        db.commit()
        db.refresh(registro)
        return jsonify({
            "mensagem": "Arquivo PST armazenado com sucesso.",
            "arquivo": registro.to_dict(),
        }), 201
    except Exception:
        db.rollback()
        if caminho.exists():
            caminho.unlink()
        current_app.logger.exception("Falha ao armazenar arquivo PST")
        return jsonify({"mensagem": "Falha ao armazenar o arquivo PST."}), 500
    finally:
        db.close()


@pst_bp.route("/api/arquivos-pst", methods=["GET"])
@auth_required
def listar_arquivos_pst():
    db = SessionLocal()
    try:
        arquivos = (
            db.query(ArquivoPST)
            .order_by(ArquivoPST.data_importacao.desc(), ArquivoPST.id.desc())
            .all()
        )
        return jsonify([arquivo.to_dict() for arquivo in arquivos]), 200
    except Exception:
        current_app.logger.exception("Falha ao listar arquivos PST")
        return jsonify({"mensagem": "Falha ao carregar os arquivos PST."}), 500
    finally:
        db.close()


@pst_bp.route("/api/arquivos-pst/<int:arquivo_id>/download", methods=["GET"])
@auth_required
def baixar_arquivo_pst(arquivo_id):
    db = SessionLocal()
    try:
        arquivo = db.query(ArquivoPST).filter(ArquivoPST.id == arquivo_id).first()
        if arquivo is None or not arquivo.caminho_arquivo:
            return jsonify({"mensagem": "Arquivo não encontrado."}), 404
        caminho = Path(arquivo.caminho_arquivo)
        if not caminho.is_file():
            return jsonify({"mensagem": "O arquivo não está disponível no armazenamento."}), 404
        return send_file(caminho, as_attachment=True, download_name=arquivo.nome_arquivo)
    except Exception:
        current_app.logger.exception("Falha ao baixar arquivo PST")
        return jsonify({"mensagem": "Falha ao baixar o arquivo PST."}), 500
    finally:
        db.close()


@pst_bp.route("/api/arquivos-pst/<int:arquivo_id>", methods=["DELETE"])
@admin_required
def excluir_arquivo_pst(arquivo_id):
    db = SessionLocal()
    caminho_original = None
    caminho_temporario = None
    try:
        arquivo = db.query(ArquivoPST).filter(ArquivoPST.id == arquivo_id).first()
        if arquivo is None:
            return jsonify({"mensagem": "Arquivo PST não encontrado."}), 404

        if arquivo.caminho_arquivo:
            caminho_original = Path(arquivo.caminho_arquivo).resolve()
            pasta_upload = UPLOAD_FOLDER.resolve()
            if caminho_original.parent != pasta_upload:
                return jsonify({"mensagem": "O caminho do arquivo não pertence ao armazenamento PST."}), 400
            if caminho_original.exists():
                if not caminho_original.is_file():
                    return jsonify({"mensagem": "O caminho armazenado não é um arquivo válido."}), 400
                caminho_temporario = caminho_original.with_name(
                    f".{caminho_original.name}.{uuid.uuid4().hex}.deleting"
                )
                os.replace(caminho_original, caminho_temporario)

        db.query(Email).filter(Email.arquivo_pst_id == arquivo.id).delete(
            synchronize_session=False
        )
        db.delete(arquivo)
        db.commit()

        if caminho_temporario is not None:
            try:
                caminho_temporario.unlink(missing_ok=True)
            except OSError:
                current_app.logger.exception("Não foi possível remover o arquivo PST temporário")

        return jsonify({"mensagem": "Arquivo PST e dados relacionados excluídos."}), 200
    except Exception:
        db.rollback()
        if caminho_temporario is not None and caminho_temporario.exists() and caminho_original is not None:
            os.replace(caminho_temporario, caminho_original)
        current_app.logger.exception("Falha ao excluir arquivo PST")
        return jsonify({"mensagem": "Falha ao excluir o arquivo PST."}), 500
    finally:
        db.close()
