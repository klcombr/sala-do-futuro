# Sala do Futuro — guia de acesso

Uma versão redesenhada da página de acesso da
[Sala do Futuro](https://saladofuturo.educacao.sp.gov.br/), feita porque a
original é ruim de usar: um bloco enorme de texto corrido, três botões que não
dizem o que você vai encontrar depois de clicar, e um rodapé com links
espremidos.

🔗 **No ar:** https://klcombr.github.io/sala-do-futuro/

## Não é site oficial

Aviso no topo da página e no rodapé. Projeto independente, sem vínculo com a
Secretaria da Educação do Estado de São Paulo.

**Esta página não tem nenhum campo de login.** Todos os botões são links para os
portais oficiais — a senha nunca é digitada aqui.

## O que foi engenharia reversa

Inspecionei o site real com Playwright para responder "o que ele faz" em vez de
supor. Achados que mudaram o desenho:

| Fato | Como foi descoberto | O que mudou |
|---|---|---|
| A raiz redireciona para `/escolha-de-perfil` | `curl -L` | Não existe "home" separada: a tela de perfil *é* a home |
| A página de perfil **não tem nenhum `<input>`** | contagem via DOM | Dá para replicar sem risco nenhum |
| Servidor sai para o GOV.BR | clique no botão | `sso.acesso.gov.br/login?client_id=idp.sp.gov.br&authorization_id=1a14cbbcb00` |
| A configuração vem de `/saladofuturobffapi/api/configuracoes` | captura da resposta | Só uma chamada de API na carga da página |
| O texto de benefícios chega **com HTML quebrado** | leitura da resposta | A API devolve `<p>`/`<li>` sem fechar — é parte do motivo do visual ruim |

Endpoints registrados na configuração oficial (extraídos de
`/saladofuturobffapi/api/configuracoes`):

```
gov_br_authorization_endpoint = https://idp.sp.gov.br/auth/realms/idpsp/protocol/openid-connect/auth
gov_br_redirect_login_url     = https://saladofuturo.educacao.sp.gov.br/sso-gov-servidor
gov_br_client_id              = seduc.saladofuturo-aluno.web
access_sed                    = true      (mesma senha da SED)
login_gov_servidor            = true      (perfil Servidor usa GOV.BR)
```

## O que mudou em relação ao original

- **"O que você encontra" em vez de "o que o serviço promete".** Cada perfil
  lista o que tem lá dentro, antes de você clicar.
- **Sem parede de texto.** O texto de benefícios virou três cartões.
- **Rodapé virou grade de links** em vez de uma linha com bullets.
- **Aviso de não-oficial** antes de qualquer conteúdo — gente vai compartilhar
  isso, e precisa ficar claro de onde veio.
- **Light/dark, responsivo, sem analytics, sem cookie.**
- Zero requisições para fora além das fontes do Google.

## Rodar local

Não tem build nem dependência:

```bash
python3 -m http.server 8000
```

## Estrutura

```
index.html   página única
style.css    folha de estilo (light + dark)
app.js       monta a lista de links e o ano — só isso
```

## Limites deste trabalho

Isto é uma **página informativa e de links**. O app que existe atrás do login é
da Secretaria e não está aqui — nem poderia, sem collectar credencial de
educador num site de terceiro, que é exatamente o risco que este projeto
evita.

## Licença

Código sob MIT (ver [LICENSE](LICENSE)).