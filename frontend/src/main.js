import "./styles/app.css";
import { api } from "./lib/api.js";
import { renderLogin } from "./pages/login.js";
import { renderSenha } from "./pages/senha.js";
import { renderHome } from "./pages/home.js";
import { renderAdmin } from "./pages/admin.js";

const app = document.getElementById("app");
const base = import.meta.env.BASE_URL.replace(/\/$/, "");

function caminhoAtual() {
  let path = location.pathname;
  if (base && path.startsWith(base)) path = path.slice(base.length);
  if (!path || path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function urlDe(path) {
  return `${base}${path}`;
}

function ir(path) {
  const url = urlDe(path);
  if (location.pathname !== url) history.pushState({}, "", url);
  desenhar();
}

async function sessao() {
  try {
    const data = await api("/api/me");
    return data.usuario;
  } catch {
    return null;
  }
}

async function desenhar() {
  const me = await sessao();
  let path = caminhoAtual();

  if (!me) {
    if (path !== "/login") history.replaceState({}, "", urlDe("/login"));
    renderLogin(app, { ir });
    return;
  }
  if (me.trocar_senha && path !== "/senha") {
    history.replaceState({}, "", urlDe("/senha"));
    renderSenha(app, { ir, obrigatoria: true });
    return;
  }
  if (!me.trocar_senha && (path === "/login" || path === "/senha")) {
    history.replaceState({}, "", urlDe("/"));
    path = "/";
  }
  if (path === "/admin") {
    if (!me.is_admin) {
      history.replaceState({}, "", urlDe("/"));
      renderHome(app, { ir, me });
      return;
    }
    renderAdmin(app, { ir });
    return;
  }
  if (path === "/senha") {
    renderSenha(app, { ir, obrigatoria: false });
    return;
  }
  renderHome(app, { ir, me });
}

window.addEventListener("popstate", () => desenhar());
desenhar();
