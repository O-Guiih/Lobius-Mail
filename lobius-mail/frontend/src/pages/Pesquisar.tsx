import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Mail } from "lucide-react";

// Tipagem do e-mail que virá do servidor
interface Email {
    id: string;
    de: string;
    assunto: string;
    data: string;
}

export default function() {
    const [busca, setBusca] = useState ("");
    const [resultados, setResultados] = useState<Email[]>([]);

    const handleBuscar = () => {
        // Será feito a chamada da API do back-end futuramente
        console.log("Buscando por:", busca);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Pesquisar E-mails</h1>

            {/* Barra de Pesquisa */}
            <Card>
                <CardContent className="p-6 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                            value={busca}
                            onChange={ (e) => setBusca(e.target.value)}
                            placeholder="Pesquisar por remetente, assunto ou palavra-chave..."
                            className="pl-10 text-lg py-6"
                        />
                    </div>
                    <Button variant="outline" className="py-6 px-6 gap-2">
                        <Filter className="w-5 h-5" />
                        Filtros
                    </Button>
                    <Button onClick={handleBuscar} className="py-6 px-8 text-lg">
                        Buscar
                    </Button>
                </CardContent>
            </Card>

            {/* Tabela de Resultados Dinâmica */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg text-slate-700">Resultados da Busca</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        {/* Cabeçalho */}
                        <div className="grid grid-cols-12 gap-4 p-4 border-b bg-slate-50 font-medium text-slate-500 text-sm">
                            <div className="col-span-3">De</div>
                            <div className="col-span-7">Assunto</div>
                            <div className="col-span-2 text-right">Data</div>
                        </div>

                        {/* Renderização real e limpa */}
                        {resultados.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                Nenhum e-mail encontrado. Digite um termo e clique em buscar.
                            </div>
                        ) : (
                            resultados.map((email) => (
                                <div key={email.id} className="grid grid-cols-12 gap-4 p-4 border-b items-center hover:bg-slate-50 cursor-pointer">
                                    <div className="col-span-3 font-medium text-slate-700 truncate">{email.de}</div>
                                    <div className="col-span-7 text-slate-600 truncate flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        {email.assunto}
                                    </div>
                                    <div className="col-span-2 text-right text-sm text-slate-500">{email.data}</div>
                                </div>
                            ))
                        )}
                    </div>                  
                </CardContent>
            </Card>
        </div>
    );
}