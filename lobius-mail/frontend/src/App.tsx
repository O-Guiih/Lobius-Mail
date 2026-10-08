import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import Importar from "./pages/Importar";
import Pesquisar from "./pages/Pesquisar";
import ArquivosPST from "./pages/ArquivosPST";
import Login from "./pages/Login";
import Usuarios from "./pages/Usuarios";

// Componente para proteger rotas exclusivas de Admin
function RotaAdmin({ children }: { children: React.ReactNode }) {
    const [carregando, setCarregando] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                // Decodifica o payload do Token JWT
                const base64Url = token.split(".")[1];
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split("")
                        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                        .join("")
                );

                const payload = JSON.parse(jsonPayload);
                const nivel = payload.nivelDeAcesso || payload.nivel || payload.role || "";

                if (nivel.toLowerCase() === "admin" || nivel.toLowerCase() === "administrador") {
                    setIsAdmin(true);
                }
            } catch (err) {
                console.error("Erro ao validar token de admin:", err);
            }
        }
        setCarregando(false);
    }, []);

    // Evita o redirecionamento precoce enquanto recupera o token
    if (carregando) return null;

    return isAdmin ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ROTAS PÚBLICAS */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />

                {/* ROTAS INTERNAS */}
                <Route element={<DashboardLayout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="pesquisar" element={<Pesquisar />} />
                    <Route path="importar" element={<Importar />} />
                    <Route path="arquivos-pst" element={<ArquivosPST />} />
                    
                    {/* ROTA PROTEGIDA PARA ADMIN */}
                    <Route 
                        path="usuarios"
                        element={
                            <RotaAdmin>
                                <Usuarios />
                            </RotaAdmin>
                        }
                    />
                </Route>

                {/* Redirecionamento para rotas inexistentes */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}