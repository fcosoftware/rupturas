/** Abre o Gmail com a senha de primeiro acesso endereçada ao administrador. */
import { esc } from "./api.js";

const CHAVE = "ruptura.emailAdmin";
const EMAIL_PADRAO = "fcosoftware35@gmail.com";

export function emailAdministrador() {
  return localStorage.getItem(CHAVE) || EMAIL_PADRAO;
}

function gravarEmail(valor) {
  const email = String(valor || "").trim().toLowerCase();
  if (!email) throw new Error("Informe o e-mail do administrador.");
  if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("E-mail do administrador inválido.");
  }
  localStorage.setItem(CHAVE, email);
  return email;
}

export function abrirGmailSenha({ para, username, nome, senha }) {
  const destino = gravarEmail(para);
  const login = String(username || "").trim();
  const segredo = String(senha || "");
  if (!login || !segredo) throw new Error("Não há senha de primeiro acesso para enviar.");
  const linhas = [
    "Senha de primeiro acesso do Processador de Planilha.",
    "",
    `Usuário: ${login}`,
  ];
  const nomeLimpo = String(nome || "").trim();
  if (nomeLimpo) linhas.push(`Nome: ${nomeLimpo}`);
  linhas.push(
    `Senha: ${segredo}`,
    "",
    "No primeiro acesso será obrigatório trocar esta senha.",
  );
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(destino)}&su=${encodeURIComponent(`Senha de primeiro acesso — ${login}`)}&body=${encodeURIComponent(linhas.join("\n"))}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function htmlEnvioSenha(username) {
  return `
    <div class="envio-senha">
      <div class="aviso-envio"></div>
      <p class="dica">Enviar a senha de primeiro acesso de <strong>${esc(username)}</strong> ao administrador. O Gmail abre preenchido; confirme o envio lá.</p>
      <label>E-mail do administrador</label>
      <input type="email" class="email-admin" value="${esc(emailAdministrador())}" maxlength="120" placeholder="${esc(EMAIL_PADRAO)}" autocapitalize="off" spellcheck="false" autocomplete="off">
      <button class="btn sec" type="button" data-enviar-senha>Enviar senha ao administrador</button>
    </div>`;
}

export function ligarEnvioSenha(raiz, obterDados) {
  const btn = raiz.querySelector("[data-enviar-senha]");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const aviso = raiz.querySelector(".aviso-envio");
    try {
      const dados = obterDados();
      abrirGmailSenha({
        para: raiz.querySelector(".email-admin").value,
        username: dados.username,
        nome: dados.nome,
        senha: dados.senha,
      });
      if (aviso) aviso.innerHTML = `<p class="msg ok">Gmail aberto com a senha de primeiro acesso. Confirme o envio.</p>`;
    } catch (err) {
      if (aviso) aviso.innerHTML = `<p class="msg erro">${esc(err.message)}</p>`;
    }
  });
}

export function mostrarEnvioSenha(box, dados) {
  box.hidden = false;
  box.innerHTML = htmlEnvioSenha(dados.username);
  ligarEnvioSenha(box, () => dados);
}
