export default function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-50 flex justify-center px-4"
    >
      <p className="rounded-full bg-ink px-5 py-3 font-bold text-cream shadow-lg">{message}</p>
    </div>
  );
}
