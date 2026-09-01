import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Search, FolderArchive, LogOut, User, Menu } from "lucide-react";

export function DashboardLayout() {
    const location = useLocation();

    // Função para saber se o menu atual está ativo
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen w-full bg-slate-50">
            
            {/* SIDEBAR (Desktop) */}
            <aside className="hidden md: flex flex-col w-64 border-r border-slate-200 bg-white">

                {/* Espaço para a Logo */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 front-bold text-xl text-slate-800">

                        {/* Onde entrará a imagem da logo futuramente */}
                        <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white text-sm">
                            LM
                        </div>
                        Lobius Mail
                    </div>
                </div>

                {/* Menu de Navegação */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <Link 
                    to="/dashboard" 
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors $ {
                        isActive("/arquivos-pst") ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                    >
                        <FolderArchive className="w-5 h-5" />
                        Arquivos PST
                    </Link>
                </nav>

                {/* Rodapé da Sidebar (Usuário e Sair) */}
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700">
                        <User className="w-5 h-5 text-slate-400" />
                        <span>usuario@escritorio.com</span>
                    </div>
                    <button className="w-full items-center gap-3 px-3 py-2 mt-1 rounded-md text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors text-left">
                        <LogOut className="w-5 h-5" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* ÁREA PRINCIPAL */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Header Mobile */}
                <header className="md:hidden h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4">
                    <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs">LM</div>
                        Lobius
                    </div>
                    <button className="text-slate-500 hover:text-slate-800">
                        <Menu className="w-6 h-6" />
                    </button>
                </header>
                
                {/* Conteúdo Dinâmico das Telas */}
                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet /> {/* Onde o React Router vai injetar o Dashboard, Pesquisa, etc */}
                </div>
            </main>

        </div>
    );
}