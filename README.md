# Diário do Bebê

PWA simples para registrar mamadas, sonecas e trocas de fralda com uma mão só e ver "quando foi a última vez".
Next.js 16 (App Router) + Tailwind v4 + Supabase (link mágico + Postgres com RLS).

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
3. **Authentication → URL Configuration**:
   - **Site URL**: `https://SEU-APP.vercel.app`
   - **Redirect URLs**: `https://SEU-APP.vercel.app/auth/callback` e `http://localhost:3000/auth/callback`
4. (Opcional, recomendado no celular) Por padrão o link mágico só funciona se for aberto no **mesmo navegador** em que foi pedido. Para funcionar em qualquer navegador/app de e-mail, em **Authentication → Emails → Magic Link** troque o link do template por:
   `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`
   (o `/auth/callback` aceita os dois formatos).

O e-mail padrão do Supabase tem limite baixo de envios por hora; para uso real configure um SMTP próprio.

## Deploy na Vercel

1. Em vercel.com → **Add New → Project**, importe este repositório do GitHub (framework detectado: Next.js).
2. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy. Depois, atualize a Site URL e as Redirect URLs no Supabase com a URL final da Vercel (passo 3 acima).
4. No celular: abra a URL, entre pelo link mágico e use "Adicionar à tela inicial".

## Decisões tomadas (as opções mais simples)

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
