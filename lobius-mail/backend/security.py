from functools import wraps

import jwt
from flask import current_app, g, jsonify, request
from sqlalchemy import func

from models import SessionLocal, Usuario


def _authenticate_request():
    authorization = request.headers.get("Authorization", "")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None, (jsonify({"mensagem": "Autenticação necessária."}), 401)

    try:
        payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
    except jwt.InvalidTokenError:
        return None, (jsonify({"mensagem": "Token inválido ou expirado."}), 401)

    db = SessionLocal()
    try:
        usuario_id = payload.get("usuarioId")
        consulta = db.query(Usuario)
        if usuario_id is not None:
            usuario = consulta.filter(Usuario.id == usuario_id).first()
        else:
            email = payload.get("email")
            usuario = (
                consulta.filter(func.lower(Usuario.email) == email.lower()).first()
                if isinstance(email, str)
                else None
            )

        if usuario is None or not usuario.status:
            return None, (jsonify({"mensagem": "Usuário não autorizado."}), 401)

        return {
            "id": usuario.id,
            "email": usuario.email,
            "nivel_de_acesso": usuario.nivel_de_acesso,
        }, None
    finally:
        db.close()


def auth_required(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        usuario, error = _authenticate_request()
        if error:
            return error
        g.usuario_atual = usuario
        return function(*args, **kwargs)

    return wrapper


def admin_required(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        usuario, error = _authenticate_request()
        if error:
            return error
        if usuario["nivel_de_acesso"].lower() not in {"admin", "administrador"}:
            return jsonify({"mensagem": "Acesso restrito a administradores."}), 403
        g.usuario_atual = usuario
        return function(*args, **kwargs)

    return wrapper