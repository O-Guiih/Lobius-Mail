import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import Importar from "./pages/Importar";
import Pesquisar from "./pages/Pesquisar";
import ArquivosPST from "./pages/ArquivosPST";
import Login from "./pages/Login";
import Usuarios from "./pages/Usuarios";


export default function App() {
    // ========================================================================
    // 🛑 EQUIPE DE BACK-END E BANCO DE DADOS 🛑
    //
    // O QUE ESTA VARIÁVEL FAZ?
    // Ela controla o sistema de permissões (Controle de Acesso) da tela de "Usuários".
    // Ela é responsável por duas barreiras de segurança no Front-end:
    // 1. Esconder o botão "Usuários" no menu lateral (Arquivo: DashboardLayout.tsx).
    // 2. Bloquear o acesso direto pela URL '/usuarios' (Arquivo: App.tsx).
    // 
    // O QUE VOCÊS PRECISAM FAZER?
    // Atualmente, o valor está "chumbado" manualmente para testes visuais.
    // Quando a API de Login estiver pronta, apaguem esta variável estática e façam 
    // o sistema ler o perfil real do usuário logado (ex: "admin" ou "comum") 
    // direto da sessão ou do Banco de Dados.
    // ========================================================================
    
    const nivelDeAcesso: string = "comum";
    return (
        <BrowserRouter>
            <Routes>
                {/* ========================================= */}
                {/* ROTAS PÚBLICAS (Fora do sistema (login, cadastro))*/}
                {/* ========================================= */}

                {/* Raiz (Quando o usuário entrar vai direto para a tela de login) */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Tela de Login */}
                <Route path="/login" element={<Login />} />

                {/* ========================================= */}
                {/* ROTAS INTERNAS (Dentro do sistema)     */}
                {/* ========================================= */}

                    {/* ROTAS*/}
                <Route element={<DashboardLayout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="pesquisar" element={<Pesquisar />} />
                    <Route path="importar" element={<Importar/>} />
                    <Route path="arquivos-pst" element={<ArquivosPST />} />
                    
                    {/* Se for admin, carrega a tela. Se não for, redireciona (Navigate) para o dashboard */}
                    <Route 
                        path="/usuarios"
                        element={nivelDeAcesso === "admin" ? <Usuarios /> : <Navigate to="/dashboard" replace />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}