import { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Mudamos de Link para useNavigate
import { apiRequest } from "@/lib/api";

export default function Login() {
    // 1. Criamos os estados para guardar o que o usuário digita
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState(""); // Para mostrar erro caso a senha esteja errada
    
    // 2. Usamos o navigate para trocar de tela via código (só se o login der certo)
    const navigate = useNavigate();

    // 3. A FUNÇÃO DE CONEXÃO COM A API DO SEU AMIGO (SEM GAMBIARRA)
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // Impede a página de recarregar
        setErro(""); // Limpa erros antigos

        try {
            // Faz o pedido para o back-end real
            const data = await apiRequest<{ token: string }>("/api/login", {
                method: "POST",
                body: JSON.stringify({ email, senha })
            });
            localStorage.setItem("token", data.token);
            navigate("/dashboard");
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Não foi possível conectar ao servidor.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-8">

                <div className="flex flex-col items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                        LM
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Lobius Mail</h1>
                    <p className="text-slate-500 text-sm">Acesse o sistema corporativo</p>
                </div>

                {/* 4. O formulário agora dispara a nossa função handleLogin */}
                <form className="space-y-5" onSubmit={handleLogin}>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 block">E-mail Corporativo</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                value={email} // Conectado ao estado
                                onChange={(e) => setEmail(e.target.value)} // Atualiza o estado ao digitar
                                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="seu.nome@empresa.com.br"
                                required
                            />
                        </div>
                    </div>

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
                                value={senha} // Conectado ao estado
                                onChange={(e) => setSenha(e.target.value)} // Atualiza o estado ao digitar
                                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="•••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Mensagem de erro caso o login falhe */}
                    {erro && (
                        <p className="text-red-500 text-sm text-center font-medium">{erro}</p>
                    )}

                    {/* 5. Mudamos o <Link> para um <button type="submit"> real */}
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors mt-6"
                    >
                        Entrar no Sistema
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}