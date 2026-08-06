/** cent → 주파수 비. 1200 cent = 1 옥타브. */
export function centsToRatio(cents: number): number {
  return 2 ** (cents / 1200);
}

/** 기준 Hz에 cent 차를 적용한 주파수. */
export function hzFromCents(referenceHz: number, cents: number): number {
  return referenceHz * centsToRatio(cents);
}
