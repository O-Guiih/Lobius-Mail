import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Text, BIGINT, DateTime, ForeignKey, Index
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:553719@localhost:5432/lobius_mail")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

# ---------------------------------------------------------
# [DB] Tabela: usuarios
# ---------------------------------------------------------
class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False, default="Usuário")
    email = Column(String, unique=True, nullable=False) 
    senha_hash = Column(String, nullable=False) 
    nivel_de_acesso = Column(String, nullable=False) # "admin" ou "comum"
    status = Column(Boolean, default=True) 
    data_criacao = Column(DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "nivelDeAcesso": self.nivel_de_acesso,
            "status": "ativo" if self.status else "inativo"
        }

# ---------------------------------------------------------
# [DB] Tabela: arquivos_pst
# ---------------------------------------------------------
class ArquivoPST(Base):
    __tablename__ = "arquivos_pst"
    
    id = Column(Integer, primary_key=True, index=True) 
    nome_arquivo = Column(String, nullable=False) 
    tamanho_bytes = Column(BIGINT) 
    data_importacao = Column(DateTime, default=utcnow)
    status_processamento = Column(String) 
    importado_por = Column(Integer, ForeignKey("usuarios.id")) 
    caminho_arquivo = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "nome_arquivo": self.nome_arquivo,
            "tamanho_bytes": self.tamanho_bytes,
            "data_importacao": self.data_importacao.isoformat() if self.data_importacao else None,
            "status_processamento": self.status_processamento,
            "importado_por": self.importado_por,
        }

# ---------------------------------------------------------
# [DB] Tabela: emails
# ---------------------------------------------------------
class Email(Base):
    __tablename__ = "emails"
    
    id = Column(Integer, primary_key=True, index=True) 
    arquivo_pst_id = Column(Integer, ForeignKey("arquivos_pst.id")) 
    remetente = Column(String, nullable=False) 
    destinatarios = Column(Text) 
    assunto = Column(String) 
    corpo_texto = Column(Text) 
    data_envio = Column(DateTime)
    tem_anexo = Column(Boolean) 

Index('idx_remetente', Email.remetente)
Index('idx_assunto', Email.assunto)
Index('idx_data_envio', Email.data_envio)

def init_db():
    print("Iniciando setup do banco de dados...")
    Base.metadata.create_all(bind=engine)

    # Adiciona a coluna em bancos criados por versões anteriores do projeto.
    if engine.dialect.name == "postgresql":
        from sqlalchemy import text

        with engine.begin() as connection:
            connection.execute(text(
                "ALTER TABLE arquivos_pst ADD COLUMN IF NOT EXISTS caminho_arquivo TEXT"
            ))
    
    db = SessionLocal()
    try:
        if not db.query(Usuario).first():
            from werkzeug.security import generate_password_hash
            admin = Usuario(
                nome="Administrador",
                email="admin@lobius.com", 
                senha_hash=generate_password_hash("admin123"), 
                nivel_de_acesso="admin",
                status=True
            )
            comum = Usuario(
                nome="Usuário Comum",
                email="usuario@lobius.com", 
                senha_hash=generate_password_hash("123456"), 
                nivel_de_acesso="comum",
                status=True
            )
            db.add_all([admin, comum])
            db.commit()
            print("Usuários 'Seed' (admin e comum) inseridos no PostgreSQL!")
        else:
            print("As tabelas já existem e os usuários já foram semeados anteriormente.")
    except Exception as e:
        db.rollback()
        print(f"Erro no init_db: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()