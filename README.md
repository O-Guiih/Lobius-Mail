# Lobius-Mail

Aplicação web full-stack para autenticação e gerenciamento de usuários, armazenamento de arquivos PST e consulta de mensagens de e-mail indexadas.

## Funcionalidades

- Login com token JWT e controle de acesso por perfil.
- Painel com métricas de arquivos armazenados, espaço utilizado e mensagens indexadas.
- Gerenciamento administrativo de usuários: cadastro, edição, ativação, desativação e exclusão.
- Upload de arquivos `.pst`, com limite de 500 MB por arquivo.
- Histórico de arquivos arquivados, download e exclusão administrativa.
- Pesquisa de mensagens já registradas no banco por remetente, assunto ou texto.

> **Estado do processamento PST:** o sistema armazena o arquivo original e seus metadados no servidor. A extração das mensagens de dentro do PST e sua indexação automática ainda não estão implementadas. A pesquisa consulta mensagens que já existam na tabela `emails`.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Radix UI |
| Backend | Python, Flask, SQLAlchemy, PyJWT |
| Banco de dados | PostgreSQL |
| Desenvolvimento | Git, GitHub, VS Code |

## Estrutura do repositório

```text
Lobius-Mail/
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── requirements.txt
│   ├── routes/
│   └── tests/
└── frontend/
	├── package.json
	└── src/
```

## Pré-requisitos

- Git.
- Python 3.10 ou superior.
- Node.js compatível com Vite 8 e npm.
- PostgreSQL instalado e em execução.

## Instalação e execução

### 1. Banco de dados

Crie um banco PostgreSQL chamado `lobius_mail`. Por exemplo, usando `psql`:

```bash
psql -U postgres -c "CREATE DATABASE lobius_mail;"
```

Configure o backend copiando o arquivo de exemplo e atualizando os valores:

```powershell
Copy-Item backend/.env.example backend/.env
```

Edite `backend/.env` e configure:

```dotenv
DATABASE_URL=postgresql+psycopg2://USUARIO:SENHA@localhost:5432/lobius_mail
SECRET_KEY=SUBSTITUA_POR_UMA_CHAVE_ALEATORIA_LONGA
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Use uma `SECRET_KEY` forte, aleatória e exclusiva. Não publique o arquivo `.env` nem reutilize a chave de exemplo em produção.

### 2. Backend

No PowerShell, a partir da raiz do repositório:

```powershell
py -3 -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
backend/.venv/Scripts/python.exe backend/app.py
```

O Flask fica disponível em `http://localhost:5000`. Na inicialização, as tabelas são criadas automaticamente. Em um banco vazio, o projeto cria contas de desenvolvimento:

- Administrador: `admin@lobius.com` / `admin123`
- Usuário comum: `usuario@lobius.com` / `123456`

Essas credenciais são somente para desenvolvimento local. Troque-as antes de qualquer uso compartilhado ou implantação.

### 3. Frontend

Abra outro terminal na raiz do repositório:

```powershell
Copy-Item frontend/.env.example frontend/.env
cd frontend
npm install
npm run dev
```

O Vite inicia normalmente em `http://localhost:5173`. A variável `VITE_API_URL` em `frontend/.env` define o endereço do backend; por padrão, é `http://localhost:5000`.

## Testes e validação

Execute os testes do backend a partir da pasta `backend`:

```powershell
cd backend
.venv/Scripts/python.exe -m unittest discover -s tests -v
```

Build e lint do frontend:

```powershell
cd frontend
npm run build
npm run lint
```

Os testes do backend usam SQLite temporário e arquivos sintéticos; não precisam alterar o PostgreSQL local.

## Segurança e armazenamento

- As senhas são armazenadas como hashes, nunca como texto puro.
- As rotas protegidas exigem JWT; o gerenciamento de usuários e a exclusão de PST são restritos a administradores.
- Os arquivos enviados ficam em `backend/temp_uploads/`; mantenha backups desse diretório junto com os backups do banco.
- O servidor Flask iniciado por `python app.py` é para desenvolvimento. Em produção, use um servidor WSGI, HTTPS, uma chave secreta segura e uma política de backup apropriada.

## Autores

- [O-Guiih](https://github.com/O-Guiih)
- [JoaoVitor5](https://github.com/JoaoVitor5)
- [JeamSZa](https://github.com/JeamSZa)
