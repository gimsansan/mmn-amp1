# 수정 리뷰 로그

> **목적**: 백로그 항목을 **어떻게 고쳤는지** — 수정 전후 코드·대안 검토·평가·검증을 남긴다.
> **정본 관계**: 「무엇을 했나」의 정본은 [`impl-log.md`](./impl-log.md)(짧은 표). **이 파일은 그 부록(상세)** 이다.
> 「무엇이 문제이고 지금 상태가 어떤가」의 정본은 [`improvement-backlog.md`](./improvement-backlog.md).
> **형식**: 새 리뷰는 **위에 추가**(최신이 위). 제목 `## 리뷰 — <항목 ID> <짧은 제목>`.
> **기록 원칙**: `.cursor/rules/android-dev-client.mdc` — 확실한 쪽(근거·파일·라인)과 단정 금지 쪽(추정·미검증·주의)을 같이 남긴다.

---

## 리뷰 — P2-3 청취 조건(헤드폰·볼륨) 사전 안내

> **일자**: 2026-08-07 · 브랜치 `two_feat`
> **대상**: `src/training/ListeningCheckScreen.tsx`(신규) · `src/app/explore.tsx`
> **검증**: `tsc --noEmit` 통과 · 기존 테스트 23/23 유지. **에뮬 확인 안 함**(화면 UI라 눈으로 봐야 함).

### 왜 이것만 했나

2026-08-07 사용자 결정: **백로그를 전부 하지 않는다.** P0(실제 결함) 4건 + 이것 하나만 하고 멈춘다.
P2-3을 고른 이유는 **제품 타당성의 근본**이기 때문이다 — 스피커/이어폰, 기기 볼륨에 따라 자극이 통째로 달라져서 **앱이 쌓는 기록끼리 서로 비교가 안 된다.** 기록을 남기는 앱인데 기록이 비교 불가능하면 존재 이유가 흔들린다. 안전(과도 음량) 측면도 있다.
나머지 항목의 처리(안 함/보류)는 [`improvement-backlog.md`](./improvement-backlog.md) §6.

### 무엇을 만들었나

**`ListeningCheckScreen`** — 연습 진입 전 한 화면.

1. 이어폰·헤드폰 권장 + 조용한 곳 + **같은 기기를 쓰면 지난 연습과 견주기 쉽다**는 안내
2. **샘플음 재생 버튼** — 들으면서 기기 볼륨을 맞춘다. 반복 가능
3. 「병원 검사·진단을 대신하지 않아요」 재고지
4. 「연습 시작」 / 「연습 목록」

### 설계 판단 4가지

**1. 화면을 공용 1개로 만들고 `explore.tsx` 한 곳에서만 붙였다**

```tsx
// 훈련 트랙은 듣기 준비를 한 번 지난 뒤에 들어간다(①② 공통 — 화면 중복 없음).
if ((track === 'freq' || track === 'am') && !checked) {
  const isFreq = track === 'freq';
  return (
    <ListeningCheckScreen
      trackTitle={isFreq ? '다른 음 찾기' : '떨림 찾기'}
      sampleHz={isFreq ? DEFAULT_REFERENCE_HZ : DEFAULT_CARRIER_HZ}
      onStart={passCheck}
      onBack={backToPicker}
    />
  );
}
```

`FreqSessionScreen`·`AmSessionScreen`에 각각 넣었다면 **P1-2(①② 중복)를 더 키웠을 것**이다. 두 훈련 화면은 **한 줄도 건드리지 않았다.**

**2. 샘플음은 「그 연습에서 실제로 들을 음」을 쓴다**

② 다른 음 찾기 → 기준음 440 Hz, ① 떨림 찾기 → 반송파 1 kHz.
1 kHz로 볼륨을 맞추고 440 Hz를 듣는 것은 의미가 없다 — 주파수에 따라 체감 크기가 다르기 때문이다.
AM 트랙의 무변조 구간은 RMS 등화 배율이 1이라 `playPureTone`의 기본 게인과 **같은 레벨**이다. 즉 샘플음과 실제 자극의 크기가 일치한다.

**3. 매번 보여준다**

「다시 보지 않기」를 넣지 않았다. 이 화면의 목적이 **「지금 이 순간의 청취 조건」을 맞추는 것**이라, 기기·볼륨이 바뀔 수 있는 세션 사이에 건너뛰면 의미가 없어진다. 대신 **샘플음을 안 듣고 바로 시작해도 되게** 해서 부담을 줄였다(강제하지 않음).

**4. 보정(calibration)이 아님을 코드 주석에 못 박았다**

```ts
/**
 * `주의`: 이 화면은 **보정(calibration)이 아니다.** 앱은 절대 음압을 알지 못하므로
 * dB 수치·권장 레벨을 제시하지 않고, 볼륨을 대신 바꾸지도 않는다(OS 볼륨 존중).
 */
```

문구도 「또렷하게 들리되 크게 느껴지지 않는 정도」처럼 **정성 표현만** 썼다. 「몇 dB로 맞추세요」는 기기 보정 없이 쓸 수 없는 말이다.

### 한계 · 안 한 것

- **이 화면은 청취 조건을 「맞춰 준다」기보다 「생각하게 만든다」에 가깝다.** 사용자가 안내를 무시하면 아무것도 강제되지 않는다. 실제로 조건이 통일되는지는 **알 수 없다**(`주의`).
- **기록에 「이때 어떤 조건이었는지」를 남기지 않는다.** 이어폰이었는지 스피커였는지 저장하지 않으므로, 나중에 기록을 비교할 때 조건 차이를 알 방법이 없다. (기록 스키마 확장이 필요 — 후속 후보, 백로그 미등록)
- **테스트 없음.** 화면 UI라 렌더 테스트를 붙이려면 RN 렌더러 설정이 필요하고, 지금 얻는 값이 크지 않다고 봤다.
- 재생 실패 시 문구는 한국어로 매핑했지만, 나머지 화면의 영문 원문 노출(P2-6)은 그대로다.

### 확인 절차 (에뮬 — **아직 안 함**)

- [ ] 「다른 음 찾기」·「떨림 찾기」를 누르면 **듣기 준비 화면이 먼저** 뜨는가
- [ ] 「소리 들어보기」 → 소리가 나고, 재생 중에는 버튼이 눌리지 않는가
- [ ] 재생 도중 「연습 목록」으로 나가도 **소리가 멎는가**
- [ ] 「연습 시작」 → 훈련 화면으로 넘어가고, 소리 크기가 샘플음과 **비슷하게 들리는가**
- [ ] 연습을 마치고 목록으로 나왔다가 다시 들어가면 **듣기 준비가 또 뜨는가**(의도된 동작)
- [ ] 「연습 기록」은 듣기 준비 없이 바로 열리는가

### 단정 금지

- 이 화면이 **세션 간 비교 가능성을 실제로 높이는지는 검증되지 않았다.** 조건을 통일하려는 시도일 뿐이다.
- 「같은 기기를 쓰면 견주기 쉽다」는 **상식·관례 수준**이며 임상 근거를 대는 것이 아니다.
- 안전 관련 문구는 **정성 안내**이며, 이 앱은 음압을 측정하지 못하므로 **청력 보호를 보장하지 않는다.**
- 자극 스펙(게인 0.15 등)은 **바꾸지 않았다.** 여전히 임시값이며 보정된 값이 아니다.

---

## 리뷰 — P0-3 저장 데이터 형태 검증 · P0-4 테마 널 가드

> **일자**: 2026-08-07 · 브랜치 `two_feat`
> **대상**: `src/training/sessionStore.ts` · `src/hooks/use-theme.ts` · `src/components/app-tabs.tsx`
> **검증**: **테스트 23/23 통과** · 검증 로직을 무력화하니 **11개 실패** 재현 확인 · `tsc --noEmit` 통과. **에뮬 확인 안 함.**
> **린트 미실행**: `eslint.config.*` 없음(P1-3). IDE(sonarqube) 힌트 1건은 반영(`END_REASONS`를 `Set`으로).

### P0-3 — 무엇이 문제였나

`readAll`이 **「배열인가」만 확인하고 내용은 그대로 캐스팅**했다.

```ts
const parsed: unknown = JSON.parse(raw);
if (!Array.isArray(parsed)) return [];
return parsed as SavedSessionRecord[];   // ← 타입만 붙일 뿐 검사 아님
```

`as`는 **컴파일러에게 하는 약속일 뿐 런타임 검사가 아니다.** 저장소에 형태가 어긋난 값이 하나라도 있으면 그대로 화면까지 흘러가고, `SessionHistoryScreen`이 `summary.meanReversalDepthDb.toFixed(1)` 같은 접근을 하는 순간 **기록 화면 전체가 넘어진다**(한 건이 아니라 목록 전부).

어디서 들어올 수 있나(`추정`):

- 쓰는 도중 앱이 죽어 **잘린 JSON**이 남는 경우
- 앞으로 스키마를 바꿨을 때 **남아 있는 구버전 레코드**
- 저장 키 이름에만 `v1`이 있고 **레코드 자체에는 버전 표시가 없어** 구분할 방법이 없었음

### P0-3 — 수정 내용

**1. 레코드 단위 형태 검증 후 불량은 버림**

```ts
// 저장소 내용은 앱이 썼더라도 **믿을 수 없는 입력**으로 다룬다(구버전·중단된 쓰기·
// 수동 조작). 형태가 어긋난 레코드는 읽는 시점에 버려서 화면이 넘어지지 않게 한다.

function isValidRecord(value: unknown): value is SavedSessionRecord {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || value.id === '') return false;
  if (typeof value.savedAt !== 'string' || value.savedAt === '') return false;
  if (!isPlainObject(value.summary) || !hasValidSummaryBase(value.summary)) return false;

  const summary = value.summary;
  if (value.track === 'freq') {
    return isFiniteNumberOrNull(summary.meanReversalDeltaCents) && /* … */;
  }
  if (value.track === 'am') {
    return isFiniteNumberOrNull(summary.meanReversalDepthDb) && /* … */;
  }
  return false;   // 모르는 track은 버린다
}
```

핵심 판단 2가지:

- **`null`은 정상으로 본다.** 요약의 수치 항목은 「값 없음」이 정상 상태다(시행 0회 등). `null`을 불량으로 보면 **멀쩡한 기록을 지우게 된다.**
- **전체를 버리지 않고 레코드 단위로 버린다.** 한 건이 깨졌다고 50건을 날리면 안 된다.

**2. 마이그레이션 자리 + 스키마 버전**

```ts
export const SESSION_RECORD_VERSION = 1;

/**
 * 스키마를 바꿀 때: SESSION_RECORD_VERSION을 올리고 여기에 버전별 분기를 넣는다.
 * 지금은 v1뿐이라 형태 검증만 하고 변환은 없다.
 */
function migrateRecord(value: unknown): SavedSessionRecord | null {
  if (!isValidRecord(value)) return null;
  return value;
}
```

새로 저장하는 레코드에는 `schemaVersion`을 찍는다. **기존 레코드는 이 필드가 없으므로 「없으면 v1」로 본다** — 그래서 타입에서 `schemaVersion?: number`(선택)다.

> `주의`: 검증은 **형태 기준**이다. 미래 버전(v2 등) 레코드라도 v1 필드를 그대로 갖고 있으면 통과시킨다. 상위 호환 데이터를 함부로 버리지 않기 위한 선택이며, 반대로 **버전만 보고 거르지는 않는다**는 뜻이기도 하다.

**3. 저장소도 자연히 청소된다** — 읽을 때 버린 레코드는 다음 append가 「읽은 것 + 새 것」을 다시 쓰면서 **저장소에서도 사라진다.** 별도 청소 코드가 필요 없다(테스트로 확인).

### P0-4 — 테마 널 가드

```ts
// 수정 전
const theme = scheme === 'unspecified' ? 'light' : scheme;
return Colors[theme];

// 수정 후
// RN 타입은 'light'|'dark'|'unspecified'로 선언돼 있지만 구현은 nullable이라
// 런타임에 null/undefined가 올 수 있다(타입 검사로 안 잡힘).
// 'dark'만 다크로 보고 나머지는 전부 light로 떨어뜨린다.
return Colors[scheme === 'dark' ? 'dark' : 'light'];
```

**타입 선언과 구현이 어긋난 사례다.** `Appearance.d.ts:51`은 `useColorScheme(): ColorSchemeName`(non-null)이라고 하지만 `useColorScheme.js`는 `?ColorSchemeName`을 반환한다. `null`이 오면 `Colors[null]`이 `undefined`가 되고 `colors.background`에서 TypeError가 난다. **타입 검사가 통과한다고 안전한 게 아니라는 예**다. `use-theme.ts`·`app-tabs.tsx` 두 곳 동일 적용.

### 검증 (P0-3)

테스트 8개 → **23개**. 새로 추가한 15개는 전부 손상 데이터 방어용이다.

| 테스트 | 검증 무력화 시 | 수정 후 |
|--------|--------------|---------|
| 정상 사이에 섞인 손상 레코드만 버린다 | ❌ | ✅ |
| 버린다: summary 없음 / null / track 모르는 값 / id 없음 / savedAt 빈 문자열 | ❌ (5건) | ✅ |
| 버린다: 레코드가 null / 숫자 | ❌ (숫자만 실패, null은 통과) | ✅ |
| 버린다: trialCount가 문자열 / endReason이 모르는 값 / freq에 am 필드 | ❌ (3건) | ✅ |
| 요약 수치가 null인 것은 **정상으로 본다** | ✅ | ✅ |
| schemaVersion 없는 초기 저장분도 읽는다 | ✅ | ✅ |
| 새 레코드에 schemaVersion이 붙는다 | ✅ | ✅ |
| 손상 레코드가 다음 저장 때 저장소에서도 사라진다 | ❌ | ✅ |
| **합계** | **11 실패 / 12 통과** | **23 통과** |

`migrateRecord`의 검증을 `return value as SavedSessionRecord`로 무력화해 **11건 실패를 재현**한 뒤 복원했다. P0-2 때와 같은 방식으로, **테스트가 실제로 결함을 잡는지**까지 확인한 것이다.

### 한계 · 남은 것

- **불량 레코드를 조용히 버린다.** 사용자에게 「기록 N건을 읽지 못했어요」 같은 안내가 없다. 지금은 발생 가능성이 낮아 단순함을 택했지만, 실제로 유실이 생기면 사용자는 **왜 없어졌는지 알 수 없다**(`주의`).
- **검증은 형태만 본다.** `trialCount: -5` 같은 **의미상 말이 안 되는 값**은 통과한다. 값 범위 검증까지 하면 멀쩡한 데이터를 거를 위험이 생겨 하지 않았다.
- P0-4는 **테스트가 없다.** RN 훅을 목으로 감싸야 하는데, 2줄 수정에 비해 비용이 커서 하지 않았다. `미검증`.
- `newId()`의 `Math.random` 사용에 sonarqube 경고(S2245)가 뜨지만 **보안 용도가 아닌 로컬 레코드 id**라 그대로 뒀다.

### 확인 절차 (에뮬 — **아직 안 함**)

- [ ] 기존 기록이 있는 상태로 앱 실행 → 「연습 기록」이 **그대로 다 보이는가**(정상 데이터를 잘못 버리지 않는지 — 이게 제일 중요)
- [ ] 새 세션 저장 → 목록에 정상 추가되는가
- [ ] 다크/라이트 모드 전환 → 색이 정상인가(P0-4)

### 단정 금지

- 손상 데이터가 **실제로 기기에서 발생한 적이 있는지는 확인되지 않았다.** 예방적 수정이다.
- 「기록 화면이 넘어진다」는 코드 경로 기반 **추론**이며 실제 크래시를 재현한 것은 아니다.
- P0-4는 **런타임 null이 실제로 관측된 적이 없다.** RN 구현이 nullable이라는 사실에 근거한 예방 조치다(`추정`).
- 이 수정들은 훈련 절차·자극 스펙·요약 계산을 **전혀 바꾸지 않았다.**

---

## 리뷰 — P0-2 저장 경쟁(read-modify-write) · 기록 유실

> **일자**: 2026-08-07 · 브랜치 `two_feat`
> **대상**: `src/training/sessionStore.ts` (+ `jest.config.js`, `tsconfig.json`, 신규 테스트)
> **검증**: **단위 테스트로 재현·수정 확인함**(수정 전 실패 → 수정 후 통과). `tsc --noEmit` 통과. **에뮬 확인 안 함.**
> **린트 미실행**: `eslint.config.*`가 없어 ESLint가 **실행 자체가 안 됨**(P1-3, 2026-08-07 확인). 타입 검사·테스트만 거쳤음.

### 1. 무엇이 문제였나

기록 저장은 **읽기 → 앞에 한 건 붙이기 → 통째로 쓰기** 3단계인데, 이 사이에 잠금이 없었다.

```
저장 A: readAll() ──────────┐              ┌── writeAll([A, ...원본])
저장 B:      readAll() ─────┼──────────────┼────────── writeAll([B, ...원본])
                            │              │                    ▲
                        둘 다 같은 원본을 읽음            나중 쓰기가 A를 덮어씀 → A 유실
```

`await` 지점마다 다른 호출이 끼어들 수 있으므로 **동시에 저장할수록 더 많이 유실**된다.

#### 실제로 얼마나 유실되나 (측정)

수정 전 코드에 이번 테스트를 돌린 결과.

| 동시 저장 요청 | 실제 남은 기록 | 유실 |
|---------------|--------------|------|
| 2건 | **1건** | 1건 |
| 5건 | **1건** | 4건 |

> 「드물게 한 건 정도」가 아니라 **동시에 들어온 것 중 마지막 하나만 남는다.** 백로그에서 `추정`으로 적었던 것보다 결과가 나쁘다 → 백로그 P0-2 항목에 정정 반영함.

#### 앱에서 실제로 겹치는 경로 (`추정`)

- P0-1에서 있었던 **`goSummary` 중복 호출**(현재는 수정됨).
- 트랙을 빠르게 오갈 때 이전 화면의 저장이 끝나기 전 다음 저장이 시작되는 경우.
- 앞으로 자동 저장·백그라운드 저장을 추가하면 **경로가 늘어남**.

즉 P0-1을 고쳐 가장 흔한 트리거는 사라졌지만, 저장소 자체는 여전히 안전하지 않은 상태였다.

### 2. 수정 전후 코드

#### 2-1. 핵심 — 직렬화 큐 도입 (신규)

```ts
/**
 * 저장소 접근 직렬화 큐.
 *
 * append는 read → 수정 → write 세 단계라 원자적이지 않다. 두 호출이 겹치면
 * 둘 다 같은 원본을 읽고 각자 한 건씩 얹어 덮어써 **한 건이 유실**된다.
 * 모든 접근을 이 큐에 태워 한 번에 하나만 실행한다.
 *
 * 주의: 같은 JS 런타임 안에서만 유효하다(프로세스·기기 간 잠금이 아님).
 */
let tail: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  // 앞 작업이 실패해도 다음 작업은 실행한다(큐가 막히지 않도록 양쪽 핸들러에 연결).
  const run = tail.then(task, task);
  // 큐 꼬리에는 실패를 흘리지 않는다(처리는 호출자 몫).
  tail = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}
```

설계 포인트 3가지:

1. `tail.then(task, task)` — **성공·실패 양쪽 핸들러에 같은 작업**을 걸어, 앞 저장이 실패해도 뒤 저장이 영구히 막히지 않는다.
2. `tail`에는 **실패를 남기지 않는다**(unhandled rejection 방지). 실패는 `run`을 통해 **호출자에게 그대로** 전달되므로 화면의 「기록 저장에 실패했어요」 경로가 유지된다.
3. 라이브러리 없이 **13줄**. 규모상 mutex 패키지는 과하다.

#### 2-2. append — 중복 제거 + 레코드 생성을 큐 안으로

**수정 전** (두 함수가 거의 동일한 복붙)
```ts
export async function appendFreqSessionSummary(
  summary: FreqSessionSummary
): Promise<SavedFreqSessionRecord> {
  const record: SavedFreqSessionRecord = {
    id: newId(),
    track: 'freq',
    savedAt: new Date().toISOString(),
    summary,
  };
  const next = [record, ...(await readAll())].slice(0, MAX_SAVED_SESSIONS);
  await writeAll(next);
  return record;
}

export async function appendAmSessionSummary(/* ... 위와 동일한 본문 ... */) { }
```

**수정 후**
```ts
/**
 * 레코드 1건 추가(최신이 앞). 상한 초과분은 오래된 것부터 버림.
 * `build`는 큐 안에서 실행되므로 `savedAt`·`id`가 **실제 기록 순서와 일치**한다.
 */
function appendRecord<R extends SavedSessionRecord>(build: () => R): Promise<R> {
  return enqueue(async () => {
    const record = build();
    const next = [record as SavedSessionRecord, ...(await readAllRaw())].slice(
      0,
      MAX_SAVED_SESSIONS
    );
    await writeAllRaw(next);
    return record;
  });
}

export function appendFreqSessionSummary(
  summary: FreqSessionSummary
): Promise<SavedFreqSessionRecord> {
  return appendRecord<SavedFreqSessionRecord>(() => ({
    id: newId(),
    track: 'freq',
    savedAt: new Date().toISOString(),
    summary,
  }));
}
```

> **`build`를 콜백으로 받은 이유**: 레코드를 큐 **바깥에서** 만들면 `savedAt`이 「호출 시각」이 되어, 대기 후 실제 기록된 순서와 타임스탬프 순서가 어긋날 수 있다. 큐 안에서 만들면 **목록 순서와 시각이 항상 일치**한다.

#### 2-3. 읽기·초기화도 같은 큐로

```ts
/** 대기 중인 저장이 있으면 그것들이 끝난 뒤의 목록을 돌려준다. */
export function listSavedSessions(): Promise<SavedSessionRecord[]> {
  return enqueue(readAllRaw);
}

export function clearSavedSessions(): Promise<void> {
  return enqueue(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
  });
}
```

**부수 효과(의도한 것)**: 세션 종료 직후 「연습 기록」으로 들어가도 **방금 저장한 건이 반드시 보인다.** 수정 전에는 저장이 끝나기 전에 목록을 읽으면 빠질 수 있었다.

내부 함수는 「큐 안에서만 호출할 것」이라는 계약을 이름으로 드러내기 위해 `readAll`/`writeAll` → **`readAllRaw`/`writeAllRaw`**로 바꿨다. **외부 API(export)는 하나도 바뀌지 않았다.**

### 3. 검증 — 테스트로 재현하고 고쳤음

이 결함은 **손으로 재현이 사실상 불가능**하다(타이밍 의존). 그래서 단위 테스트를 붙였다.

#### 3-1. 목(mock) 설계가 핵심

```ts
jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
  ...
```

> **지연이 없으면 이 버그는 재현되지 않는다.** 기본 목처럼 즉시 resolve하면 read→write 사이에 다른 호출이 끼어들 틈이 없어 **수정 전 코드도 테스트를 통과해 버린다.** 그래서 `getItem`/`setItem`마다 한 틱씩 지연을 넣었다.

#### 3-2. 결과 (수정 전 ↔ 수정 후)

같은 테스트를 **수정 전 구현(`HEAD`)** 과 **수정 후 구현**에 각각 돌렸다.

| 테스트 | 수정 전 | 수정 후 |
|--------|---------|---------|
| 동시에 저장한 두 건이 모두 남는다 | ❌ **1건만 남음** | ✅ |
| 동시에 저장한 다섯 건이 모두 남는다 | ❌ **1건만 남음** | ✅ |
| 저장 직후 목록 조회가 방금 저장한 건을 포함한다 | ✅ | ✅ |
| 최신 기록이 앞에 온다 | ✅ | ✅ |
| 50건을 넘으면 오래된 것부터 버린다 | ✅ | ✅ |
| 저장된 값이 깨져 있으면 빈 목록 | ✅ | ✅ |
| 배열이 아닌 값이면 빈 목록 | ✅ | ✅ |
| 초기화하면 목록이 빈다 | ✅ | ✅ |
| **합계** | **2 실패 / 6 통과** | **8 통과** |

**테스트가 결함을 실제로 잡는다는 것까지 확인**했다(수정본을 잠시 되돌려 실패를 재현 → 복원). 통과만 보고 끝내면 「아무것도 검사하지 않는 테스트」일 수 있다.

#### 3-3. 테스트를 돌리기 위해 필요했던 설정

`jest.config.js` — `@/` 경로 별칭을 Jest에도 알려야 했다.
```js
moduleNameMapper: {
  '^@/assets/(.*)$': '<rootDir>/assets/$1',
  '^@/(.*)$': '<rootDir>/src/$1',
},
```

`tsconfig.json` — `@types/jest`가 설치돼 있는데도 `describe`/`expect`를 못 찾아 명시했다.
```json
"types": ["jest"],
```
> 이 환경(TypeScript 6.0)에서는 `node_modules/@types`의 **자동 포함이 동작하지 않았다**(`관찰`). 원인은 더 파보지 않았고 명시로 우회했다. `types`를 지정하면 다른 전역 타입 자동 포함이 꺼지는데, **`tsc --noEmit`이 그대로 통과**하므로 현재 코드에는 영향이 없다.

### 4. 수정 전후 평가

| 축 | 수정 전 | 수정 후 |
|----|---------|---------|
| 동시 저장 | **마지막 1건만 남음**(측정) | 전부 남음(측정) |
| 저장 직후 목록 조회 | 방금 건이 빠질 수 있음 | 반드시 포함 |
| 저장 실패 시 | 호출자에게 전달 | **동일**(큐가 삼키지 않음) + 이후 저장도 막히지 않음 |
| `savedAt` 순서 | 호출 시각(대기 시 목록 순서와 어긋날 수 있음) | 기록 순서와 일치 |
| 외부 API | — | **변경 없음**(5개 export 시그니처 동일) |
| 코드 중복 | append 두 함수가 본문 복붙 | 공통 `appendRecord`로 1곳 |
| 테스트 | **0개** | **8개** (이 파일 한정) |
| 타입 검사 | 통과 | 통과 |

**성능**: `await`가 한 겹 늘어나는 정도이며 순차 저장 시 지연은 사실상 0. 동시 저장은 직렬 처리되어 두 건이면 총 시간이 대략 2배가 되지만, 저장 자체가 세션당 1회·수 ms 규모라 **체감 영향 없음**으로 본다(`추정` — 실기기 측정 안 함).

### 5. 한계 · 남은 것

- **같은 JS 런타임 안에서만 유효하다.** 프로세스 간·기기 간 잠금이 아니다. 지금 구조(단일 앱, 로컬 전용)에서는 충분하지만 **클라우드 동기화를 붙이면 부족**하다.
- **여전히 전체 목록을 매번 통째로 읽고 쓴다.** 50건 상한이라 문제되지 않지만 상한을 크게 늘리면 재검토 필요.
- **P0-3(저장 데이터 형태 검증)은 그대로다.** 이번 수정은 「덮어쓰기 유실」만 다뤘고, 깨진 레코드를 읽어 화면이 넘어지는 문제는 남아 있다.
- 이번 테스트는 `sessionStore`만 덮는다. **계단식·세션 로직은 여전히 테스트 0개**(P1-1).
- `beforeEach`에서 목 저장소만 비우고 **큐(`tail`)는 리셋하지 않는다.** 큐는 항상 해소되는 구조라 테스트 간섭이 없었지만(8개 통과), 앞으로 실패를 던지는 테스트를 추가하면 `jest.resetModules()`가 필요할 수 있다(`주의`).

### 6. 확인 절차 (에뮬 — **아직 안 함**)

- [ ] ① · ② 각각 정상 종료 → 「기기에 기록했어요」가 그대로 뜨는가
- [ ] 종료 직후 바로 「연습 기록」 진입 → **방금 세션이 목록에 있는가**(새로고침 없이)
- [ ] 연속 2세션 → 기록 2건, 최신이 위인가
- [ ] 「새로고침」이 정상 동작하는가

### 7. 단정 금지

- 「동시 5건 중 4건 유실」은 **테스트 목(지연 있는 인메모리) 기준 측정**이다. 실제 기기의 AsyncStorage 타이밍에서 같은 비율로 유실된다는 뜻은 아니다.
- 앱에서 실제로 저장이 겹치는 빈도는 **측정하지 않았다**(`추정`). P0-1 수정으로 가장 흔한 경로는 사라졌다.
- 성능 영향 「체감 없음」은 **실기기 측정이 아닌 추정**이다.
- TypeScript 6.0에서 `@types` 자동 포함이 안 된 것은 **관찰 사실**이며 원인은 규명하지 않았다.
- 이 수정은 훈련 절차·자극 스펙·요약 계산을 **전혀 바꾸지 않았다.** 저장되는 요약은 여전히 **역치·점수·진단 결과가 아니다.**

---

## 리뷰 — P0-1 「중지」 미작동 · 기록 중복 저장

> **일자**: 2026-08-07 · 브랜치 `two_feat` · 수정 전 기준 `ec53d8f`
> **대상**: `src/training/FreqSessionScreen.tsx` · `src/training/AmSessionScreen.tsx` (①② **동시 수정**)
> **검증**: `npx tsc --noEmit` **통과**. **에뮬/실기기 재현·확인은 하지 않았음**(`미검증`) — §7 체크리스트로 확인 필요.
> **린트 미실행**: `eslint.config.*`가 없어 ESLint가 **실행 자체가 안 됨**(P1-3). 이 수정은 **타입 검사만 거쳤고 규칙 검사는 못 거쳤음.**

### 1. 무엇이 문제였나 (수정 전 동작 재구성)

앱에는 **중단 신호가 두 개**인데 한쪽만 사용되고 있었다.

| 신호 | 하는 일 | 누가 보나 |
|------|---------|-----------|
| `stopPureTone()` / `stopAmTone()` | **지금 울리는 소리만** 끈다. 대기 중 promise를 **resolve**(reject 아님) | 오디오 계층 |
| `abortRef.current` | **다음 구간도 틀지 마라**. `shouldAbort()`로 재생 루프·`runTrial`이 확인 | 훈련 화면 |

`goSummary()`는 **앞의 것만** 호출하고 **뒤의 것을 세우지 않았다.**

#### 수정 전 호출 흐름 (재생 중 「중지」)

```
사용자 「중지」
  └ onEndManual()
      └ goSummary(endSessionManual(session))
          ├ abortFreqAfcPlayback() → stopPureTone()
          │     └ pendingResolve() ── 대기 중인 playPureTone을 **정상 resolve**
          ├ setPhase('summary')          ← 요약 화면 표시
          └ appendFreqSessionSummary()   ← 기록 1건 저장 (①)

  ┈ 같은 틱의 마이크로태스크에서 계속 ┈

  playFreqAfcTrial 루프 재개
      └ shouldAbort() === **false**  ← abortRef를 아무도 안 세웠음
          └ 남은 구간 계속 재생  ← ⚠ 소리가 안 멈춤
  runTrial 복귀
      └ if (abortRef.current) → **false**
          └ setPhase('choose')   ← ⚠ 요약 화면이 선택 화면으로 되돌아감

  사용자가 선택지를 누름
      └ onChoose(): phase === 'choose' 통과  ← ⚠ 가드가 phase만 봄
          └ applySessionResult(완료된 세션) → 그대로 반환(status: 'completed')
              └ next.status === 'completed' → goSummary() **재호출**
                  └ appendFreqSessionSummary() ← ⚠ 기록 중복 저장 (②)
```

**증상 3종**: (a) 소리가 안 멈춤 (b) 요약이 선택 화면으로 되돌아감 (c) 같은 연습이 기록에 2건.

### 2. 수정 전후 코드

두 화면이 대칭이라 ② 기준. ①(`AmSessionScreen.tsx`)은 함수명만 다른 **동일 변경**이다.

#### 2-1. `goSummary` — 중단 플래그 + 저장 1회 보장

**수정 전**
```tsx
const goSummary = useCallback((next: FreqSessionState) => {
  abortFreqAfcPlayback();
  const nextSummary = summarizeSession(next);
  setSession(next);
  setSummary(nextSummary);
  setPhase('summary');
  setTrial(null);
  setSaveNote(null);
  void appendFreqSessionSummary(nextSummary)
    .then(() => { setSaveNote('기기에 기록했어요'); })
    .catch(() => { setSaveNote('기록 저장에 실패했어요'); });
}, []);
```

**수정 후**
```tsx
const goSummary = useCallback((next: FreqSessionState) => {
  // 진행 중인 시행이 있으면 재생 루프까지 멈춘다.
  // stopPureTone()은 대기 promise를 resolve만 하므로, 이 플래그가 없으면
  // 남은 구간이 계속 재생되고 runTrial이 phase를 'choose'로 되돌린다.
  abortRef.current = true;                    // ← ①  중단 신호 완성
  abortFreqAfcPlayback();
  const nextSummary = summarizeSession(next);
  setSession(next);
  setSummary(nextSummary);
  setPhase('summary');
  setTrial(null);

  if (savedRef.current) {                     // ← ②  저장 1회 보장
    return;
  }
  savedRef.current = true;
  setSaveNote(null);
  void appendFreqSessionSummary(nextSummary)
    .then(() => { setSaveNote('기기에 기록했어요'); })
    .catch(() => { setSaveNote('기록 저장에 실패했어요'); });
}, []);
```

> `savedRef.current`가 이미 `true`면 **`setSaveNote(null)` 앞에서 반환**한다. 앞선 저장의 안내 문구(「기기에 기록했어요」)를 지우지 않기 위해서다.

#### 2-2. 새 ref

```tsx
const abortRef = useRef(false);
/** 이번 세션 요약을 이미 저장했는지. 중복 저장 방지(세션 시작 시 리셋). */
const savedRef = useRef(false);               // ← 추가
```

#### 2-3. `onChoose` — 완료된 세션 재채점 차단

**수정 전**
```tsx
if (!trial || !session || phase !== 'choose') {
  return;
}
```

**수정 후**
```tsx
// 완료된 세션은 다시 채점하지 않는다(중지 직후 잔여 UI 방어).
if (!trial || !session || phase !== 'choose' || session.status !== 'active') {
  return;
}
```

#### 2-4. 리셋 지점 2곳

```tsx
const resetToIdle = useCallback(() => {
  abortRef.current = true;
  savedRef.current = false;                   // ← 추가
  abortFreqAfcPlayback();
  ...
```

```tsx
const onStart = useCallback(() => {
  const next = createFreqSession();
  savedRef.current = false;                   // ← 추가 (다시 연습 시 저장 재허용)
  setSession(next);
  ...
```

#### 2-5. 변경 규모

```
 src/training/AmSessionScreen.tsx   | 16 +++++++++++++++-
 src/training/FreqSessionScreen.tsx | 16 +++++++++++++++-
 2 files changed, 30 insertions(+), 2 deletions(-)
```

**오디오 계층(`pureTone.ts`·`amTone.ts`)·훈련 로직(`freqSession`·`amSession`·계단식)·저장 계층(`sessionStore.ts`)은 건드리지 않았다.**

### 3. 왜 이 방식을 골랐나 (대안 검토)

| 안 | 내용 | 판단 |
|----|------|------|
| **A (채택)** | `goSummary`에서 기존 `abortRef`를 세우고, 가드 2개 추가 | **표면적 최소**. 오디오·로직 계층 무변경. 이미 있는 중단 메커니즘을 **의도대로 쓰는 것**뿐 |
| B | `stopPureTone()`이 대기 promise를 **reject**하도록 변경 | 중단 의미는 더 명확해지나 **정상 종료 경로와 얽힘**. 오디오 계층 2개 파일을 동시에 바꿔야 하고, 당시 **단위 테스트가 0개**(P1-1)라 회귀를 잡을 수단이 없음 → **보류** |
| C | `AbortController` 도입 | 더 깔끔하지만 **두 화면에 또 복붙**하게 됨. P1-2(공통화)에서 `useTrainingSession` 훅으로 뽑을 때 함께 하는 게 맞음 → **보류** |

**결론**: 테스트 안전망(P1-1)이 깔리기 전에는 **가장 얇은 수정**이 옳다고 판단. B·C는 P1-2 리팩터링과 함께 재검토할 후보로 남긴다.

### 4. 수정 전후 평가 (시나리오별)

| # | 시나리오 | 수정 전 | 수정 후 |
|---|----------|---------|---------|
| 1 | **재생 중 「중지」** | 남은 구간 계속 재생 · 요약이 선택 화면으로 복귀 | 루프가 `ABORTED`로 즉시 종료 · 요약 화면 유지 |
| 2 | **중지 직후 선택지 탭** | 재채점 통과 → `goSummary` 재호출 → **중복 저장** | 선택 UI 자체가 안 뜸(1차) + `status !== 'active'` 가드(2차) + `savedRef`(3차) — **3중 방어** |
| 3 | **정상 종료(전환 4회)** | 정상 | **동일**(회귀 없음). `abortRef=true`가 추가로 서지만 진행 중 시행이 없어 무해 |
| 4 | **「끝내기」(피드백 단계)** | 정상 | **동일** |
| 5 | **「다시 연습」** | 정상 | `savedRef`·`abortRef`가 `onStart`/`runTrial`에서 리셋 → 새 세션 저장 정상 |
| 6 | **화면 언마운트** | 정상 | **동일**(기존 cleanup 유지) |
| 7 | **저장 실패 시** | 「기록 저장에 실패했어요」 | **동일**. 단 `savedRef`는 이미 `true` → **자동 재시도는 없음**(§6 참조) |

#### 코드 품질 평가

| 축 | 수정 전 | 수정 후 |
|----|---------|---------|
| 중단 신호 일관성 | `onBack`은 `abortRef`를 세우고 `goSummary`는 안 세움 — **경로마다 제각각** | **모든 이탈 경로가 `abortRef`를 세움**으로 통일 |
| `onChoose` 가드 | `phase`만 확인(화면 상태) | `phase` + **세션 상태(진실의 원천)** 동시 확인 |
| 저장 호출 | 호출될 때마다 무조건 append | **세션당 1회** 보장 |
| 코드 중복 | ①② 동일 결함 존재 | ①② 동일 수정 — **중복 자체는 그대로**(P1-2에서 해결) |

### 5. 왜 이 수정이 옳다고 보는가 (근거)

1. **경합 없음(추정)** — 「중지」로 `stopPureTone()`이 대기 promise를 resolve하면, 재생 루프는 **같은 틱의 마이크로태스크**에서 재개되어 `shouldAbort()`를 확인한다. 사용자 입력이 그 사이에 끼어들 수 없으므로, 「중지」 후 사용자가 무엇을 누르기 전에 루프는 이미 `ABORTED`로 정리된다.
2. **재생 루프의 중단 지점이 충분함** — `playFreqAfcTrial`은 **구간 재생 직전과 직후 모두** `shouldAbort()`를 확인하고(`freqAfcTrial.ts:144-165`), ISI `sleep()`도 50 ms 간격으로 확인한다. 즉 플래그만 세워지면 **어느 시점에 눌러도** 잡힌다.
3. **정상 경로 무영향** — `runTrial()`은 매 시행 시작 시 `abortRef.current = false`로 초기화하므로 「다시 연습」·「다음」 경로가 막히지 않는다.
4. **방어가 3중** — 화면(선택 UI 미표시) → 가드(`status !== 'active'`) → 저장(`savedRef`). 앞의 두 겹이 뚫려도 기록은 오염되지 않는다.

### 6. 남은 위험 · 이번에 안 고친 것

- **P0-2(저장 경쟁)는 이 수정만으로는 미해결.** `savedRef`는 **컴포넌트 인스턴스 단위**라 화면을 오갈 때의 경합은 남았다 → **별도 수정 완료**(위 P0-2 리뷰).
- **저장 실패 시 재시도 없음.** `savedRef`를 먼저 세우므로 실패해도 자동 재시도하지 않는다. 수정 전에도 재시도는 없었으니 **회귀는 아니지만** 「다시 시도」 버튼은 후속 후보.
- **소리의 꼬리 10~15 ms는 남는다.** `stopPureTone()`이 클릭음 방지를 위해 짧게 페이드아웃한 뒤 정지하기 때문이며 **의도된 동작**.
- **중단된 시행은 요약 시행 수에 포함되지 않는다.** 「연습 3」을 보다가 중지하면 요약에는 `2`로 나올 수 있다. 채점 안 된 시행을 세지 않는 것이라 논리적으로는 맞지만 어색할 수 있다 — 이번 수정과 무관한 **기존 동작**이며 표기 개선은 후속 후보(백로그 미등록).
- **P1-2(①② 중복)는 그대로.** 이번에도 **같은 수정을 두 파일에 손으로 복사**했다. 이 결함이 애초에 양쪽에 동시 존재했던 것과 같은 이유다.

#### 부수 관찰 (IDE 경고)

수정 중 `AmSessionScreen.tsx`에 대해 IDE(sonarqube) **인지 복잡도 20 > 15** 경고가 표시되었다. 이 경고는 **ref 한 줄만 추가한 첫 편집 직후에 이미 20으로 나타났으므로 수정 이전부터 존재했던 것으로 추정**한다(파일 재분석 시점에 표면화). 어느 쪽이든 **P1-2(화면 로직을 훅으로 분리)의 근거**가 하나 더 늘었다. `추정` — 수정 전 기준으로 다시 측정해 보지는 않았다.

### 7. 확인 절차 (에뮬 — **아직 안 함**)

①(떨림 찾기)·②(다른 음 찾기) **각각** 수행:

- [ ] 연습 시작 → **소리 나는 도중** 「중지」 → **소리가 바로 멎는가**(짧은 페이드 제외)
- [ ] 같은 상황에서 **요약 화면이 유지되는가** (선택 버튼 1·2·3이 다시 나타나지 않아야 함)
- [ ] 그 상태에서 화면을 눌러봐도 채점이 일어나지 않는가
- [ ] 「연습 목록」 → 「연습 기록」 → 방금 세션이 **1건만** 있는가
- [ ] 정상 종료(전환 4회)까지 진행 → 요약 + 「기기에 기록했어요」 → 기록 **1건 추가**
- [ ] 「다시 연습」 → 한 세션 더 종료 → 기록이 **또 1건** 늘어나는가 (저장이 막히지 않았는지)
- [ ] 피드백 단계에서 「다음」 반복 → 정상 진행되는가

### 8. 단정 금지

- 이 수정은 **정적 분석(코드 정독) + 타입 검사까지만** 확인했다. **에뮬·실기기 재현은 하지 않았다.** §7을 통과하기 전에는 「고쳤다」가 아니라 **「고친 것으로 보인다」**이다.
- §5의 「마이크로태스크 내에서 정리된다」는 JS 실행 모델에 근거한 **추론**이며 실측(로그)으로 확인하지 않았다.
- 「소리가 즉시 멎는다」의 **체감**은 기기 오디오 버퍼에 따라 다를 수 있다(`추정`).
- 인지 복잡도 경고가 이번 수정 **이전부터 있었다**는 것은 편집 순서에 근거한 **추정**이다.
- 이 수정은 훈련 절차·자극 스펙·요약 수치 계산을 **전혀 바꾸지 않았다.** 요약은 여전히 **역치·점수·진단 결과가 아니다.**
