/** Contas do site no GitHub Pages. Ficam neste navegador, sem servidor. */
import { ESTATICO } from "./estatico.js";

const CONTAS = "ruptura.contas";
const SESSAO = "ruptura.sessao";
const INICIAL = "ruptura.senhaInicial";

const EMAILS = [
  "alexandre.gorges@giassi.com.br",
  "lidio.silva@giassi.com.br",
  "jolsimar.silva@giassi.com.br",
  "centroloja.lj07@giassi.com.br",
  "bazar.lj07@giassi.com.br",
  "acougue.lj07@giassi.com.br",
];

function ler() {
  try {
    const data = JSON.parse(localStorage.getItem(CONTAS) || "");
    if (!data || !Array.isArray(data.usuarios)) return { usuarios: [] };
    return data;
  } catch {
    return { usuarios: [] };
  }
}

function salvar(data) {
  localStorage.setItem(CONTAS, JSON.stringify(data));
}

function hex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function senhaTemporaria() {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  let senha = "";
  for (const b of bytes) senha += alfabeto[b % alfabeto.length];
  return `${senha}a7`;
}

async function hashSenha(senha, salt) {
  const enc = new TextEncoder();
  const chave = await crypto.subtle.importKey("raw", enc.encode(senha), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: 120000, hash: "SHA-256" },
    chave,
    256,
  );
  return hex(new Uint8Array(bits));
}

function iguais(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function validarSenhaLocal(senha) {
  if (senha.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
  if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) return "A senha deve conter letras e números.";
  return "";
}

const PERMISSOES = {
  processar: "Processar planilha",
  baixar: "Baixar planilha processada",
  email: "Enviar por e-mail",
};

function hoje() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function expirado(u) {
  if (u.is_admin || !u.validade) return false;
  return hoje() > u.validade;
}

function permissoesDe(u) {
  if (u.is_admin) return { processar: true, baixar: true, email: true };
  const p = u.permissoes || {};
  return {
    processar: !!p.processar,
    baixar: !!p.baixar,
    email: !!p.email,
  };
}

function publico(u) {
  return {
    id: u.id,
    username: u.username,
    nome: u.nome,
    email: u.email || "",
    is_admin: !!u.is_admin,
    ativo: u.ativo !== false,
    estatico: true,
    trocar_senha: !!u.trocar_senha,
    validade: u.is_admin ? "" : (u.validade || ""),
    expirado: expirado(u),
    ultimo_acesso: u.ultimo_acesso || "",
    permissoes: permissoesDe(u),
    emails: EMAILS.map((email) => ({ email, nome: "" })),
  };
}

function validarUsername(nome) {
  if (!/^[A-Za-z0-9._-]{3,32}$/.test(nome)) {
    return "Usuário: 3 a 32 caracteres (letras, números, ponto, hífen ou sublinhado).";
  }
  return "";
}

function validarData(txt) {
  if (!txt) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(txt) || Number.isNaN(new Date(`${txt}T00:00:00`).getTime())) {
    return "Data de validade inválida.";
  }
  return "";
}

function exigirAdmin() {
  const me = usuarioAtual();
  if (!me?.is_admin) throw new Error("Acesso restrito ao administrador.");
  return me;
}

function adminsAtivos(usuarios, excetoId) {
  return usuarios.filter((u) => u.is_admin && u.ativo !== false && u.id !== excetoId).length;
}

async function criarAdmin(senha) {
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  const usuario = {
    id: 1,
    username: "admin",
    nome: "Administrador",
    salt,
    hash: await hashSenha(senha, salt),
    is_admin: true,
    ativo: true,
    trocar_senha: true,
    permissoes: { processar: true, baixar: true, email: true },
  };
  salvar({ usuarios: [usuario] });
  localStorage.setItem(INICIAL, senha);
}

export async function preparar() {
  if (!ESTATICO) return;
  if (!ler().usuarios.length) await criarAdmin(senhaTemporaria());
}

export function senhaInicialVisivel() {
  const admin = ler().usuarios.find((u) => u.username === "admin");
  if (!admin?.trocar_senha) return "";
  return localStorage.getItem(INICIAL) || "";
}

export function usuarioAtual() {
  const id = Number(sessionStorage.getItem(SESSAO) || 0);
  const u = ler().usuarios.find((item) => item.id === id && item.ativo !== false);
  if (!u || expirado(u)) {
    if (u) sessionStorage.removeItem(SESSAO);
    return null;
  }
  return publico(u);
}

export async function entrar(username, senha) {
  await preparar();
  const u = ler().usuarios.find((item) => item.username.toLowerCase() === username.toLowerCase());
  const hash = u ? await hashSenha(senha, u.salt) : "";
  if (!u || !iguais(hash, u.hash)) {
    throw new Error("Usuário ou senha incorretos.");
  }
  if (!u.ativo) throw new Error("Este usuário está desativado. Fale com o administrador.");
  if (expirado(u)) throw new Error("Seu acesso expirou. Fale com o administrador.");
  const data = ler();
  const alvo = data.usuarios.find((item) => item.id === u.id);
  alvo.ultimo_acesso = new Date().toISOString().slice(0, 19);
  salvar(data);
  sessionStorage.setItem(SESSAO, String(u.id));
  return publico(alvo);
}

export function sair() {
  sessionStorage.removeItem(SESSAO);
}

export async function trocarSenha({ atual, nova, confirma }) {
  const me = usuarioAtual();
  if (!me) throw new Error("Faça login para continuar.");
  if (nova !== confirma) throw new Error("A confirmação não confere com a nova senha.");
  if (nova === atual) throw new Error("A nova senha deve ser diferente da atual.");
  const erro = validarSenhaLocal(nova);
  if (erro) throw new Error(erro);
  const data = ler();
  const u = data.usuarios.find((item) => item.id === me.id);
  const hashAtual = await hashSenha(atual, u.salt);
  if (!iguais(hashAtual, u.hash)) throw new Error("Senha atual incorreta.");
  u.salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  u.hash = await hashSenha(nova, u.salt);
  u.trocar_senha = false;
  salvar(data);
  localStorage.removeItem(INICIAL);
  return { mensagem: "Senha alterada com sucesso." };
}

export async function recriarAdmin() {
  sair();
  localStorage.removeItem(CONTAS);
  localStorage.removeItem(INICIAL);
  const senha = senhaTemporaria();
  await criarAdmin(senha);
  return senha;
}

export function dadosAdmin() {
  const me = exigirAdmin();
  return {
    eu_id: me.id,
    hoje: hoje(),
    permissoes: PERMISSOES,
    usuarios: ler().usuarios.map(publico),
  };
}

export async function criarUsuario({ username, nome, senha, validade, is_admin, permissoes }) {
  exigirAdmin();
  const login = String(username || "").trim();
  const erro = validarUsername(login) || validarSenhaLocal(String(senha || "")) || validarData(validade || "");
  if (erro) throw new Error(erro);
  const data = ler();
  if (data.usuarios.some((u) => u.username.toLowerCase() === login.toLowerCase())) {
    throw new Error("Já existe um usuário com esse nome.");
  }
  const admin = !!is_admin;
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  const id = data.usuarios.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  data.usuarios.push({
    id,
    username: login,
    nome: String(nome || "").trim().slice(0, 80),
    email: "",
    salt,
    hash: await hashSenha(senha, salt),
    is_admin: admin,
    ativo: true,
    trocar_senha: true,
    validade: admin ? "" : (validade || ""),
    permissoes: admin
      ? { processar: true, baixar: true, email: true }
      : {
        processar: !!permissoes?.processar,
        baixar: !!permissoes?.baixar,
        email: !!permissoes?.email,
      },
    ultimo_acesso: "",
  });
  salvar(data);
  return { ok: true, mensagem: `Usuário '${login}' criado. Ele deverá trocar a senha no primeiro acesso.` };
}

export function editarUsuario(id, { nome, validade, is_admin, ativo, permissoes }) {
  const me = exigirAdmin();
  const data = ler();
  const u = data.usuarios.find((item) => item.id === Number(id));
  if (!u) throw new Error("Usuário não encontrado.");
  const erro = validarData(validade || "");
  if (erro) throw new Error(erro);
  const seraAdmin = u.id === me.id ? true : !!is_admin;
  const seraAtivo = u.id === me.id ? true : !!ativo;
  if (u.is_admin && (!seraAdmin || !seraAtivo) && adminsAtivos(data.usuarios, u.id) === 0) {
    throw new Error("É preciso manter pelo menos um administrador ativo.");
  }
  u.nome = String(nome || "").trim().slice(0, 80);
  u.is_admin = seraAdmin;
  u.ativo = seraAtivo;
  u.validade = seraAdmin ? "" : (validade || "");
  u.permissoes = seraAdmin
    ? { processar: true, baixar: true, email: true }
    : {
      processar: !!permissoes?.processar,
      baixar: !!permissoes?.baixar,
      email: !!permissoes?.email,
    };
  salvar(data);
  return { ok: true, mensagem: `Usuário '${u.username}' atualizado.` };
}

export async function redefinirSenhaUsuario(id, senha) {
  const me = exigirAdmin();
  const erro = validarSenhaLocal(String(senha || ""));
  if (erro) throw new Error(erro);
  const data = ler();
  const u = data.usuarios.find((item) => item.id === Number(id));
  if (!u) throw new Error("Usuário não encontrado.");
  u.salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  u.hash = await hashSenha(senha, u.salt);
  u.trocar_senha = u.id !== me.id;
  salvar(data);
  return { ok: true, mensagem: `Senha de '${u.username}' redefinida.` };
}

export function excluirUsuario(id) {
  const me = exigirAdmin();
  const data = ler();
  const u = data.usuarios.find((item) => item.id === Number(id));
  if (!u) throw new Error("Usuário não encontrado.");
  if (u.id === me.id) throw new Error("Você não pode excluir o próprio usuário.");
  if (u.is_admin && adminsAtivos(data.usuarios, u.id) === 0) {
    throw new Error("É preciso manter pelo menos um administrador ativo.");
  }
  data.usuarios = data.usuarios.filter((item) => item.id !== u.id);
  salvar(data);
  return { ok: true, mensagem: `Usuário '${u.username}' excluído.` };
}
