import LoginForm from "./LoginForm";

export const metadata = { title: "Entrar · Diário do Bebê" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  return (
    <main className="flex flex-1 flex-col justify-center gap-8 py-10">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-feed text-4xl shadow-sm">
          🍼
        </div>
        <h1 className="text-3xl font-extrabold">Diário do Bebê</h1>
        <p className="mt-2 text-ink-soft">Mamadas, sonecas e fraldas em poucos toques.</p>
      </div>
      <LoginForm
        initialError={
          erro ? "Esse link expirou ou já foi usado. Peça um novo link abaixo." : null
        }
      />
    </main>
  );
}
