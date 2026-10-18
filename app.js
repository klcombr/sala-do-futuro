// Sala do Futuro — guia de acesso.
// Página sem lógica de negócio: só monta a lista de links e o ano.
// Nenhum fetch, nenhum campo de login, nada sai daqui.

const LINKS = [
  { t: "Portal da Educação",       u: "https://www.educacao.sp.gov.br/" },
  { t: "Secretaria Escolar Digital", u: "https://sed.educacao.sp.gov.br/" },
  { t: "Intranet",                 u: "https://intranet.educacao.sp.gov.br/" },
  { t: "Centro de Mídias SP",      u: "https://centrodemidiasp.educacao.sp.gov.br/" },
  { t: "Portal de Atendimento",    u: "https://atendimento.educacao.sp.gov.br/" },
  { t: "Base de conhecimento",     u: "https://atendimento.educacao.sp.gov.br/knowledgebase/" },
  { t: "Inscrição Rede Pública",   u: "https://sed.educacao.sp.gov.br/NCA/PreInscricaoOnline/login" },
  { t: "Certificação Supletivo",   u: "https://sed.educacao.sp.gov.br/SedDiplomas/ValidarDocDiploma/ConsultaDocumento" },
  { t: "Consulta de concluintes",  u: "https://sed.educacao.sp.gov.br/SedCon/ConsultaPublica/Index" },
];

const grade = document.querySelector("#linksGrid");
for (const { t, u } of LINKS) {
  const a = document.createElement("a");
  a.href = u;
  a.rel = "noopener";
  a.target = "_blank";
  a.textContent = t;
  const seta = document.createElement("span");
  seta.textContent = "↗";
  seta.setAttribute("aria-hidden", "true");
  a.append(seta);
  grade.append(a);
}

document.querySelector("#ano").textContent = `página sem cookies, sem analytics e sem servidor · ${new Date().getFullYear()}`;