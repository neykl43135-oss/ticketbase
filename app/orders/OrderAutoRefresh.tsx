"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  enabled: boolean;
};

export default function OrderAutoRefresh({ enabled }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const interval = window.setInterval(() => {
      router.refresh();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [enabled, router]);

  return null;
}
