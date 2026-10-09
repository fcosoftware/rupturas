import { api, esc } from "../lib/api.js";

export function renderLogin(app, { ir }) {
  app.innerHTML = `
    <div class="wrap">
      <div class="topo">
        <p class="tag">CENTRO DE DISTRIBUIÇÃO</p>
        <h1>Processador de Planilha</h1>
      </div>
      <div class="caixa">
        <div id="msgs"></div>
        <form autocomplete="on">
          <label for="username">Usuário</label>
          <input type="text" id="username" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" required autofocus>
          <label for="senha">Senha</label>
          <input type="password" id="senha" autocomplete="current-password" required>
          <button class="btn" type="submit">Entrar</button>
        </form>
        ${import.meta.env.VITE_API_BASE ? '<p class="dica">O login usa o servidor que está aberto neste computador.</p>' : ""}
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
      await api("/api/login", {
        method: "POST",
        body: {
          username: app.querySelector("#username").value.trim(),
          senha: app.querySelector("#senha").value,
        },
      });
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
}
