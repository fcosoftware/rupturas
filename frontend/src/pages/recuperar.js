import { api, esc } from "../lib/api.js";
import { recuperarSenhaAdmin, recriarAdmin } from "../lib/conta.js";
import { ESTATICO } from "../lib/estatico.js";
import { EMAIL_ADMIN, htmlEnvioSenha, ligarEnvioSenha } from "../lib/gmail.js";

export function renderRecuperar(app, { ir, path }) {
  const prefixo = "/recuperar/";
  const token = path.startsWith(prefixo) ? decodeURIComponent(path.slice(prefixo.length)) : "";
  if (ESTATICO) renderRecuperarEstatico(app, { ir });
  else if (token) renderNovaSenha(app, { ir, token });
  else renderPedido(app, { ir });
}

function renderRecuperarEstatico(app, { ir }) {
  app.innerHTML = `
    <div class="wrap">
      <div class="topo"><h1>Recuperar senha</h1></div>
      <div class="caixa">
        <div id="msgs"></div>
        <p class="dica">A recuperação da senha do <strong>admin</strong> sempre é enviada para <strong>${esc(EMAIL_ADMIN)}</strong>.</p>
        <button class="btn" id="recuperar-admin" type="button">Gerar nova senha do admin</button>
        <p class="dica">Isso cria uma senha temporária e abre o Gmail para ${esc(EMAIL_ADMIN)}. Confirme o envio lá.</p>
        <a class="btn sec" href="/login" id="voltar">Voltar ao login</a>
      </div>
    </div>`;
  app.querySelector("#voltar").addEventListener("click", (ev) => {
    ev.preventDefault();
    ir("/login");
  });
  app.querySelector("#recuperar-admin").addEventListener("click", async () => {
    const msgs = app.querySelector("#msgs");
    const btn = app.querySelector("#recuperar-admin");
    btn.disabled = true;
    try {
      let senha;
      try {
        senha = await recuperarSenhaAdmin();
      } catch {
        senha = await recriarAdmin();
      }
      msgs.innerHTML = `
        <p class="msg ok">Nova senha temporária do admin gerada.</p>
        ${htmlEnvioSenha("admin")}`;
      ligarEnvioSenha(msgs, () => ({
        username: "admin",
        nome: "Administrador",
        senha,
        assunto: "Recuperação de senha do admin — Processador de Planilha",
      }));
      msgs.querySelector("[data-enviar-senha]")?.click();
    } catch (err) {
      msgs.innerHTML = `<p class="msg erro">${esc(err.message)}</p>`;
      btn.disabled = false;
    }
  });
}

function renderPedido(app, { ir }) {
  app.innerHTML = `
    <div class="wrap">
      <div class="topo"><h1>Recuperar senha</h1></div>
      <div class="caixa">
        <div id="msgs"></div>
        <p class="dica">Informe o e-mail da conta. A recuperação do <strong>admin</strong> sempre vai para <strong>${esc(EMAIL_ADMIN)}</strong>. O link vale por 2 horas.</p>
        <form>
          <label for="email">E-mail</label>
          <input type="email" id="email" value="${esc(EMAIL_ADMIN)}" autocomplete="email" autocapitalize="off" spellcheck="false" inputmode="email" required autofocus>
          <button class="btn" type="submit">Enviar link por e-mail</button>
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
        body: { email: app.querySelector("#email").value.trim() },
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
