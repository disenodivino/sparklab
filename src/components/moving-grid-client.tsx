"use client";

import { useEffect, useState } from "react";
import MovingGrid from "@/components/moving-grid";

export default function MovingGridClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return <MovingGrid />;
}
