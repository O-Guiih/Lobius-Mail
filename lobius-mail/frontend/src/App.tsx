import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import Importar from "./pages/Importar";
import Pesquisar from "./pages/Pesquisar";
import ArquivosPST from "./pages/ArquivosPST"


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<DashboardLayout />}>
                    {/* Redireciona a raiz direto para o dashboard */}
                    <Route index element={<Navigate to="/dashboard" replace />} />

                    {/* Rota oficial do Dashboard */}
                    <Route path="dashboard" element={<Dashboard />} />

                    {/* Rotas oficiais das telas que já foram criadas */}
                    <Route path="pesquisar" element={<Pesquisar />} />
                    <Route path="importar" element={<Importar/>} />
                    
                    {/* Rotas temporárias */}
                    <Route path="arquivos-pst" element={<ArquivosPST />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}