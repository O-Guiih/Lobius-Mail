from flask import Blueprint, g, request, jsonify
from sqlalchemy import func
from werkzeug.security import generate_password_hash
from models import ArquivoPST, SessionLocal, Usuario, init_db
from security import admin_required

usuarios_bp = Blueprint("usuarios", __name__)


# =========================================================================
# SEED INICIAL DO ADMIN
# =========================================================================
def seed_admin_inicial():
    """Mantém o ponto de entrada legado e usa o seed único definido nos modelos."""
    init_db()


# =========================================================================
# ROTAS CRUD
# =========================================================================

# READ - Listar todos os usuários
@usuarios_bp.route("/api/usuarios", methods=["GET"])
@admin_required
def listar_usuarios():
    db = SessionLocal()
    try:
        usuarios = db.query(Usuario).order_by(Usuario.id.asc()).all()
        return jsonify([u.to_dict() for u in usuarios]), 200
    except Exception:
        return jsonify({"mensagem": "Erro ao listar usuários."}), 500
    finally:
        db.close()


# CREATE - Cadastrar novo usuário
@usuarios_bp.route("/api/usuarios", methods=["POST"])
@admin_required
def criar_usuario():
    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return jsonify({"mensagem": "Corpo JSON inválido."}), 400
    nome = dados.get("nome", "").strip() if isinstance(dados.get("nome"), str) else ""
    email = dados.get("email", "").strip().lower() if isinstance(dados.get("email"), str) else ""
    senha = dados.get("senha")
    nivel = dados.get("nivelDeAcesso", "comum")

    if not nome or not email or not isinstance(senha, str) or not senha:
        return jsonify({"mensagem": "Nome, e-mail e senha são obrigatórios."}), 400
    if nivel not in {"admin", "comum"}:
        return jsonify({"mensagem": "Nível de acesso inválido."}), 400

    db = SessionLocal()
    try:
        usuario_existente = db.query(Usuario).filter(func.lower(Usuario.email) == email).first()
        if usuario_existente:
            return jsonify({"mensagem": "Este e-mail já está cadastrado."}), 409

        novo_usuario = Usuario(
            nome=nome,
            email=email,
            senha_hash=generate_password_hash(senha),
            nivel_de_acesso=nivel,
            status=True
        )
        db.add(novo_usuario)
        db.commit()
        db.refresh(novo_usuario)

        return jsonify(novo_usuario.to_dict()), 201
    except Exception:
        db.rollback()
        return jsonify({"mensagem": "Erro ao criar usuário."}), 500
    finally:
        db.close()


# UPDATE - Atualizar um usuário
@usuarios_bp.route("/api/usuarios/<int:id>", methods=["PUT"])
@admin_required
def atualizar_usuario(id):
    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return jsonify({"mensagem": "Corpo JSON inválido."}), 400

    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter(Usuario.id == id).first()
        if not usuario:
            return jsonify({"erro": "Usuário não encontrado"}), 404

        nome = dados.get("nome", usuario.nome)
        email = dados.get("email", usuario.email)
        nivel = dados.get("nivelDeAcesso", usuario.nivel_de_acesso)
        if not isinstance(nome, str) or not nome.strip():
            return jsonify({"mensagem": "Nome inválido."}), 400
        if not isinstance(email, str) or not email.strip():
            return jsonify({"mensagem": "E-mail inválido."}), 400
        if nivel not in {"admin", "comum"}:
            return jsonify({"mensagem": "Nível de acesso inválido."}), 400
        if usuario.id == g.usuario_atual["id"] and nivel != "admin":
            return jsonify({"mensagem": "Não é possível remover o próprio acesso de administrador."}), 400
        if usuario.nivel_de_acesso == "admin" and nivel != "admin" and usuario.status:
            administradores_ativos = db.query(Usuario).filter(
                Usuario.nivel_de_acesso == "admin",
                Usuario.status.is_(True),
            ).count()
            if administradores_ativos <= 1:
                return jsonify({"mensagem": "O sistema precisa manter um administrador ativo."}), 409

        email = email.strip().lower()
        duplicado = db.query(Usuario).filter(
            func.lower(Usuario.email) == email,
            Usuario.id != usuario.id,
        ).first()
        if duplicado:
            return jsonify({"mensagem": "Este e-mail já está cadastrado."}), 409

        usuario.nome = nome.strip()
        usuario.email = email
        usuario.nivel_de_acesso = nivel

        db.commit()
        db.refresh(usuario)
        return jsonify(usuario.to_dict()), 200
    except Exception:
        db.rollback()
        return jsonify({"mensagem": "Erro ao atualizar usuário."}), 500
    finally:
        db.close()


# PATCH - Alternar status (ativo / inativo)
@usuarios_bp.route("/api/usuarios/<int:id>/status", methods=["PATCH"])
@admin_required
def alterar_status(id):
    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return jsonify({"mensagem": "Corpo JSON inválido."}), 400
    novo_status = dados.get("status")  # pode vir "ativo" ou "inativo"

    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter(Usuario.id == id).first()
        if not usuario:
            return jsonify({"erro": "Usuário não encontrado"}), 404

        if novo_status is not None and novo_status not in {"ativo", "inativo"}:
            return jsonify({"mensagem": "Status inválido."}), 400

        status_final = novo_status == "ativo" if novo_status is not None else not usuario.status
        if usuario.id == g.usuario_atual["id"] and not status_final:
            return jsonify({"mensagem": "Não é possível desativar a própria conta."}), 400
        if usuario.nivel_de_acesso == "admin" and usuario.status and not status_final:
            administradores_ativos = db.query(Usuario).filter(
                Usuario.nivel_de_acesso == "admin",
                Usuario.status.is_(True),
            ).count()
            if administradores_ativos <= 1:
                return jsonify({"mensagem": "O sistema precisa manter um administrador ativo."}), 409

        if novo_status is not None:
            usuario.status = status_final
        else:
            usuario.status = not usuario.status

        db.commit()
        return jsonify({"id": usuario.id, "status": "ativo" if usuario.status else "inativo"}), 200
    except Exception:
        db.rollback()
        return jsonify({"mensagem": "Erro ao alterar status."}), 500
    finally:
        db.close()


# DELETE - Remover usuário
@usuarios_bp.route("/api/usuarios/<int:id>", methods=["DELETE"])
@admin_required
def deletar_usuario(id):
    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter(Usuario.id == id).first()
        if not usuario:
            return jsonify({"erro": "Usuário não encontrado"}), 404

        if usuario.id == g.usuario_atual["id"]:
            return jsonify({"mensagem": "Não é possível excluir a própria conta."}), 400
        if usuario.nivel_de_acesso == "admin" and usuario.status:
            administradores_ativos = db.query(Usuario).filter(
                Usuario.nivel_de_acesso == "admin",
                Usuario.status.is_(True),
            ).count()
            if administradores_ativos <= 1:
                return jsonify({"mensagem": "O sistema precisa manter um administrador ativo."}), 409

        db.query(ArquivoPST).filter(ArquivoPST.importado_por == usuario.id).update(
            {ArquivoPST.importado_por: None}, synchronize_session=False
        )
        db.delete(usuario)
        db.commit()
        return jsonify({"mensagem": "Usuário apagado com sucesso"}), 200
    except Exception:
        db.rollback()
        return jsonify({"mensagem": "Erro ao deletar usuário."}), 500
    finally:
        db.close()