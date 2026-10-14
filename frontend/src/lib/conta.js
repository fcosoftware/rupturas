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

function publico(u) {
  return {
    id: u.id,
    username: u.username,
    nome: u.nome,
    is_admin: u.is_admin,
    estatico: true,
    trocar_senha: u.trocar_senha,
    validade: "",
    permissoes: u.permissoes,
    emails: EMAILS.map((email) => ({ email, nome: "" })),
  };
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
  const u = ler().usuarios.find((item) => item.id === id && item.ativo);
  return u ? publico(u) : null;
}

export async function entrar(username, senha) {
  await preparar();
  const u = ler().usuarios.find((item) => item.username.toLowerCase() === username.toLowerCase());
  const hash = u ? await hashSenha(senha, u.salt) : "";
  if (!u || !iguais(hash, u.hash)) {
    throw new Error("Usuário ou senha incorretos.");
  }
  if (!u.ativo) throw new Error("Este usuário está desativado. Fale com o administrador.");
  sessionStorage.setItem(SESSAO, String(u.id));
  return publico(u);
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
