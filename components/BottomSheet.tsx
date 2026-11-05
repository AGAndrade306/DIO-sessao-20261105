"use client";

import { useEffect } from "react";

export default function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-ink/30" />
      <div className="relative max-h-[90dvh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-cream px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(59,66,82,0.15)]">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-ink/15" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <button type="button" onClick={onClose} className="min-h-12 px-2 font-semibold text-ink-soft">
            Cancelar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
