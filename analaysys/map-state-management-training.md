# 상태 관리 지도 — `src/app/**` + `src/training/**` + `src/audio/**`

> **축**: 상태 관리(3번 축). 질문 요령은 [`ask-state-management.md`](./ask-state-management.md).
> **자매 지도**: 화면 [`map-screen-flow-training.md`](./map-screen-flow-training.md) · 데이터 [`map-data-flow-training.md`](./map-data-flow-training.md).
> **표기**: `(상태)@소유자`. 화면 `[ ]`, 데이터 `{ }`.
> **작성**: 2026-08-21, 브랜치 `feat_wrs_voice_guide`. 코드가 바뀌면 이 문서는 낡는다.

## 0. 대상 목록과 읽음 상태

고정 목록 **82개**(`src/app` 5 + `src/audio` 3 + `src/training` 74). 읽음 82 / **안 읽음 0**.
목록 밖에서 `src/hooks/use-theme.ts` 하나를 확인했다 — 전역 상태처럼 보이지만 아니어서(§3) 확인이 필요했다.

상태를 **가진** 파일은 15개뿐이다(`useState`/`useRef`/모듈 전역). 나머지 67개는 순수 계산·정적 데이터·테스트다.

---

## 1. 한 줄 요약 — 전역 상태가 없다

**전역 상태 라이브러리가 없다.** Zustand·Redux·Jotai 없음. 앱이 만든 **React Context도 없다**.
`_layout.tsx`의 `ThemeProvider`는 expo-router 것이고 `DefaultTheme` 고정값을 넣을 뿐이다.
`useTheme()`은 훅 모양이지만 상태가 아니라 **상수 객체를 그대로 돌려주는 함수**다(`Colors.light` 고정).

그래서 상태 지도는 세 층뿐이다.

```
(모듈 전역)@오디오·저장소 모듈     — React 밖. 재생 핸들·쓰기 큐.
(끌어올린 상태)@탭 컴포넌트        — 화면 스와프를 넘어 유지해야 하는 것만.
(지역 상태)@세션 화면              — 나머지 전부. 컴포넌트가 사라지면 같이 사라진다.
```

기록은 상태가 아니라 **AsyncStorage**에 있다(데이터 축). 화면은 그것을 **복사해 지역 상태로 들고 그린다**(§4).

---

## 2. 지역 상태 — 세션 화면의 표준 묶음

일곱 세션 화면이 거의 같은 상태 묶음을 각자 들고 있다. 공유하지 않는다.

```
(phase)@세션화면            idle | playing | choose | feedback | summary   ← 화면을 결정하는 유일한 상태
(trialIndex)@세션화면       몇 번째 문항
(lastCorrect)@세션화면      방금 맞았나 (undefined = 아직)
(lastTarget)@세션화면       방금 정답 (feedback에서 칸 강조용)
(summary)@세션화면          끝난 뒤 결과 객체
(saveNote)@세션화면         「기기에 기록했어요」 같은 저장 결과 문구
(lastError)@세션화면        「단어를 읽지 못했어요」 같은 실패 문구
(showStats)@세션화면        통계 화면 스와프 여부
```

- **`phase`가 이 앱의 중심 상태다.** 화면·버튼·선택지 잠금이 전부 여기서 갈린다.
- 트리거는 전부 사용자 동작 또는 재생 완료다: `연습 시작 → playing`, `재생 resolve → choose`,
  `보기 누름 → feedback`, `다음(마지막) → summary`.
- 이 값들은 **밖에서 필요해질 여지가 없다**. 세션이 끝나면 요약 하나만 저장소로 빠져나가고 나머지는 버려진다.
  지역 상태로 맞다.

### 화면별 추가분

| 화면 | 더 있는 지역 상태 |
| --- | --- |
| `Ling6SessionScreen` | `(passCount)` `(progressLine)` `(highFreqLine)` `(history)` |
| `WrsBingoScreen` | `(board)` `(marked)` `(line)` `(lastMarked)` `(cueUsed)` `(lastDifficulty)` |
| `Am` · `Freq` | `(session)` `(trial)` `(result)` `(mode)` |
| `PitchCompareScreen` | `(trialNumber)` `(reversalCount)` `(correct)` `(mode)` |
| `StatsScreen` | `(kind)` `(feed)` `(loading)` `(error)` `(clearing)` |
| `ListeningCheckScreen` | `(playing)` `(error)` |
| `TrendChart` · 두 ProgressPanel | `(width)` — `onLayout`으로 잰 폭. SVG를 그리기 전 0이면 안 그린다. |

---

## 3. 끌어올린 상태 — 탭 컴포넌트가 들고, props로 한 단계만 내린다

화면을 스와프하면 자식이 **언마운트된다**. 그때 사라지면 안 되는 값만 부모로 올라가 있다.

```
(track)@WrsTabScreen        --props--> 어느 연습을 그릴지
(autoStart)@WrsTabScreen    --props--> [한 글자]·[두 글자]에 「바로 시작해」
(pendingTrack)@WrsTabScreen           원래 누른 카드 기억 ([음성 안내]의 「다시 확인」이 쓴다)
(checking)@WrsTabScreen     --props--> 카드 잠금 + [음성 안내] 버튼 잠금

(track)@PtaSessionScreen              picker | pitch2 | freq
(checked)@PtaSessionScreen            듣기 준비를 통과했나
(autoStart)@PtaSessionScreen --props-->
(mode)@PtaSessionScreen     --props--> 귀풀기/연습. [듣기 준비]와 세션 양쪽이 쓴다
(showStats)@PtaSessionScreen

(showStats)@AmTabScreen
(showCheck)@AmTabScreen
(checked)@AmTabScreen                 첫 시작 전 게이트 통과 여부
(autoStart)@AmTabScreen     --props-->
(mode)@AmTabScreen          --props--> [듣기 준비]로 스와프해도 선택이 살아 있게
```

- **깊이는 최대 1단계다.** prop drilling이 없다. 전역으로 올릴 근거도 없다.
- 되돌리는 방식이 콜백이다: `onModeChange` · `onAutoStartConsumed` · `onBack` · `onRetry`.
  자식이 setter를 직접 받지 않는다.
- `autoStart`는 **소모형 상태**다. 자식이 `onAutoStartConsumed()`로 부모에게 껐다고 알린다.
  자식 쪽에도 `autoStartOnceRef`가 있어 **두 겹으로** 재시작을 막는다.

### `checked`가 탭마다 다르게 산다

```
(checked)@PtaSessionScreen — backToPicker에서 false로 되돌림 → 목록에 나갔다 오면 [듣기 준비]를 또 본다
(checked)@AmTabScreen      — 되돌리는 경로 없음 → 탭이 살아 있는 동안 한 번만 본다
```

같은 이름·같은 목적인데 수명이 다르다. 「왜 떨림은 듣기 준비가 한 번뿐이냐」의 답이 여기다.

---

## 4. 원본은 ref, 화면은 state — 이 코드의 핵심 관용구

세션 진행 중 값의 **원본은 `useState`가 아니라 `useRef`다.** 비동기 콜백(재생 `await` 뒤)에서
최신 값을 읽어야 하는데, state는 클로저에 갇힌 옛 값을 준다.

```
outcomesRef.current  --복사--> (outcomeCount)@화면   → 진행 막대
trialsRef.current    --복사--> (trials)@화면          → 보기 4칸
markedRef.current    --복사--> (marked)@빙고          → 칠해진 칸
boardRef.current     --복사--> (board)@빙고
cueCountRef.current  --복사--> (cueUsed)@빙고         → 「기회 N번 남음」
managerRef.current   --복사--> (trialNumber)·(reversalCount)@높낮이 비교
```

**규칙**: 계산·판정은 ref에서, 그리기는 state에서. 갱신할 때 **둘 다** 바꾼다.

```js
outcomesRef.current = [...outcomesRef.current, { ... }];
setOutcomeCount(outcomesRef.current.length);   // 이 줄이 빠지면 화면이 안 따라온다
```

세 화면(`WrsSessionScreen`·`WrsTwoCharScreen`·`Ling6SessionScreen`)에 **같은 주석이 붙어 있다** —
「ref는 바꿔도 다시 그리지 않아서 옆에 있는 `setPhase` 덕에 우연히 맞게 보일 뿐이다」.
실제로 깨졌던 자리라 `WrsSessionScreen.test.tsx`에 회귀 테스트가 있다(「답을 고르면 진행 막대가 늘어난다」).

### 화면을 그리지 않는 순수 플래그 ref

| ref | 하는 일 | 있는 곳 |
| --- | --- | --- |
| `abortRef` | 중단 신호. `await` 뒤에 `if (abortRef.current) return` | 7개 세션 화면 + `ListeningCheckScreen` |
| `savedRef` | 이번 세션을 이미 저장했나(중복 저장 차단) | 6개 세션 화면 |
| `autoStartOnceRef` | 자동 시작을 한 번만 | `Wrs` · `TwoChar` · `Am` · `Freq` · `Pitch` |
| `runModeRef` | **이번 세션의** 모드를 시작 시점에 못 박음 | `Am` · `Freq` · `Pitch` |
| `managerRef` | `SessionManager` 인스턴스(메모리 원본) | `Pitch` |
| `cueRef` | 지금 들려준 단어 | `Bingo` |

이 여섯은 화면에 안 그려지므로 state일 이유가 없다. ref가 맞다.

---

## 5. 파생 상태 — 전부 렌더 중 계산한다 (저장하지 않는다)

**`useMemo`가 이 82개 파일에 한 번도 없다.** `React.memo`도 없다. 파생값은 매 렌더 그냥 계산한다.

```
(phase) --파생--> running = playing | choose | feedback
(phase) --파생--> choiceDisabled = phase !== "choose"
(trials, trialIndex) --파생--> currentTrial = trials[trialIndex]
(marked) --파생--> markedCount = marked.filter(Boolean).length
(session, phase) --파생--> trialNumber = stair.trialCount (+1 if playing|choose)
(mode 또는 session) --파생--> targetReversals
(feed, kind) --파생--> hasRecords = countOfKind(feed, kind) > 0
(records) --파생--> showTrend = canShowWrsTrend(records)
```

「원본 하나 + 계산」 원칙을 잘 지킨 편이다. **`useEffect`로 파생값을 동기화하는 자리가 없다.**

다만 `targetReversals`의 원본이 화면마다 다르다.

```
(mode)@Am   --파생--> session?.targetReversals ?? targetReversalsFor(mode)     ← 세션이 있으면 세션 값
(mode)@Freq --파생--> session?.targetReversals ?? targetReversalsFor(mode)     ← 같음
(mode)@Pitch --파생--> targetReversalsFor(mode)                                ← 항상 state에서
```

`Pitch`에만 「ref를 렌더에서 읽으면 바뀌어도 다시 그리지 않아 값이 밀린다」는 주석이 붙어 있다.
결과는 같지만 근거가 다른 세 줄이라, 셋 중 하나를 고치면 나머지를 같이 봐야 한다.

---

## 6. 모듈 전역 상태 — React 밖에 있는 것들

React가 모르는 가변 상태가 네 모듈에 있다. 컴포넌트가 사라져도 남는다.

```
(sharedContext, activeOscillator, activeGain, pendingResolve)@audio/pureTone.ts
(sharedContext, activeCarrier, activeModulator, activeNodes, pendingResolve)@audio/amTone.ts
(sharedContext, playGen, silenceTimer, activeOscillators, activeGains,
 activeFilter, activeBufferSource, pendingResolve)@ling6/ling6Synth.ts
(tail)@sessionStore · wrsStore · twoCharStore · ling6Store            — 쓰기 직렬화 큐
```

- **저장소가 아니라 「진행 중인 것의 손잡이」다.** 중단(`stopPureTone` 등)이 이걸 잡고 끊는다.
- 이 상태는 **앱 전체에 하나뿐이다.** 두 화면이 동시에 소리를 내면 나중 것이 앞 것을 끊는다
  (`playPureTone`이 시작 전에 `stopPureTone()`을 부른다). 지금은 한 번에 한 화면만 살아 있어 문제가 안 된다.
- `ling6Synth`만 `playGen` 세대 카운터를 둔다 — 무음 대기(`setTimeout`)까지 끊어야 해서 플래그 하나로는 부족했다.
- 네 저장소의 `tail`은 같은 코드가 네 번 복사돼 있고, **키마다 큐가 따로**다. 서로 막지 않는다.

---

## 7. 파일별 종류

**1. 지역 상태** (15) —
`ling6/Ling6SessionScreen`, `pitch2afc/PitchCompareScreen`, `freq/FreqSessionScreen`, `am/AmSessionScreen`,
`wrs/{WrsSessionScreen,WrsTwoCharScreen,WrsBingoScreen}`, `StatsScreen`, `ListeningCheckScreen`,
`TrendChart`(width), `ling6/Ling6ProgressPanel`(width), `wrs/WrsProgressPanel`(width),
그리고 §3의 탭 3개(`WrsTabScreen`·`PtaSessionScreen`·`AmTabScreen`)

**2. 공유(끌어올린) 상태** (3) — `wrs/WrsTabScreen`, `pta/PtaSessionScreen`, `am/AmTabScreen`.
전부 한 단계만 내린다.

**3. 전역 상태** — **없음.** 가장 가까운 것이 §6의 모듈 전역이지만 React 상태가 아니다.

**4. 파생 상태** — 별도 파일 없음. §5처럼 화면 안에서 계산된다.
계산 함수 자체는 `sessionMode.ts`(`targetReversalsFor` 등), `wrsTrend.ts`(`canShowWrsTrend`),
`statsFeed.ts`(`countOfKind`·`glanceOfKind`)에 있다.

**상태 없음(순수·정적·오디오 출력)** (44) — 계산 모듈 전부, `wrsWords`·`twoCharLists`·`sounds`,
`SummaryCard`·`SessionProgressBar`·`SessionModeToggle`·`SessionTrendPanel`·`WrsVoiceGuideScreen`,
`app/*` 라우트 5개, `audio/cents.ts`

**테스트 23개** — 상태 없음. 다만 `SessionManager.test.ts`·`StaircaseEngine.test.ts`가
**클래스 인스턴스의 내부 상태**를 직접 검증한다(React 상태가 아님).

---

## 8. 상태가 어긋날 수 있는 지점

1. **`mode`가 세 곳에 산다.** `(mode)@탭` → props `initialMode` → `(mode)@세션화면` → 시작 시 `runModeRef`.
   화면이 언마운트돼도 살아남게 하려는 설계인데, **동기화가 한 방향(위→아래 초기값 + 아래→위 콜백)**뿐이라
   부모가 `mode`를 다른 이유로 바꾸면 이미 마운트된 자식은 안 따라온다.
   지금은 부모가 `onModeChange` 말고 `mode`를 바꾸지 않아 문제가 없다.

2. **`PitchCompareScreen`의 진행 숫자는 `SessionManager`의 복사본이고, 수동 동기화다.**
   `(trialNumber)`·`(reversalCount)`가 원본이 아니라 `manager.getStaircaseState()`를 베껴 온 값이다.
   `setReversalCount`를 부르는 자리가 세 곳(`onStart`·`onAnswer`·`finish`)이고, 한 곳을 빠뜨리면 화면만 뒤처진다.
   나머지 세션 화면은 `(session)` 객체 자체를 state로 들어 이 문제가 없다.

3. **`(history)@Ling6SessionScreen`과 `(feed)@StatsScreen`이 같은 저장소를 각각 복사한다.**
   링 6은 `refreshHistory()`로, 통계는 `useFocusEffect(reload)`로 따로 읽는다.
   둘이 동시에 화면에 있는 경우는 없지만(스와프), 「저장 직후 어느 쪽이 최신이냐」는 호출 순서에 달려 있다.
   링 6은 저장 뒤 `refreshHistory()`를 부르고, 나머지 종목은 갱신하지 않는다.

4. **`abortRef`를 세우지 않고 요약으로 가는 화면이 하나 있다.**
   `Am`·`Freq`·`Pitch`는 종료 함수 첫 줄이 `abortRef.current = true`인데,
   `Ling6SessionScreen.finishSession`에는 그 줄이 없다(`stopLing6Playback()`만 부른다).
   자세한 결과는 [`map-error-handling-training.md`](./map-error-handling-training.md) §5에 적었다.

5. **`(lastDifficulty)@빙고`는 지역 상태라 화면을 나가면 사라진다.**
   「다시 하기」가 방금 난이도를 기억하는 근거가 이 값 하나뿐이고, `null`이면 버튼 자체가 안 그려진다.
