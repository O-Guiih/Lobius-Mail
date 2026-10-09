import datetime
import hmac

import jwt
from flask import Blueprint, current_app, jsonify, request
from sqlalchemy import func
from werkzeug.security import check_password_hash, generate_password_hash

from models import SessionLocal, Usuario


auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/login", methods=["POST"])
def login():
    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return jsonify({"mensagem": "Informe e-mail e senha."}), 400

    email = dados.get("email")
    senha_digitada = dados.get("senha")
    if not isinstance(email, str) or not isinstance(senha_digitada, str):
        return jsonify({"mensagem": "Informe e-mail e senha."}), 400

    email = email.strip().lower()
    if not email or not senha_digitada:
        return jsonify({"mensagem": "Informe e-mail e senha."}), 400

    db = SessionLocal()
    try:
        usuario = (
            db.query(Usuario)
            .filter(func.lower(Usuario.email) == email)
            .first()
        )

        if usuario is None or not usuario.status:
            return jsonify({"mensagem": "E-mail ou senha incorretos."}), 401

        senha_valida = check_password_hash(usuario.senha_hash, senha_digitada)
        if not senha_valida and hmac.compare_digest(usuario.senha_hash, senha_digitada):
            usuario.senha_hash = generate_password_hash(senha_digitada)
            db.commit()
            senha_valida = True

        if not senha_valida:
            return jsonify({"mensagem": "E-mail ou senha incorretos."}), 401

        nivel_acesso = usuario.nivel_de_acesso
        payload = {
            "usuarioId": usuario.id,
            "email": usuario.email,
            "nivelDeAcesso": nivel_acesso,
            "exp": datetime.datetime.now(datetime.timezone.utc)
            + datetime.timedelta(hours=2),
        }
        token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")

        return jsonify({
            "mensagem": "Login efetuado com sucesso",
            "token": token,
            "nivelDeAcesso": nivel_acesso,
        }), 200
    except Exception:
        current_app.logger.exception("Erro ao processar login")
        return jsonify({"mensagem": "Erro interno no servidor."}), 500
    finally:
        db.close()