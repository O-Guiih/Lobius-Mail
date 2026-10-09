import os

from flask import Flask, jsonify
from flask_cors import CORS
from routes.status import status_bp
from routes.dashboard import dashboard_bp
from routes.pesquisa import pesquisa_bp
from routes.pst import pst_bp
from routes.auth import auth_bp
from routes.usuarios import usuarios_bp
from models import init_db


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY", "dev-lobius-mail-secret-change-in-production"
)


# Configuração do ticket para suportar arquivos "pesados" (ex: 500MB)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024 


origens_frontend = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
)
CORS(app, origins=[origem.strip() for origem in origens_frontend.split(",") if origem.strip()])

app.register_blueprint(status_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(pesquisa_bp)
app.register_blueprint(pst_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(usuarios_bp)

init_db()


@app.errorhandler(413)
def arquivo_muito_grande(error):
    return jsonify({"mensagem": "Arquivo excede o limite de 500 MB."}), error.code


@app.route("/")
def home():
    return "Lobios Mail - Back-end funcionando!"


if __name__ == "__main__":
    app.run(debug=True)