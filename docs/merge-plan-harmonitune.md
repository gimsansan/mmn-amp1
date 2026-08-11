# HarmoniTune × mnn_1 병합 계획

> **상태**: 계획(2026-08-11). 코드 변경 전 기록.
> **표기**: `근거` = 파일 실측 · `결정` = 합의 필요 · `추정`/`미검증` = 확인 안 됨.
> 관련: `docs/amp-mdt-training-design.md` · `docs/impl-log.md` · `.cursor/rules/android-dev-client.mdc`

## 0. 결론

- **제품**: HarmoniTune (이름·IA·홈/통계/설정/결과 플로)
- **코드 호스트**: **mnn_1 저장소** (빌드 설정·규칙·테스트가 여기 있음)
- **훈련 3종**: 음고 2 + 포락 1. 하나의 「연습」탭 → **진입 카드 3개** (토글 아님)

| 카드         | 과제                    | 계열                | 출처        |
| ------------ | ----------------------- | ------------------- | ----------- |
| 높낮이 비교  | A→B 듣고 높/낮 (2택)    | 음고                | HarmoniTune |
| 다른 음 찾기 | 3구간 중 다른 음 (3AFC) | 음고                | mnn ②       |
| 떨림 찾기    | 크기 출렁임(AM) 감지    | **포락**(음고 아님) | mnn ①       |

> 「2IFC/3AFC」는 심리음향 관례 약칭이며 **UI 문구로 쓰지 않는다**. 화면에는 쉬운 한글만.

## 1. 교차검증 실측 (`근거`)

| 항목       | HarmoniTune                                          | mnn_1                                                 | 판정                        |
| ---------- | ---------------------------------------------------- | ----------------------------------------------------- | --------------------------- |
| 오디오     | `react-native-audio-api` ^0.13.2                     | 동일                                                  | **동일 — 통일 작업 불필요** |
| 베이스     | Expo 57 / RN 0.86 / React 19.2.3 / `name: rn-hear-1` | 동일                                                  | 형제 프로젝트               |
| babel      | `react-native-reanimated/plugin` (구버전)            | worklets `bundleMode: true`                           | **mnn 채택**                |
| metro      | 기본                                                 | svg transformer + `patches/metro*` + `patch-package`  | **mnn 채택**                |
| 라우트     | `app/` (루트)                                        | `src/app/`                                            | 루트 하나로                 |
| dev client | 플러그인 없음(스크립트만 `--dev-client`)             | `expo-dev-client` 플러그인                            | **mnn 채택**                |
| 저장       | `@harmonitune/sessions`, 최대 200, 단일 배열         | `training.sessionHistory.v1`, 최대 50, freq/am 유니온 | **결정 필요**               |
| 계단       | 시작 200 · 10~300 · 스텝 50/20/10 · 반전 8 자동종료  | 시작 150 · 10~150 · ±10 · 반전 4                      | **트랙별 분리 유지**        |
| 지표 카피  | `변별 역치` 대표 지표 · 「평가」 모드                | 요약≠역치·진단 금지                                   | **결정 필요(중요)**         |

**부수 발견**: HH 문서 `cent_활용과_시작간격.md`는 시작값 **50**으로 서술하지만, 코드 `STAIRCASE.INITIAL_CENTS`는 **200**이다(주석에 "이전 50은 초심자가 첫 문제부터 틀림"). 병합 시 문서를 코드에 맞춰야 한다.

## 2. 먼저 정할 것 (`결정`)

1. **역치·평가 카피** — HH는 `thresholdCents`를 "변별 역치" 대표 지표로 노출하고 「평가」모드가 있다. mnn 방침은 진단·역치 확정 주장 금지. 셋 중 택1:
   - (a) 「평가」유지 + 문구를 "연습 기록·내부 난이도"로 순화 ← **권고**
   - (b) 「평가」모드 삭제, 훈련만
   - (c) 「평가」를 음고 카드에서만 유지
2. **저장 스키마** — mnn `sessionStore`에 이미 `track: 'freq' | 'am'` · `schemaVersion` · `migrateRecord` 훅이 있음(`training.sessionHistory.v1`). **새 v2 키로 갈아타지 않는다.** 높낮이 비교 추가 시 `SessionTrack`에 값 하나(예: `'pitch2'`)만 늘리고, HH `@harmonitune/sessions`는 읽기 전용 마이그레이션(선택) 또는 병행 후 폐기. (정본: `merge-host-decision.md` §4.1)
3. **기록 화면 위치** — **지금은 연습 탭 안 유지.** 훈련이 **3종**(높낮이·다른 음·떨림)이 된 뒤에 상위로 빼서 전체 기록(+필터)로 올린다. 그 전엔 이득 없음.
4. **계단 상수 위치** — 트랙별 상수 파일 분리. `STAIRCASE` 하나로 강제 통합하지 않는다.
5. **볼륨 안내 중복** — HH `app/onboarding.tsx` vs mnn `ListeningCheckScreen.tsx`. 하나만 남긴다.
6. **테마** — HH 라이트 기조(`COLORS.background`) vs mnn `theme.ts` 흑백+액센트. 한쪽 선택.

## 3. 이식 매핑

**HH → mnn (가져올 것, 약 20파일)**

- `app/index.tsx`(홈), `stats.tsx`, `settings.tsx`, `result.tsx` → mnn `src/app/`로 이동, import 경로 `@/`로 교정
- `src/training/{StaircaseEngine,SessionManager,trainingFlow}.ts` + 테스트 → `src/training/pitch2afc/`
- `src/components/{AnswerButtons,ModeTab,FeedbackCard,ThresholdChart,SkiaWaveVisualizer}.tsx`
- `src/storage/{TrainingStorage,AppSettingsStorage}.ts` → §2-2(기존 `sessionStore`에 `track` 값 확장) 방침으로 흡수. 별도 저장소 신설 안 함
- `src/audio/{pitchUtils,AudioEngine}.ts` → mnn `src/audio/`와 병존(중복 함수는 `cents.ts`로 통합)
- `src/utils/haptics.ts`, `app.json`의 이름/슬러그/패키지/아이콘

**mnn 유지 (건드리지 않을 것)**

- `babel.config.js`, `metro.config.js`, `patches/`, `tsconfig.json`, `app.json` 플러그인 목록
- `src/audio/{amTone,pureTone,cents}.ts`, `src/training/{freq*,am*}.ts`, `sessionStore.ts`, 테스트
- `FreqSessionScreen` / `AmSessionScreen` — 둘 다 `onBack` prop만 받는 **컴포넌트**라 새 라우트에 그대로 꽂힌다 (`근거`: `src/app/explore.tsx`에서 그렇게 쓰임)

**버릴 것**

- HH `babel.config.js`, `index.ts`(mnn은 `main: expo-router/entry`), HH `tsconfig`·`eslint.config.js`

## 4. 순서

1. mnn에 브랜치 생성. 병합 전 상태 커밋.
2. HH 로직 3종(`StaircaseEngine`·`SessionManager`·`trainingFlow`) + 테스트만 먼저 이식 → `npm test` 통과 확인. **UI는 아직 안 건드림.**
3. `pitchUtils` ↔ mnn `cents.ts` 중복 정리(단일 변환 함수).
4. 「높낮이 비교」세션 화면을 mnn 라우팅에 붙이고 실기기 청취 확인.
5. 저장: `SessionTrack`에 높낮이 트랙 값 추가 + 테스트. (v2 키 신설 없음 · §2-2) · 기록 화면 상위 이동은 **3종 완성 후**(§2-3) — 이번 단계에 하지 않음.
6. 연습 탭 = 카드 3개로 재구성. 섹션 라벨 「음고」 2 / 「떨림」 1.
7. 홈·통계·설정·결과 이식. 지표 카피 §2-1 결정 적용.
8. `app.json` 이름·slug·패키지·아이콘을 HarmoniTune으로. 온보딩 중복 제거.
9. 문서 갱신: 설계 §3·§6에 3트랙 반영, `impl-log` 기록, HH의 시작값 50/200 불일치 정정.

## 5. 리빌드 (필수 고지)

- **dev client 리빌드 필요.** `app.json` 플러그인·패키지명·아이콘이 바뀌고 네이티브 의존성 구성이 달라진다. `npm run android`.
- Babel/Metro를 손대면 `--reset-cache`.

## 6. 성능 주의

- HH `SkiaWaveVisualizer`는 GPU 파형 애니메이션. mnn 방침은 **훈련 입력 화면 정적·최경량** → 훈련 중 상시 렌더로 넣지 말고 결과·연출 화면 한정, 또는 제외.
- 시각을 난이도(cent·변조 깊이)에 연동 금지(시각 누수). HH 파형은 `440 Hz / ? Hz` 라벨 성격이라 현재는 위반 아님(`근거`: HH cent 문서 §4.3).

## 7. 단정 금지

- `미검증`: 세 트랙을 한 앱에 합쳤을 때의 세션 길이·이탈·피로. 실기기 확인 안 됨.
- `미검증`: 기존 `sessionStore`에 트랙 값 확장은 방침만 정함(§2-2). HH `@harmonitune/sessions` → mnn 키로의 마이그레이션 코드는 없음.
- `추정`: HH 컴포넌트가 mnn `react-native-svg`/아이콘 체계와 그대로 맞물릴지. HH는 svg 의존성이 없어 확인 필요.
- `추정`: HH `app/training.tsx`가 가장 큰 파일이라 이식 시 상태 머신 충돌 가능. 전체 읽고 판단해야 함(이번 검증에서 미독).
- `주의`: HH의 "역치·평가" 프레이밍과 mnn의 웰니스 방침은 **실제 충돌**이다. §2-1을 정하지 않고 화면부터 합치면 카피가 뒤섞인다.
- 효과 주장(청취 개선)은 양쪽 다 **미검증** — 통합 후에도 스토어·UI에 쓰지 않는다.
