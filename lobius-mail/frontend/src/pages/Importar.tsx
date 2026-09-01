import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, ArrowLeft, File, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Importar() {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Funções para lidar com o Arrastar e Soltar
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);


    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        validateAndSetFile(file);
    }
};

// Função para lidar com o clique no botão
const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        validateAndSetFile(file);
    }
};

// Validação (para garantir que é .pst)
const validateAndSetFile = (file: File) => {
    if (file.name.endsWith(".pst")) {
        setSelectedFile(file);
    } else {
        alert("Por favor, selecione apenas arquivos do tipo .pst");
    }
};

return (
    <div className="p-8 max-w-3xl mx-auto">
        <Link to="/dashboard">
            <Button variant="ghost" className="mb-6 gap-2 text-slate-600">
                <ArrowLeft className="w-4 h-4" />
                Voltar para o Dashboard
            </Button>
        </Link>
        
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Importar Arquivo PST</CardTitle>
                <CardDescription>
                    Selecione o arquivo de banco de dados do Outlook para iniciar o processamento.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Input invisível que é ativado pelo botão */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept=".pst"
                    className="hidden"
                />

                {!selectedFile ? (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg transition-colors cursor-pointer
                            ${isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"}
                        `}
                    >
                        <FileUp className={`w-12 h-12 mb-4 ${isDragging ? "text-blue-600" : "text-blue-500"}`} />
                        <p className="text-sm text-slate-600 mb-6 text-center">
                            Arraste e solteo seu arquivo <span className="font-bold">.pst</span> aqui, ou clique no botão abaixo.
                        </p>
                        <Button type="button" variant="outline" onClick={(e) => {
                            e.stopPropagation(); 
                            fileInputRef.current?.click();
                        }}>
                            Procurar Arquivo
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 border border-green-200 rounded-lg bg-green-50">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                        <p className="text-lg font-medium text-green-800 mb-2">Arquivo Selecionado!</p>
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 px-4 py-2 rounded-md mb-6">
                            <File className="w-4 h-4" />
                            {selectedFile.name}
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setSelectedFile(null)}>
                                Trocar Arquivo
                            </Button>
                            <Button>Iniciar Processamento</Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
);

}


