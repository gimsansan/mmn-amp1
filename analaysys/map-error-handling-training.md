# 에러 처리 지도 — `src/app/**` + `src/training/**` + `src/audio/**`

> **축**: 에러 처리(4번 축). 질문 요령은 [`ask-error-handling.md`](./ask-error-handling.md).
> **자매 지도**: 화면 [`map-screen-flow-training.md`](./map-screen-flow-training.md) · 데이터 [`map-data-flow-training.md`](./map-data-flow-training.md) · 상태 [`map-state-management-training.md`](./map-state-management-training.md).
> **표기**: `! !` 실패 지점. 화면 `[ ]`, 데이터 `{ }`, 상태 `( )@소유자`.
> **작성**: 2026-08-21, 브랜치 `feat_wrs_voice_guide`. 코드가 바뀌면 이 문서는 낡는다.

## 0. 대상 목록과 읽음 상태

고정 목록 **82개**(`src/app` 5 + `src/audio` 3 + `src/training` 74). 읽음 82 / **안 읽음 0**.

세어 본 것: `try/catch`·`.catch()` **43곳**, `throw` **48곳**, 알림창 **4곳**, `ErrorBoundary` **0곳**.

---

## 1. 한 줄 요약 — 「막음」이 두껍고, 「복구」가 거의 없다

이 앱의 실패 처리에는 뚜렷한 성격이 있다.

- **막음이 두껍다.** 오디오·시행 생성 함수가 인자를 전부 `RangeError`로 막고, 저장소는 저장 전에 문항 수를 검사하고, 읽을 때는 형태가 어긋난 레코드를 버린다.
- **잡는 자리는 화면 한 층뿐이다.** 에러 경계가 없어서, 화면이 안 잡으면 **앱까지 올라간다**.
- **보임은 문구 한 줄이 표준이다.** 화면 하단의 `(lastError)` 또는 요약의 `(saveNote)`. 알림창은 삭제·종료 확인에만 쓴다.
- **복구가 거의 없다.** 재시도 버튼이 있는 곳은 `[음성 안내]`의 「다시 확인」 **하나뿐**이다. 나머지는 「다시 시작해 주세요」라고 적고 사용자가 직접 누르게 한다. 되돌림(rollback)은 아예 없다.

---

## 2. 실패 종류별 경로

### 소리를 못 냈다 (가장 흔한 실패)

```
{expo-speech} !onError! --잡음(playCurrent catch)--> (lastError)@화면 --보임--> [고르기 아래 문구]
{react-native-audio-api} !재생 실패! --잡음(playCurrent catch)--> (lastError)@링 6
{순음 재생} !실패! --잡음(runTrial catch)--> (lastError) + phase = idle, session = null
```

세 갈래가 **서로 다르게** 끝난다.

| 화면 | 실패 후 phase | 사용자에게 보이는 것 | 진행 중이던 세션 |
| --- | --- | --- | --- |
| 한 글자 · 두 글자 · 빙고 | `choose` | 「단어를 읽지 못했어요. 보기를 고르거나 다시 시작해 주세요.」 | **살아 있다** |
| 링 6 | `choose` | 「소리를 재생하지 못했어요. 다시 시작해 주세요.」 | **살아 있다** |
| 떨림 · 다른 음 찾기 | `idle` | 예외 메시지 원문(`e.message`) | **버린다**(`setSession(null)`) |
| 높낮이 비교 | `idle` | 예외 메시지 원문 | **버린다**(`managerRef.current = null`) |

- 앞 두 줄은 **소리 없이 계속 진행된다.** 무음 상태로 찍는 셈이라, 그걸 막으려고 이 브랜치가 `[음성 안내]`를 넣었다(§3).
- 뒤 두 줄은 **기술 메시지를 그대로 보여 준다**(`e instanceof Error ? e.message : String(e)`).
  나머지 화면이 전부 한국어 안내 문구인 것과 어긋나는 유일한 자리다. 여기 뜨는 건 대개 `pureTone`/`amTone`의 `RangeError` 원문이다.

`ABORTED`만은 실패로 세지 않는다 — 중단 경로가 던지는 약속된 신호라 `catch`에서 걸러 조용히 빠져나간다.

```js
if (e instanceof Error && e.message === "ABORTED") { return; }
```

### 기기에 한국어 음성이 없다 (이 브랜치의 주제)

```
[단어 듣기 고르기] --카드--> {getAvailableVoicesAsync} !한국어 0개! --막음--> [음성 안내]
[음성 안내] --다시 확인--> {재조회} --있음--> (원래 연습)
                          └--없음--> [음성 안내] 그대로
```

- **예방(막음)에 해당한다.** 실패한 뒤 알리는 게 아니라 **시작 자체를 차단**한다.
  이유가 코드에 적혀 있다 — 무음으로 지나가면 사용자는 이유를 모르고, 소리로 고르는 연습이 찍기가 된다.
- `hasKoreanVoice()`는 **절대 reject하지 않는다.** 실패·불명은 전부 `true`(통과)로 접는다.
  「멀쩡한 기기의 연습을 막는 쪽이 더 나쁘다」는 판단이고, 그 대가로 **한국어 없는 기기를 놓칠 수 있다**.
  놓쳐도 세션 안의 「단어를 읽지 못했어요」가 뜬다 — 두 겹 방어다.
- 빈 목록은 실패로 보지 않고 **0 · 250 · 500 ms 세 번 다시 묻는다**. 앱 시작 직후 TTS 엔진이 안 깬 경우를 위한 것.
- **결과를 캐시하지 않는다.** 설정에서 음성을 깔고 돌아와 「다시 확인」이 통해야 하기 때문. 테스트가 이 성질을 고정한다.

### 저장이 안 됐다

```
{요약} --append--> !저장 실패! --잡음--> (saveNote) = "기록에 남기지 못했어요" --보임--> [요약 알약]
{요약} --문항 수 미달--> --막음(저장 호출 안 함)--> (saveNote) = "25개를 다 고르지 않아 기록에는 안 남겼어요"
```

- **되돌림이 없다.** 요약 화면은 그대로 보이고 숫자도 그대로다. 저장만 안 된다.
- 문구가 화면마다 미묘하게 다르다: 한 글자·두 글자·링 6은 「기록에 남기지 못했어요」,
  떨림·다른 음·높낮이는 「기록 저장에 실패했어요」. 같은 사건에 두 문장이 있다.
- **재시도 경로가 없다.** `savedRef.current = true`가 저장을 **시도하기 전에** 세워지므로,
  실패해도 그 세션에서는 다시 안 쓴다. 「다시 연습」으로 새 세션을 시작해야 `savedRef`가 풀린다.

### 두 글자 — 시작이 막히는 유일한 자리

```
[두 글자 idle] --연습 시작--> {twoCharSessions.v1 읽기} !실패! --잡음--> (lastError) = "연습을 시작하지 못했어요."
```

저장소 읽기가 **시작 트리거 안에** 있어서(다음 장을 고르려고), 읽기가 실패하면 세션 자체가 안 열린다.
다른 여섯 연습은 저장소 없이도 시작된다.

### 통계를 못 읽었다 / 못 지웠다

```
{4개 저장소} !읽기 실패! --각각 .catch(() => [])--> {빈 목록} --보임--> [아직 … 기록이 없어요]
{clearStatsKind} !실패! --잡음--> [알림: "기록을 지우지 못했어요."]
```

**여기가 이 앱에서 가장 조용한 실패다.** `loadStatsFeed`는 네 읽기를 각각 `.catch(() => [])`로 접기 때문에,
한 저장소가 깨져도 **그 종목만 「기록 없음」으로 보인다.** 사용자는 기록이 사라진 것과 못 읽은 것을 구분할 수 없다.

의도된 선택이다(하나가 깨져도 나머지는 보여 준다). 대신 `StatsScreen`의 `.catch(→ "기록을 불러오지 못했어요")`는
**사실상 도달하지 않는다** — `loadStatsFeed`가 reject할 경로가 남아 있지 않기 때문.

---

## 3. 「막음」 — 세 층으로 두껍다

### 층 1: 오디오·시행 생성 함수의 인자 검증 (`RangeError` 40여 곳)

`playPureTone` · `playAmTone` · `createFreqAfcTrial` · `createAmAfcTrial` · `createFreqStaircase` ·
`createAmStaircase` · `createFreqSession` · `createAmSession` · `depthDbFromM` · `mFromDepthDb` · `rmsEqualizeScale`.

전부 「유한수인가 / 범위 안인가 / 정수인가」를 확인하고 던진다. **막는 쪽이지 잡는 쪽이 아니다** —
던진 뒤에는 화면의 `runTrial catch`까지 올라가고, 거기서 세션이 버려진다(§2 표).

### 층 2: 저장 직전 문항 수 검사 (`throw`)

```
appendWrsSummary       — trialCount !== 25면 throw
appendTwoCharSummary   — trialCount !== 12면 throw
upsertLing6DailyRecord — 6음소가 다 안 차면 throw
```

**화면은 이 throw에 기대지 않는다.** 부르기 전에 자기가 먼저 검사하고 문구를 띄운다.
그래서 이 `throw`는 실제로는 **다른 호출부를 막는 안전망**이고, 그 성질을 저장소 테스트가 고정한다.

### 층 3: 읽기 시점의 형태 검증

네 저장소 모두 `JSON.parse` 실패 · 배열 아님 · 레코드 형태 어긋남을 **조용히 버린다**.
`sessionStore`가 가장 촘촘하다(트랙별 요약 필드까지 확인). 주석의 근거: 저장소 내용은 앱이 썼더라도 **믿을 수 없는 입력**이다.

버린 레코드는 사용자에게 알리지 않고, **다음 쓰기 때 저장소에서도 사라진다.** 되돌릴 수 없다.

### 층 4(작음): 화면 안의 조기 return 가드

```js
if (phase !== "choose") return;          // 잘못된 단계의 입력
if (!trial) return;                      // 시행이 없는데 채점 시도
if (markedRef.current[index]) return;    // 이미 칠한 칸
if (!trial || !session || session.status !== "active") return;   // 완료된 세션 재채점 방어
```

「중지 직후 잔여 UI 방어」라는 주석이 붙어 있다. 알림창을 띄우는 동안에도 화면이 살아 있어서 필요한 가드다.

---

## 4. 「삼킨 에러」 — 16곳, 전부 오디오 정리 코드

빈 `catch`가 16곳 있다. **모두 `audio/pureTone` · `audio/amTone` · `ling6/ling6Synth`의 정리 경로**다.

```js
try { osc.disconnect(); } catch { /* already disconnected */ }
```

이미 멈춘 노드를 다시 멈추려다 나는 예외라 삼키는 게 맞다. 주석으로 이유가 다 적혀 있다.
**이 축에서 「고쳐야 할 삼킨 에러」로 볼 자리는 아니다.** 다만 진짜 오디오 장치 오류도 같이 삼켜지므로,
「소리가 안 나는데 아무 문구도 없다」가 나오면 이 16곳이 후보다.

그 밖의 삼킴은 두 곳뿐이다.

```
hasKoreanVoice의 catch → true 반환      (의도적. 연습을 막지 않으려고)
refreshHistory의 catch → setHistory([])  (링 6 idle의 미리보기 격자가 조용히 나타났다 사라진다)
```

---

## 5. 잡히지 않는 경로 — 확인된 것 세 가지

### 5-1. 에러 경계가 없다

`ErrorBoundary`도 `componentDidCatch`도 앱 전체에 없다. **렌더 중 예외가 나면 앱이 그대로 넘어진다.**
후보가 실제로 있다:

```
WrsSessionScreen.onStart  → createWrsTrials()      → buildChoices()  !throw "wrs needs 3 distractors"!
WrsBingoScreen.onStart    → createBingoBoard()                        !throw "bingo needs 9 unique words"!
```

둘 다 **`try/catch` 없이 이벤트 핸들러 안에서 동기 호출**된다. 실제로는 200단어 풀에서 빈칸을 채우므로
던질 일이 거의 없지만, 던지면 잡는 사람이 없다.

같은 자리의 두 글자는 다르다 — `listTwoCharRecords().then(…createTwoCharTrials…)` 안에 있어
`createTwoCharTrials`의 세 가지 `throw`가 `.catch`에 걸린다. **세 화면 중 하나만 감싸져 있다.**

### 5-2. 링 6은 중단 플래그를 세우지 않고 요약으로 간다

`Am`·`Freq`·`Pitch`의 종료 함수는 첫 줄이 `abortRef.current = true`이고, 코드에 이유까지 적혀 있다 —
「`stopPureTone()`은 대기 promise를 resolve만 하므로, 이 플래그가 없으면 남은 구간이 계속 재생되고
`runTrial`이 phase를 'choose'로 되돌린다」.

`Ling6SessionScreen.finishSession`에는 그 줄이 없다.

```js
const finishSession = useCallback(async () => {
  stopLing6Playback();     // ← 대기 promise를 resolve한다
  setPhase("summary");
  …
```

`[듣는 중]`에서 「중지」를 누르면 이렇게 이어진다.

```
중지 → finishSession → stopLing6Playback() → pendingResolve() 호출
     → playCurrent의 `await playLing6Target()`이 resolve
     → `if (abortRef.current) return`  ← abortRef는 playCurrent가 false로 둔 그대로
     → setPhase("choose")             ← 방금 세운 summary가 덮인다
```

`[고르기]`에서 누를 때는 이미 재생이 끝나 대기 promise가 없으므로 영향이 없다.
**코드 기준 추정이며 실기기에서 재현해 보지는 않았다.** `WrsSessionScreen`·`WrsTwoCharScreen`·`WrsBingoScreen`은
같은 자리에서 플래그를 세우므로 같은 문제가 없다.

### 5-3. `.then` 안에서 난 예외를 받는 `.catch`가 없는 곳

```js
void hasKoreanVoice().then((ok) => { … }).finally(() => setChecking(false));
```

`hasKoreanVoice`가 reject하지 않으므로 지금은 안전하지만, `.then` 콜백 자체가 던지면 받는 곳이 없다.
`AmSessionScreen`·`FreqSessionScreen`의 `appendXSessionSummary(...).then(...).catch(...)`는 `.catch`가 있다.

---

## 6. 알림창 4곳 — 실패 표시가 아니라 확인·완료용

| 위치 | 언제 | 내용 |
| --- | --- | --- |
| `confirmEndSession` | 「끝내기」·「중지」·진행 중 뒤로 가기 | 「여기서 끝낼까요?」 취소/끝내기 |
| `StatsScreen.confirmClear` | 「기록 지우기」 | 「되돌릴 수 없어요」 취소/삭제 |
| `StatsScreen.doClear` 성공 | 삭제 완료 | 「… 기록을 지웠어요.」 |
| `StatsScreen.doClear` 실패 | 삭제 실패 | 「기록을 지우지 못했어요.」 |

**실패를 알림창으로 알리는 유일한 자리가 마지막 줄이다.** 나머지 실패는 전부 화면 안 문구다.
오탭 방지(`confirmEndSession`)는 실패 처리가 아니라 **예방**에 가깝다 — 실수로 연습을 날리는 것을 막는다.

---

## 7. 파일별 종류

**1. 막음(예방)** (18) —
`audio/{pureTone,amTone}`, `am/{amAfcTrial,amStaircase,amSession}`, `freq/{freqAfcTrial,freqStaircase,freqSession}`,
`wrs/{wrsStore,twoCharStore,twoCharSession,wrsBingo,wrsDistractors}`, `ling6/ling6Store`, `sessionStore`,
`wrs/wrsTts`(`hasKoreanVoice`), `wrs/WrsVoiceGuideScreen`, `confirmEndSession`,
`pitch2afc/trainingFlow`(`canSubmitAnswer` 등 규칙으로 막음)

**2. 잡음(포착)** (13) —
7개 세션 화면, `StatsScreen`, `ListeningCheckScreen`, `WrsTabScreen`,
`statsFeed`(`loadStatsFeed`의 4중 `.catch`), 그리고 정리 경로를 삼키는 `ling6/ling6Synth`·`audio/*`

**3. 보임(표시)** (9) — 위 화면들의 `(lastError)`·`(saveNote)` 렌더 분기.
전용 에러 화면은 `wrs/WrsVoiceGuideScreen` 하나뿐이다. Fallback 컴포넌트·에러 UI 컴포넌트는 없다.

**4. 복구(되돌림)** (1) — `wrs/WrsVoiceGuideScreen`의 「다시 확인」 → `WrsTabScreen.retryVoice`.
그 밖의 복구는 「다시 연습」·「처음으로」 버튼으로 **사용자가 직접 새로 시작**하는 것뿐이다.

**실패 경로 없음** (41) — 순수 계산·정적 데이터·표시 전용 컴포넌트·라우트 5개.

**테스트 23개** — 실패 경로를 **검증하는** 쪽이다. §8 참고.

---

## 8. 실패 경로를 지키는 테스트

지금 회귀로 고정돼 있는 실패 동작:

```
{음성 목록 조회} !실패! → ✓ true (연습을 막지 않는다)        wrsTts.test.ts
{음성 목록} = 빈 배열 → ✓ 다시 물어보고 그 결과를 쓴다        wrsTts.test.ts
{저장 값} !JSON 깨짐! → ✓ 빈 목록                            sessionStore.test.ts
{저장 값} !배열 아님! → ✓ 빈 목록                            sessionStore.test.ts
{레코드} !형태 어긋남! → ✓ 그 1건만 버리고 나머지는 읽는다     sessionStore.test.ts
{mode} !모르는 값! → ✓ 레코드를 버린다                       sessionStore.test.ts
25개 미만 저장 → ✓ throw + 목록 그대로                        wrsStore.test.ts
12개 미만 저장 → ✓ throw + 목록 그대로                        twoCharStore.test.ts
total = 0 진행바 → ✓ 0으로 나누지 않고 0%                    SessionProgressBar.test.tsx
확인 중 버튼 재탭 → ✓ 콜백이 안 불린다                        WrsVoiceGuideScreen.test.tsx
```

**지켜지지 않는 것**: §5의 세 경로(에러 경계 부재 · 링 6 중단 · `.then` 예외)에는 테스트가 없다.
화면의 `catch` → `(lastError)` 표시 경로도 테스트가 없다 —
`WrsSessionScreen.test.tsx`는 `speakWrsWord`를 **성공하는 목**으로 바꿔 두고 있어 실패 갈래를 안 지난다.
