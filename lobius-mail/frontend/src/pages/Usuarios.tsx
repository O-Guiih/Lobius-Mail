import { UserPlus, MoreVertical, Shield, Building2, Mail } from "lucide-react";

// Dados simulados (Back-end vai mandar isso do Banco de Dados no futuro)

const mockUsers = [
    { id: "1", nome: "Carlos Almeida", email: "carlos.almeida@empresa.com", setor: "Diretoria", nivel: "Administrador", status: "Ativo" },
    { id: "2", nome: "Fernanda Costa", email: "fernanda.costa@empresa.com", setor: "Jurídico", nivel: "Comum", status: "Ativo" },
    { id: "3", nome: "Ricardo Souza", email: "ricardo.souza@empresa.com", setor: "RH", nivel: "Comum", status: "Inativo" },
    { id: "4", nome: "Ana Paula", email: "ana.paula@empresa.com", setor: "Financeiro" , nivel: "Comum", status: "Ativo "},
];

export default function Usuarios() {
    return (
        <div className="space-y-6">

            {/* Cabeçalho da Página */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Gestão de Usuários</h1>
                    <p className="text-slate-500 mt-1">Gerencie os acessos e setores dos colaboradores</p>
                </div>

                {/* Botão de Adicionar */}
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                    <UserPlus className="w-5 h-5" />
                    Novo Usuário
                </button>
            </div>

            {/* Tabela de Usuários */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Usuário</th>
                                <th className="px-6 py-4">Setor</th>
                                <th className="px-6 py-4">Nível de Acesso</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {mockUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">

                                    {/* Coluna Nome e E-mail */}
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-800">{user.nome}</div>
                                        <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                                            <Mail className="w-3 h-3" />
                                            {user.email}
                                        </div>
                                    </td>

                                    {/* Coluna Setor */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Building2 className="w-4 h-4 text-slate-400" />
                                            {user.setor}
                                        </div>
                                    </td>

                                    {/* Coluna Nível */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            {user.nivel === "Administrador" && <Shield className="w-4 h-4 text-blue-600" />}
                                            <span className={user.nivel === "Administrador" ? "font-medium text-blue-700" : ""}>
                                                {user.nivel}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Coluna Status */}
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                            user.status ==="Ativo"
                                                ? "bg=green-100 text-green-700"
                                                : "bg-slate-100 text-slate-600"
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>

                                    {/* Coluna Ações */}
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition colors">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}