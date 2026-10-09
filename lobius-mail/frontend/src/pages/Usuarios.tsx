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
import { apiRequest } from "@/lib/api";
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
    // ESTADOS DE DADOS
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);

    // ESTADOS DE FILTRO
    const [busca, setBusca] = useState<string>("");
    const [filtroNivel, setFiltroNivel] = useState<string>("todos");
    const [filtroStatus, setFiltroStatus] = useState<string>("todos");

    // ESTADOS DO FORMULÁRIO DE CRIAÇÃO
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [novoNome, setNovoNome] = useState<string>("");
    const [novoEmail, setNovoEmail] = useState<string>("");
    const [novaSenha, setNovaSenha] = useState<string>("");
    const [novoNivel, setNovoNivel] = useState<"admin" | "comum">("comum");

    // ESTADOS DO FORMULÁRIO DE EDIÇÃO
    const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
    const [usuarioEditandoId, setUsuarioEditandoId] = useState<number | null>(null);
    const [editNome, setEditNome] = useState<string>("");
    const [editEmail, setEditEmail] = useState<string>("");
    const [editNivel, setEditNivel] = useState<"admin" | "comum">("comum");

    // =========================================================================
    // 1. CARREGAR USUÁRIOS
    // =========================================================================
    const carregarUsuarios = async () => {
        setCarregando(true);
        setErro(null);

        try {
            const data = await apiRequest<Usuario[]>("/api/usuarios");
            setUsuarios(data);
        } catch (err: unknown) {
            console.error(err);
            setErro(err instanceof Error ? err.message : "Erro de conexão com o servidor.");
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        let ativo = true;
        apiRequest<Usuario[]>("/api/usuarios")
            .then((data) => {
                if (ativo) setUsuarios(data);
            })
            .catch((err: unknown) => {
                if (ativo) setErro(err instanceof Error ? err.message : "Erro de conexão com o servidor.");
            })
            .finally(() => {
                if (ativo) setCarregando(false);
            });
        return () => {
            ativo = false;
        };
    }, []);

    // =========================================================================
    // 2. CRIAR NOVO USUÁRIO
    // =========================================================================
    const handleCriarUsuario = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!novoNome || !novoEmail || !novaSenha) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        try {
            await apiRequest<Usuario>("/api/usuarios", {
                method: "POST",
                body: JSON.stringify({
                    nome: novoNome,
                    email: novoEmail,
                    senha: novaSenha,
                    nivelDeAcesso: novoNivel,
                }),
            });

            await carregarUsuarios();

            setNovoNome("");
            setNovoEmail("");
            setNovaSenha("");
            setNovoNivel("comum");
            setIsDialogOpen(false);
        } catch (err: unknown) {
            console.error(err);
            alert(err instanceof Error ? err.message : "Não foi possível cadastrar o usuário.");
        }
    };

    // =========================================================================
    // 3. ALTERAR STATUS DO USUÁRIO
    // =========================================================================
    const toggleStatusUsuario = async (id: number, statusAtual: "ativo" | "inativo") => {
        const novoStatus = statusAtual === "ativo" ? "inativo" : "ativo";

        try {
            const resultado = await apiRequest<{ id: number; status: "ativo" | "inativo" }>(`/api/usuarios/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: novoStatus }),
            });

            setUsuarios((prev) =>
                prev.map((u) => (u.id === id ? { ...u, status: resultado.status } : u))
            );
        } catch (err: unknown) {
            console.error(err);
            alert(err instanceof Error ? err.message : "Erro ao alterar status do usuário.");
        }
    };

    // =========================================================================
    // 4. EDITAR USUÁRIO (NOVA FUNÇÃO)
    // =========================================================================
    const abrirModalEdicao = (usuario: Usuario) => {
        setUsuarioEditandoId(usuario.id);
        setEditNome(usuario.nome);
        setEditEmail(usuario.email);
        setEditNivel(usuario.nivelDeAcesso);
        setIsEditDialogOpen(true);
    };

    const handleEditarUsuario = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editNome || !editEmail || !usuarioEditandoId) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        try {
            await apiRequest<Usuario>(`/api/usuarios/${usuarioEditandoId}`, {
                method: "PUT",
                body: JSON.stringify({
                    nome: editNome,
                    email: editEmail,
                    nivelDeAcesso: editNivel,
                }),
            });

            // Atualiza a lista
            await carregarUsuarios();
            setIsEditDialogOpen(false);
        } catch (err: unknown) {
            console.error(err);
            alert(err instanceof Error ? err.message : "Não foi possível editar o usuário.");
        }
    };

    // =========================================================================
    // 5. EXCLUIR USUÁRIO
    // =========================================================================
    const handleExcluirUsuario = async (id: number) => {
        const confirmar = window.confirm("Tem certeza que deseja excluir este usuário permanentemente?");
        if (!confirmar) return;

        try {
            await apiRequest<{ mensagem: string }>(`/api/usuarios/${id}`, {
                method: "DELETE",
            });

            // Atualiza a lista na tela removendo o usuário deletado
            setUsuarios((prev) => prev.filter((u) => u.id !== id));
        } catch (err: unknown) {
            console.error(err);
            alert(err instanceof Error ? err.message : "Não foi possível excluir o usuário.");
        }
    };

    // =========================================================================
    // LÓGICA DE FILTRAGEM
    // =========================================================================
    const usuariosFiltrados = usuarios.filter((usuario) => {
        const atendeBusca =
            (usuario.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
            (usuario.email || "").toLowerCase().includes(busca.toLowerCase());

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

                {/* MODAL DE CRIAÇÃO */}
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

                {/* MODAL DE EDIÇÃO (NOVO) */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Editar Usuário</DialogTitle>
                            <DialogDescription>
                                Altere as informações do usuário.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditarUsuario} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-nome">Nome Completo</Label>
                                <Input
                                    id="edit-nome"
                                    value={editNome}
                                    onChange={(e) => setEditNome(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">E-mail</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-nivel">Nível de Acesso</Label>
                                <Select
                                    value={editNivel}
                                    onValueChange={(v: "admin" | "comum") => setEditNivel(v)}
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
                                    onClick={() => setIsEditDialogOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Atualizar Usuário
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
                                            {/* BOTÃO DE EDITAR AGORA CONECTADO */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Editar Usuário"
                                                onClick={() => abrirModalEdicao(u)}
                                            >
                                                <Edit className="w-4 h-4 text-slate-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Excluir Usuário"
                                                onClick={() => handleExcluirUsuario(u.id)}
                                            >
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