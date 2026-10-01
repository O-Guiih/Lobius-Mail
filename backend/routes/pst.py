from flask import Blueprint, jsonify

pst_bp = Blueprint("pst", __name__)


@pst_bp.route("/api/pst", methods=["GET"])
def listar_pst():
    arquivos = [
        {
            "nome": "arquivo_2025.pst",
            "tamanho": "1.2 GB",
            "dataImportacao": "2026-09-15",
            "status": "Processado"
        },
        {
            "nome": "arquivo_2024.pst",
            "tamanho": "850 MB",
            "dataImportacao": "2026-09-18",
            "status": "Processado"
        }
    ]

    return jsonify(arquivos)