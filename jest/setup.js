/**
 * 화면 테스트가 저장소를 **간접적으로** 끌고 오는 일이 흔하다.
 * (예: `WrsSessionScreen` → `StatsScreen` → `ling6Store` → AsyncStorage)
 * 네이티브 모듈이 없으면 그 자리에서 스위트가 통째로 넘어지므로 기본 목을 깔아 둔다.
 *
 * 저장소 단위 테스트는 각자 `jest.mock`으로 이 목을 덮어쓴다(그쪽이 이긴다).
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
