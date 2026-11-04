/** Envia senha por e-mail (Gmail) sem exibir a senha na tela. */
import { esc } from "./api.js";

/** Recuperação e avisos do admin sempre vão para este e-mail. */
export const EMAIL_ADMIN = "fcosoftware35@gmail.com";

export function emailAdministrador() {
  return EMAIL_ADMIN;
}

export function abrirGmailSenha({ para, username, nome, senha, assunto }) {
  const destino = String(para || EMAIL_ADMIN).trim().toLowerCase() || EMAIL_ADMIN;
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
    "Não compartilhe esta senha. Se você não pediu isso, ignore o e-mail.",
  );
  const titulo = assunto || `Senha de acesso — ${login}`;
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(destino)}&su=${encodeURIComponent(titulo)}&body=${encodeURIComponent(linhas.join("\n"))}`;
  window.open(url, "_blank", "noopener,noreferrer");
  return destino;
}

/** Bloco na tela: nunca mostra a senha, só o e-mail de destino. */
export function htmlEnvioSenha(username, destino = EMAIL_ADMIN) {
  return `
    <div class="envio-senha">
      <div class="aviso-envio"></div>
      <p class="dica">A senha de <strong>${esc(username)}</strong> não aparece nesta tela. Ela é enviada para <strong>${esc(destino)}</strong>.</p>
      <button class="btn sec" type="button" data-enviar-senha>Enviar senha para ${esc(destino)}</button>
    </div>`;
}

export function ligarEnvioSenha(raiz, obterDados) {
  const btn = raiz.querySelector("[data-enviar-senha]");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const aviso = raiz.querySelector(".aviso-envio");
    try {
      const dados = obterDados();
      const destino = abrirGmailSenha({
        para: dados.para || EMAIL_ADMIN,
        username: dados.username,
        nome: dados.nome,
        senha: dados.senha,
        assunto: dados.assunto,
      });
      if (aviso) {
        aviso.innerHTML = `<p class="msg ok">Gmail aberto para <strong>${esc(destino)}</strong>. Confirme o envio. A senha não é exibida nesta página.</p>`;
      }
    } catch (err) {
      if (aviso) aviso.innerHTML = `<p class="msg erro">${esc(err.message)}</p>`;
    }
  });
}

/** Mostra o bloco e já abre o Gmail (sem colocar a senha no HTML). */
export function mostrarEnvioSenha(box, dados) {
  const destino = dados.para || EMAIL_ADMIN;
  box.hidden = false;
  box.innerHTML = htmlEnvioSenha(dados.username, destino);
  ligarEnvioSenha(box, () => dados);
  try {
    const enviadoPara = abrirGmailSenha({
      para: destino,
      username: dados.username,
      nome: dados.nome,
      senha: dados.senha,
      assunto: dados.assunto,
    });
    const aviso = box.querySelector(".aviso-envio");
    if (aviso) {
      aviso.innerHTML = `<p class="msg ok">Senha enviada para <strong>${esc(enviadoPara)}</strong> (confirme no Gmail). Ela não aparece nesta tela.</p>`;
    }
  } catch (err) {
    const aviso = box.querySelector(".aviso-envio");
    if (aviso) aviso.innerHTML = `<p class="msg erro">${esc(err.message)}</p>`;
  }
}
