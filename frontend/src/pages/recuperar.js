import { api, esc } from "../lib/api.js";

export function renderRecuperar(app, { ir, path }) {
  const prefixo = "/recuperar/";
  const token = path.startsWith(prefixo) ? decodeURIComponent(path.slice(prefixo.length)) : "";
  if (token) renderNovaSenha(app, { ir, token });
  else renderPedido(app, { ir });
}

function renderPedido(app, { ir }) {
  app.innerHTML = `
    <div class="wrap">
      <div class="topo"><h1>Recuperar senha</h1></div>
      <div class="caixa">
        <div id="msgs"></div>
        <p class="dica">Informe seu usuário. O administrador recebe um link para você criar uma nova senha. O link vale por 2 horas.</p>
        <form>
          <label for="username">Usuário</label>
          <input type="text" id="username" autocomplete="username" autocapitalize="off" spellcheck="false" required autofocus>
          <button class="btn" type="submit">Pedir recuperação</button>
        </form>
        <a class="btn sec" href="/login" id="voltar">Voltar ao login</a>
      </div>
    </div>`;
  const msgs = app.querySelector("#msgs");
  app.querySelector("#voltar").addEventListener("click", (ev) => {
    ev.preventDefault();
    ir("/login");
  });
  app.querySelector("form").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    msgs.innerHTML = "";
    const btn = ev.target.querySelector("button");
    btn.disabled = true;
    try {
      const data = await api("/api/recuperar", {
        method: "POST",
        body: { username: app.querySelector("#username").value.trim() },
      });
      msgs.innerHTML = `<p class="msg ok">${esc(data.mensagem)}</p>`;
    } catch (err) {
      msgs.innerHTML = `<p class="msg erro">${esc(err.message)}</p>`;
      btn.disabled = false;
    }
  });
}

function renderNovaSenha(app, { ir, token }) {
  app.innerHTML = `
    <div class="wrap">
      <div class="topo"><h1>Nova senha</h1></div>
      <div class="caixa">
        <div id="msgs"><p class="dica">Conferindo o link...</p></div>
        <form hidden>
          <label for="nova">Nova senha</label>
          <input type="password" id="nova" autocomplete="new-password" required minlength="8">
          <p class="dica">Mínimo de 8 caracteres, com letras e números.</p>
          <label for="confirma">Confirmar nova senha</label>
          <input type="password" id="confirma" autocomplete="new-password" required minlength="8">
          <button class="btn" type="submit">Salvar senha</button>
        </form>
        <a class="btn sec" href="/login" id="voltar">Voltar ao login</a>
      </div>
    </div>`;
  const msgs = app.querySelector("#msgs");
  const form = app.querySelector("form");
  app.querySelector("#voltar").addEventListener("click", (ev) => {
    ev.preventDefault();
    ir("/login");
  });
  api(`/api/recuperar/${encodeURIComponent(token)}`).then(() => {
    msgs.innerHTML = "";
    form.hidden = false;
  }).catch((err) => {
    msgs.innerHTML = `<p class="msg erro">${esc(err.message)}</p>`;
  });
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    msgs.innerHTML = "";
    try {
      const data = await api(`/api/recuperar/${encodeURIComponent(token)}`, {
        method: "POST",
        body: {
          nova: app.querySelector("#nova").value,
          confirma: app.querySelector("#confirma").value,
        },
      });
      msgs.innerHTML = `<p class="msg ok">${esc(data.mensagem)}</p>`;
      form.hidden = true;
    } catch (err) {
      msgs.innerHTML = `<p class="msg erro">${esc(err.message)}</p>`;
    }
  });
}
