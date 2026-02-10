export const siteConfig = {
  name: "ClarityHire",
  description:
    "AI-assisted hiring workspace for modern companies: source candidates, screen faster, and hire with confidence.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://www.clarityhire.online",
};

export function absoluteUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, siteConfig.url).toString();
}
