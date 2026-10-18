# Engenharia reversa — Sala do Futuro

Trabalho autorizado. O bundle é ofuscado com array de strings rotacionado; o
guia para recuperar tudo está no fim. Resultado: **3.703 strings**, **46 rotas de
API**, **61 telas**.

> Este documento descreve a estrutura de um sistema de terceiros, para registrar o que a engenharia reversa autorizada revelou.

## O que a API oferece

Quatro microsserviços, todos em `https://sedintegracoes.educacao.sp.gov.br`:

| Serviço | O que dá |
|---|---|
| `apiboletim` | boletim, frequência, agenda, avaliações, fechamento |
| `apihubintegracoes` | turmas, disciplinas, bimestres do aluno |
| `muralavisosapi` | mural de avisos, banners, aluno-monitor |
| `ncaapi` | itinerário formativo, transferência escolar |
| `credenciais` | login, logout, autorizações |
| `avatarapi` | avatar e preferências |
| `cmspwebservice` | ponte com o CMSP |

### O que dá para consumir

```
/apiboletim/api/Boletim/GetBoletimCompleto
/apiboletim/api/Frequencia/ConsultaFrequenciaBimestre
/apiboletim/api/Frequencia/GetFaltasBimestreAtual
/apiboletim/api/Frequencia/GetFrequenciaBimestreAtual
/apiboletim/api/Agenda/GetAgendaDia
/apiboletim/api/Agenda/GetAgendaPeriodoEscola
/apiboletim/api/Avaliacao/GetAvaliacaoAlunoBimestre
/apiboletim/api/Fechamento/ConsultaFechamentoComparativo

/apihubintegracoes/api/v2/Turma/ListarTurmasPorAluno
/apihubintegracoes/api/v2/Disciplina/ListarDisciplinaPorAluno
/apihubintegracoes/api/v2/Bimestre/ListarBimestres

/muralavisosapi/api/mural-avisos/listar-avisos-turma
/ncaapi/api/ItinerarioFormativoSF/InfoAluno
```

## As telas do app

`/tarefas` · `/tarefas/pontos` · `/atividade` · `/boletim` · `/presenca` ·
`/presenca/lista-faltas` · `/provas` · `/provas/resultados` · `/redacoes` ·
`/mensagens` · `/mural` · `/pesquisas` · `/aulas-olimpicas` ·
`/avaliacoes-diagnosticas` · `/itinerario-formativo` · `/plataformas` ·
`/minhas-conquistas` · `/carteirinha-do-estudante` · `/copa-da-escola` ·
`/relatorio` · `/perfil` · `/transferencia-escolar`

## Autenticação — e os dois portões

O app web usa **Authorization Code + PKCE** contra o Keycloak
`idp.sp.gov.br` (client `seduc.saladofuturo-aluno.web`). Aluno e responsável
entram por formulário de senha SED em `/login-alunos` e `/login-responsaveis`;
servidor entra por GOV.BR.

### Portão 1 — `redirect_uri` (bloqueia qualquer cliente de terceiros)

```
redirect_uri=https://saladofuturo.educacao.sp.gov.br/sso-gov   → HTTP 303 ✅
redirect_uri=https://klcombr.github.io/...                     → HTTP 400 ❌
redirect_uri=http://localhost:8000/callback                    → HTTP 400 ❌
redirect_uri=http://127.0.0.1:8000/cb                          → HTTP 400 ❌
```

O IdP só aceita URIs cadastradas no domínio do Estado. **Só a Secretaria pode
cadastrar uma nova.**

### Portão 1b — Device Flow (desativado)

```
POST .../openid-connect/auth/device
→ unauthorized_client: "The flow is disabled for the client."
```

### Portão 2 — CORS

```
GET /saladofuturobffapi/api/configuracoes
→ HTTP 200, sem Access-Control-Allow-Origin
```

Um navegador de outro site não chama essa API. A saída seria um proxy — que
passaria nota e frequência de estudantes por um servidor de terceiro.

## Chaves de assinatura encontradas

| Chave | Serviço |
|---|---|
| `d701a2043aa24d7ebb37e9adf60d043b` | `saladofuturobffapi` (`api_key_bff`, vem de `/api/configuracoes`) |
| `7c2a8f51a60947d2b42449e68983ee20` | `credenciais` (encontrada no bundle do CMSP) |
| `9a1c18f57885465ebc2ea0557afc6dbe` | acervo do CMSP |

## Bug encontrado no site oficial

`benefits_text_html`, servido por `/api/configuracoes`, vem com HTML
**malformado** — `<p>` e `<li>` sem tag de fechamento:

```
"<p>A <b>Sala do Futuro</b> nasceu para ... <b>processo de aprendizagem</b><p>
 <b>Benefícios para os estudantes:</b><ul><li><b>Acesso centralizado:</b> ..."
```

Nenhum `</p>`, nenhum `</li>`. O navegador se vira como pode. É parte do motivo
de a página parecer mal acabada.

## Como reproduzir a desofuscação

O bundle usa `a0_0x235e()` (array) + `a0_0x3f33(idx)` (decoder, offset
`0xed`) + uma IIFE que rotaciona o array até um checksum bater. Sem source map
(`*.js.map` devolve o `index.html` da SPA, 1584 bytes).

```python
s = open('app.js', encoding='utf-8').read()
i = s.index('function a0_0x235e(')
j = s.index('return a0_0x235e();}', i) + len('return a0_0x235e();}')
k = s.index("(this['webpackChunksaladofuturo']")
prog = s[i:j] + "\n" + s[:k].rstrip().rstrip(',') + ');\n'   # fecha a IIFE de rotação
# depois: chamar a0_0x3f33(i) para i de 0xed em diante
```

## O que ainda falta para um cliente funcionar

1. A Secretaria cadastrar um `redirect_uri` no realm `idpsp`, **ou**
2. Habilitar o Device Flow para o client `seduc.saladofuturo-aluno.web`, **ou**
3. Habilitar CORS no `saladofuturobffapi`

Nenhum dos três é decisão técnica — são configuração do lado deles. Até lá, um
cliente de terceiros não consegue autenticar.