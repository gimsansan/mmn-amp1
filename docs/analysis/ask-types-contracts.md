# 타입·계약 지도 — 이 앱에 적용 (#5)

> **지침**: [`analaysys/ask-types-contracts.md`](../../analaysys/ask-types-contracts.md) (타입·계약 파악)
> **표기**: `이름(입력: 타입) → (출력: 타입)`
> **날짜**: 2026-08-21 · `근거` = 파일을 읽고 확인한 것

---

## 0. 한 줄

**이 앱에는 서버가 없는데도 「외부 데이터 계약」이 있다 — 저장소가 그 외부다.**

지침 §2-3은 API 응답을 예로 들지만, 이 앱에서 통제 못 하는 데이터는 **어제 내 앱이 저장한 값**이다. 구버전이 썼을 수도, 쓰다 만 것일 수도, 손으로 고쳤을 수도 있다. 그래서 **읽을 때 검증한다**.

---

## 1. 가장 중요한 계약 — 저장 레코드

### 약속된 모양

```ts
type SavedSessionRecord =
  | SavedFreqSessionRecord    // track: 'freq'
  | SavedAmSessionRecord      // track: 'am'
  | SavedPitch2SessionRecord  // track: 'pitch2'
```

**`track` 필드 하나로 갈라지는 유니온**이다. 이게 왜 좋으냐면:

```ts
if (record.track === "am") {
  record.summary.meanReversalDepthDb   // ✓ 여기서만 이 필드가 보인다
}
```

`track`을 확인하는 순간 TypeScript가 나머지 두 종류를 지워 준다. `pitch2` 레코드에서 `meanReversalDepthDb`를 읽으려 하면 **컴파일이 막는다.**

### 약속이 실제와 다를 수 있나 — **있다**

지침 §0 "이유 2"(컴파일타임 vs 런타임)가 이 앱에서 실제 사고로 이어졌던 자리다. 프로젝트 문서에 그대로 적혀 있다:

> `as`는 **컴파일러에게 하는 약속일 뿐 런타임 검사가 아니다.** 저장소에 형태가 어긋난 값이 하나라도 있으면 그대로 화면까지 흘러가고, `summary.meanReversalDepthDb.toFixed(1)` 같은 접근을 하는 순간 **기록 화면 전체가 넘어진다.**
> (`docs/fix-reviews.md`)

### 그래서 런타임 검증을 붙였다

```ts
function isValidRecord(value: unknown): value is SavedSessionRecord
```

**`unknown`으로 받아 `is`로 좁힌다.** 이 시그니처가 핵심이다 — 들어올 때는 "모르는 값"이고, 검사를 통과해야 비로소 타입이 붙는다.

검사 내용:

| 검사 | 이유 |
|------|------|
| `isFiniteNumber` | `NaN`·`Infinity`도 `typeof === "number"`다. 그대로 그리면 그래프가 깨진다 |
| `isFiniteNumberOrNull` | 요약 수치는 **「값 없음」이 정상**이라 null 허용 |
| `isEndReasonOrNull` | 아는 문자열(`reversals`·`max_trials`·`manual`)만 |
| `isSessionModeOrAbsent` | **없어도 통과** — 구버전 레코드에는 이 필드가 없다 |

마지막 줄이 이 앱이 조심하는 방식이다. `mode?: SessionMode`처럼 **선택 필드로 두고, 없으면 「측정」으로 간주**한다. 안 그러면 예전에 저장한 기록이 전부 통계에서 사라진다.

```ts
export function isCountedInStats(record: SavedSessionRecord): boolean {
  return record.mode !== 'practice';   // undefined면 true → 통계 포함
}
```

**`=== 'measure'`가 아니라 `!== 'practice'`인 게 의도다.** 구버전 호환이 여기 한 줄에 걸려 있다.

---

## 2. `as` 단언은 몇 번 쓰였나 — **의미 있는 것은 딱 1번**

`근거`: `grep`으로 전수 확인. 나머지는 전부 `import { Text as SvgText }` 같은 이름 바꾸기다.

```ts
const next = capByMode([
  record as SavedSessionRecord,   // ← 유일한 진짜 단언
  ...(await readAllRaw()),
]);
```
`sessionStore.ts:268`

**여기서는 안전하다.** `record`는 바로 윗줄에서 이 함수가 직접 만든 값이고(`build()`), 제네릭이 `R extends SavedSessionRecord`로 묶여 있다. 외부에서 온 값을 단언하는 게 아니다.

→ **지침 §4의 "`as`로 약속 우회"가 이 앱에는 사실상 없다.** `any`도 0건이다.

---

## 3. 컴포넌트 계약 — props

이 앱의 props 타입은 형식이 통일돼 있다.

```ts
type AmSessionScreenProps = {
  onBack?: () => void;
  onOpenStats?: () => void;
  onBeforeStart?: () => boolean;
  autoStart?: boolean;
  onAutoStartConsumed?: () => void;
  initialMode?: SessionMode;
  onModeChange?: (next: SessionMode) => void;
};

export function AmSessionScreen({
  autoStart = false,
  initialMode = DEFAULT_SESSION_MODE,
  ...
}: Readonly<AmSessionScreenProps>) {
```

**전부 선택(`?`)이고 기본값이 있다.** 이유가 있다 — 같은 연습 화면이 두 가지로 쓰인다:

| 쓰임 | 넘기는 props |
|------|------------|
| 탭이 곧 연습 (떨림) | `onBack` 없음 → 뒤로 버튼 안 뜸 |
| 고르기 화면 아래 (한 글자) | `onBack` 있음 → 뒤로 버튼 뜸 |

**`onBack`이 있냐 없냐로 화면 모양이 바뀐다.** 이게 이 앱에서 props 계약을 읽을 때 가장 먼저 볼 것이다.

**`Readonly<>`로 감싸는 것도 규칙이다.** props를 함수 안에서 바꾸지 않겠다는 선언이다.

### 눈여겨볼 계약 하나 — `onBeforeStart`

```ts
onBeforeStart?: () => boolean;
```

**boolean을 반환하는 콜백**이다. `false`면 연습을 시작하지 않는다. 부모가 "잠깐, 듣기 준비부터"라고 막는 장치다. 흔한 `on*` 콜백(반환값 없음)과 다르니 헷갈리지 말 것.

---

## 4. 함수 계약 — null 반환을 어떻게 다루나

지침 §2-2의 "반환이 `T | null`이면 받는 쪽이 열어 쓰는지" 확인.

```
glanceOfKind(feed: StatsFeed, kind: StatsKind, now?: Date) → (StatsGlance | null)
```

**null이 정상 값이다** — 그 종목을 아직 한 번도 안 했다는 뜻. 받는 쪽이 반드시 열어야 한다:

```ts
export function glanceLineCopy(glance: StatsGlance | null): string {
  if (glance == null) { return "기록 없음"; }
  ...
}
```

**null을 문구로 바꾸는 함수를 따로 둬서, 화면이 null을 직접 안 만지게 했다.** 화면에서 `glance.whenCopy`를 쓰다가 터지는 자리를 없앤 것이다.

같은 패턴이 요약 숫자에도 있다:

```ts
meanReversalDepthDb: number | null;   // 반전이 부족한 짧은 세션이면 null
```

→ 그래프는 **null인 점만 빼고** 선을 그린다. 0으로 채우지 않는다. 0은 "떨림 깊이 0dB"라는 **거짓 기록**이 되기 때문이다.

---

## 5. 공유 타입 — 원본이 하나인가

```ts
// sessionStore.ts — 원본
export type SessionMode = 'practice' | 'measure';

// sessionMode.ts — 다시 내보내기만
import type { SessionMode } from "@/training/sessionStore";
export type { SessionMode };
```

**중복 정의가 아니라 재수출이다.** 원본은 저장소 하나다. 화면들은 `sessionMode.ts`에서 가져다 쓰는데, 그래도 실제 타입은 저장소 것이다.

**왜 이렇게 했나(`추정`)**: 화면이 저장소를 직접 import하지 않게 하려는 것. 타입은 저장 모양에서 나오는 게 맞고, 화면이 쓰는 창구는 따로 두는 구조다.

### 통계 종목 타입 — 새로 만든 공유 타입

```ts
export type StatsKind = "ling6" | "pitch2" | "freq" | "wrs1" | "wrs2" | "am";
export const KIND_LABEL: Record<StatsKind, string> = { ... };
```

**`Record<StatsKind, string>`이 안전장치다.** 나중에 `StatsKind`에 종목을 하나 더 넣으면, 라벨을 안 채운 곳에서 **컴파일이 깨진다.** 빠뜨릴 수가 없다.

이 앱에서 `Record<유니온, T>`가 쓰인 곳:

| 자리 | 채워야 하는 것 |
|------|--------------|
| `KIND_LABEL` · `GROUP_LABEL` | 화면에 보일 이름 |
| `GROUP_OF_KIND` · `KINDS_OF_GROUP` | 종목 ↔ 탭 대응 |
| `TRACK_FACE` (`SessionTrendPanel`) | 그래프 제목·단위·읽는 법 |

**종목을 추가할 때 어디를 고쳐야 하는지 컴파일러가 알려 준다.** 문서를 안 봐도 된다.

---

## 6. `as const` — 이 앱에 반복해서 나오는 도구

```ts
const VOICE_PROBE_WAITS_MS = [0, 250, 500] as const;
const GRAPH_A_TRACKS = [ { key: "pitch2", ... }, ... ] as const;
type GraphATrack = (typeof GRAPH_A_TRACKS)[number]["key"];
```

`as const`가 없으면 `key`가 그냥 `string`이 돼서, 위 마지막 줄이 `string` 타입이 된다. 붙이면 `"pitch2" | "freq"`로 좁혀진다.

**배열 하나에서 타입이 나온다** — 목록과 타입을 따로 관리하지 않아도 된다. 별도 학습 노트가 있다: `docs/as-const-리터럴타입-노트.md`

---

## 7. 이 앱에서 타입을 읽는 요령

| 보이면 | 뜻 |
|--------|-----|
| `value is X` | 런타임 검증 함수. 저장소 경계다 |
| `unknown` 파라미터 | 여기서부터 안쪽은 못 믿는다 |
| `number \| null` | 「값 없음」이 정상. 0으로 바꾸면 안 됨 |
| `?:` 필드 | 구버전 호환일 가능성이 높다. 주석 확인 |
| `Record<유니온, T>` | 유니온을 늘리면 여기가 깨진다(의도) |
| `Readonly<Props>` | props 계약 |
| `as const` | 리터럴 타입을 뽑아 쓰는 중 |

---

## 8. 단정 금지

- `근거`: `as` 1건·`any` 0건은 grep 전수 확인. 검증 함수는 `sessionStore.ts`·`ling6Store.ts`·`wrsStore.ts`·`twoCharStore.ts` 네 곳에서 확인.
- `주의`: 검증은 **읽을 때만** 돈다. 쓸 때는 타입만 믿는다 — 앱이 만든 값이니 맞다고 보는 것이다(`추정`: 합리적이나 절대적이진 않음).
- `미검증`: `schemaVersion`을 올려 `migrateRecord`에 분기를 추가하는 경로는 아직 한 번도 안 밟았다(현재 전부 버전 1).
- `추정`: §5의 재수출 의도는 코드 구조에서 읽은 것이고, 문서에 명시된 근거는 못 찾았다.
