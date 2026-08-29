"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

export function LogoutButton({ className, compact = false }: { className?: string; compact?: boolean }) {
  const [isLeaving, setIsLeaving] = useState(false);

  async function handleLogout() {
    if (isLeaving) return;

    setIsLeaving(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLeaving}
      className={cn(
        "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70",
        compact ? "text-white/76 hover:bg-white/10 hover:text-white" : "border border-line bg-white text-forest hover:bg-mist",
        className
      )}
    >
      <LogOut className="h-4 w-4" />
      {isLeaving ? "Saindo..." : "Sair"}
    </button>
  );
}
