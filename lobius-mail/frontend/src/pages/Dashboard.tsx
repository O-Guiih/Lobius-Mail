import { Link } from "react-router-dom";
import {
    FileBox,
    Database,
    HardDrive,
    PlusCircle,
    Search,
    CheckCircle2,
    Clock,
    FileUp
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

export function Dashboard() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto">

            {/* Cabeçalho da Página */}
            <div className="flex flex-col sm:flex-row sm:flex-row sm:items-center justify-between gap-4">
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
                        <div className="text-2xl font-bold text-slate-900">125.432</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Armazenamento</CardTitle>
                        <HardDrive className="w-4 h-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">1,8 TB</div>
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
                                    <TableHead>E-mails</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium text-slate-700">arquivo_juridico_2023.pst</TableCell>
                                    <TableCell>48 GB</TableCell>
                                    <TableCell>125.432</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Concluido
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium text-slate-700">caixa_antiga_2020.pst</TableCell>
                                    <TableCell>12 GB</TableCell>
                                    <TableCell>31.200</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-slate-600 border-slate-300">
                                            <Clock className="w-3 h-3 mr-1"/> Processando
                                        </Badge>
                                    </TableCell>
                                </TableRow>
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