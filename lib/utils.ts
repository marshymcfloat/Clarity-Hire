import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPostedDate = (date: Date | string): string => {
  const now = new Date();
  const postedDate = new Date(date);
  const diffInSeconds = Math.floor(
    (now.getTime() - postedDate.getTime()) / 1000,
  );

  const days = Math.floor(diffInSeconds / 86400);
  if (days > 1) return `${days} days ago`;
  if (days === 1) return `1 day ago`;

  const hours = Math.floor(diffInSeconds / 3600);
  if (hours > 1) return `${hours} hours ago`;
  if (hours === 1) return `1 hour ago`;

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes > 0) return `${minutes} minutes ago`;

  return "Just now";
};

export const formatSalary = (min?: number | null, max?: number | null) => {
  if (!min && !max) return "Salary not disclosed";

  const format = (n: number) => `₱${(n / 1000).toFixed(0)}k`;

  if (min && max) return `${format(min)} - ${format(max)}`;
  if (min) return `From ${format(min)}`;
  if (max) return `Up to ${format(max)}`;
  return "Salary not disclosed";
};

export const getInitials = (name: string = ""): string => {
  if (!name) return "";
  const words = name.trim().split(" ").filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export const formatToTitleCase = (str: string | null | undefined): string => {
  if (!str) {
    return "";
  }

  return str
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) =>
      word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : "",
    )
    .join(" ");
};

// geminiGenerate has been moved to app/actions/gemini.ts to secure the API key.
