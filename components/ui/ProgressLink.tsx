"use client";

import Link, { LinkProps } from "next/link";
import NProgress from "nprogress";
import { usePathname } from "next/navigation";
import React from "react";

type ProgressLinkProps = LinkProps & {
  children: React.ReactNode;
  className?: string;
};

export default function ProgressLink({
  href,
  children,
  ...props
}: ProgressLinkProps) {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey) {
      return;
    }

    if (pathname === href) {
      return;
    }

    NProgress.start();
  };

  return (
    <Link href={href} {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
