from flask import Flask
from flask_cors import CORS
from routes.pst import pst_bp

from routes.status import status_bp
from routes.pesquisa import pesquisa_bp
from routes.pst import pst_bp
from routes.auth import auth_bp
from routes.usuarios import usuarios_bp


app = Flask(__name__)


# Configuração do ticket para suportar arquivos "pesados" (ex: 500MB)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024 

# Conecta o arquivo pst.py que você acabou de criar
from routes.pst import pst_bp
app.register_blueprint(pst_bp)

CORS(app, origins=["http://localhost:5173"])

app.register_blueprint(status_bp)
app.register_blueprint(pesquisa_bp)
app.register_blueprint(pst_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(usuarios_bp)


@app.route("/")
def home():
    return "Lobios Mail - Back-end funcionando!"


if __name__ == "__main__":
    app.run(debug=True)