import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Trash2 } from "lucide-react";
import { apiDownload, apiRequest, readTokenClaims } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface Arquivo {
    id: number;
    nome_arquivo: string;
    tamanho_bytes: number;
    status_processamento: string;
    data_importacao: string | null;
}

export default function ArquivosPST() {
    const [arquivos, setArquivos] = useState<Arquivo[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [excluindoId, setExcluindoId] = useState<number | null>(null);
    const claims = readTokenClaims();
    const nivel = (claims?.nivelDeAcesso || claims?.nivel || claims?.role || "").toLowerCase();
    const isAdmin = nivel === "admin" || nivel === "administrador";

    useEffect(() => {
        apiRequest<Arquivo[]>("/api/arquivos-pst")
            .then(setArquivos)
            .catch((error: unknown) => setErro(error instanceof Error ? error.message : "Falha ao carregar arquivos."))
            .finally(() => setCarregando(false));
    }, []);

    const formatarTamanho = (bytes: number) => new Intl.NumberFormat("pt-BR", {
        style: "unit", unit: "byte", notation: "compact", maximumFractionDigits: 1,
    }).format(bytes);

    const formatarData = (data: string | null) => data
        ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(data))
        : "-";

    const excluirArquivo = async (arquivo: Arquivo) => {
        const confirmado = window.confirm(
            `Excluir "${arquivo.nome_arquivo}" e os e-mails associados? Esta ação não pode ser desfeita.`
        );
        if (!confirmado) return;

        setExcluindoId(arquivo.id);
        setErro("");
        try {
            await apiRequest<{ mensagem: string }>(`/api/arquivos-pst/${arquivo.id}`, {
                method: "DELETE",
            });
            setArquivos((atuais) => atuais.filter((item) => item.id !== arquivo.id));
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Falha ao excluir arquivo.");
        } finally {
            setExcluindoId(null);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Arquivos PST Importados</h1>
            <p className="text-slate-500">Acompanhe os arquivos PST armazenados no sistema.</p>

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
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {carregando ? (
                                    <TableRow><TableCell colSpan={5} className="py-8 text-center text-slate-500">Carregando arquivos...</TableCell></TableRow>
                                ) : erro ? (
                                    <TableRow><TableCell colSpan={5} role="alert" className="py-8 text-center text-red-600">{erro}</TableCell></TableRow>
                                ) : arquivos.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="py-8 text-center text-slate-500">Nenhum arquivo PST arquivado.</TableCell></TableRow>
                                ) : arquivos.map((arquivo) => (
                                    <TableRow key={arquivo.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            {arquivo.nome_arquivo}
                                        </TableCell>
                                        <TableCell>{formatarTamanho(arquivo.tamanho_bytes)}</TableCell>
                                        <TableCell><Badge variant="secondary">{arquivo.status_processamento}</Badge></TableCell>
                                        <TableCell className="text-right text-slate-500">{formatarData(arquivo.data_importacao)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Baixar arquivo PST"
                                                aria-label={`Baixar ${arquivo.nome_arquivo}`}
                                                onClick={() => void apiDownload(`/api/arquivos-pst/${arquivo.id}/download`, arquivo.nome_arquivo).catch((error: unknown) => setErro(error instanceof Error ? error.message : "Falha no download."))}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            {isAdmin && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Excluir arquivo PST"
                                                    aria-label={`Excluir ${arquivo.nome_arquivo}`}
                                                    disabled={excluindoId === arquivo.id}
                                                    onClick={() => void excluirArquivo(arquivo)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            )}
                                        </TableCell>
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
