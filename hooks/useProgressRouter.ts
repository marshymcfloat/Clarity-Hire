"use client";

import { useRouter as useNextRouter, usePathname } from "next/navigation";
import NProgress from "nprogress";
import { useCallback } from "react";

export function useProgressRouter() {
  const router = useNextRouter();
  const pathname = usePathname();

  const push = useCallback(
    (href: string) => {
      if (pathname !== href) {
        NProgress.start();
      }
      router.push(href);
    },
    [pathname, router]
  );

  const { push: _, ...rest } = router;

  return {
    push,
    ...rest,
  };
}
