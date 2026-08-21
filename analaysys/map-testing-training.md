# 테스트 지도 — `src/app/**` + `src/training/**` + `src/audio/**`

> **축**: 테스트(7번 축). 질문 요령은 [`ask-testing.md`](./ask-testing.md).
> **성격**: 다른 여섯 축과 대립하지 않는다 — **여섯 축의 동작이 안 깨지게 고정**하는 축이다.
> **자매 지도**: 화면 [`map-screen-flow-training.md`](./map-screen-flow-training.md) · 데이터 [`map-data-flow-training.md`](./map-data-flow-training.md) · 상태 [`map-state-management-training.md`](./map-state-management-training.md) · 에러 [`map-error-handling-training.md`](./map-error-handling-training.md) · 타입 [`map-types-contracts-training.md`](./map-types-contracts-training.md) · 성능 [`map-performance-training.md`](./map-performance-training.md).
> **표기**: `상황 → 동작 → ✓기대`.
> **작성**: 2026-08-21, 브랜치 `feat_wrs_voice_guide`. 코드가 바뀌면 이 문서는 낡는다.

## 0. 대상 목록과 실행 결과

고정 목록 **82개**(`src/app` 5 + `src/audio` 3 + `src/training` 74). 읽음 82 / **안 읽음 0**.
그중 테스트가 **23개**(전부 `src/training/**/__tests__/`), 소스가 59개.

**이 축은 문서를 쓰면서 실제로 돌렸다** (다른 여섯 축은 코드 읽기만 했다).

```
npx jest              → 23 suites / 230 tests  ·  1 failed  (33.4 s)
npx jest (재시도)      → 23 suites / 230 tests  ·  0 failed  (16.7 s)
npx jest --runInBand  → 23 suites / 230 tests  ·  0 failed  (26.2 s)
```

**불안정 테스트가 하나 확인됐다** — §6에 자세히.

설정: `jest-expo/android` 프리셋, `@testing-library/react-native` 13.3, `jest/setup.js`가 AsyncStorage 기본 목.
**커버리지 설정 없음**(`collectCoverage` 미지정), **CI 없음**(`.github` 없음), **E2E 도구 없음**(Detox·Playwright·Maestro 전무).

---

## 1. 한 줄 요약 — 계산과 저장소는 두껍게, 화면은 셋뿐

```
단위(순수 함수·클래스)   20 파일 / 224 테스트   ← 거의 전부
컴포넌트(렌더·상호작용)   3 파일 /   6 테스트   ← 이 브랜치에서 처음 생김
통합                     0
E2E                      0
```

**계산·저장소 로직은 촘촘하다.** 계단식 엔진·저장소 4개·요약 함수가 경계값·손상 입력까지 고정돼 있다.
**화면은 얇다.** 화면 12개 중 3개만 렌더되고, 그중 실제 상호작용을 밟는 건 2개다.

테스트가 가장 두꺼운 세 파일이 전체의 절반 가까이를 차지한다.

```
StaircaseEngine.test.ts  34   음고 계단식 엔진
sessionStore.test.ts     31   세 트랙 공용 저장소
SessionManager.test.ts   21   음고 세션 관리자
```

---

## 2. 각 축이 무엇으로 지켜지나

### 데이터 흐름(#2) — 가장 두껍게 지켜진다

```
동시에 두 건 저장 → ✓ 둘 다 남는다                          sessionStore   (enqueue 큐)
동시에 다섯 건 저장 → ✓ 다섯 건 다 남는다                    sessionStore
세 트랙 동시 저장 → ✓ 셋 다 남는다                           sessionStore
저장 직후 목록 조회 → ✓ 방금 저장한 건이 들어 있다            sessionStore
한 트랙이 50건 초과 → ✓ 그 트랙 오래된 것만 버린다            sessionStore
귀풀기(practice) 저장 → ✓ 아무것도 안 남는다                  sessionStore
같은 날 링 6 두 번 → ✓ 덮어쓴다(날짜 1건)                     ling6Store
50일 초과 → ✓ 오래된 날부터 버린다                            ling6Store
저장소 4개 읽기 → ✓ kind별로 안 섞인다                        statsFeed
음고 줄에 떨림 기록 → ✓ 안 섞인다                             statsFeed
```

데이터 지도의 §1~§3(원본 4곳·쓰기 경로·읽기 창구)이 **거의 그대로 테스트로 남아 있다.**
특히 「모듈 전역 `tail` 큐가 read-modify-write 유실을 막는다」는 설계가 **동시 저장 테스트 4개**로 고정돼 있다.

### 에러 처리(#4) — 실패 갈래가 잘 잡혀 있다

에러 지도 §8에 표로 정리했다. 요약하면 **저장소 쪽 실패는 촘촘하고, 화면 쪽 실패는 비어 있다.**

```
{JSON 깨짐} !실패! → ✓ 빈 목록                                sessionStore
{배열 아님} → ✓ 빈 목록                                       sessionStore
{정상 사이에 손상 1건} → ✓ 그것만 버리고 나머지는 읽는다       sessionStore
{손상 레코드} → ✓ 다음 저장 때 저장소에서도 사라진다           sessionStore
{음성 조회 실패} → ✓ true (연습을 막지 않는다)                 wrsTts
{음성 목록 빈 배열} → ✓ 다시 물어보고 그 결과를 쓴다           wrsTts
25/12개 미만 저장 → ✓ throw + 목록 그대로                      wrsStore · twoCharStore
```

### 상태 관리(#3) — 한 자리만, 그런데 그 자리가 실제로 깨졌던 곳

```
[한 글자] 답 고르기 → ✓ 진행 막대가 0 → 1로 늘어난다          WrsSessionScreen.test
```

상태 지도 §4의 「원본은 ref, 화면은 state」 관용구를 지키는 **유일한 테스트**다.
테스트 주석에 「오늘 실제로 깨졌던 자리 — 진행 막대가 `outcomesRef`를 렌더에서 읽어 0%에 얼어 있었다」고 적혀 있다.

**같은 관용구를 쓰는 나머지 다섯 화면**(`WrsTwoCharScreen`·`WrsBingoScreen`·`Ling6SessionScreen` 등)에는
같은 테스트가 없다. 한 곳만 고정돼 있다.

### 화면 흐름(#1) — 거의 안 지켜진다

```
[음성 안내] 다시 확인 누름 → ✓ onRetry 1회                     WrsVoiceGuideScreen.test
[음성 안내] 뒤로 가기 → ✓ onBack 1회                           WrsVoiceGuideScreen.test
[음성 안내] 확인 중 재탭 → ✓ 콜백 안 불림 + 라벨 「확인 중…」   WrsVoiceGuideScreen.test
[한 글자] autoStart → ✓ 보기 4개가 그려진다                    WrsSessionScreen.test
```

화면 지도의 화살표 수십 개 중 **네 개만** 테스트로 고정돼 있다.
`phase` 5단계 전이·`BackHandler` 규칙·통계 스와프·듣기 준비 게이트에는 테스트가 하나도 없다.

### 타입·계약(#5)

`sessionStore.test.ts`가 실질적인 계약 테스트다 — 선택 필드(`mode` 없는 구버전), 모르는 값 거부,
`null`이 정상인 수치, `schemaVersion` 유무를 전부 확인한다.
`trainingFlow.test.ts` 15개는 **프로덕션에서 안 쓰이는 파일을 지킨다**(타입 지도 §8-5).

### 성능(#6)

**없다.** 벤치마크도 렌더 횟수 검증도 하나도 없다.

---

## 3. 무엇을 진짜로 두고 무엇을 가짜로 두나

목(mock)은 **네 종류**뿐이다. 과하지 않다.

| 가짜 | 어디서 | 왜 |
| --- | --- | --- |
| `@react-native-async-storage/async-storage` | `jest/setup.js`(전역) | 네이티브 모듈이 없으면 스위트가 통째로 넘어진다 |
| 〃 (지연 있는 손수 만든 목) | 저장소 4개 테스트가 각자 덮어씀 | **지연을 넣어야 동시 저장 경합이 재현된다** |
| `expo-speech` | `wrsTts.test.ts` | 실기기 TTS 없이 음성 목록을 조작 |
| `@/training/wrs/wrsTts`, `@/training/wrs/wrsStore`, `expo-router` | `WrsSessionScreen.test.tsx` | 소리·저장·포커스를 뺀 나머지를 진짜로 돌리려고 |

**잘 된 부분**: `jest/setup.js`의 전역 목이 왜 필요한지 주석에 있다 —
`WrsSessionScreen` → `StatsScreen` → `ling6Store` → AsyncStorage로 **간접 의존이 끌려 오기 때문**.
그리고 저장소 테스트가 그 목을 덮어쓰는 규칙(「그쪽이 이긴다」)도 적혀 있다.

**저장소 테스트의 지연 목이 이 코드의 백미다.**

```js
const delay = () => new Promise((resolve) => setTimeout(resolve, 0));
getItem: async (key) => { await delay(); return store[key] ?? null; },
```

지연이 없으면 read-modify-write가 한 틱에 끝나 **경합이 재현되지 않는다.**
즉 `enqueue` 큐를 지우고도 테스트가 통과해 버린다. 지연 한 줄이 그 구멍을 막는다.

**「가짜끼리 잘 논다」에 가까운 자리**: `WrsSessionScreen.test.tsx`는 `speakWrsWord`를
**항상 성공하는 목**으로 바꿔 둔다. 그래서 이 테스트는 **실패 갈래(「단어를 읽지 못했어요」)를 한 번도 안 지난다.**
화면 로직·시행 생성·채점·진행 막대는 진짜로 돌므로 무의미하지는 않지만, 지키는 범위가 성공 경로뿐이다.

---

## 4. 동작을 보나, 구현을 보나

대체로 **동작을 본다.** 그런데 세 파일에 온도차가 있다.

### 동작을 본다 (좋음)

```js
// WrsSessionScreen.test.tsx — 접근성 값을 본다
function progressNow() {
  return screen.getByRole("progressbar").props.accessibilityValue?.now;
}
```

**이유가 주석에 있다** — 「폭(%)이 아니라 접근성 값을 보는 이유는 보기 칸도 %폭을 쓰기 때문이다」.
보기 칸을 고르는 방식도 동작 기준이다 — 「보기 칸은 라벨이 단어 자체인 버튼이다」(`accessibilityLabel?.length === 1`).

`WrsVoiceGuideScreen.test.tsx`도 전부 문구(`getByText`)로 찾는다.

### 구현을 본다 (리팩터에 약함)

```js
// SessionProgressBar.test.tsx — DOM 구조를 타고 들어간다
const track = tree.children[0];
const fill = track.children[0];
return StyleSheetFlatten(fill.props.style)?.width;
```

`View` 하나를 더 감싸기만 해도 깨진다. `StyleSheetFlatten`을 직접 만들어 쓴다.
진행바가 접근성 값(`accessibilityValue`)을 이미 내보내고 있으므로, **같은 파일 안에 더 튼튼한 손잡이가 있는데 안 쓴다** —
`WrsSessionScreen.test.tsx`는 정확히 그 손잡이를 쓴다. 두 테스트가 같은 컴포넌트를 다른 기준으로 본다.

다만 이 테스트가 지키려는 것(0으로 나누기·상한·음수)은 **폭 문자열이 아니면 확인할 수 없는 값**이라
완전히 틀린 선택은 아니다. 접근성 값은 `current`를 그대로 내보내지 클램프 결과를 안 내보낸다.

### 내부 상태를 본다 (계약이라 볼 수 있음)

`StaircaseEngine.test.ts`·`SessionManager.test.ts`는 `getState()`·`getReversals()`·`getThreshold()`로
내부 값을 직접 확인한다. **공개 메서드라 계약으로 볼 수 있고**, 이 클래스들은 UI를 모르는 순수 로직이라 적절하다.

---

## 5. 지켜지지 않는 것

### 테스트가 하나도 안 닿는 소스 36개

```
화면 9개   AmSessionScreen · AmTabScreen · FreqSessionScreen · PitchCompareScreen · PtaSessionScreen
          Ling6SessionScreen · WrsTabScreen · WrsTwoCharScreen · WrsBingoScreen
          + StatsScreen · ListeningCheckScreen
표시부 6개 SummaryCard · TrendChart · SessionTrendPanel · SessionModeToggle
          Ling6ProgressPanel · WrsProgressPanel
오디오 4개 audio/pureTone · audio/amTone · audio/cents · ling6/ling6Synth
시행 4개   am/amAfcTrial · am/amSession · freq/freqAfcTrial · pitch2afc/pitchCompareTrial
그 밖      sessionMode · confirmEndSession · pitch2afc/{constants,pitchSummary}
          ling6/sounds · wrs/twoCharLists · app 라우트 5개
```

일부는 **간접적으로 닿는다** — `twoCharLists`는 `twoCharSession.test.ts`가 12개 목록을 검증하고,
`sessionMode`의 상수는 `freqSession.test.ts`가 「연습 기본값은 반전 6·시행 40」으로 고정한다.
`pitchSummary`·`constants`는 타입·상수뿐이라 테스트할 동작이 없다.

**진짜로 비어 있는 자리**는 이 셋이다.

1. **오디오 4개 전부.** `depthDbFromM`·`mFromDepthDb`·`rmsEqualizeScale`·`centsToRatio`·`clampFreq`는
   전부 순수 함수라 **가장 테스트하기 쉬운데** 하나도 없다. `RangeError` 검증도 없다.
   `cents.ts`는 36줄짜리 순수 함수 4개다.
2. **`am/amSession.ts`.** `freq/freqSession.ts`에는 모드별 종료 테스트가 3개 있는데,
   **거의 같은 코드인 am 쪽에는 없다**(`amStaircase`만 있다). 두 파일이 짝인데 한쪽만 지켜진다.
3. **`pitch2afc/pitchCompareTrial.ts`의 중단 경로.** `playPitchPair`의 `ABORTED` throw는
   에러 지도 §2의 핵심인데 테스트가 없다.

### 축 자체가 비어 있는 것

```
화면 전이(#1)     [듣는 중]→[고르기]→[정답 확인]→[요약] 5단계를 밟는 테스트 0
BackHandler 규칙  화면마다 다른 뒤로 가기 동작(화면 지도 §5) 테스트 0
중단 경로         「중지」→ 확인 → 요약, 그 사이 abortRef 동작 테스트 0
저장 실패 표시     (saveNote) = 「기록에 남기지 못했어요」 경로 테스트 0
재생 실패 표시     (lastError) = 「단어를 읽지 못했어요」 경로 테스트 0
성능(#6)          0
E2E               0 (도구 자체가 없음)
```

에러 지도 §5의 세 가지 **확인된 위험**(에러 경계 없음 · 링 6 중단 시 요약이 덮임 · `.then` 예외)도 전부 미고정이다.
특히 **링 6 중단 문제는 테스트가 있었다면 잡혔을 종류**다 — 「`[듣는 중]`에서 중지 → ✓ `[요약]`에 머문다」 한 줄이면 된다.

---

## 6. 불안정 테스트 하나 — 확인됨

```
FAIL  WrsSessionScreen › 연습을 시작하면 보기 4개가 그려진다
      thrown: "Exceeded timeout of 5000 ms for a test."
```

**같은 코드로 세 번 돌린 결과**가 다르다.

| 실행 | 결과 | 그 스위트 소요 |
| --- | --- | --- |
| `npx jest` (1회차) | **실패** — 5000 ms 초과 | 28.1 s |
| `npx jest` (2회차) | 통과 | 15.1 s |
| `npx jest --runInBand` | 통과 | — |
| `npx jest <그 파일만>` | 통과 (**3856 ms**) | 8.9 s |

원인은 **여유가 없다**는 것이다. 파일 하나만 돌려도 3.9초로 기본 한도 5초에 붙어 있고,
전체 실행에서 워커들이 CPU를 나눠 쓰면 넘긴다.

무거운 이유는 이 한 줄이다.

```js
render(<WrsSessionScreen autoStart />);
```

`autoStart` → `createWrsTrials()` → **200단어 셔플 + 25회 `buildChoices`**(성능 지도 §3의 「가장 무거운 계산」)가
`jest-expo/android` 환경에서 동기로 돈다. 게다가 `WrsSessionScreen`이 `StatsScreen`을 import하므로
저장소 4개·SVG·패널까지 모듈 그래프가 통째로 딸려 온다.

**손댈 수 있는 방향**(고르는 건 이 문서 밖의 일이다):
`it(..., 15000)`로 한도를 늘리거나, `createWrsTrials`를 목으로 바꿔 시행 생성을 빼거나,
`autoStart` 대신 「연습 시작」을 눌러 렌더와 생성을 분리하거나.

**CI가 없어서 지금은 이 실패가 아무도 못 보고 지나간다.**

---

## 7. 파일별 종류

**1. 단위(unit)** — 20 파일 / 224 테스트

| 파일 | it | 지키는 것 |
| --- | --- | --- |
| `pitch2afc/StaircaseEngine.test.ts` | 34 | 2-down-1-up · 가변 스텝 · 반전/역치 · 클램프 |
| `__tests__/sessionStore.test.ts` | 31 | 직렬화 · 트랙별 상한 · 모드 · 손상 레코드 · 삭제 |
| `pitch2afc/SessionManager.test.ts` | 21 | 다시 듣기 · 반응시간 · 자동 종료 · 라운드 폐기 |
| `ling6/ling6Session.test.ts` | 18 | 시행 구성 · 음소 집계 · 약점 창(7건/4회) · 문구 |
| `pitch2afc/trainingFlow.test.ts` | 15 | 답변 1회 · 다시 듣기 분기 · 평가 피드백 숨김 |
| `__tests__/statsFeed.test.ts` | 14 | 상대 날짜 · 종목별 근황 · 그룹 최신 · 개수 |
| `wrs/wrsBingo.test.ts` | 7 | 보드 9칸 · 줄 찾기 · 큐 고르기 · 요약 문구 |
| `wrs/wrsTts.test.ts` | 7 | 한국어 판별 · 빈 목록 재시도 · 실패 통과 · 캐시 안 함 |
| `am/amStaircase.test.ts` · `freq/freqStaircase.test.ts` | 6+6 | 상수 · 가변 스텝 · 반전 |
| `ling6/ling6Store.test.ts` | 6 | 날짜 upsert · 직전 비교 · 지난주 기준 · 상한 |
| `wrs/wrsDistractors.test.ts` | 5 | 자모 축별 오답 · ㅔ/ㅐ 제외 · 4지 |
| `wrs/twoCharSession.test.ts` | 4 | 목록 3장 · 회전 · 안 비슷한 2개 |
| `freq/freqSession.test.ts` | 3 | 귀풀기 무한 · 연습 기본값 · 시행 한도 |
| `wrs/{wrsStore,twoCharStore,wrsHangul,wrsSession}.test.ts` | 3씩 | 상한·거부·자모·요약 |
| `wrs/wrsTrend.test.ts` | 2 | 시간순 · 2회 이상만 그린다 |
| `wrs/wrsWords.test.ts` | 1 | 단음절 200개 중복 없음 |

**2. 컴포넌트** — 3 파일 / 6+4 테스트
`__tests__/SessionProgressBar.test.tsx`(4) · `wrs/WrsVoiceGuideScreen.test.tsx`(4) · `wrs/WrsSessionScreen.test.tsx`(2)

**3. 통합** — 0. 가장 가까운 것이 `WrsSessionScreen.test.tsx`다
(화면 + 시행 생성 + 채점 + 진행 막대를 함께 돌리고 TTS·저장소만 가짜).

**4. E2E** — 0. 도구도 없다.

---

## 8. 이 축에서 헷갈리는 지점

1. **`npx jest`가 실패해도 코드 문제가 아닐 수 있다**(§6). 실패가 나오면
   `npx jest <그 파일만>` 또는 `--runInBand`로 먼저 재확인한다. 지금 불안정한 것은 딱 하나다.
2. **`it(` 개수를 세면 202가 나오지만 실제는 230이다.** `describe` 안에서 반복문으로 도는 확인이 있어
   정적 grep과 실행 결과가 다르다. 숫자를 인용할 때는 실행 결과를 쓴다.
3. **`trainingFlow.test.ts` 15개는 프로덕션 코드를 지키지 않는다.**
   그 파일의 함수들을 부르는 화면이 없다(타입 지도 §8-5). 테스트는 통과하지만 지키는 동작이 없다 —
   커버리지 숫자와 「실제로 지켜지는 것」이 갈리는 대표 사례다.
4. **커버리지를 측정하지 않는다.** `jest.config.js`에 `collectCoverage`가 없어 숫자 자체가 없다.
   위 §5의 「안 닿는 36개」는 파일명 대조로 센 것이지 커버리지 리포트가 아니다.
5. **저장소 테스트의 목이 `jest/setup.js`의 전역 목을 덮어쓴다.** 두 목의 동작이 다르다
   (전역은 공식 목, 각 파일은 지연 있는 손수 목). 저장소 테스트를 읽을 때는 파일 위쪽의 `jest.mock`부터 본다.
