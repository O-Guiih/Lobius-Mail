from flask import Blueprint, request, jsonify
import jwt
import datetime
import os
from dotenv import load_dotenv

# Carrega as variáveis do ficheiro .env para a memória
load_dotenv()


auth_bp = Blueprint("auth", __name__)

# Chave secreta para assinar o JWT (num projeto real, isto ficaria num ficheiro .env oculto)
SECRET_KEY = os.getenv("SECRET_KEY")

usuarios_bd = [
    {"email": "admin@projeto.com", "senha": "123", "nivelDeAcesso": "admin"},
    {"email": "comum@projeto.com", "senha": "123", "nivelDeAcesso": "comum"}
]

@auth_bp.route("/api/login", methods=["POST"])
def login():
    dados = request.json
    
    if not dados or "email" not in dados or "senha" not in dados:
        return jsonify({"erro": "E-mail e senha são obrigatórios."}), 400

    email = dados.get("email")
    senha = dados.get("senha")
    
    for u in usuarios_bd:
        if u["email"] == email and u["senha"] == senha:
            usuario_valido = u
            break
    
    payload = {
        "email": usuario_valido["email"],
        "nivelDeAcesso": usuario_valido["nivelDeAcesso"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    
    return jsonify({
        "mensagem": "Login efetuado com sucesso",
        "token": token,
        "nivelDeAcesso": usuario_valido["nivelDeAcesso"]
    }), 200