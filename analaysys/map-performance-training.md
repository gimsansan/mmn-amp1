# 성능 지도 — `src/app/**` + `src/training/**` + `src/audio/**`

> **축**: 성능(6번 축). 질문 요령은 [`ask-performance.md`](./ask-performance.md).
> **자매 지도**: 화면 [`map-screen-flow-training.md`](./map-screen-flow-training.md) · 데이터 [`map-data-flow-training.md`](./map-data-flow-training.md) · 상태 [`map-state-management-training.md`](./map-state-management-training.md) · 에러 [`map-error-handling-training.md`](./map-error-handling-training.md) · 타입 [`map-types-contracts-training.md`](./map-types-contracts-training.md).
> **표기**: `(변화) ⟳ [대상]` — 이 변화가 저것을 다시 그리거나 계산한다.
> **작성**: 2026-08-21, 브랜치 `feat_wrs_voice_guide`. 코드가 바뀌면 이 문서는 낡는다.

> ## ⚠ 이 문서는 **측정 결과가 아니다**
> 저장소에 프로파일링 흔적이 없고(React DevTools Profiler·Systrace·Flipper 설정 없음),
> 이 조사에서도 앱을 실행해 재지 않았다. 아래는 전부 **코드에서 읽어 낸 트리거·계산량**이다.
> 「느리다」고 적은 곳은 하나도 없다. 재 볼 후보를 §6에 순서대로 적었다.

## 0. 대상 목록과 읽음 상태

고정 목록 **82개**(`src/app` 5 + `src/audio` 3 + `src/training` 74). 읽음 82 / **안 읽음 0**.
목록 밖에서 `components/ui/equalizer.tsx` 하나를 확인했다 — 모든 세션 화면이 진행 중에 계속 그리는 애니메이션이라 트리거를 알아야 했다.

세어 본 것: `useMemo` **0개** · `React.memo` **0개** · `useCallback` **101개** ·
`FlatList`/`FlashList` **0개** · `ScrollView` **11개 화면** · 렌더 안 `.map()` **36곳** · 인라인 `onPress={() => …}` **37곳**.

---

## 1. 한 줄 요약 — 최적화를 거의 안 붙였고, 붙일 근거도 아직 얇다

**`useMemo`도 `React.memo`도 하나 없다.** 파생값은 매 렌더 다시 계산한다(상태 축 §5).
성급한 최적화가 없다는 뜻이라 이 축에서는 오히려 건강한 출발점이다.

그런데 `useCallback`은 **101개**로 아주 많다. 짝이 안 맞는다 —
`useCallback`으로 함수 참조를 안정시켜도 **받는 쪽이 `memo`가 아니면 리렌더를 막지 못한다.**
지금 `useCallback`이 실제로 값을 하는 자리는 두 군데뿐이다.

```
useFocusEffect(useCallback(…, [deps]))   ← 이건 필수. 참조가 흔들리면 effect가 매 렌더 재등록된다
useEffect(…, [onBack, phase, resetRun])  ← BackHandler 재등록을 막는다
```

나머지(`onStart`·`onChoose`·`onNext`·`openStats` 등)는 **자식이 `memo`가 아니어서 리렌더 억제 효과가 없고**,
`useEffect` 의존성에 들어가는 것들만 실질적 의미가 있다. 지금은 비용도 이득도 작다.

---

## 2. 무엇이 무엇을 다시 그리나

### 세션 화면 — `phase` 하나가 화면 전체를 다시 그린다

```
(phase)@세션화면 ⟳ [세션 화면 전체]        idle→playing→choose→feedback 마다
(outcomeCount) ⟳ [진행 막대] + 화면 전체
(lastCorrect)·(lastTarget) ⟳ [정답 강조] + 화면 전체
(marked)·(board)·(line)·(cueUsed) ⟳ [빙고 판 9칸] + 화면 전체
(session)@Am·Freq ⟳ [화면 전체]            시행마다 새 객체
```

세션 화면은 `memo`가 없으므로 **상태 하나만 바뀌어도 그 화면의 서브트리 전체가 다시 그려진다.**

다만 **트리가 아주 작다.**

| 화면 | 진행 중 그리는 노드 수(대략) |
| --- | --- |
| 한 글자 · 두 글자 | 헤더 + 진행바 + 이퀄라이저 + 문구 + **보기 4칸** + 버튼 1~2 |
| 링 6 | 위 + **그림 6칸** + 「못 들었어요」 |
| 떨림 · 다른 음 찾기 | 헤더 + 진행바 + 이퀄라이저 + **번호 3칸** |
| 높낮이 비교 | 위 + **↑/↓ 2칸** |
| 빙고 | 헤더 + HUD 2 + **판 9칸** |

한 화면에 **10~20개 남짓**이다. 리스트도 표도 없다.
「대부분의 리렌더는 문제가 아니다」가 그대로 들어맞는 규모다.

### 인라인 함수 props 37곳 — 매 렌더 새 참조

```js
onPress={() => onChoose(word)}          // ChoiceCell 4개 × 매 렌더
onPress={() => onPress(word, index)}    // BingoTile 9개 × 매 렌더
onPress={() => confirmEndSession(onEndManual)}
onPress={() => onStart("hard")}
style={{ marginBottom: Spacing.six }}   // 인라인 객체
```

`ChoiceCell`·`BingoTile`이 `memo`가 아니므로 **이 새 참조가 추가 리렌더를 만들지는 않는다**
(어차피 부모가 다시 그리면 자식도 그린다). 지금 상태에서 `useCallback`으로 감싸도 얻는 게 없다.
`memo`를 붙이기 시작하면 그때 같이 봐야 하는 자리다.

### 통계 화면 — 칩 전환은 다시 읽지 않는다

```
[연습 기록 진입/재포커스] ⟳ {저장소 4개 읽기}        useFocusEffect(reload)
(kind) 칩 전환 ⟳ [본문 패널]만                       메모리에서 자른다 — 재요청 없음
```

**설계 의도가 파일 머리 주석에 적혀 있다** — 「저장소는 열 때 한 번만 읽고, 칩 전환은 메모리로 처리한다」.
그리고 「한 번에 하나만 그린다 — 네 그래프를 세로로 쌓지 않는다」. 성능 판단이 코드 방침으로 남아 있는 유일한 자리다.

`useFocusEffect` 하나만 쓰고 별도 `useEffect`를 두지 않은 이유도 주석에 있다 — **두 번 읽는 것을 피하려고.**

### 애니메이션 — 진행 중 계속 도는 것 둘

```
[듣는 중·고르기·정답확인] ⟳ Equalizer 막대 3~4개    Animated.loop, useNativeDriver: true
[빙고 요약(줄 완성)] ⟳ ConfettiBurst 조각 16개       Animated.loop, useNativeDriver: true
[빙고 정답확인] ⟳ BingoTile spring 1칸               방금 찍힌 칸만
[빙고 요약] ⟳ BingoTile spring 완성 줄               순차 delay
```

둘 다 `useNativeDriver: true`라 **JS 스레드를 매 프레임 건드리지 않는다.** 좋은 선택이다.
`Animated.Value`는 지연 초기화 `useState(() => new Animated.Value(...))`로 **한 번만** 만든다(주석에 근거 있음).

**다만 `ConfettiBurst`는 `Animated.loop`다.** 이름은 「burst(한 번 터짐)」인데
요약 화면에 머무는 **내내 16조각이 반복해서 떨어진다.** 정지 조건은 언마운트뿐이다.
성능보다 연출 의도 쪽 질문이지만, 요약 화면을 오래 켜 두면 계속 도는 애니메이션이 하나 있다는 사실은 기록해 둔다.

### 목록 밖 요인 — 탭 4개가 동시에 살아 있다

`NativeTabs`를 쓰므로 탭을 옮겨도 **앞 탭이 언마운트되지 않는다**(그래서 `useFocusEffect`와 `BackHandler` 재등록이 필요하다).
즉 링 6·소리 높낮이·단어 듣기·떨림 화면이 **동시에 메모리에 있다.** 각각 지역 상태와 `Animated.Value`를 들고 있다.
지금 트리가 작아 문제가 될 규모는 아니지만, 「탭을 다 돌고 오면 무거워진다」가 나오면 여기부터 본다.

---

## 3. 재계산 — 무거운 것은 전부 렌더 밖에 있다

### 렌더 **밖**(이벤트 핸들러에서 1회) — 이 코드에서 가장 무거운 계산들

```
createWrsTrials()      200단어 셔플 + 25회 buildChoices        「연습 시작」 1회
  └ buildChoices()     축 3개 × 자모 후보 생성 + 풀 필터링       문항당 1회
createBingoBoard("hard")  hardNeighbors를 씨앗마다 계산 →
                          클러스터가 9칸이 될 때까지 확장        「비슷한 소리」 1회
  └ hardNeighbors()    축 3개 × candidatesFor × uniqueWords(200-set 조회)
  └ conflictsHard()    보드에 넣을 때마다 양방향 이웃 계산       (easy 판)
createTwoCharTrials()  12문항 × pickDissimilar(음절 교집합)      「연습 시작」 1회
createLing6Trials()    8개 셔플                                  「연습 시작」 1회
```

`pickNearBoard`가 그중 제일 무겁다 — 최악의 경우 200단어를 훑으며 각 단어의 `hardNeighbors`를 계산한다.
**그래도 「연습 시작」을 누를 때 한 번이고, 렌더 본문에 없다.** 이 축에서 문제 삼을 자리가 아니다.
(다만 동기 호출이라 버튼을 눌렀을 때 프레임이 한 번 튈 수 있다 — §6의 측정 후보 1번.)

### 렌더 **본문**에서 매번 도는 계산

| 위치 | 계산 | 입력 크기 |
| --- | --- | --- |
| `SessionTrendPanel` | `computeAggregate` + `collectPoints` | 최대 50 레코드 |
| `Ling6ProgressPanel` | `ling6WeaknessSnapshot`(정렬 + 7×6 집계) + `chronological`(정렬) | 최대 50일 |
| `WrsProgressPanel` | `chronologicalWrs`(정렬) + `slice(0, 8)` | 최대 50 |
| `TrendChart` · 두 Trend | 좌표 배열 `map` + `Math.min/max(...values)` + 경로 문자열 join | 최대 50점 |
| `StatsScreen` | `countOfKind` · `glanceOfGroup`(그룹 3개 × 종목) | 피드 전체 |
| 세션 화면 | `marked.filter(Boolean).length`, `trials[trialIndex]` | 9 / 25 |

**전부 50개 이하다.** 정렬·평균 몇 번이라 `useMemo`를 붙일 근거가 아직 없다.
이들이 다시 도는 트리거도 드물다 — 통계 패널은 `(feed)`·`(kind)`·`(width)`가 바뀔 때만 그려진다.

**주의**: `Math.min(...ordinals)` 스프레드는 배열이 아주 커지면 스택 한도에 걸린다.
지금은 상한 50이라 안전하지만, 저장 상한을 크게 올리면 여기가 먼저 깨진다.

### 오디오 — 매 시행 도는 유일한 무거운 루프

```js
// ling6Synth.fillWhiteNoise — /s/·/ʃ/ 시행마다
const length = Math.floor(ctx.sampleRate * 0.8);   // 48 kHz면 약 38,400
for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
```

**링 6에서 마찰음(/s/·/ʃ/)이 나올 때마다 4만 개 가까운 난수를 JS로 채운다.** 동기 루프다.
8시행 중 2개가 여기 해당한다. 실측 후보 2번(§6).

그 밖의 오디오는 가볍다 — `AudioContext`를 **모듈 전역에 한 번 만들어 재사용**하고(세 모듈 모두),
노드는 시행마다 만들지만 개수가 2~5개다.

---

## 4. 목록·대량 — 가상화가 필요 없는 크기

**`FlatList`가 하나도 없다.** 전부 `ScrollView` + `.map()`이다. 지금 규모에서는 맞는 선택이다.

| 목록 | 최대 개수 | 상한 근거 |
| --- | --- | --- |
| 최근 연습 목록(`WrsRecentList`) | **8** | `records.slice(0, 8)` |
| 추이 그래프 점 | **50** | 저장소 상한(`MAX_WRS_SESSIONS` 등) |
| 통계 칩 | 6 | `STATS_KINDS` |
| 「다른 연습」 줄 | 3 | 그룹 4개 − 현재 1 |
| 보기 칸 | 4 | 튜플 타입으로 못 박음 |
| 링 6 그림 | 6 | `LING6_SOUNDS` |
| 빙고 칸 | 9 | `BINGO_CELL_COUNT` |
| 컨페티 | 16 | 고정 |
| 안내 단계(`[음성 안내]`) | 4 | `STEPS` |

**모든 목록에 코드로 박힌 상한이 있다.** 사용자 데이터로 무한히 늘어나는 목록이 없다.
링 6 그래프만 예외적으로 50일치 점을 다 그리지만, SVG `Circle` 50개는 부담이 아니다.

### key 안정성

대부분 안정적이다 — `key={word}`(보드·보기 안에서 유일함이 테스트로 보장), `key={sound.id}`,
`key={kind}`, `key={group}`, `key={record.id}`, `key={step}`.

인덱스 key가 4곳 있다.

```
AmSessionScreen:478   key={i}   3AFC 번호 버튼 — 개수 고정, 순서 불변
FreqSessionScreen:456 key={i}   〃
WrsBingoScreen:529    key={i}   컨페티 16조각 — 고정
equalizer.tsx:120     key={i}   막대 3~4개 — 고정
```

**넷 다 「개수·순서가 절대 안 바뀌는 고정 배열」이라 안전하다.** 재정렬·삽입·삭제가 없다.

혼합 key가 둘 있다 — `key={`${records[index]?.id}-${index}`}`, `key={`${points[i].savedAt}-${i}`}`.
인덱스가 섞여 있지만 시간순 고정 배열이라 실질 문제는 없다.

---

## 5. 로드·크기

```
초기 번들에 들어가는 것
├ 링 6 그림 PNG 6개        require() 정적 — 화면을 안 열어도 번들에 있다
├ 단어 200개 + 두 글자 36쌍  문자열 상수 (수 KB)
├ react-native-svg          그래프 4종이 공유
├ react-native-audio-api    오디오 3모듈
├ expo-speech               단어 듣기 3종
└ 화면 컴포넌트 전부         지연 로딩(lazy/dynamic import) 없음
```

- **코드 분할이 전혀 없다.** `React.lazy`도 동적 `import()`도 0개.
  탭 4개가 어차피 앱 열자마자 다 살아나는 구조라 지금은 나눌 이득이 작다.
- PNG 6개가 유일한 자원이다. `assets/ling6/001~006.png`. 크기는 재 보지 않았다.
- 스플래시는 `_layout.tsx`가 `preventAutoHideAsync()`로 잡고, 걷는 쪽은 목록 밖(`components/animated-icon.tsx`)에 있다.
  **첫 화면까지 걸리는 시간을 볼 때는 그 파일부터 본다.**

---

## 6. 재 볼 후보 (측정 순서)

우선순위는 「사용자가 알아챌 가능성 × 계산량」으로 매겼다. **전부 아직 안 잰 것이다.**

1. **「연습 시작」을 누른 순간의 프레임 튐** — `createWrsTrials`(25×`buildChoices`)와
   `createBingoBoard("hard")`가 동기로 돈다. 저사양 기기에서 버튼 반응이 늦는지 본다.
   → 늦으면 `InteractionManager.runAfterInteractions`나 첫 문항만 먼저 만드는 쪽.
2. **링 6 /s/·/ʃ/ 시행의 재생 지연** — `fillWhiteNoise`가 매번 4만 개 난수를 채운다.
   → 늦으면 버퍼를 **한 번 만들어 재사용**하면 된다(같은 길이·같은 성질이라 캐시 가능).
3. **탭 4개를 다 돌고 온 뒤의 메모리·부드러움** — `NativeTabs`가 화면을 살려 두고,
   `AudioContext`가 세 모듈에 각각 하나씩 열린다(`pureTone`·`amTone`·`ling6Synth` = **컨텍스트 3개**).
   → `closePureToneContext`/`closeAmToneContext`가 있는데 **아무도 부르지 않는다.**
4. **요약 화면을 켜 둔 채 방치할 때** — `ConfettiBurst`의 `Animated.loop` 16개가 계속 돈다(§2).
5. **기록이 50건 꽉 찼을 때의 통계 화면** — 진입 때 `Promise.all` 4개 읽기 + 패널 렌더.
   레코드가 전부 요약 숫자라 수십 KB라는 계산이 `statsFeed.ts` 주석에 있다.

**지금 하지 말아야 할 것**: 근거 없이 `memo`/`useMemo`를 바르는 것.
트리가 10~20노드고 계산 입력이 50 이하라, 붙이면 이득 없이 복잡도만 는다.

---

## 7. 파일별 종류

**1. 리렌더 관심사** (15) — 상태를 들고 자기 서브트리를 다시 그리는 화면.
7개 세션 화면 + 탭 3개(`WrsTabScreen`·`PtaSessionScreen`·`AmTabScreen`) + `StatsScreen` +
`ListeningCheckScreen` + `TrendChart`·`Ling6ProgressPanel`·`WrsProgressPanel`(`width` state)

**2. 재계산 관심사** (11) —
렌더 본문: `SessionTrendPanel` `TrendChart` `Ling6ProgressPanel` `WrsProgressPanel` `StatsScreen`
렌더 밖(호출 1회, 무거움): `wrs/wrsDistractors` `wrs/wrsBingo` `wrs/twoCharSession` `wrs/wrsSession`
매 시행: `ling6/ling6Synth`(`fillWhiteNoise`) `ling6/ling6Session`

**3. 목록·대량** (4) — `WrsProgressPanel`(최근 8) `Ling6ProgressPanel`(50일) `SessionTrendPanel`(50점) `StatsScreen`(칩 6).
**전부 가상화 불필요한 크기.**

**4. 로드·크기** (4) — `ling6/sounds`(PNG 6개) `wrs/wrsWords`(200) `wrs/twoCharLists`(36쌍) `app/_layout`(스플래시)

**성능 관심사 없음** (48) — 순수 계산 모듈, 오디오 2종, 정적 데이터, 표시 전용 컴포넌트, 라우트 5개.

**테스트 23개** — 성능 테스트는 **없다.** 벤치마크·렌더 횟수 검증이 하나도 없다.
`SessionProgressBar.test.tsx`가 `rerender`를 쓰지만 폭 계산을 확인하는 것이지 성능이 아니다.

---

## 8. 이 축에서 헷갈리는 지점

1. **`useCallback` 101개가 성능 최적화처럼 보이지만 대부분 아니다**(§1).
   `useFocusEffect`·`useEffect` 의존성에 들어가는 것만 실효가 있다.
   지우면 `BackHandler`가 매 렌더 재등록되는 자리가 있으니, 「불필요해 보인다」고 일괄 제거하면 안 된다.
2. **`Animated.Value`를 `useState(() => new Animated.Value(...))`로 만드는 게 이 코드의 관용구다.**
   `useRef(...).current`가 렌더 중 ref 접근이라 린트에 막힌 결과이고, 주석이 두 곳에 붙어 있다.
   「왜 state냐」는 성능이 아니라 규칙 문제다.
3. **`AudioContext`가 세 개다.** `pureTone`·`amTone`·`ling6Synth`가 각자 모듈 전역에 하나씩 연다.
   하나로 합치는 것이 자연스러워 보이지만, 트랙 분리 방침(타입 축 §5-5) 때문에 그렇게 돼 있다.
   닫는 함수는 있는데 부르는 곳이 없다(§6-3).
4. **`StatsScreen`이 「한 번만 읽는다」고 하지만 재포커스마다 다시 읽는다.**
   주석의 「한 번」은 **한 번의 진입 안에서**라는 뜻이다. 탭을 오갈 때마다 4개 저장소를 다시 읽는다.
