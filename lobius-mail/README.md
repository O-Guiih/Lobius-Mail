# Lobius Mail

Aplicação local para arquivar arquivos PST, gerenciar usuários e pesquisar e-mails já indexados.

## Configuração

1. Configure o PostgreSQL e crie o banco `lobius_mail`.
2. Copie `backend/.env.example` para `backend/.env` e configure `DATABASE_URL` e `SECRET_KEY`.
3. Instale e inicie o backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

4. Em outro terminal, instale e inicie o frontend:

```powershell
cd frontend
npm install
npm run dev
```

O backend cria as tabelas ao iniciar. Em banco vazio, cria as contas de desenvolvimento `admin@lobius.com` / `admin123` e `usuario@lobius.com` / `123456`; troque essas senhas antes de qualquer uso compartilhado.

## Testes

No diretório `backend`, execute `python -m unittest discover -s tests -v`. Os testes usam SQLite e arquivos PST sintéticos, sem alterar o PostgreSQL configurado nem ler arquivos pessoais.

No diretório `frontend`, execute `npm run build` e `npm run lint`.

## Estado do processamento PST

O upload grava o arquivo no diretório `backend/temp_uploads` e seus metadados no PostgreSQL; a tela de arquivos permite listagem e download. A extração/indexação do conteúdo PST ainda não está habilitada: o pacote `pypff` instalado no ambiente é de outro formato (PANOSETI), não o parser libpff do Outlook. Por isso, a busca retorna apenas e-mails já presentes na tabela `emails` e os arquivos aparecem como `Armazenado`, sem alegar processamento concluído.

As rotas de arquivos, pesquisa, dashboard e gerenciamento de usuários exigem JWT. O gerenciamento de usuários é restrito a administradores.