import { api, esc, formatarData } from "../lib/api.js";
import { criarUsuario, dadosAdmin, editarUsuario, excluirUsuario, redefinirSenhaUsuario, sair } from "../lib/conta.js";
import { ESTATICO } from "../lib/estatico.js";

function msg(el, texto, tipo) {
  el.innerHTML = texto ? `<p class="msg ${tipo}">${esc(texto)}</p>` : "";
}

function selo(u) {
  if (!u.ativo) return '<span class="selo off">Desativado</span>';
  if (u.expirado) return `<span class="selo off">Expirado em ${esc(formatarData(u.validade))}</span>`;
  if (u.validade && !u.is_admin) return `<span class="selo warn">Até ${esc(formatarData(u.validade))}</span>`;
  return `<span class="selo ok">Ativo${u.is_admin ? "" : " · sem prazo"}</span>`;
}

export async function renderAdmin(app, { ir }) {
  if (ESTATICO) {
    renderAdminLocal(app, { ir });
    return;
  }
  app.innerHTML = `
    <div class="wrap larga">
      <div class="barra">
        <h1>Administração de usuários</h1>
        <div class="links">
          <a class="btn peq sec" href="/" id="ir-home">Ir para a ferramenta</a>
          <button class="btn peq perigo" id="sair" type="button">Sair</button>
        </div>
      </div>
      <div id="msgs"></div>
      <div id="conteudo"><p class="dica">Carregando...</p></div>
    </div>`;

  const msgs = app.querySelector("#msgs");
  app.querySelector("#ir-home").addEventListener("click", (ev) => {
    ev.preventDefault();
    ir("/");
  });
  app.querySelector("#sair").addEventListener("click", async () => {
    await api("/api/logout", { method: "POST" });
    ir("/login");
  });

  let dados;
  try {
    dados = await api("/api/admin");
  } catch (err) {
    msg(msgs, err.message, "erro");
    return;
  }
  desenhar(dados);

  function desenhar(d) {
    const permChecks = Object.entries(d.permissoes).map(([chave, rotulo]) =>
      `<label><input type="checkbox" name="perm_${chave}" ${chave !== "email" ? "checked" : ""}> ${esc(rotulo)}</label>`
    ).join("");

    const usuarios = d.usuarios.map((u) => {
      const checks = Object.entries(d.permissoes).map(([chave, rotulo]) =>
        `<label><input type="checkbox" name="perm_${chave}" ${(u.permissoes[chave] || u.is_admin) ? "checked" : ""} ${u.is_admin ? "disabled" : ""}> ${esc(rotulo)}</label>`
      ).join("");
      const acesso = u.ultimo_acesso ? u.ultimo_acesso.replace("T", " ") : "nunca";
      return `
        <details class="usuario">
          <summary>
            <span class="nome-u">${esc(u.username)}</span>
            ${u.nome ? `<span class="meta">${esc(u.nome)}</span>` : ""}
            ${u.email ? `<span class="meta">${esc(u.email)}</span>` : '<span class="meta">sem e-mail</span>'}
            ${u.is_admin ? '<span class="selo adm">Administrador</span>' : ""}
            ${selo(u)}
            <span class="meta">Último acesso: ${esc(acesso)}</span>
          </summary>
          <div class="corpo-u">
            <form data-acao="editar" data-id="${u.id}">
              <div class="grade">
                <div><label>Nome</label><input type="text" name="nome" value="${esc(u.nome)}" maxlength="80"></div>
                <div><label>E-mail de recuperação</label><input type="email" name="email" value="${esc(u.email || "")}" maxlength="120" required autocapitalize="off" spellcheck="false"></div>
                <div><label>Acesso válido até</label><input type="date" name="validade" value="${esc(u.validade || "")}" ${u.is_admin ? "disabled" : ""}></div>
              </div>
              <label>Permissões</label>
              <div class="checks">
                ${checks}
                <label><input type="checkbox" name="is_admin" ${u.is_admin ? "checked" : ""} ${u.id === d.eu_id ? "disabled" : ""}> Administrador</label>
                <label><input type="checkbox" name="ativo" ${u.ativo ? "checked" : ""} ${u.id === d.eu_id ? "disabled" : ""}> Usuário ativo</label>
              </div>
              ${u.is_admin ? '<p class="dica">Administradores têm todas as permissões e não expiram.</p>' : ""}
              <div class="acoes-u"><button class="btn peq" type="submit">Salvar alterações</button></div>
            </form>
            <div class="sub">
              <form data-acao="senha" data-id="${u.id}" autocomplete="off">
                <div><label>Redefinir senha</label><input type="password" name="senha" minlength="8" required placeholder="nova senha temporária" autocomplete="new-password"></div>
                <button class="btn peq sec" type="submit">Redefinir</button>
              </form>
            </div>
            ${u.id !== d.eu_id ? `
            <div class="sub">
              <form data-acao="excluir" data-id="${u.id}">
                <button class="btn peq perigo" type="submit">Excluir usuário</button>
              </form>
            </div>` : ""}
          </div>
        </details>`;
    }).join("");

    const emails = d.emails.map((e) => `
      <div class="email-item">
        <span><strong>${esc(e.email)}</strong>${e.nome ? ` <span class="meta">· ${esc(e.nome)}</span>` : ""}</span>
        <button class="btn peq perigo" type="button" data-excluir-email="${e.id}" data-email="${esc(e.email)}">Remover</button>
      </div>`).join("") || '<p class="dica">Nenhum e-mail cadastrado.</p>';

    const recuperacoes = (d.recuperacoes || []).map((r) => `
      <div class="recuperacao">
        <span><strong>${esc(r.username)}</strong>${r.nome ? ` <span class="meta">${esc(r.nome)}</span>` : ""}
          <span class="meta"> · até ${esc((r.expira_em || "").replace("T", " "))}</span>
        </span>
        <span class="acoes">
          <button class="btn peq sec" type="button" data-copiar-token="${esc(r.token)}">Copiar link</button>
        </span>
      </div>`).join("") || '<p class="dica">Nenhum pedido em aberto.</p>';

    app.querySelector("#conteudo").innerHTML = `
      <div class="painel">
        <h2>Recuperação de senha (${(d.recuperacoes || []).length})</h2>
        <p class="dica">O link é enviado por e-mail. Se a pessoa não receber, copie aqui. Ele vale por 2 horas e só pode ser usado uma vez.</p>
        <div style="margin-top:8px;">${recuperacoes}</div>
      </div>
      <div class="painel">
        <h2>Novo usuário</h2>
        <form data-acao="novo" autocomplete="off">
          <div class="grade">
            <div><label>Usuário (login)</label><input type="text" name="username" required autocapitalize="off" spellcheck="false"></div>
            <div><label>Nome</label><input type="text" name="nome" maxlength="80"></div>
            <div><label>E-mail de recuperação</label><input type="email" name="email" required maxlength="120" placeholder="nome@empresa.com" autocapitalize="off" spellcheck="false"></div>
            <div><label>Senha inicial</label><input type="password" name="senha" required minlength="8" autocomplete="new-password"></div>
            <div><label>Acesso válido até</label><input type="date" name="validade" min="${esc(d.hoje)}"><p class="dica">Vazio = sem prazo. O último dia vale por inteiro.</p></div>
          </div>
          <label>Permissões</label>
          <div class="checks">
            ${permChecks}
            <label><input type="checkbox" name="is_admin"> Administrador (acesso total, sem prazo)</label>
          </div>
          <button class="btn" type="submit" style="width:auto;padding:11px 22px;">Criar usuário</button>
          <p class="dica">No primeiro acesso, o usuário será obrigado a trocar a senha.</p>
        </form>
      </div>
      <div class="painel" id="emails">
        <h2>E-mails cadastrados (${d.emails.length})</h2>
        <p class="dica">Estes e-mails aparecem na busca de destinatários da tela principal.</p>
        <form data-acao="email" autocomplete="off">
          <div class="grade">
            <div><label>E-mail(s)</label><input type="text" name="email" required placeholder="nome@empresa.com (vários: separe por vírgula)" autocapitalize="off" spellcheck="false"></div>
            <div><label>Nome / setor (opcional)</label><input type="text" name="nome" maxlength="80" placeholder="ex: Açougue Loja 07"></div>
          </div>
          <button class="btn" type="submit" style="width:auto;padding:11px 22px;">Cadastrar e-mail</button>
        </form>
        <div style="margin-top:14px;">${emails}</div>
      </div>
      <div class="painel">
        <h2>Usuários (${d.usuarios.length})</h2>
        ${usuarios}
      </div>`;

    app.querySelector("#conteudo").querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", (ev) => enviar(ev, form));
    });
    app.querySelectorAll("[data-copiar-token]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const link = `${location.origin}/recuperar/${btn.dataset.copiarToken}`;
        try {
          await navigator.clipboard.writeText(link);
          msg(msgs, "Link copiado.", "ok");
        } catch {
          msg(msgs, link, "ok");
        }
      });
    });
    app.querySelectorAll("[data-excluir-email]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm(`Remover ${btn.dataset.email} do cadastro?`)) return;
        await executar(() => api(`/api/admin/emails/${btn.dataset.excluirEmail}`, { method: "DELETE" }));
      });
    });
  }

  function lerChecks(form) {
    const permissoes = {};
    form.querySelectorAll('input[name^="perm_"]').forEach((el) => {
      permissoes[el.name.slice(5)] = el.checked;
    });
    return permissoes;
  }

  function campo(form, nome) {
    return form.querySelector(`[name="${nome}"]`);
  }

  async function executar(fn) {
    try {
      const data = await fn();
      msg(msgs, data.mensagem || "", data.ok === false ? "erro" : "ok");
      dados = await api("/api/admin");
      desenhar(dados);
    } catch (err) {
      msg(msgs, err.message, "erro");
    }
  }

  function enviar(ev, form) {
    ev.preventDefault();
    const acao = form.dataset.acao;
    const id = form.dataset.id;
    if (acao === "novo") {
      return executar(() => api("/api/admin/usuarios", {
        method: "POST",
        body: {
          username: campo(form, "username").value.trim(),
          nome: campo(form, "nome").value,
          email: campo(form, "email").value.trim(),
          senha: campo(form, "senha").value,
          validade: campo(form, "validade").value,
          is_admin: campo(form, "is_admin").checked,
          permissoes: lerChecks(form),
        },
      }));
    }
    if (acao === "editar") {
      const adminEl = campo(form, "is_admin");
      const ativoEl = campo(form, "ativo");
      return executar(() => api(`/api/admin/usuarios/${id}`, {
        method: "PUT",
        body: {
          nome: campo(form, "nome").value,
          email: campo(form, "email").value.trim(),
          validade: campo(form, "validade").value,
          is_admin: adminEl.checked,
          ativo: ativoEl.checked,
          permissoes: lerChecks(form),
        },
      }));
    }
    if (acao === "senha") {
      return executar(() => api(`/api/admin/usuarios/${id}/senha`, {
        method: "POST",
        body: { senha: campo(form, "senha").value },
      }));
    }
    if (acao === "excluir") {
      const nome = form.closest(".usuario").querySelector(".nome-u").textContent;
      if (!confirm(`Excluir o usuário ${nome}? Esta ação não pode ser desfeita.`)) return;
      return executar(() => api(`/api/admin/usuarios/${id}`, { method: "DELETE" }));
    }
  }
}

function renderAdminLocal(app, { ir }) {
  app.innerHTML = `
    <div class="wrap larga">
      <div class="barra">
        <h1>Administração de usuários</h1>
        <div class="links">
          <a class="btn peq sec" href="/" id="ir-home">Ir para a ferramenta</a>
          <button class="btn peq perigo" id="sair" type="button">Sair</button>
        </div>
      </div>
      <div id="msgs"></div>
      <div id="conteudo"></div>
    </div>`;
  const msgs = app.querySelector("#msgs");
  app.querySelector("#ir-home").addEventListener("click", (ev) => {
    ev.preventDefault();
    ir("/");
  });
  app.querySelector("#sair").addEventListener("click", () => {
    sair();
    ir("/login");
  });

  let dados;
  try {
    dados = dadosAdmin();
  } catch (err) {
    msg(msgs, err.message, "erro");
    return;
  }
  desenhar(dados);

  function desenhar(d) {
    const permChecks = Object.entries(d.permissoes).map(([chave, rotulo]) =>
      `<label><input type="checkbox" name="perm_${chave}" ${chave !== "email" ? "checked" : ""}> ${esc(rotulo)}</label>`
    ).join("");
    const usuarios = d.usuarios.map((u) => {
      const checks = Object.entries(d.permissoes).map(([chave, rotulo]) =>
        `<label><input type="checkbox" name="perm_${chave}" ${(u.permissoes[chave] || u.is_admin) ? "checked" : ""} ${u.is_admin ? "disabled" : ""}> ${esc(rotulo)}</label>`
      ).join("");
      const acesso = u.ultimo_acesso ? u.ultimo_acesso.replace("T", " ") : "nunca";
      return `
        <details class="usuario">
          <summary>
            <span class="nome-u">${esc(u.username)}</span>
            ${u.nome ? `<span class="meta">${esc(u.nome)}</span>` : ""}
            ${u.is_admin ? '<span class="selo adm">Administrador</span>' : ""}
            ${selo(u)}
            <span class="meta">Último acesso: ${esc(acesso)}</span>
          </summary>
          <div class="corpo-u">
            <form data-acao="editar" data-id="${u.id}">
              <div class="grade">
                <div><label>Nome</label><input type="text" name="nome" value="${esc(u.nome)}" maxlength="80"></div>
                <div><label>Acesso válido até</label><input type="date" name="validade" value="${esc(u.validade || "")}" ${u.is_admin ? "disabled" : ""}></div>
              </div>
              <label>Permissões</label>
              <div class="checks">
                ${checks}
                <label><input type="checkbox" name="is_admin" ${u.is_admin ? "checked" : ""} ${u.id === d.eu_id ? "disabled" : ""}> Administrador</label>
                <label><input type="checkbox" name="ativo" ${u.ativo ? "checked" : ""} ${u.id === d.eu_id ? "disabled" : ""}> Usuário ativo</label>
              </div>
              ${u.is_admin ? '<p class="dica">Administradores têm todas as permissões e não expiram.</p>' : ""}
              <div class="acoes-u"><button class="btn peq" type="submit">Salvar alterações</button></div>
            </form>
            <div class="sub">
              <form data-acao="senha" data-id="${u.id}" autocomplete="off">
                <div><label>Redefinir senha</label><input type="password" name="senha" minlength="8" required placeholder="nova senha temporária" autocomplete="new-password"></div>
                <button class="btn peq sec" type="submit">Redefinir</button>
              </form>
            </div>
            ${u.id !== d.eu_id ? `
            <div class="sub">
              <form data-acao="excluir" data-id="${u.id}">
                <button class="btn peq perigo" type="submit">Excluir usuário</button>
              </form>
            </div>` : ""}
          </div>
        </details>`;
    }).join("");

    app.querySelector("#conteudo").innerHTML = `
      <div class="painel">
        <h2>Novo usuário</h2>
        <form data-acao="novo" autocomplete="off">
          <div class="grade">
            <div><label>Usuário (login)</label><input type="text" name="username" required autocapitalize="off" spellcheck="false"></div>
            <div><label>Nome</label><input type="text" name="nome" maxlength="80"></div>
            <div><label>Senha inicial</label><input type="password" name="senha" required minlength="8" autocomplete="new-password"></div>
            <div><label>Acesso válido até</label><input type="date" name="validade" min="${esc(d.hoje)}"><p class="dica">Vazio = sem prazo. O último dia vale por inteiro.</p></div>
          </div>
          <label>Permissões</label>
          <div class="checks">
            ${permChecks}
            <label><input type="checkbox" name="is_admin"> Administrador (acesso total, sem prazo)</label>
          </div>
          <button class="btn" type="submit" style="width:auto;padding:11px 22px;">Criar usuário</button>
          <p class="dica">No primeiro acesso, o usuário será obrigado a trocar a senha.</p>
        </form>
      </div>
      <div class="painel">
        <h2>Usuários (${d.usuarios.length})</h2>
        ${usuarios}
      </div>`;

    app.querySelector("#conteudo").querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", (ev) => enviar(ev, form));
    });
  }

  function lerChecks(form) {
    const permissoes = {};
    form.querySelectorAll('input[name^="perm_"]').forEach((el) => {
      permissoes[el.name.slice(5)] = el.checked;
    });
    return permissoes;
  }

  function campo(form, nome) {
    return form.querySelector(`[name="${nome}"]`);
  }

  async function executar(fn) {
    try {
      const data = await fn();
      msg(msgs, data.mensagem || "", "ok");
      dados = dadosAdmin();
      desenhar(dados);
    } catch (err) {
      msg(msgs, err.message, "erro");
    }
  }

  function enviar(ev, form) {
    ev.preventDefault();
    const acao = form.dataset.acao;
    const id = form.dataset.id;
    if (acao === "novo") {
      return executar(() => criarUsuario({
        username: campo(form, "username").value.trim(),
        nome: campo(form, "nome").value,
        senha: campo(form, "senha").value,
        validade: campo(form, "validade").value,
        is_admin: campo(form, "is_admin").checked,
        permissoes: lerChecks(form),
      }));
    }
    if (acao === "editar") {
      return executar(() => editarUsuario(id, {
        nome: campo(form, "nome").value,
        validade: campo(form, "validade").value,
        is_admin: campo(form, "is_admin").checked,
        ativo: campo(form, "ativo").checked,
        permissoes: lerChecks(form),
      }));
    }
    if (acao === "senha") {
      return executar(() => redefinirSenhaUsuario(id, campo(form, "senha").value));
    }
    if (acao === "excluir") {
      const nome = form.closest(".usuario").querySelector(".nome-u").textContent;
      if (!confirm(`Excluir o usuário ${nome}? Esta ação não pode ser desfeita.`)) return;
      return executar(() => excluirUsuario(id));
    }
  }
}
