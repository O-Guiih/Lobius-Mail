import { Mail, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login () {
    return (
        // Fundo da tela ocupando altura e centralizando o conteúdo
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">

            {/* Card principal de Login */}
            <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-8">

                {/* Logo e Boas-vindas */}
                <div className="flex flex-col items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                        LM
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Lobius Mail</h1>
                    <p className="text-slate-500 text-sm">Acesse o sistema corporativo</p>
                </div>

                {/* Formulário */}
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    
                    {/* Campo de E-mail */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 block">E-mail Corporativo</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="seu.nome@empresa.com.br"
                            />
                        </div>
                    </div>

                    {/* Campo de Senha */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-700 block">Senha</label>
                            <a href="#" className="text-sm text-blue-600 hover:underline">Esqueceu a senha?</a>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input 
                                type="password"
                                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-tranparent transition-all"
                                placeholder="•••••••"
                            />
                        </div>
                    </div>

                    {/* Botão de Entrar (Simulando o login levando para o Dashboard) */}
                    <Link
                        to="/dashboard"
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors mt-6"
                    >
                        Entrar no Sistema
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </form>
            </div>
        </div>
    );
}