import type { SavedWrsRecord } from "@/training/wrs/wrsStore";

export function chronologicalWrs(
  records: readonly SavedWrsRecord[],
): SavedWrsRecord[] {
  return [...records].sort((a, b) => a.savedAt.localeCompare(b.savedAt));
}

export function canShowWrsTrend(records: readonly SavedWrsRecord[]): boolean {
  return records.length >= 2;
}

export function wrsTimeOrdinal(iso: string): number {
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? 0 : ms;
}

export function formatWrsDateShort(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
