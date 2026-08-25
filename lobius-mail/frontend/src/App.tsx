import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import Importar from "./pages/Importar";
import Pesquisar from "./pages/Pesquisar";
import ArquivosPST from "./pages/ArquivosPST";
import Login from "./pages/Login";


export default function App() {
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
                </Route>
            </Routes>
        </BrowserRouter>
    );
}