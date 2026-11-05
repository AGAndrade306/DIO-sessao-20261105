export type Baby = {
  id: string;
  owner_id: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  created_at: string;
};

export type EventType = "feed" | "sleep" | "diaper";
export type FeedKind = "breast_left" | "breast_right" | "bottle";
export type DiaperKind = "pee" | "poop" | "both";

export type BabyEvent = {
  id: string;
  baby_id: string;
  type: EventType;
  started_at: string;
  ended_at: string | null;
  feed_kind: FeedKind | null;
  amount_ml: number | null;
  diaper_kind: DiaperKind | null;
  notes: string | null;
  created_at: string;
};

export const FEED_LABELS: Record<FeedKind, string> = {
  breast_left: "Peito esquerdo",
  breast_right: "Peito direito",
  bottle: "Mamadeira",
};

export const DIAPER_LABELS: Record<DiaperKind, string> = {
  pee: "Xixi",
  poop: "Cocô",
  both: "Xixi e cocô",
};

export const EVENT_META: Record<EventType, { emoji: string; label: string; bg: string }> = {
  feed: { emoji: "🍼", label: "Mamada", bg: "bg-feed" },
  sleep: { emoji: "😴", label: "Soneca", bg: "bg-sleep" },
  diaper: { emoji: "🧷", label: "Fralda", bg: "bg-diaper" },
};
