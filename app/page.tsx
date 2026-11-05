import { redirect } from "next/navigation";
import HomeClient from "@/components/HomeClient";
import { getUserAndBaby } from "@/lib/baby";

export default async function Home() {
  const { baby } = await getUserAndBaby();
  if (!baby) redirect("/bebe");
  return <HomeClient baby={baby} />;
}
