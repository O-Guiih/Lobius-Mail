from flask import Blueprint, request, jsonify

pesquisa_bp = Blueprint("pesquisa", __name__)


@pesquisa_bp.route("/api/pesquisar", methods=["GET"])
def pesquisar():
    remetente = request.args.get("remetente")
    palavra_chave = request.args.get("palavra_chave")

    return jsonify({
        "filtros": {
            "remetente": remetente,
            "palavra_chave": palavra_chave
        },
        "resultados": []
    })