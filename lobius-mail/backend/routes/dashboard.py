from flask import Blueprint, current_app, jsonify
from sqlalchemy import func

from models import ArquivoPST, Email, SessionLocal
from security import auth_required


dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/api/dashboard", methods=["GET"])
@auth_required
def dashboard():
    db = SessionLocal()
    try:
        total_emails = db.query(func.count(Email.id)).scalar() or 0
        total_arquivos = db.query(func.count(ArquivoPST.id)).scalar() or 0
        total_bytes = db.query(func.coalesce(func.sum(ArquivoPST.tamanho_bytes), 0)).scalar() or 0
        recentes = (
            db.query(ArquivoPST)
            .order_by(ArquivoPST.data_importacao.desc(), ArquivoPST.id.desc())
            .limit(5)
            .all()
        )
        return jsonify({
            "totalEmails": total_emails,
            "totalArquivos": total_arquivos,
            "armazenamentoBytes": total_bytes,
            "arquivosRecentes": [arquivo.to_dict() for arquivo in recentes],
        }), 200
    except Exception:
        current_app.logger.exception("Falha ao carregar dashboard")
        return jsonify({"mensagem": "Falha ao carregar o dashboard."}), 500
    finally:
        db.close()