import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText} from "lucide-react";

// Tipagem do arquivo
interface Arquivo{
    id: string;
    nome: string;
    tamanho: string;
    status: "Concluido" | "Processando" | "Erro";
    dataUpload: string;
}

// Dados simulados
const arquivos: Arquivo[] = [
    { id: "1", nome: "backup_diretoria_2023.pst", tamanho: "2,4 GB", status: "Concluido", dataUpload: "20 Ago, 10:30" },
    { id: "2", nome: "histórico_rh_antigo.pst", tamanho: "850 MB", status: "Processando", dataUpload: "24 Ago, 14:15"},
    { id: "3", nome: "caixa_corrompida.pst", tamanho: "1.2 GB", status: "Erro", dataUpload: "23 Ago, 09:00" },
];

export default function ArquivosPST() {
   
    // Função para retornar o Badge oficial com as cores certas
    const getStatusBagde = (status: string) => {
        switch (status) {
            case "Concluido":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">Concluido</Badge>;
            case "Processando":
                return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">Processando</Badge>;
            case "Erro":
                return <Badge variant="destructive">Erro</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Arquivos PST Importados</h1>
            <p className="text-slate-500">Acompanhe o status de processamento dos seus arquivos de banco de dados.</p>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg text-slate-700">Histórico de Uploads</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome do Arquivo</TableHead>
                                    <TableHead>Tamanho</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Data do Upload</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {arquivos.map((arquivo) => (
                                    <TableRow key={arquivo.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            {arquivo.nome}
                                        </TableCell>
                                        <TableCell>{arquivo.tamanho}</TableCell>
                                        <TableCell>{getStatusBagde(arquivo.status)}</TableCell>
                                        <TableCell className="text-right text-slate-500">{arquivo.dataUpload}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
