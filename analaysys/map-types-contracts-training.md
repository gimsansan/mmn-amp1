# 타입·계약 지도 — `src/app/**` + `src/training/**` + `src/audio/**`

> **축**: 타입·계약(5번 축). 질문 요령은 [`ask-types-contracts.md`](./ask-types-contracts.md).
> **자매 지도**: 화면 [`map-screen-flow-training.md`](./map-screen-flow-training.md) · 데이터 [`map-data-flow-training.md`](./map-data-flow-training.md) · 상태 [`map-state-management-training.md`](./map-state-management-training.md) · 에러 [`map-error-handling-training.md`](./map-error-handling-training.md).
> **표기**: `이름(입력: 타입) → (출력: 타입)`. 화면 `[ ]`, 데이터 `{ }`, 상태 `( )@소유자`.
> **작성**: 2026-08-21, 브랜치 `feat_wrs_voice_guide`. 코드가 바뀌면 이 문서는 낡는다.

## 0. 대상 목록과 읽음 상태

고정 목록 **82개**(`src/app` 5 + `src/audio` 3 + `src/training` 74). 읽음 82 / **안 읽음 0**.
`tsconfig.json`은 목록 밖이지만 이 축의 전제라 확인했다 — **`strict: true`**(expo 베이스 상속).

세어 본 것: `any` **0개** · 강제 단언 `as` **1곳** · 논널 단언 `!` **1곳** · 타입 가드 함수 **17개** · `.d.ts` **1개**(`types/svg.d.ts`, 목록 밖).

---

## 1. 한 줄 요약 — 약속을 우회하는 자리가 거의 없다

`any`가 하나도 없고, 외부에서 오는 값(저장소 JSON · TTS 음성 목록)은 **전부 런타임 검증**을 거친다.
이 축에서 흔한 지적(「타입만 믿고 `as`」)이 이 코드에는 거의 해당하지 않는다.

대신 다른 성격의 위험이 있다.

- **같은 이름, 다른 뜻의 타입이 둘 있다** — `SessionMode`(§5-1). 가장 헷갈리는 자리.
- **구조가 완전히 같은 두 타입이 서로 대입된다** — `SavedWrsRecord` / `SavedTwoCharRecord`(§5-2).
- **선택 필드 규칙이 저장소마다 다르다** — `schemaVersion`·`mode`(§5-3).

---

## 2. 데이터 계약(외부) — 통제 못 하는 세 경계

### 2-1. `{AsyncStorage}` → 앱 (가장 두꺼운 검증)

```
{저장소 문자열} → JSON.parse → unknown → isValidRecord(unknown) → SavedXRecord | 버림
```

네 저장소가 같은 골격이다. 검증 깊이는 다르다.

| 저장소 | 검증하는 것 | 타입 가드 |
| --- | --- | --- |
| `sessionStore` | id·savedAt·mode(선택)·summary 공통 4필드 **+ 트랙별 3필드** | `isValidRecord` `hasValidSummaryBase` `isSessionModeOrAbsent` `isEndReasonOrNull` `isFiniteNumberOrNull` |
| `wrsStore` | id·savedAt·summary 3필드 + **값 범위**(`correctCount ≤ trialCount`, `0 ≤ percent ≤ 100`) | `isValidRecord` `isValidSummary` |
| `twoCharStore` | 위와 **글자 그대로 같은 코드** | 〃 |
| `ling6Store` | id·savedAt·dateKey 정규식·6음소 boolean **+ passCount 재계산 일치** | `isValidRecord` `isPhonemeMap` `isDateKey` |

- 주석에 근거가 있다 — 「저장소 내용은 앱이 썼더라도 **믿을 수 없는 입력**으로 다룬다」.
- `ling6Store`가 유일하게 **필드 간 정합성**까지 본다: `summary.passCount === passCountOf(summary.byPhoneme)`.
- `sessionStore`의 검증은 **형태 기준**이다. 미래 버전(v2)이라도 v1 필드를 갖고 있으면 통과시킨다 — 상위 호환 데이터를 함부로 버리지 않으려는 의도가 주석에 적혀 있다.

**유일한 강제 단언이 여기 있다.**

```ts
// sessionStore.ts:268
const next = capByMode([record as SavedSessionRecord, ...(await readAllRaw())]);
```

`R extends SavedSessionRecord`인 제네릭을 상위 타입으로 넓히는 것뿐이라 위험은 없다. 우회가 아니라 폭 넓히기다.

### 2-2. `{expo-speech}` → 앱

```
getAvailableVoicesAsync() → (Voice[])
isKorean(language: unknown) → boolean
```

`language`를 **`unknown`으로 받는다**. 라이브러리 타입은 `string`이지만 믿지 않고 `String(language ?? "")`로 접는다.
이 축에서 「외부 값을 안 믿는다」의 교과서적인 예다.

```ts
speakWrsWord(word: string) → Promise<void>    // resolve = 끝났거나 중지됨, reject = onError
hasKoreanVoice() → Promise<boolean>            // reject 없음 — 실패는 true로 접는다
```

`hasKoreanVoice`의 계약이 특이하다. **실패를 값으로 접어** 호출부가 `try/catch`를 쓰지 않게 만든다.
대가는 「모름」과 「있음」이 같은 `true`라는 것 — 타입만 봐선 구분할 수 없고 주석에만 적혀 있다.

### 2-3. `{react-native-audio-api}` → 앱

`AudioContext`·`OscillatorNode`·`GainNode`·`BiquadFilterNode`·`AudioBufferSourceNode`를 타입 그대로 쓴다. **검증 없이 믿는 유일한 외부 경계**다.
대신 노드 조작을 전부 `try/catch`로 감싸 실패를 삼킨다(에러 축 §4). 타입으로 못 막는 것을 런타임으로 막는 셈이다.

`fillWhiteNoise(length: number) → Float32Array<ArrayBuffer>` — 타입 인자가 붙은 typed array다. 최신 TS의 `ArrayBufferLike` 구분을 따른다.

---

## 3. 함수 계약 — 핵심 시그니처

### 시행 생성 (전부 `Rng`를 마지막 선택 인자로 받는다 — 테스트 주입용)

```
createWrsTrials(rng?: Rng) → WrsTrial[]
createTwoCharTrials(listIndex: number, rng?: Rng) → TwoCharTrial[]     ※ 범위 밖이면 throw
createLing6Trials(rng?: Rng) → Ling6Trial[]
createBingoBoard(difficulty: WrsDifficulty, rng?: Rng) → string[]      ※ 9칸 못 만들면 throw
createFreqAfcTrial(options?) → FreqAfcTrial
createAmAfcTrial(options?) → AmAfcTrial
buildChoices(target: string, rng?: Rng) → WrsChoices
```

`Rng = () => number`가 **두 곳에 각각 정의**돼 있다(`wrsDistractors.ts`, `ling6Session.ts`). 같은 모양이라 문제는 안 나지만 원본이 둘이다.

### 채점 — 전부 `boolean` 또는 결과 객체

```
scoreWrsChoice(target: string, choice: string) → boolean
scoreTwoCharChoice(target: string, choice: string) → boolean
scoreBingoTap(cue: string, choice: string) → boolean
scoreLing6Choice(target: Ling6Choice, choice: Ling6Choice) → boolean
scoreFreqAfcChoice(trial, chosenIndex: number) → FreqAfcChoiceResult    ※ 범위 밖이면 throw
scoreAmAfcChoice(trial, chosenIndex: number) → AmAfcChoiceResult        ※ 〃
```

앞 넷은 전부 `a === b` 한 줄이다. 이름만 다른 같은 함수가 넷 있는 셈이다.

### 요약 — `null`이 정상인 반환

```
summarizeWrs(outcomes: readonly WrsTrialOutcome[]) → WrsSessionSummary
summarizeTwoChar(outcomes: readonly { correct: boolean }[]) → WrsSessionSummary
summarizeBingo({cueCount, marked}) → BingoSummary
summarizeSession(session: FreqSessionState) → FreqSessionSummary
summarizeAmSession(session: AmSessionState) → AmSessionSummary
toDailySummary(map: Ling6PhonemeMap) → Ling6DailySummary
```

**`| null`이 붙은 필드가 이 코드의 특징이다.**

```ts
meanReversalDeltaCents: number | null   // 반전이 없으면 값 없음
easiestDeltaCents:      number | null
hardestDeltaCents:      number | null
meanReversalDepthDb:    number | null
meanReversalCents:      number | null
endReason: SessionEndReason | null
```

「값 없음이 정상」이라는 주석이 저장소 검증(`isFiniteNumberOrNull`)과 테스트(「요약 수치가 null이어도 정상으로 본다」)에 함께 박혀 있다.
받는 쪽은 전부 열어 쓴다 — `summary?.meanReversalDepthDb == null ? "—" : …`.

`summarizeTwoChar`의 입력이 `readonly { correct: boolean }[]`이다. 구조적 최소 계약만 요구해서
`TwoCharOutcome`이든 `WrsTrialOutcome`이든 받는다. 의도적으로 느슨하다.

### 좁히기 계약 (`is` 술어 17개)

```
isCompletePhonemeMap(map: Partial<Record<Ling6SoundId, boolean>>) → map is Ling6PhonemeMap
isSessionTrack(kind: StatsKind) → kind is SessionTrack
isCountedInStats(record: SavedSessionRecord) → boolean
isPlainObject(value: unknown) → value is Record<string, unknown>
isFiniteNumber / isFiniteNumberOrNull / isEndReasonOrNull / isSessionModeOrAbsent / isDateKey / isPhonemeMap
isValidRecord / isValidSummary  (저장소 4곳에 각각)
```

`isCompletePhonemeMap`이 가장 잘 쓰인 예다. **`Partial<...>` → `Ling6PhonemeMap`으로 좁히는 문이 이 함수 하나뿐**이라,
6음소가 다 안 찬 맵이 저장소에 들어갈 길이 타입으로 막혀 있다.

---

## 4. 컴포넌트 계약 — props

**모든 컴포넌트가 `Readonly<{...}>`로 props를 받는다.** 예외가 없다. 일관성이 높은 축이다.

### 필수 / 선택 / 기본값

| 컴포넌트 | 필수 | 선택(기본값) |
| --- | --- | --- |
| `WrsVoiceGuideScreen` | `onRetry` `onBack` | `checking = false` |
| `WrsSessionScreen` | — | `onBack?` `autoStart = false` `onAutoStartConsumed?` |
| `WrsTwoCharScreen` | **`onBack`** | `autoStart = false` `onAutoStartConsumed?` |
| `WrsBingoScreen` | `onBack` | — |
| `AmSessionScreen` | — | `onBack?` `onOpenStats?` `onBeforeStart?` `autoStart = false` `onAutoStartConsumed?` `initialMode = DEFAULT_SESSION_MODE` `onModeChange?` |
| `FreqSessionScreen` · `PitchCompareScreen` | — | `onBack?` `autoStart = false` `onAutoStartConsumed?` `initialMode` `onModeChange?` |
| `StatsScreen` | `initialKind` `onBack` | — |
| `ListeningCheckScreen` | `trackTitle` `trackIcon` `sampleHz` `onStart` `onBack` | `extra?: ReactNode` |
| `SummaryCard` | 수치 6개 + `meanLabel` | `header?: ReactNode` `footnote?: string \| null` |
| `TrendChart` | `points` | `referenceValue?` `referenceLabel?` |
| `SessionModeToggle` | `value` `onChange` | `disabled?` `style?` `textScale = 1` |
| `SessionProgressBar` | `current` `total` | — |

**`onBack`이 화면마다 필수/선택이 갈린다.** `WrsSessionScreen`은 선택(`onBack?`)이고
`WrsTwoCharScreen`은 필수다 — 거의 같은 화면인데 계약이 다르다.
선택인 쪽은 `onBack`이 없으면 「뒤로 가기」 버튼도, 뒤로 가기 핸들러도 **둘 다 안 단다**(`if (!onBack) return`).
지금은 항상 넘겨 주므로 차이가 드러나지 않는다.

### 콜백 계약

```
onBeforeStart() → boolean        // false면 세션을 만들지 않는다 ← 반환값이 게이트인 유일한 콜백
onModeChange(next: SessionMode) → void
onAutoStartConsumed() → void
onPick(kind: StatsKind) → void
onPress(word: string, index: number) → void      // BingoBoard
```

`onBeforeStart`만 **반환값에 의미가 있다.** 호출부는 `onBeforeStart?.() === false`로 확인한다 —
`?.`가 `undefined`를 낼 수 있어서 `!` 대신 `=== false`를 쓴 것. 계약이 「값을 안 주면 통과」다.

---

## 5. 공유 타입 — 원본과 그 위험

### 5-1. `SessionMode`가 **두 개 있고 뜻이 다르다** (가장 헷갈리는 자리)

```ts
// sessionStore.ts:37   — 앱 전체가 쓰는 것
export type SessionMode = 'practice' | 'measure';    // 귀풀기 / 연습

// pitch2afc/SessionManager.ts:16 — 음고 트랙 안쪽에만 있는 것
export type SessionMode = 'assessment' | 'training'; // 평가 / 훈련
```

`sessionMode.ts`는 앞의 것을 `import` 후 그대로 `export type`으로 다시 내보낸다(재수출).
그래서 화면들은 `@/training/sessionMode`에서 가져오고, `trainingFlow.ts`만 `./SessionManager`에서 가져온다.

**`PitchCompareScreen.tsx` 한 파일 안에 둘이 같이 있다.**

```ts
import { type SessionMode } from "@/training/sessionMode";      // practice | measure
…
const manager = new SessionManager({ mode: "training", … });    // 다른 SessionMode의 값
```

리터럴로 넘겨서 이름 충돌은 안 나지만, 이 파일에서 「모드」를 이야기하면 **어느 쪽인지 매번 물어야 한다.**
`runModeRef: SessionMode`는 앞의 것이고, `SessionManager`가 들고 있는 `config.mode`는 뒤의 것이다.

### 5-2. `SavedWrsRecord`와 `SavedTwoCharRecord`가 **구조적으로 같다**

```ts
type SavedWrsRecord     = { id: string; savedAt: string; schemaVersion: number; summary: WrsSessionSummary };
type SavedTwoCharRecord = { id: string; savedAt: string; schemaVersion: number; summary: WrsSessionSummary };
```

TypeScript는 구조로 판단하므로 **두 타입은 서로 완전히 대입 가능하다.** 25문항 기록을 두 글자 저장소에 넘겨도 컴파일된다.
막는 것은 타입이 아니라 **런타임 검사**뿐이다.

```
appendWrsSummary      — trialCount !== 25면 throw
appendTwoCharSummary  — trialCount !== 12면 throw
```

`WrsProgressPanel`이 둘 다 받는 것도 같은 이유다 — `PercentSessionRecord`라는 구조적 상위 타입 하나로 받는다.
데이터 축의 「요약 객체만 들고는 어느 연습 것인지 알 수 없다」가 타입 축에서는 이렇게 나타난다.
구분하려면 `id` 접두사(`wrs-` / `two-`)나 저장 키를 봐야 하는데, **둘 다 타입에 없다.**

### 5-3. `schemaVersion`·`mode`의 선택 여부가 저장소마다 다르다

```ts
sessionStore : schemaVersion?: number    mode?: SessionMode   ← 둘 다 선택(구버전 호환)
wrsStore     : schemaVersion: number     (mode 없음)          ← 필수
twoCharStore : schemaVersion: number     (mode 없음)          ← 필수
ling6Store   : schemaVersion: number     (mode 없음)          ← 필수
```

`sessionStore`만 **초기 저장분에 필드가 없던 시절**을 안고 간다. 그래서 「없으면 1로 본다」·「없으면 측정으로 간주」라는
암묵 규칙이 타입이 아니라 **주석과 `isCountedInStats` 함수 안에** 산다.

```ts
export function isCountedInStats(record: SavedSessionRecord): boolean {
  return record.mode !== 'practice';   // undefined도 통과 = 측정으로 간주
}
```

타입만 읽으면 `mode`가 `undefined`일 때 어떻게 되는지 알 수 없다. 이 함수를 같이 봐야 한다.

### 5-4. 원본이 하나로 잘 잡힌 타입들

```
WrsSessionSummary      @ wrs/wrsSession.ts      → wrsStore · twoCharStore · twoCharSession · 두 화면
SessionEndReason       @ freq/freqSession.ts    → amSession(재수출) · pitchSummary · sessionStore
PitchCompareSummary    @ pitch2afc/pitchSummary.ts  → 「저장 스키마의 단일 출처」라고 주석에 명시
Ling6SoundId · Ling6Choice · Ling6Sound @ ling6/sounds.ts
ConfusionAxis · WrsDifficulty · Rng · WrsChoices @ wrs/wrsDistractors.ts
StatsKind · StatsGroup · StatsFeed @ statsFeed.ts
SessionTrack @ sessionStore.ts
```

`pitchSummary.ts`가 좋은 예다 — **저장 스키마 타입만 담은 23줄짜리 파일**이라,
화면과 저장소가 서로를 import하지 않고도 같은 모양에 합의한다.

### 5-5. 같은 정의가 두 번 있는 것

```
StaircaseDirection = 'up' | 'down'    @ am/amStaircase.ts  와  freq/freqStaircase.ts
Rng = () => number                    @ wrs/wrsDistractors.ts  와  ling6/ling6Session.ts
AmStepScheduleEntry / STEP_SCHEDULE   구조가 같은 표가 셋 (am · freq · pitch2afc/constants)
```

트랙을 독립적으로 두려는 방침(`merge-plan-harmonitune.md §2-4`가 근거로 인용돼 있다)의 결과다.
의도된 중복이지만, **한쪽을 고칠 때 나머지를 같이 봐야 한다**는 비용은 그대로다.

---

## 6. 리터럴·튜플 계약

```ts
choices: readonly [string, string, string, string]      // 4지선다를 타입으로 못 박음
CHO / JUNG / JONG: readonly [...] as const              // 한글 자모 표
LING6_SOUNDS: readonly Ling6Sound[]
STATS_KINDS: readonly StatsKind[]
KIND_LABEL: Record<StatsKind, string>                   // 종목이 늘면 여기서 컴파일 에러가 난다
GROUP_OF_KIND / KINDS_OF_GROUP: Record<...>
PLAY_BUTTON_LABEL: Record<GameState, string>            // 상태가 늘면 문구 누락이 잡힌다
```

`Record<유니온, T>`가 **누락을 컴파일 타임에 잡는 장치**로 잘 쓰였다.
`StatsKind`에 종목을 하나 더하면 `KIND_LABEL`·`GROUP_OF_KIND`·`countOfKind`의 `switch`가 동시에 걸린다.

**논널 단언은 딱 하나다.**

```ts
// SessionTrendPanel.tsx:198
const last = points.at(-1)!.value;
```

바로 위에 `if (points.length < 2) return null;`이 있어 안전하지만, 타입이 그 관계를 모른다.

---

## 7. 파일별 종류

**1. 컴포넌트 계약** (20) — 화면·표시부 전부. `*Props` 타입 또는 인라인 `Readonly<{}>`.
`WrsVoiceGuideScreen` `WrsSessionScreen` `WrsTwoCharScreen` `WrsBingoScreen` `WrsTabScreen`
`Ling6SessionScreen` `Ling6ProgressPanel` `WrsProgressPanel` `PitchCompareScreen` `FreqSessionScreen`
`AmSessionScreen` `AmTabScreen` `PtaSessionScreen` `StatsScreen` `ListeningCheckScreen`
`SummaryCard` `TrendChart` `SessionTrendPanel` `SessionProgressBar` `SessionModeToggle`

**2. 함수 계약** (24) —
`audio/{pureTone,amTone,cents}`, `am/{amStaircase,amSession,amAfcTrial}`, `freq/{freqStaircase,freqSession,freqAfcTrial}`,
`ling6/{ling6Session,ling6Synth}`, `pitch2afc/{StaircaseEngine,SessionManager,trainingFlow,pitchCompareTrial}`,
`wrs/{wrsSession,twoCharSession,wrsBingo,wrsDistractors,wrsHangul,wrsTrend,wrsTts}`, `sessionMode`, `confirmEndSession`

**3. 데이터 계약(외부)** (5) — `sessionStore`, `wrs/wrsStore`, `wrs/twoCharStore`, `ling6/ling6Store`, `wrs/wrsTts`

**4. 공유 타입** (5) — `pitch2afc/pitchSummary`(전용), `statsFeed`, `ling6/sounds`,
`wrs/wrsDistractors`(`Rng`·`ConfusionAxis`·`WrsDifficulty`), `wrs/wrsSession`(`WrsSessionSummary`)

**정적 데이터** (3) — `wrs/wrsWords`, `wrs/twoCharLists`, `ling6/sounds`(계약과 겸함)

**계약 없음(껍데기)** (5) — `app/*` 라우트 5개. props도 반환 타입 애노테이션도 없다.

**테스트 23개** — 계약을 **고정하는** 쪽. `sessionStore.test.ts`가 가장 많은 계약을 검증한다(선택 필드·손상 레코드·구버전 호환).

---

## 8. 계약이 흐려지는 지점

1. **`SessionMode`라는 이름이 두 가지 뜻을 갖는다**(§5-1). 「모드」라는 말이 나오면 어느 파일에서 온 타입인지 먼저 확인한다.
   `PitchCompareScreen.tsx`에서는 한 파일 안에 둘이 공존한다.
2. **`SavedWrsRecord`와 `SavedTwoCharRecord`를 타입이 구분하지 못한다**(§5-2). 잘못 넣는 것을 막는 건 런타임 검사뿐이다.
   구분이 필요하면 `kind` 같은 태그 필드를 넣어야 하는데, 지금은 없다.
3. **`mode?: SessionMode`의 `undefined`가 「측정」을 뜻한다**(§5-3). 타입에 안 적혀 있고 `isCountedInStats`에만 있다.
   통계 개수가 기대와 다르면 여기부터 본다.
4. **`hasKoreanVoice(): Promise<boolean>`의 `true`가 「있음」과 「모름」을 겸한다**(§2-2). 시그니처만 보면 알 수 없다.
5. **`trainingFlow.ts` 전체와 `SessionManager.shouldAutoEnd`가 프로덕션에서 안 쓰인다.**
   `canSubmitAnswer`·`isReplayPress`·`showsTrialFeedback`·`PLAY_BUTTON_LABEL`을 부르는 화면이 없고,
   호출부는 자기 테스트뿐이다(`trainingFlow.test.ts` 151줄이 전부 이 파일을 지킨다).
   `PitchCompareScreen`이 `Phase` 5단계로 자체 상태 머신을 따로 갖고 있어서다 —
   **같은 개념의 상태 타입이 `GameState`(5값)와 `Phase`(5값) 둘로 갈라져 있고, 서로 값이 다르다.**
   `ASSESSMENT` 상수도 같은 이유로 실질 미사용이다(주석에 「쓰지 않는다」고 명시).
6. **`useTheme(): Record<ThemeColor, string>`은 일부러 넓힌 타입이다.** `as const`의 리터럴 좁힘을 풀려는 것이고,
   이유가 `use-theme.ts` 주석에 있다. 색 값을 타입으로 알아야 할 곳은 없다.
