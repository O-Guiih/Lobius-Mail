from flask import Blueprint, request, jsonify

usuarios_bp = Blueprint("usuarios", __name__)

# Base de dados em memóriax' temporária (Mock) para não bloquear o Front-end
usuarios_mock = []
contador_id = 1

# CREATE - Criar novo usuario
@usuarios_bp.route("/api/usuarios", methods=["POST"])
def criar_usuario():
    global contador_id
    dados = request.json
    
    if not dados or "nome" not in dados or "email" not in dados:
        return jsonify({"erro": "Nome e e-mail são obrigatórios."}), 400
    
    novo_usuario = {
        "id": contador_id,
        "nome": dados["nome"],
        "email": dados["email"],
        "nivelDeAcesso": dados.get("nivelDeAcesso", "comum") # Assume "comum" se não for enviado
    }
    
    usuarios_mock.append(novo_usuario)
    contador_id += 1
    
    return jsonify({"mensagem": "Usuário criado com sucesso", "usuario": novo_usuario}), 201

# READ - Listar todos os usuario
@usuarios_bp.route("/api/usuarios", methods=["GET"])
def listar_usuarios():
    return jsonify(usuarios_mock), 200

# UPDATE - Atualizar um usuario existente
@usuarios_bp.route("/api/usuarios/<int:id>", methods=["PUT"])
def atualizar_usuario(id):
    dados = request.json
    
    for usuario in usuarios_mock:
        if usuario["id"] == id:
            usuario["nome"] = dados.get("nome", usuario["nome"])
            usuario["email"] = dados.get("email", usuario["email"])
            usuario["nivelDeAcesso"] = dados.get("nivelDeAcesso", usuario.get("nivelDeAcesso"))
            return jsonify({"mensagem": "Usuário atualizado com sucesso", "usuario": usuario}), 200
        
    return jsonify({"erro": "Usuario não encontrado"}), 404
    
    # DELETE - Apagar um Usuário
@usuarios_bp.route("/api/usuarios/<int:id>", methods=["DELETE"])
def deletar_usuario(id):
    global usuarios_mock
    tamanho_inicial = len(usuarios_mock)
        
    # Recria a lista excluindo o usuario com o ID passado
    usuarios_mock = [u for u in usuarios_mock if u["id"] != id]
        
    if len (usuarios_mock) < tamanho_inicial:
        return jsonify({"mensagem": "Usuário apagado com sucesso"}), 200
        
    return jsonify({"erro": "Usuário não encontrado"}), 404

