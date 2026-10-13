import { api, esc, formatarData } from "../lib/api.js";
import { ligarFerramenta } from "../planilha/processar.js";

export function renderHome(app, { ir, me }) {
  const perms = me.permissoes || {};
  const validade = !me.is_admin && me.validade ? ` · acesso até ${formatarData(me.validade)}` : "";
  app.innerHTML = `
    <div class="card">
      <div class="userbar">
        <span>👤 ${esc(me.nome || me.username)}${esc(validade)}</span>
        <span class="acoes">
          ${me.estatico ? "" : `
          ${me.is_admin ? '<a href="/admin" id="ir-admin">Administração</a>' : ""}
          <a href="/senha" id="ir-senha">Alterar senha</a>
          <button type="button" id="sair">Sair</button>
          `}
        </span>
      </div>
      <div class="header">
        <p class="tag">CENTRO DE DISTRIBUIÇÃO</p>
        <h1>Processador de Planilha</h1>
      </div>
      <div class="body">
        ${perms.processar ? `
        <div class="step">
          <label>1. Selecione a planilha (.xlsx)</label>
          <div class="filebox">
            <label class="btn-pick" for="arquivo">Escolher arquivo</label>
            <input type="file" id="arquivo" accept=".xlsx">
            <div class="fname" id="fname">Nenhum arquivo selecionado</div>
          </div>
        </div>
        <div class="step">
          <label>2. Nome da nova planilha</label>
          <input type="text" id="nomeSaida" placeholder="ex: Report_processado">
        </div>
        <button class="principal" id="btnProcessar" disabled>Processar planilha</button>
        ${perms.baixar ? '<button class="baixar" id="btnBaixar">⬇️ Baixar planilha processada</button>' : ""}
        ` : ""}
        ${!perms.processar && !perms.email ? '<div class="aviso-sem-perm">Seu usuário ainda não tem permissões nesta ferramenta. Fale com o administrador.</div>' : ""}
        <div class="console" id="console"></div>
        ${perms.email ? `
        <hr class="divisor">
        <div class="step">
          <label>3. Enviar por e-mail</label>
          <label class="suave">Remetente</label>
          <input type="email" id="remetente" placeholder="seu-email@gmail.com" autocomplete="email" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="email">
          <p class="hint">Informativo — o Gmail sempre envia pela conta que estiver logada no navegador/app.</p>
          <label class="suave">Destinatários</label>
          <div class="busca-wrap">
            <input type="text" id="buscaEmail" placeholder="🔍 Pesquisar e-mail cadastrado..." autocomplete="off" autocapitalize="off" spellcheck="false">
            <div id="resultadosEmail" class="resultados" hidden></div>
          </div>
          <div class="busca-acoes"><button type="button" class="btn-link" id="btnAddTodos">Adicionar todos os cadastrados</button></div>
          <div id="listaDestinatarios"></div>
          <button type="button" class="btn-add-dest" id="btnAddDest">+ Digitar outro e-mail</button>
          <label class="suave">Assunto</label>
          <input type="text" id="assunto" value="Produtos em Ruptura">
          <label class="suave">Corpo do e-mail</label>
          <textarea id="corpoEmail">Segue o relatório dos produtos que estão zerados em nossa loja!!</textarea>
          <button class="enviar" id="btnEnviarEmail">📧 Abrir no Gmail</button>
          <p class="hint">Isso abre o Gmail já preenchido. O Gmail não permite anexar o arquivo automaticamente pelo link — anexe a planilha baixada manualmente antes de enviar.</p>
        </div>` : ""}
        <p class="foot">Tudo roda no navegador — a planilha não é enviada para nenhum servidor.<br>© 2026 [Francisco Cunha/FCOSOFTWARE]. Todos os direitos reservados. Desenvolvido com foco em performance.</p>
      </div>
    </div>`;

  app.querySelector("#ir-admin")?.addEventListener("click", (ev) => {
    ev.preventDefault();
    ir("/admin");
  });
  app.querySelector("#ir-senha")?.addEventListener("click", (ev) => {
    ev.preventDefault();
    ir("/senha");
  });
  app.querySelector("#sair")?.addEventListener("click", async () => {
    await api("/api/logout", { method: "POST" });
    ir("/login");
  });

  ligarFerramenta(app, { perms, emails: me.emails || [] });
}
