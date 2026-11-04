/** Contas compartilhadas no GitHub (mesmo login em qualquer computador). */
const REPO = "fcosoftware/rupturas";
const CAMINHO = "docs/contas.json";
const TOKEN = "ruptura.githubToken";

export function tokenSync() {
  return (localStorage.getItem(TOKEN) || import.meta.env.VITE_GITHUB_TOKEN || "").trim();
}

export function salvarTokenSync(valor) {
  const t = String(valor || "").trim();
  if (t) localStorage.setItem(TOKEN, t);
  else localStorage.removeItem(TOKEN);
}

function urlPublica() {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}contas.json?t=${Date.now()}`;
}

export async function baixarContas() {
  const r = await fetch(urlPublica(), { cache: "no-store" });
  if (!r.ok) throw new Error("Não foi possível carregar as contas compartilhadas.");
  const data = await r.json();
  if (!data || !Array.isArray(data.usuarios)) throw new Error("Arquivo de contas inválido.");
  return data;
}

export async function publicarContas(data) {
  const token = tokenSync();
  if (!token) {
    throw new Error(
      "Para a senha valer em outros computadores, cole um token GitHub em Administração (permissão Contents: Read and write neste repositório).",
    );
  }
  // Nunca publica senha em texto claro no repositório.
  const limpo = {
    atualizado_em: data.atualizado_em || new Date().toISOString(),
    usuarios: data.usuarios,
  };

  const meta = await fetch(`https://api.github.com/repos/${REPO}/contents/${CAMINHO}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!meta.ok) {
    const erro = await meta.json().catch(() => ({}));
    throw new Error(erro.message || "Token sem acesso para publicar as contas.");
  }
  const info = await meta.json();
  const texto = JSON.stringify(limpo, null, 2);
  const bytes = new TextEncoder().encode(texto);
  let bin = "";
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  const corpo = btoa(bin);
  const put = await fetch(`https://api.github.com/repos/${REPO}/contents/${CAMINHO}`, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message: "Atualiza contas compartilhadas.",
      content: corpo,
      sha: info.sha,
      branch: "main",
    }),
  });
  if (!put.ok) {
    const erro = await put.json().catch(() => ({}));
    throw new Error(erro.message || "Falha ao publicar as contas no GitHub.");
  }
}
