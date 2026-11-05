# Diário do Bebê

PWA simples para registrar mamadas, sonecas e trocas de fralda com uma mão só e ver "quando foi a última vez".
Next.js 16 (App Router) + Tailwind v4 + Supabase (login com e-mail e senha + Postgres com RLS).

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha com os dados do seu projeto Supabase
npm run dev                  # http://localhost:3000
```

Outros comandos: `npm run build`, `npm run lint`, `npm test` (testes de `lib/time.ts`).

## Variáveis de ambiente

| Variável | Onde achar |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → chave `anon` / publishable |

Nunca use a chave `service_role` aqui. O `.env.local` não é commitado.

## Supabase

1. Crie um projeto em supabase.com.
2. Abra o **SQL Editor**, cole todo o conteúdo de `supabase/schema.sql` e rode (cria as tabelas, o enum, o índice e as políticas de RLS).
3. **Authentication → Sign In / Providers → Email**: deixe o provedor ligado e **desligue "Confirm email"**. Assim a conta criada no app já entra direto, sem depender de envio de e-mail. (Sem SMTP próprio, o Supabase só envia e-mails para membros da equipe do projeto.)
4. **Authentication → URL Configuration** (só usado se você mantiver a confirmação de e-mail ligada):
   - **Site URL**: `https://SEU-APP.vercel.app`
   - **Redirect URLs**: `https://SEU-APP.vercel.app/auth/callback` e `http://localhost:3000/auth/callback`

Se quiser manter a confirmação de e-mail, configure um SMTP próprio (o e-mail padrão do Supabase tem limite baixo e restrição de destinatários).

## Deploy na Vercel

1. Em vercel.com → **Add New → Project**, importe este repositório do GitHub (framework detectado: Next.js).
2. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy.
4. No celular: abra a URL, toque em "Criar conta" e depois use "Adicionar à tela inicial".

## Decisões tomadas (as opções mais simples)

- **Login com e-mail e senha** (em vez do link mágico do SPEC), porque o envio de e-mail padrão do Supabase é restrito. Recuperação de senha ficou fora do MVP. O `/auth/callback` continua existindo para o link de confirmação, caso ela seja ligada.

- **Next 16:** o middleware se chama `proxy.ts` (nova convenção). Ele renova a sessão e manda quem não está logado para `/login`.
- **Schema:** igual ao SPEC, mais um `check` garantindo `ended_at >= started_at`.
- **Duração da mamada:** guardada como `ended_at = started_at + duração` (sem coluna nova).
- **Soneca aberta:** é a soneca mais recente sem `ended_at`. Com uma aberta, o botão Soneca vira "Acordou" (não cria outra).
- **Cartão "última soneca":** conta o tempo desde que o bebê **acordou** (ou mostra "Dormindo").
- **Horário ajustado:** se o horário escolhido estiver no futuro, considera-se que foi ontem (ex.: às 00:30 registrar 23:50).
- **Layout:** os três botões ficam fixos na base da tela (zona do polegar); cartões, cronômetro e histórico rolam acima.
- **Dados:** a home é um componente cliente que busca direto no Supabase (o RLS garante o isolamento) e recarrega após cada ação, ao voltar para o app, e atualiza os "há X min" a cada minuto.
- **Service worker:** mínimo, só faz cache de arquivos estáticos e ícones; não há modo offline.
- **Ícones:** desenhados em `public/icons/icon.svg`; PNGs gerados com `node scripts/generate-icons.cjs` (usa Playwright).
