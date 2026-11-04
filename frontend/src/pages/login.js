import { api, esc } from "../lib/api.js";
import { entrar, preparar, senhaInicialPendente, senhaInicialVisivel } from "../lib/conta.js";
import { ESTATICO } from "../lib/estatico.js";
import { EMAIL_ADMIN, htmlEnvioSenha, ligarEnvioSenha, abrirGmailSenha } from "../lib/gmail.js";

export function renderLogin(app, { ir }) {
  app.innerHTML = `<p class="dica">Carregando...</p>`;
  montar();

  async function montar() {
    if (ESTATICO) await preparar();
    const pendente = ESTATICO && senhaInicialPendente();
    const inicial = pendente ? senhaInicialVisivel() : "";
    app.innerHTML = `
    <div class="wrap">
      <div class="topo">
        <p class="tag">CENTRO DE DISTRIBUIÇÃO</p>
        <h1>Processador de Planilha</h1>
      </div>
      <div class="caixa">
        <div id="msgs"></div>
        ${pendente ? `
          <p class="dica">Primeiro acesso do admin. A senha temporária <strong>não é exibida nesta tela</strong> — ela vai para <strong>${esc(EMAIL_ADMIN)}</strong>.</p>
          ${htmlEnvioSenha("admin", EMAIL_ADMIN)}
        ` : ""}
        <form autocomplete="on">
          <label for="username">Usuário</label>
          <input type="text" id="username" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" required autofocus>
          <label for="senha">Senha</label>
          <input type="password" id="senha" autocomplete="current-password" required>
          <button class="btn" type="submit">Entrar</button>
        </form>
        <a class="link-recuperar" href="/recuperar" id="recuperar">Esqueci minha senha</a>
        <p class="foot">© 2026 [Francisco Cunha/FCOSOFTWARE]. Todos os direitos reservados.</p>
      </div>
    </div>`;

  const msgs = app.querySelector("#msgs");
  app.querySelector("form").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    msgs.innerHTML = "";
    const btn = ev.target.querySelector("button");
    btn.disabled = true;
    try {
      if (ESTATICO) {
        await entrar(app.querySelector("#username").value.trim(), app.querySelector("#senha").value);
      } else {
        await api("/api/login", {
          method: "POST",
          body: {
            username: app.querySelector("#username").value.trim(),
            senha: app.querySelector("#senha").value,
          },
        });
      }
      ir("/");
    } catch (err) {
      msgs.innerHTML = `<p class="msg erro">${esc(err.message)}</p>`;
      btn.disabled = false;
    }
  });
  app.querySelector("#recuperar").addEventListener("click", (ev) => {
    ev.preventDefault();
    ir("/recuperar");
  });
  if (pendente && inicial) {
    ligarEnvioSenha(app, () => ({
      para: EMAIL_ADMIN,
      username: "admin",
      nome: "Administrador",
      senha: inicial,
      assunto: "Senha de primeiro acesso do admin — Processador de Planilha",
    }));
    try {
      abrirGmailSenha({
        para: EMAIL_ADMIN,
        username: "admin",
        nome: "Administrador",
        senha: inicial,
        assunto: "Senha de primeiro acesso do admin — Processador de Planilha",
      });
      const aviso = app.querySelector(".aviso-envio");
      if (aviso) {
        aviso.innerHTML = `<p class="msg ok">Senha enviada para <strong>${esc(EMAIL_ADMIN)}</strong>. Confirme no Gmail. Ela não aparece nesta tela.</p>`;
      }
    } catch (err) {
      const aviso = app.querySelector(".aviso-envio");
      if (aviso) aviso.innerHTML = `<p class="msg erro">${esc(err.message)}</p>`;
    }
  }
  }
}
