import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FileBox,
    HardDrive,
    PlusCircle,
    Search,
    FileUp,
    FolderArchive,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/api";

interface ArquivoRecente {
    id: number;
    nome_arquivo: string;
    tamanho_bytes: number;
    status_processamento: string;
}

interface DadosDashboard {
    totalEmails: number;
    totalArquivos: number;
    armazenamentoBytes: number;
    arquivosRecentes: ArquivoRecente[];
}

export function Dashboard() {
    const [dados, setDados] = useState<DadosDashboard | null>(null);
    const [erro, setErro] = useState("");

    useEffect(() => {
        apiRequest<DadosDashboard>("/api/dashboard")
            .then(setDados)
            .catch((error: unknown) => setErro(error instanceof Error ? error.message : "Falha ao carregar o painel."));
    }, []);

    const formatarNumero = (valor: number) => new Intl.NumberFormat("pt-BR").format(valor);
    const formatarTamanho = (bytes: number) => new Intl.NumberFormat("pt-BR", {
        style: "unit", unit: "byte", notation: "compact", maximumFractionDigits: 1,
    }).format(bytes);

    return (
        <div className="space-y-8 max-w-6xl mx-auto">

            {/* Cabeçalho da Página */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Visão geral</h1>
                    <p className="text-slate-500 mt-1">Gerencie seus e-mails arquivados.</p>
                </div>
                <Link to="/importar">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <PlusCircle className="w-4 h-4" />
                        Importar PST
                    </Button>
                </Link>
            </div>

            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">E-mails arquivados</CardTitle>
                        <FileBox className="w-4 h-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{dados ? formatarNumero(dados.totalEmails) : "-"}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Arquivos PST</CardTitle>
                        <FolderArchive className="w-4 h-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{dados ? formatarNumero(dados.totalArquivos) : "-"}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Armazenamento</CardTitle>
                        <HardDrive className="w-4 h-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{dados ? formatarTamanho(dados.armazenamentoBytes) : "-"}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Tabela de Arquivos Recentes */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-800">Arquivos recentes</h2>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Tamanho</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {erro ? (
                                    <TableRow><TableCell colSpan={3} role="alert" className="py-6 text-center text-red-600">{erro}</TableCell></TableRow>
                                ) : !dados ? (
                                    <TableRow><TableCell colSpan={3} className="py-6 text-center text-slate-500">Carregando...</TableCell></TableRow>
                                ) : dados.arquivosRecentes.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="py-6 text-center text-slate-500">Nenhum arquivo arquivado.</TableCell></TableRow>
                                ) : dados.arquivosRecentes.map((arquivo) => (
                                    <TableRow key={arquivo.id}>
                                        <TableCell className="font-medium text-slate-700">{arquivo.nome_arquivo}</TableCell>
                                        <TableCell>{formatarTamanho(arquivo.tamanho_bytes)}</TableCell>
                                        <TableCell><Badge variant="secondary">{arquivo.status_processamento}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
                
                {/* Bloco de Acesso Rápido */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-800">Acesso rápido</h2>
                    <Card>
                        <CardContent className="p-4 flex flex-col gap-3">
                            <Link to="/pesquisar">
                                <Button variant="outline" className="w-full justify-start gap-3 h-12 text-slate-600">
                                    <Search className="w-5 h-5 text-blue-600" />
                                    Pesquisar e-mails
                                </Button>
                            </Link>
                            <Link to="/importar">
                                <Button variant="outline" className="w-full justify-start gap-3 h-12 text-slate-600">
                                <FileUp className="w-5 h-5 text-blue-600" />
                                Importar PST
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
};