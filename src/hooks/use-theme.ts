/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  // RN 타입은 'light'|'dark'|'unspecified'로 선언돼 있지만 구현은 nullable이라
  // 런타임에 null/undefined가 올 수 있다(타입 검사로 안 잡힘).
  // 'dark'만 다크로 보고 나머지는 전부 light로 떨어뜨린다.
  const scheme = useColorScheme();

  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}
