"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DownloadButton({ contentId, signedIn }: { contentId: string; signedIn: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function download() {
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/kistube")}`);
      return;
    }
    setPending(true);
    try {
      const res = await fetch(`/api/kistube/contents/${contentId}/download`);
      const data = await res.json().catch(() => ({}));
      const downloadUrl = data?.data?.download_url;
      if (downloadUrl) {
        window.open(downloadUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button type="button" className="kt-button kt-button--outline" onClick={download} disabled={pending}>
      Download
    </button>
  );
}
