# OBSIDIAN — Laboratório (versão estática, sem build)

Site puro em HTML + CSS + JavaScript. Sem React, sem Vite, sem npm, sem build.
Feito assim de propósito: dá pra publicar direto no Vercel só arrastando os
arquivos pro GitHub, sem precisar de Node/npm/git instalados na tua máquina.

## O que tem

- **Painel**: dashboard com indicadores gerais e financeiros (materiais abaixo
  do mínimo, valor total em estoque, custo médio dos lotes, valor consumido
  no mês, destaques de custo, próxima maceração a avaliar).
- **Estoque**: cadastro de materiais separados por **categoria** (Químico / Óleo
  Essencial / Absoluto) e por **família olfativa** (12 famílias), com diluição
  em Puro (100%), 50%, 10% ou 1% (ou uma % customizada). Cada material também
  guarda o que foi pago e a quantidade comprada, pra calcular o custo unitário
  automaticamente. Alerta visual quando o estoque fica abaixo do mínimo.
- **Detecção automática de família olfativa** ao digitar o nome do material
  (dicionário embutido com matérias-primas comuns de perfumaria).
- **Fórmulas**: cadastro de receitas técnicas com pirâmide olfativa (topo/coração/fundo),
  puxando materiais direto do estoque ou digitados manualmente. Mostra o custo
  da fórmula por 4/10/30/50/100ml e a produção máxima possível com o estoque atual.
- **Calculadora de lote**: informa tamanho do frasco + concentração final e
  calcula quanto pesar de cada material, avisando se falta estoque.
- **Produzir lote**: a partir de uma fórmula, gera um lote real — calcula os
  ingredientes automaticamente, valida o estoque (bloqueia se faltar qualquer
  material), debita o estoque, grava o histórico de movimentação e calcula o
  custo total e por ml do lote.
- **Lotes**: acompanhamento de cada lote produzido — maceração automática
  (15/30/45/60 dias ou customizado), status (macerando/pronto/entregue),
  timeline de evolução e custo.
- **Acordes**: controle de testes de acordes em maceração — cada acorde tem sua
  lista de materiais (%), um prazo estimado de maturação e uma barra que muda
  de vermelho pra maduro conforme os dias passam. Dá pra registrar anotações
  de evolução ao longo do tempo (dia 1, dia 7, dia 15...).
- **Perfumes**: painel de acompanhamento das criações — nome, briefing/proposta,
  fórmula técnica vinculada (opcional), embalagem (frasco/válvula/caixa/etiqueta),
  a mesma barra de maturação + registro de evolução, e cálculo automático do
  custo final e preço sugerido (a partir do markup desejado).
- **Embalagens**: cadastro de insumos de embalagem com preço, quantidade
  comprada e custo unitário calculado.
- **Backup**: exportar/importar tudo (materiais, fórmulas, acordes, perfumes,
  lotes, embalagens) em `.json` (mesclar ou substituir).
- Banco de dados real no **Supabase** (Postgres) — não depende de navegador
  nem de sessão do Claude.

## 1. Banco (Supabase)

**Se é a primeira vez configurando:** roda o `schema.sql` inteiro (SQL Editor → New query → cola → Run). Já sai com todas as tabelas, incluindo lotes, movimentação de estoque e embalagens.

**Se já tem `materials`/`formulas` rodando em produção, sem `accords`/`perfumes`:** roda o `migration_acordes_perfumes.sql`.

**Se já tem `accords`/`perfumes` e quer os módulos de produção e custo (lotes, movimentação de estoque, embalagens, preços):** roda o `migration_producao_custos.sql`. Ele só *acrescenta* colunas/tabelas novas — não apaga nada.

## 2. Configurar

Abre o arquivo `config.js` e substitui os dois valores:

```js
window.OBSIDIAN_CONFIG = {
  SUPABASE_URL: "https://xxxxxxxxxxxx.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_xxxxxxxxxxxxxxxxxxxx",
};
```

Isso é seguro de deixar no arquivo — essa chave é feita pra ficar exposta no
navegador (a proteção real é o RLS configurado no banco). **Não** cola a
`sb_secret_...` aqui, essa é privada.

## 3. Testar antes de publicar (opcional, mas recomendado)

Não precisa de servidor nem de npm — só abre o `index.html` direto no navegador
(duplo clique, ou clique direito → Abrir com → navegador). Cadastra um material
de teste, recarrega a página, confirma que persiste.

Se o navegador bloquear alguma chamada por CORS/arquivo local, também dá pra
usar a extensão "Live Server" do VS Code, ou qualquer servidor estático simples
— mas normalmente abrir o arquivo direto já funciona.

## 4. Publicar

**Sem git, direto pelo site do GitHub:**

1. github.com → **New repository** (vazio, sem README).
2. Na página do repo → **Add file → Upload files**.
3. Arrasta todos os arquivos desta pasta (`index.html`, `style.css`, `app.js`,
   `config.js`, `sql/`, `README.md`).
4. **Commit changes**.

**Depois, no Vercel:**

1. vercel.com → **Add New → Project** → importa esse repositório.
2. **Framework Preset**: escolhe **Other** (é site estático, sem build).
3. **Build Command**: deixa em branco / vazio.
4. **Output Directory**: deixa em branco (ou `.`).
5. **Deploy**.

Não precisa configurar nenhuma variável de ambiente no Vercel — a configuração
já está dentro do `config.js` que subiu junto.

## 5. Estrutura

```
index.html    página principal (carrega os CDNs + os arquivos abaixo)
style.css     todo o visual (tema escuro OBSIDIAN)
app.js        toda a lógica: estado, renderização, chamadas ao Supabase
config.js     tua URL e chave do Supabase
sql/schema.sql  tabelas + políticas de RLS
```
