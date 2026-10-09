import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import Importar from "./pages/Importar";
import Pesquisar from "./pages/Pesquisar";
import ArquivosPST from "./pages/ArquivosPST";
import Login from "./pages/Login";
import Usuarios from "./pages/Usuarios";
import { readTokenClaims } from "@/lib/api";

function RotaAutenticada({ children }: { children: React.ReactNode }) {
    return readTokenClaims() ? children : <Navigate to="/login" replace />;
}

// Componente para proteger rotas exclusivas de Admin
function RotaAdmin({ children }: { children: React.ReactNode }) {
    const claims = readTokenClaims();
    const nivel = (claims?.nivelDeAcesso || claims?.nivel || claims?.role || "").toLowerCase();
    const isAdmin = nivel === "admin" || nivel === "administrador";
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
                <Route element={<RotaAutenticada><DashboardLayout /></RotaAutenticada>}>
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