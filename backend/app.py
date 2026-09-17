from flask import Flask
from flask_cors import CORS

from routes.status import status_bp


app = Flask(__name__)

CORS(app, origins=["http://localhost:5173"])

app.register_blueprint(status_bp)


@app.route("/")
def home():
    return "Lobios Mail - Back-end funcionando!"


if __name__ == "__main__":
    app.run(debug=True)