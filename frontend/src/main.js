import "./styles/app.css";
import { api } from "./lib/api.js";
import { renderLogin } from "./pages/login.js";
import { renderSenha } from "./pages/senha.js";
import { renderHome } from "./pages/home.js";
import { renderAdmin } from "./pages/admin.js";

const app = document.getElementById("app");

function ir(path) {
  if (location.pathname !== path) history.pushState({}, "", path);
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
  let path = location.pathname;

  if (!me) {
    path = "/login";
    if (location.pathname !== "/login") history.replaceState({}, "", "/login");
    renderLogin(app, { ir });
    return;
  }
  if (me.trocar_senha && path !== "/senha") {
    history.replaceState({}, "", "/senha");
    renderSenha(app, { ir, obrigatoria: true });
    return;
  }
  if (!me.trocar_senha && (path === "/login" || path === "/senha")) {
    history.replaceState({}, "", "/");
    path = "/";
  }
  if (path === "/admin") {
    if (!me.is_admin) {
      history.replaceState({}, "", "/");
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
