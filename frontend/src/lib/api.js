const API_BASE = String(import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
const EXTERNO = Boolean(API_BASE);

let csrf = "";
let token = sessionStorage.getItem("sessao") || "";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.codigo = data?.codigo;
    this.data = data;
  }
}

function urlApi(path) {
  return `${API_BASE}${path}`;
}

async function lerJson(r) {
  const texto = await r.text();
  if (!texto) return {};
  try {
    return JSON.parse(texto);
  } catch {
    throw new ApiError("O servidor respondeu de forma inesperada. Recarregue a página.", r.status, {});
  }
}

async function lerCsrf() {
  if (EXTERNO) return "";
  const r = await fetch(urlApi("/api/csrf"), { credentials: "same-origin" });
  const data = await lerJson(r);
  csrf = data.csrf || "";
  return csrf;
}

export async function api(path, { method = "GET", body, _retry = false } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!EXTERNO && method !== "GET" && method !== "HEAD") {
    headers["X-CSRF-Token"] = csrf || (await lerCsrf());
  }
  let r;
  try {
    r = await fetch(urlApi(path), {
      method,
      headers,
      credentials: EXTERNO ? "omit" : "same-origin",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor neste computador. Deixe o sistema local aberto e tente de novo.",
      0,
      {},
    );
  }
  const data = await lerJson(r);
  if (data.csrf) csrf = data.csrf;
  if (path === "/api/logout") {
    token = "";
    sessionStorage.removeItem("sessao");
  } else if (r.ok && data.token) {
    token = data.token;
    sessionStorage.setItem("sessao", token);
  }
  if (r.status === 400 && !_retry && String(data.erro || "").includes("Sessão inválida")) {
    csrf = "";
    return api(path, { method, body, _retry: true });
  }
  if (!r.ok) {
    throw new ApiError(data.erro || "Falha na requisição.", r.status, data);
  }
  return data;
}

export function esc(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatarData(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}
