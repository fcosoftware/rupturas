let csrf = "";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.codigo = data?.codigo;
    this.data = data;
  }
}

async function lerCsrf() {
  const r = await fetch("/api/csrf", { credentials: "same-origin" });
  const data = await r.json();
  csrf = data.csrf || "";
  return csrf;
}

export async function api(path, { method = "GET", body, _retry = false } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET" && method !== "HEAD") {
    headers["X-CSRF-Token"] = csrf || (await lerCsrf());
  }
  const r = await fetch(path, {
    method,
    headers,
    credentials: "same-origin",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (data.csrf) csrf = data.csrf;
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
