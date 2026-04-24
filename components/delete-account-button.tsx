"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteAccountButton({ userEmail }: { userEmail: string }) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const matches = typed.trim().toLowerCase() === userEmail.trim().toLowerCase();

  async function handleDelete() {
    if (!matches) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: typed.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      router.push("/?deleted=1");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-2 items-end">
        <p className="text-xs text-severity-critical font-medium">
          This is permanent and cannot be undone.
        </p>
        <p className="text-xs text-muted">
          Type <span className="font-mono text-body">{userEmail}</span> to confirm.
        </p>
        <input
          type="email"
          autoComplete="off"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={userEmail}
          className="h-8 w-full min-w-[260px] px-3 text-xs font-mono border border-border focus:border-primary focus:outline-none bg-background"
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              setConfirming(false);
              setTyped("");
              setError("");
            }}
            className="h-8 px-4 text-xs font-medium border border-border text-body hover:border-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || !matches}
            className="h-8 px-4 text-xs font-medium bg-red-600 text-white border border-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Deleting…" : "Yes, delete my account"}
          </button>
        </div>
        {error && <p className="text-xs text-severity-critical">{error}</p>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="h-8 px-4 text-xs font-medium border border-red-300 text-severity-critical hover:bg-red-50 transition-colors"
    >
      Delete
    </button>
  );
}
