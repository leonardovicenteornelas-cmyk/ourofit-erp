# Estado do Projeto — OuroFit ERP
> Salvo em: 13/07/2026 — Retomar nesta conversa quando voltar.

---

## Localizacao do projeto
```
c:\Users\Leonardo\Desktop\Leo\Desenvolvimento de softwere pessoal\Isabela\ourofit-erp
```

## Contexto Geral
Sistema de gestao financeira para a academia da **Isabela (OuroFit)**.
Substitui a planilha `Fluxo de Caixa Setembro.xlsm` que tinha varios problemas:
- Erro na formula de saldo anterior (HLOOKUP com indice errado)
- 10.000+ linhas de formulas arrastadas travando o Excel
- Sem centros de custo
- Duplicidades por digitacao livre
- DRE e DFC manuais e incorretos

---

## O que ja foi feito

| Item | Detalhe |
|---|---|
| Projeto Next.js 16 + TypeScript + Tailwind v4 + Shadcn/UI | Criado e configurado |
| Schema Prisma (PostgreSQL) | Completo: User, PlanoContas, CentroCusto, Lancamento + Enums |
| Estrutura de rotas | /dashboard, /lancamentos, /dre, /fluxo-de-caixa, /plano-de-contas, /configuracoes |
| Componentes financeiros | KpiCard.tsx, GraficoEvolucao.tsx |
| Dependencias instaladas | Recharts, React Hook Form, Zod, NextAuth, Prisma, Radix UI, date-fns |
| Pagina do Dashboard | page.tsx com ~9KB de conteudo |
| Pagina de Lancamentos | page.tsx com ~9.5KB + pasta /novo |

---

## O que FALTA fazer (Fase 1 - MVP)

### Back-end (APIs)
- [ ] Route Handler: GET/POST /api/lancamentos
- [ ] Route Handler: GET/POST /api/plano-contas
- [ ] Route Handler: GET/POST /api/centros-custo
- [ ] Route Handler: GET /api/dre (calculo automatico)
- [ ] Route Handler: GET /api/fluxo-de-caixa
- [ ] Autenticacao (NextAuth + login page)

### Front-end (paginas incompletas)
- [ ] Pagina DRE — conectar com API real
- [ ] Pagina Fluxo de Caixa — conectar com API real
- [ ] Pagina Plano de Contas — CRUD completo
- [ ] Formulario de Novo Lancamento — conectar com API

### Banco de dados
- [ ] Configurar Supabase (gratuito) ou outro PostgreSQL
- [ ] Atualizar .env com DATABASE_URL real
- [ ] Rodar prisma db push para criar as tabelas
- [ ] Seed com dados historicos da planilha (Abr-Out 2025)

---

## Perguntas pendentes para a Isabela

- Regime tributario (MEI, Simples Nacional, Lucro Presumido?)
- Quantas contas bancarias (Stone + PJ + caixa fisico?)
- Quantos alunos ativos?
- Quais planos e modalidades?
- Usa Nextfit como sistema? Ha integracao a fazer?
- Acesso cloud (internet) ou local (so na academia)?

---

## Stack Tecnologica

| Camada | Tecnologia |
|---|---|
| Front-end | Next.js 16 + React 19 + TypeScript |
| Estilo | Tailwind CSS v4 + Shadcn/UI + Radix UI |
| Banco de dados | PostgreSQL via Prisma ORM |
| Graficos | Recharts |
| Formularios | React Hook Form + Zod |
| Autenticacao | NextAuth.js v4 |
| Deploy planejado | Vercel (front) + Supabase (banco) |

---

## Para continuar quando voltar

1. Abrir o workspace: Isabela
2. Retomar a conversa (ID: 2998f495-e83f-4bf4-a5eb-bebddb03c302) ou abrir nova e mencionar este arquivo
3. Proximos passos prioritarios:
   - Rodar npm run dev na pasta ourofit-erp para ver o estado visual atual
   - Criar as APIs (Route Handlers)
   - Configurar o banco de dados PostgreSQL
