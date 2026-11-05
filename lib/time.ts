const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/** "YYYY-MM-DD" → Date à meia-noite no fuso local. */
export function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Data local de hoje no formato "YYYY-MM-DD" (para <input type="date">). */
export function todayInputValue(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Idade do bebê: "3 meses e 2 dias", "12 dias", "1 ano e 2 meses". */
export function formatAge(birthDate: string, now = new Date()): string {
  const b = parseLocalDate(birthDate);
  let years = now.getFullYear() - b.getFullYear();
  let months = now.getMonth() - b.getMonth();
  let days = now.getDate() - b.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return "ainda não nasceu";
  if (years > 0) {
    const y = plural(years, "ano", "anos");
    return months > 0 ? `${y} e ${plural(months, "mês", "meses")}` : y;
  }
  if (months > 0) {
    const m = plural(months, "mês", "meses");
    return days > 0 ? `${m} e ${plural(days, "dia", "dias")}` : m;
  }
  if (days === 0) return "nasceu hoje";
  return plural(days, "dia", "dias");
}

/** Duração curta: "42min", "2h 15min". */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / MINUTE));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}min`;
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

/** Cronômetro: sempre com horas, "0h 42min". */
export function formatTimer(ms: number): string {
  const total = Math.max(0, Math.floor(ms / MINUTE));
  return `${Math.floor(total / 60)}h ${String(total % 60).padStart(2, "0")}min`;
}

/** "agora mesmo", "há 5min", "há 2h 15min", "há 3 dias". */
export function timeAgo(date: Date | string, now = new Date()): string {
  const diff = now.getTime() - new Date(date).getTime();
  if (diff < MINUTE) return "agora mesmo";
  if (diff < DAY) return `há ${formatDuration(diff)}`;
  return `há ${plural(Math.floor(diff / DAY), "dia", "dias")}`;
}

/** Horário no fuso do aparelho: "14:05". */
export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Início do dia local, deslocado em dias (0 = hoje, -1 = ontem). */
export function startOfLocalDay(offsetDays = 0, now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays);
}

/** Date → "HH:MM" local (para <input type="time">). */
export function toTimeInput(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/**
 * "HH:MM" → Date de hoje nesse horário. Se cair no futuro, assume ontem
 * (ex.: às 00:30 registrar "23:50" = ontem).
 */
export function fromTimeInput(value: string, now = new Date()): Date {
  const [h, m] = value.split(":").map(Number);
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  if (d.getTime() > now.getTime() + MINUTE) d.setDate(d.getDate() - 1);
  return d;
}
