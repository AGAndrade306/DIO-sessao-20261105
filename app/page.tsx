import { redirect } from "next/navigation";
import { getUserAndBaby } from "@/lib/baby";
import { formatAge } from "@/lib/time";

export default async function Home() {
  const { baby } = await getUserAndBaby();
  if (!baby) redirect("/bebe");
  return (
    <main className="py-6">
      <h1 className="text-2xl font-extrabold">{baby.name}</h1>
      <p className="text-ink-soft">{formatAge(baby.birth_date)}</p>
    </main>
  );
}
