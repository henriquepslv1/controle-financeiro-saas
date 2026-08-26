# Controle.Financeiro — V7

Aplicativo SaaS em Next.js + Supabase, em Português do Brasil.

## O que está pronto

- Login, cadastro e recuperação de senha com Supabase Auth.
- Fluxo SSR/PKCE com endpoint `/auth/confirm`.
- MASTER_ADMIN e CLIENT com isolamento por RLS.
- Dashboard brasileiro, responsivo e com identidade visual própria.
- Pessoas: cadastrar e editar.
- Operações: criar, visualizar e editar dados.
- Movimentação de principal com auditoria.
- Pagamento somente de encargo, encargo + principal, somente principal e personalizado.
- Períodos mensais recorrentes: quando o encargo de um período é quitado e ainda existe principal, o banco abre o próximo período.
- Histórico de pagamentos, períodos e ajustes.
- Assinatura: R$40/30 dias, status e bloqueio.
- Painel Master para clientes, planos e auditoria.
- Mercado Pago ainda NÃO está conectado, conforme combinado.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e informe as credenciais públicas do seu projeto Supabase.

Nunca coloque `service_role`, `sb_secret_*` ou senhas neste arquivo do frontend.

## Rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

Para uma validação completa antes do deploy:

```bash
npm run check
```

`npm run check` executa typecheck, lint e build.

## Supabase já conectado

A versão entregue foi preparada para o projeto Supabase que estamos usando nesta conversa. As migrations incrementais 008, 009 e 010 já foram aplicadas ao projeto remoto.

Se você for reproduzir em outro projeto Supabase, primeiro faça uma migração completa do schema/base antes de aplicar as incrementais.

## Auth

No Supabase, configure a URL do site e os Redirect URLs para incluir:

- `http://localhost:3000/**`
- a URL final de produção

O fluxo de confirmação usa `/auth/confirm` e o fluxo de recuperação usa `/redefinir-senha`.

## Teste manual recomendado

1. Entrar como `MASTER_ADMIN`.
2. Criar um cliente por `/cadastro`.
3. Confirmar o e-mail.
4. Verificar que o cliente nasce com assinatura `PENDING`.
5. No Master, usar `+30 dias` para ativar o cliente durante os testes.
6. Entrar como cliente.
7. Cadastrar uma pessoa.
8. Criar operação de R$300 com taxa de 20%.
9. Registrar pagamento de R$60 somente de encargo: principal deve continuar R$300.
10. Registrar R$110 com R$60 de encargo e R$50 de principal: principal deve cair para R$250.
11. Conferir o próximo encargo: R$50.
12. Adicionar R$200 ao principal e conferir R$450.
13. Reduzir R$50 e conferir R$400.
14. Conferir histórico e auditoria.
15. Testar acesso de um cliente aos dados de outro: deve ser negado pelo RLS.

## Próxima etapa

Somente depois de você aprovar visual e funcionalmente esta versão, integrar Mercado Pago, webhooks, renovação automática e Resend.

## V8.1 — entrega profissional

Esta versão corrige o cadastro de Pessoas, melhora o layout desktop/mobile, adiciona busca/edição e prepara a gestão segura de assinaturas pelo Administrador Master. Consulte `RELEASE_NOTES.md` para o checklist de publicação.
