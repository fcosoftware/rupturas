/** Site publicado no GitHub Pages: a planilha roda no navegador, sem o servidor. */
export const ESTATICO = import.meta.env.VITE_ESTATICO === "true";

const EMAILS = [
  "alexandre.gorges@giassi.com.br",
  "lidio.silva@giassi.com.br",
  "jolsimar.silva@giassi.com.br",
  "centroloja.lj07@giassi.com.br",
  "bazar.lj07@giassi.com.br",
  "acougue.lj07@giassi.com.br",
];

export const USUARIO_ESTATICO = {
  username: "giassi",
  nome: "Centro de Distribuição",
  is_admin: false,
  estatico: true,
  permissoes: { processar: true, baixar: true, email: true },
  emails: EMAILS.map((email) => ({ email, nome: "" })),
};
