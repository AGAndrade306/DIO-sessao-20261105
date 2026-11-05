import { getUserAndBaby } from "@/lib/baby";
import BabyForm from "./BabyForm";

export const metadata = { title: "Bebê · Diário do Bebê" };

export default async function BabyPage() {
  const { baby } = await getUserAndBaby();
  return (
    <main className="flex flex-1 flex-col justify-center gap-6 py-10">
      <div className="text-center">
        <p className="text-5xl">👶</p>
        <h1 className="mt-3 text-2xl font-extrabold">
          {baby ? "Editar dados do bebê" : "Vamos conhecer o bebê"}
        </h1>
        {!baby && <p className="mt-2 text-ink-soft">Só precisamos do nome e da data de nascimento.</p>}
      </div>
      <BabyForm baby={baby} />
    </main>
  );
}
