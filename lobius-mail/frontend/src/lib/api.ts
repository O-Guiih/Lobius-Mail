const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export interface TokenClaims {
    email?: string;
    nivelDeAcesso?: string;
    nivel?: string;
    role?: string;
    exp?: number;
}

export function readTokenClaims(): TokenClaims | null {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(payload)) as TokenClaims;
    } catch {
        return null;
    }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    const token = localStorage.getItem("token");

    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.mensagem || data.erro || `Falha na solicitação (${response.status}).`);
    }
    return data as T;
}

export async function apiDownload(path: string, filename: string): Promise<void> {
    const headers = new Headers();
    const token = localStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(`${API_BASE_URL}${path}`, { headers });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.mensagem || `Falha no download (${response.status}).`);
    }

    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}