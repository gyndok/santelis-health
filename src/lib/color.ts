/**
 * Apply an alpha channel to a hex color, returning rgba(). Accepts #rrggbb
 * and #rgb. Non-hex inputs (rgb(), var(), named colors, empty) are returned
 * unchanged so unexpected palette data degrades gracefully instead of
 * producing invalid CSS like "rgb(1,2,3)4d".
 */
export function withAlpha(color: string, alpha: number): string {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return color;

  let hex = match[1];
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = Math.min(1, Math.max(0, alpha));

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
