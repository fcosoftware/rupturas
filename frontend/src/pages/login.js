import { api, esc } from "../lib/api.js";
import { entrar, preparar, senhaInicialVisivel } from "../lib/conta.js";
import { ESTATICO } from "../lib/estatico.js";
import { htmlEnvioSenha, ligarEnvioSenha } from "../lib/gmail.js";

export function renderLogin(app, { ir }) {
  app.innerHTML = `<p class="dica">Carregando...</p>`;
  montar();

  async function montar() {
    if (ESTATICO) await preparar();
    const inicial = ESTATICO ? senhaInicialVisivel() : "";
    app.innerHTML = `
    <div class="wrap">
      <div class="topo">
        <p class="tag">CENTRO DE DISTRIBUIÇÃO</p>
        <h1>Processador de Planilha</h1>
      </div>
      <div class="caixa">
        <div id="msgs"></div>
        ${inicial ? `<p class="dica">Primeiro acesso neste navegador. Usuário <strong>admin</strong>, senha temporária <strong>${esc(inicial)}</strong>.</p>${htmlEnvioSenha("admin")}` : ""}
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
  if (inicial) {
    ligarEnvioSenha(app, () => ({ username: "admin", nome: "Administrador", senha: inicial }));
  }
  }
}
