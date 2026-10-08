import { useState, useEffect } from "react";
import { PlusCircle, Search, Edit, UserCheck, UserX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Usuario {
    id: number;
    nome: string;
    email: string;
    nivelDeAcesso: "admin" | "comum";
    status: "ativo" | "inativo";
}

export default function Usuarios() {
    // ESTADOS DE DADOS (Agora alimentados pelo Banco de Dados)
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);

    // ESTADOS DE FILTRO
    const [busca, setBusca] = useState<string>("");
    const [filtroNivel, setFiltroNivel] = useState<string>("todos");
    const [filtroStatus, setFiltroStatus] = useState<string>("todos");

    // ESTADOS DO FORMULÁRIO (NOVO USUÁRIO)
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [novoNome, setNovoNome] = useState<string>("");
    const [novoEmail, setNovoEmail] = useState<string>("");
    const [novaSenha, setNovaSenha] = useState<string>("");
    const [novoNivel, setNovoNivel] = useState<"admin" | "comum">("comum");

    // =========================================================================
    // 1. CARREGAR USUÁRIOS DO BANCO DE DADOS (GET /api/usuarios)
    // =========================================================================
    const carregarUsuarios = async () => {
        setCarregando(true);
        setErro(null);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3000/api/usuarios", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao carregar a lista de usuários do banco.");
            }

            const data = await response.json();
            setUsuarios(data);
        } catch (err: any) {
            console.error(err);
            setErro(err.message || "Erro de conexão com o servidor.");
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    // =========================================================================
    // 2. CRIAR NOVO USUÁRIO NO BANCO DE DADOS (POST /api/usuarios)
    // =========================================================================
    const handleCriarUsuario = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!novoNome || !novoEmail || !novaSenha) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3000/api/usuarios", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nome: novoNome,
                    email: novoEmail,
                    senha: novaSenha,
                    nivelDeAcesso: novoNivel,
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao cadastrar novo usuário.");
            }

            // Recarrega a lista do banco de dados atualizada
            await carregarUsuarios();

            // Reseta o formulário e fecha a modal
            setNovoNome("");
            setNovoEmail("");
            setNovaSenha("");
            setNovoNivel("comum");
            setIsDialogOpen(false);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Não foi possível cadastrar o usuário.");
        }
    };

    // =========================================================================
    // 3. ALTERAR STATUS DO USUÁRIO NO BANCO (PATCH /api/usuarios/:id/status)
    // =========================================================================
    const toggleStatusUsuario = async (id: number, statusAtual: "ativo" | "inativo") => {
        const novoStatus = statusAtual === "ativo" ? "inativo" : "ativo";

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:3000/api/usuarios/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: novoStatus }),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar status do usuário.");
            }

            // Atualiza localmente sem precisar recarregar tudo
            setUsuarios((prev) =>
                prev.map((u) => (u.id === id ? { ...u, status: novoStatus } : u))
            );
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Erro ao alterar status do usuário.");
        }
    };

    // =========================================================================
    // 4. LÓGICA DE FILTRAGEM (Preservada da versão anterior)
    // =========================================================================
    const usuariosFiltrados = usuarios.filter((usuario) => {
        const atendeBusca =
            usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
            usuario.email.toLowerCase().includes(busca.toLowerCase());

        const atendeNivel =
            filtroNivel === "todos" || usuario.nivelDeAcesso === filtroNivel;

        const atendeStatus =
            filtroStatus === "todos" || usuario.status === filtroStatus;

        return atendeBusca && atendeNivel && atendeStatus;
    });

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* CABEÇALHO */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gerenciamento de Usuários</h1>
                    <p className="text-slate-500 mt-1">
                        Cadastre, edite e controle o acesso dos usuários ao sistema.
                    </p>
                </div>

                {/* MODAL DE NOVO USUÁRIO */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Novo Usuário
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Cadastrar Usuário</DialogTitle>
                            <DialogDescription>
                                Preencha as informações para criar um novo acesso ao sistema.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCriarUsuario} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome Completo</Label>
                                <Input
                                    id="nome"
                                    placeholder="Ex: Maria Silva"
                                    value={novoNome}
                                    onChange={(e) => setNovoNome(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="maria@escritorio.com"
                                    value={novoEmail}
                                    onChange={(e) => setNovoEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="senha">Senha Inicial</Label>
                                <Input
                                    id="senha"
                                    type="password"
                                    placeholder="••••••••"
                                    value={novaSenha}
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nivel">Nível de Acesso</Label>
                                <Select
                                    value={novoNivel}
                                    onValueChange={(v: "admin" | "comum") => setNovoNivel(v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o nível" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="comum">Comum (Visualizador)</SelectItem>
                                        <SelectItem value="admin">Administrador (Total)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter className="pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Salvar Usuário
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* BARRA DE PESQUISA E FILTROS */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                        placeholder="Buscar por nome ou e-mail..."
                        className="pl-9"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={filtroNivel} onValueChange={setFiltroNivel}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Nível de Acesso" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos os Níveis</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="comum">Comum</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos Status</SelectItem>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* TABELA DE USUÁRIOS */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>E-mail</TableHead>
                            <TableHead>Nível de Acesso</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {carregando ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    Conectando ao banco de dados e carregando usuários...
                                </TableCell>
                            </TableRow>
                        ) : erro ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-red-500">
                                    {erro}
                                </TableCell>
                            </TableRow>
                        ) : usuariosFiltrados.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    Nenhum usuário encontrado no banco de dados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            usuariosFiltrados.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-medium text-slate-900">{u.nome}</TableCell>
                                    <TableCell className="text-slate-600">{u.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={u.nivelDeAcesso === "admin" ? "default" : "secondary"}>
                                            {u.nivelDeAcesso === "admin" ? "Administrador" : "Comum"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => toggleStatusUsuario(u.id, u.status)}
                                            title="Clique para alternar status"
                                        >
                                            <Badge
                                                className={`cursor-pointer transition-colors ${
                                                    u.status === "ativo"
                                                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                                                }`}
                                            >
                                                {u.status === "ativo" ? (
                                                    <UserCheck className="w-3 h-3 mr-1" />
                                                ) : (
                                                    <UserX className="w-3 h-3 mr-1" />
                                                )}
                                                {u.status === "ativo" ? "Ativo" : "Inativo"}
                                            </Badge>
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" title="Editar Usuário">
                                                <Edit className="w-4 h-4 text-slate-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Excluir Usuário">
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}