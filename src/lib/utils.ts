import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getLevel(points: number): {
  level: number;
  name: string;
  nextLevelPoints: number;
  progress: number;
} {
  const levels = [
    { min: 0, name: "Novato" },
    { min: 100, name: "Fiel" },
    { min: 500, name: "Veterano" },
    { min: 1500, name: "Leyenda" },
    { min: 5000, name: "Metedor Supremo" },
  ];

  let currentLevel = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].min) {
      currentLevel = i;
      break;
    }
  }

  const nextLevel = levels[currentLevel + 1];
  const currentMin = levels[currentLevel].min;
  const nextMin = nextLevel?.min ?? levels[currentLevel].min * 2;
  const progress = ((points - currentMin) / (nextMin - currentMin)) * 100;

  return {
    level: currentLevel + 1,
    name: levels[currentLevel].name,
    nextLevelPoints: nextMin,
    progress: Math.min(progress, 100),
  };
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const intervals: [number, string][] = [
    [31536000, "año"],
    [2592000, "mes"],
    [86400, "día"],
    [3600, "hora"],
    [60, "minuto"],
    [1, "segundo"],
  ];

  for (const [secondsInUnit, unit] of intervals) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) {
      const plural = count > 1 ? (unit === "mes" ? "es" : "s") : "";
      return `hace ${count} ${unit}${plural}`;
    }
  }

  return "justo ahora";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
