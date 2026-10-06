from database import conectar_banco


try:
    conexao = conectar_banco()
    print("Conexão com o PostgreSQL realizada com sucesso!")
    conexao.close()
except Exception as erro:
    print("Erro ao conectar ao PostgreSQL:")
    print(erro)