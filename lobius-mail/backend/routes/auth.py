from flask import Blueprint, request, jsonify
import jwt
import datetime
import os
from dotenv import load_dotenv

# Carrega as variáveis do ficheiro .env para a memória
load_dotenv()

auth_bp = Blueprint("auth", __name__)

# Chave secreta para assinar o JWT
SECRET_KEY = os.getenv("SECRET_KEY", "chave_secreta_padrao_dev")

# Usuários de teste (temporários enquanto o banco local está sendo populado)
usuarios_bd = [
    {"email": "admin@projeto.com", "senha": "123", "nivelDeAcesso": "admin"},
    {"email": "comum@projeto.com", "senha": "123", "nivelDeAcesso": "comum"}
]

@auth_bp.route("/api/login", methods=["POST"])
def login():
    dados = request.json
    
    if not dados or "email" not in dados or "senha" not in dados:
        return jsonify({"mensagem": "E-mail e senha são obrigatórios."}), 400

    email = dados.get("email")
    senha = dados.get("senha")
    
    usuario_valido = None

    # Busca o usuário na lista
    for u in usuarios_bd:
        if u["email"] == email and u["senha"] == senha:
            usuario_valido = u
            break
    
    # SE NÃO ENCONTRAR O USUÁRIO: Retorna 401 (Não Autorizado) de forma limpa!
    if not usuario_valido:
        return jsonify({"mensagem": "E-mail ou senha incorretos."}), 401
    
    # Se encontrou, gera o Token JWT normalmente
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