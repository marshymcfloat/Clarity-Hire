"use client";

import { Suspense } from "react";
import TopLoader from "./TopLoader";

export default function TopLoaderWrapper() {
  return (
    <Suspense fallback={null}>
      <TopLoader />
    </Suspense>
  );
}

