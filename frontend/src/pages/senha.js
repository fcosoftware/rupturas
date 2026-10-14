import { api, esc } from "../lib/api.js";
import { sair, trocarSenha } from "../lib/conta.js";
import { ESTATICO } from "../lib/estatico.js";

export function renderSenha(app, { ir, obrigatoria }) {
  app.innerHTML = `
    <div class="wrap">
      <div class="topo"><h1>Alterar senha</h1></div>
      <div class="caixa">
        <div id="msgs"></div>
        ${obrigatoria ? '<p class="msg ok">Por segurança, defina uma nova senha para continuar.</p>' : ""}
        <form>
          <label for="atual">Senha atual</label>
          <input type="password" id="atual" autocomplete="current-password" required autofocus>
          <label for="nova">Nova senha</label>
          <input type="password" id="nova" autocomplete="new-password" required minlength="8">
          <p class="dica">Mínimo de 8 caracteres, com letras e números.</p>
          <label for="confirma">Confirmar nova senha</label>
          <input type="password" id="confirma" autocomplete="new-password" required minlength="8">
          <button class="btn" type="submit">Salvar senha</button>
        </form>
        ${obrigatoria
          ? '<button class="btn sec" id="sair" type="button">Sair</button>'
          : '<a class="btn sec" href="/" id="voltar">Voltar</a>'}
      </div>
    </div>`;

  const msgs = app.querySelector("#msgs");
  app.querySelector("form").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    msgs.innerHTML = "";
    try {
      const corpo = {
        atual: app.querySelector("#atual").value,
        nova: app.querySelector("#nova").value,
        confirma: app.querySelector("#confirma").value,
      };
      const data = ESTATICO
        ? await trocarSenha(corpo)
        : await api("/api/senha", { method: "POST", body: corpo });
      msgs.innerHTML = `<p class="msg ok">${esc(data.mensagem)}</p>`;
      ir("/");
    } catch (err) {
      msgs.innerHTML = `<p class="msg erro">${esc(err.message)}</p>`;
    }
  });

  app.querySelector("#sair")?.addEventListener("click", async () => {
    if (ESTATICO) sair();
    else await api("/api/logout", { method: "POST" });
    ir("/login");
  });
  app.querySelector("#voltar")?.addEventListener("click", (ev) => {
    ev.preventDefault();
    ir("/");
  });
}
