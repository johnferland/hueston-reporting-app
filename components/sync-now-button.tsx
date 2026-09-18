"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SyncNowButton({
  brandId,
  label,
}: {
  brandId?: string;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function runSync() {
    setBusy(true);
    setNote("");
    try {
      const query = brandId ? `?brandId=${encodeURIComponent(brandId)}` : "";
      const response = await fetch(`/api/admin/sync-google${query}`);
      const data = (await response.json()) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || data.ok === false) {
        setNote(data.error ?? data.message ?? "Sync failed.");
        return;
      }
      setNote(data.message ?? "Sync started. You can keep using the dashboard.");
      router.refresh();
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Sync failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ds-sync-now">
      <Button type="button" variant="secondary" disabled={busy} onClick={() => void runSync()}>
        {busy ? "Starting…" : label}
      </Button>
      {note ? <p className="ds-muted">{note}</p> : null}
    </div>
  );
}
