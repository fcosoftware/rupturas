/** Abre o Gmail com a senha endereçada ao administrador. */
import { esc } from "./api.js";

/** Recuperação e avisos do admin sempre vão para este e-mail. */
export const EMAIL_ADMIN = "fcosoftware35@gmail.com";

export function emailAdministrador() {
  return EMAIL_ADMIN;
}

export function abrirGmailSenha({ username, nome, senha, assunto }) {
  const login = String(username || "").trim();
  const segredo = String(senha || "");
  if (!login || !segredo) throw new Error("Não há senha para enviar.");
  const linhas = [
    "Senha do Processador de Planilha.",
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
  const titulo = assunto || `Senha de acesso — ${login}`;
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL_ADMIN)}&su=${encodeURIComponent(titulo)}&body=${encodeURIComponent(linhas.join("\n"))}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function htmlEnvioSenha(username) {
  return `
    <div class="envio-senha">
      <div class="aviso-envio"></div>
      <p class="dica">Enviar a senha de <strong>${esc(username)}</strong> para <strong>${esc(EMAIL_ADMIN)}</strong>. O Gmail abre preenchido; confirme o envio lá.</p>
      <button class="btn sec" type="button" data-enviar-senha>Enviar senha para ${esc(EMAIL_ADMIN)}</button>
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
        username: dados.username,
        nome: dados.nome,
        senha: dados.senha,
        assunto: dados.assunto,
      });
      if (aviso) aviso.innerHTML = `<p class="msg ok">Gmail aberto para ${esc(EMAIL_ADMIN)}. Confirme o envio.</p>`;
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
