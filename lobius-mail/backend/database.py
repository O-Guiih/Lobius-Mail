from models import engine


def conectar_banco():
    return engine.connect()