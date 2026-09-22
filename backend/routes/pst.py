import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

pst_bp = Blueprint ("pst", __name__)

# Diretório para salvar os arquivos reais recebidos do seu Front-end
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'temp_uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@pst_bp.route("/api/pst/importar", methods=["POST"])
def importar_pst():
    # 1. Busca exatamente a chave 'arquivo' que o Front-end envia no FormData
    if "arquivo" not in request.files:
        return jsonify({"erro": "Nenhum arquivo encontrado na requisição"}), 400
    
    arquivo = request.files ["arquivo"]
    
    if arquivo.filename == "":
        return jsonify({"erro": "Nenhum arquivo selecionado"}), 400
    
    # 2. Validação da extensão (.pst)
    if not arquivo.filename.lower().endswith(".pst"):
        return jsonify({"erro": "Formato invalido. Apenas arquivos .pst são permitidos."}), 400
    
    # 3. Lógica real exigida no ticket (Salvar no servidor)
    try:
        nome_seguro = secure_filename(arquivo.filename)
        caminho_salvamento = os.path.join(UPLOAD_FOLDER, nome_seguro)
        
        # Salva o arquivo fisicamente na pasta temp_uploads
        arquivo.save(caminho_salvamento)
        
        # Calcula o tamanho real do arquivo salvo (em bytes)
        tamanho_real_bytes = os.path.getsize(caminho_salvamento)
        
        # 4. Retorna exatamente o padrão de chaves que o seu Front-end já espera ler
        return jsonify({
            "mensagem": f"Arquivo '{nome_seguro}' recebido e salvo com sucesso!",
            "status_processamento": "Processando",
            "tamanho_bytes": tamanho_real_bytes
        }), 200
        
    except Exception as e:
        return jsonify({"erro": f"Falha ao salvar o arquivo: {str(e)}"}), 500
    
    # Tratamento caso o arquivo enviado pelo Front seja maior que o limite do Flask
    @pst_bp.errorhandler(413)
    @pst_bp.errorhandler(RequestEntityTooLarge)
    def arquivo_muito_grande(e):
        return jsonify({"erro": "Arquivo muito grande. Excedeu o limite permitido pelo servidor."}), 413