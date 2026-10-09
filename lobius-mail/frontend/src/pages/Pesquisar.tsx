import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Mail } from "lucide-react";
import { apiRequest } from "@/lib/api";

// Tipagem do e-mail que virá do servidor
interface Email {
    id: number;
    remetente: string;
    assunto: string | null;
    data_envio: string | null;
}

export default function Pesquisar() {
    const [busca, setBusca] = useState("");
    const [remetente, setRemetente] = useState("");
    const [assunto, setAssunto] = useState("");
    const [exibirFiltros, setExibirFiltros] = useState(false);
    const [resultados, setResultados] = useState<Email[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    const handleBuscar = async () => {
        const parametros = new URLSearchParams();
        if (busca.trim()) parametros.set("q", busca.trim());
        if (remetente.trim()) parametros.set("remetente", remetente.trim());
        if (assunto.trim()) parametros.set("assunto", assunto.trim());
        setCarregando(true);
        setErro("");
        try {
            const resposta = await apiRequest<{ resultados: Email[] }>(`/api/pesquisar?${parametros}`);
            setResultados(resposta.resultados);
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Falha ao pesquisar e-mails.");
            setResultados([]);
        } finally {
            setCarregando(false);
        }
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
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    void handleBuscar();
                                }
                            }}
                        />
                    </div>
                    <Button type="button" variant="outline" className="py-6 px-6 gap-2" onClick={() => setExibirFiltros((aberto) => !aberto)} aria-expanded={exibirFiltros}>
                        <Filter className="w-5 h-5" />
                        Filtros
                    </Button>
                    <Button type="button" onClick={() => void handleBuscar()} disabled={carregando} className="py-6 px-8 text-lg">
                        Buscar
                    </Button>
                </CardContent>
                {exibirFiltros && (
                    <CardContent className="grid gap-4 border-t pt-4 sm:grid-cols-2">
                        <Input aria-label="Filtrar remetente" value={remetente} onChange={(event) => setRemetente(event.target.value)} placeholder="Remetente" />
                        <Input aria-label="Filtrar assunto" value={assunto} onChange={(event) => setAssunto(event.target.value)} placeholder="Assunto" />
                    </CardContent>
                )}
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
                        {erro ? (
                            <div role="alert" className="p-8 text-center text-red-600">{erro}</div>
                        ) : carregando ? (
                            <div className="p-8 text-center text-slate-500">Pesquisando e-mails...</div>
                        ) : resultados.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                Nenhum resultado. Pesquise depois de importar e indexar e-mails.
                            </div>
                        ) : (
                            resultados.map((email) => (
                                <div key={email.id} className="grid grid-cols-12 gap-4 p-4 border-b items-center hover:bg-slate-50 cursor-pointer">
                                    <div className="col-span-3 font-medium text-slate-700 truncate">{email.remetente}</div>
                                    <div className="col-span-7 text-slate-600 truncate flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        {email.assunto || "(sem assunto)"}
                                    </div>
                                    <div className="col-span-2 text-right text-sm text-slate-500">
                                        {email.data_envio ? new Date(email.data_envio).toLocaleDateString("pt-BR") : "-"}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>                  
                </CardContent>
            </Card>
        </div>
    );
}