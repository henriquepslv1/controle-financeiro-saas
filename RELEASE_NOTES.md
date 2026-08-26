# Controle.Financeiro — V8.1 Profissional

## Correções críticas
- Corrigido o cadastro de Pessoas: o `profile_id` agora é obtido da sessão autenticada antes do INSERT.
- Tratamento de erros do Supabase mais claro na tela de Pessoas.
- Carregamento de Pessoas agora informa erros de leitura em vez de falhar silenciosamente.
- Layout desktop corrigido para reservar espaço real para a sidebar.
- Responsividade refinada para notebook, desktop e celular.

## UX/UI
- Tela de Pessoas redesenhada com busca, estado vazio, avatar inicial e edição rápida.
- Formulários com feedback de carregamento, sucesso e erro.
- Onboarding e tela de assinatura apresentam benefícios antes de pedir ativação.
- Identidade visual em Português do Brasil e moeda BRL.

## Administração
- Fluxo de ativação manual de assinatura protegido para `MASTER_ADMIN`.
- Ativação manual respeita `period_days` do plano.
- Registro de pagamento manual e auditoria preparados no Supabase.
- Reativação e suspensão disponíveis no painel Master.

## Mercado Pago
Ainda não integrado. A arquitetura está preparada para a etapa posterior de cobrança automática.

## Variáveis de ambiente
```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

## Deploy
1. Extraia o ZIP.
2. Substitua o conteúdo do repositório pelo conteúdo do projeto (não envie `node_modules`).
3. Commit/push para `main` ou crie um Pull Request.
4. A Vercel fará o novo deployment.
5. Mantenha as variáveis do Supabase configuradas em Production e Preview.
6. Se estiver usando o banco conectado atualmente, a migration `011_master_subscription_management.sql` deve estar aplicada antes de usar os novos botões de gestão de assinatura.
