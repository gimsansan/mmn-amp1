import { Colors } from '@/constants/theme';

/**
 * 화면 색을 준다. **라이트 고정** — 다크 모드는 구현하지 않기로 했다(2026-08-11).
 *
 * OS 설정을 보지 않으므로 `useColorScheme`도 쓰지 않는다. 훅으로 남겨 두는 이유는
 * 호출부(화면 20여 곳)를 그대로 두기 위해서다 — 다크를 다시 하게 되면
 * 여기서만 갈라주면 된다.
 */
export function useTheme() {
  return Colors.light;
}
