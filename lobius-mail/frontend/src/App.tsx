import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Dashboard } from ".pages/DashboardLayout";

// Componentes temporários 
const Pesquisar = () => <h1 className="text-2xl font-bold text-slate-800">Pesquisar E-mails</h1>;
const ArquivosPST = () => <h1 className="text-2xl font-bold text-slate-800">Arquivos PST</h1>;
const ImportarPST = () => <h1 className="text-2xl font-bold text-slate-800">Importar PST</h1>

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<DashboardLayout />}>
                    {/* Redireciona a raiz direto para o dashboard */}
                    <Route index element={<Navigate to="/dashboard" replace />} />

                    {/* Rota oficial do Dashboard */}
                    <Route path="dashboard" element={<Dashboard />} />

                    {/* Rotas temporárias */}
                    <Route path="pesquisar" element={<Pesquisar />} />
                    <Route path="arquivos-pst" element={<ArquivosPST />} />
                    <Route path="importar" element={<ImportarPST />} />
                </Route>
            <Routes>
        </BrowserRouter>
    );
}