from flask import Blueprint, current_app, jsonify, request
from sqlalchemy import or_

from models import Email, SessionLocal
from security import auth_required

pesquisa_bp = Blueprint("pesquisa", __name__)


@pesquisa_bp.route("/api/pesquisar", methods=["GET"])
@auth_required
def pesquisar():
    consulta = request.args.get("q", "").strip()
    remetente = request.args.get("remetente", "").strip()
    assunto = request.args.get("assunto", "").strip()

    db = SessionLocal()
    try:
        query = db.query(Email)
        if consulta:
            termo = f"%{consulta}%"
            query = query.filter(or_(
                Email.remetente.ilike(termo),
                Email.destinatarios.ilike(termo),
                Email.assunto.ilike(termo),
                Email.corpo_texto.ilike(termo),
            ))
        if remetente:
            query = query.filter(Email.remetente.ilike(f"%{remetente}%"))
        if assunto:
            query = query.filter(Email.assunto.ilike(f"%{assunto}%"))

        emails = query.order_by(Email.data_envio.desc().nullslast(), Email.id.desc()).limit(200).all()
        return jsonify({
            "filtros": {"q": consulta, "remetente": remetente, "assunto": assunto},
            "resultados": [{
                "id": email.id,
                "remetente": email.remetente,
                "destinatarios": email.destinatarios,
                "assunto": email.assunto,
                "data_envio": email.data_envio.isoformat() if email.data_envio else None,
                "tem_anexo": email.tem_anexo,
                "arquivo_pst_id": email.arquivo_pst_id,
            } for email in emails],
        }), 200
    except Exception:
        current_app.logger.exception("Falha na pesquisa de e-mails")
        return jsonify({"mensagem": "Falha ao pesquisar e-mails."}), 500
    finally:
        db.close()