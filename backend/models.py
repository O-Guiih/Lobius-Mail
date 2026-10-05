import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Text, BIGINT, DateTime, ForeignKey, Index
from sqlalchemy.orm import declarative_base, sessionmaker

# Lê a string de conexão do arquivo .env (se não achar, usa um padrão de fallback)
# Lembre-se de criar o arquivo .env na sua pasta e de trocar SUA_SENHA_AQUI pela sua senha do PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:553719@localhost:5432/lobius_mail")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# ---------------------------------------------------------
# [DB] Tabela: usuarios
# ---------------------------------------------------------
class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True) 
    email = Column(String, unique=True, nullable=False) 
    senha_hash = Column(String, nullable=False) 
    nivel_de_acesso = Column(String, nullable=False) # "admin" ou "comum"
    status = Column(Boolean, default=True) 
    data_criacao = Column(DateTime, default=datetime.utcnow) 

# ---------------------------------------------------------
# [DB] Tabela: arquivos_pst
# ---------------------------------------------------------
class ArquivoPST(Base):
    __tablename__ = "arquivos_pst"
    
    id = Column(Integer, primary_key=True, index=True) 
    nome_arquivo = Column(String, nullable=False) 
    tamanho_bytes = Column(BIGINT) 
    data_importacao = Column(DateTime, default=datetime.utcnow) 
    status_processamento = Column(String) 
    importado_por = Column(Integer, ForeignKey("usuarios.id")) 

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

# Índices (Indexes) exigidos para performance nas buscas do Front-end
Index('idx_remetente', Email.remetente)
Index('idx_assunto', Email.assunto)
Index('idx_data_envio', Email.data_envio)

# ---------------------------------------------------------
# Execução (Migrations e Seed)
# ---------------------------------------------------------
def init_db():
    print("Iniciando setup do banco de dados...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    # Inserção (Seed) dos usuários iniciais conforme o Trello
    if not db.query(Usuario).first():
        admin = Usuario(email="admin@lobius.com", senha_hash="hash_ficticia_1", nivel_de_acesso="admin")
        comum = Usuario(email="usuario@lobius.com", senha_hash="hash_ficticia_2", nivel_de_acesso="comum")
        db.add_all([admin, comum])
        db.commit()
        print("Usuários 'Seed' (admin e comum) inseridos com sucesso!")
    else:
        print("As tabelas já existem e os usuários já foram semeados anteriormente.")
    db.close()

if __name__ == "__main__":
    init_db()