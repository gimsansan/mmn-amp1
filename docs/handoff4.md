# 인계4

> **정본**: 이 파일. 최신 블록을 **맨 위**에 추가. `docs/handoff.md`·`handoff2.md`·`handoff3.md`에는 넣지 않음.  
> 사용자(2026-08-21 02:08): 이후 인계는 여기. `handoff3.md`는 과거.  
> 사용자(2026-08-19 01:09): 블록에 **`### 합의` / `### 안 한 일` / `### 다음` 넣지 않음.**

## 인계 — 2026-08-31 17:08

새 채팅 AI용. **이번 세션 = 통계 점 12 상한 + %·링6 면 0.22.**

### 한 일

- 세 벌 SVG: 점 12 이하면 전부, 13 이상이면 첫·끝만. 선·면적은 50점 유지.
- `%`·링6 면적 `0.22`. `TrendChart`(높낮이·다른 음·떨림) 면은 `0.35`.
- `docs/training-stats-graphs.md` · `training-stats-recommendation.md` 맞춤.

### 핵심 경로

- `src/training/TrendChart.tsx`
- `src/training/PercentTrend.tsx`
- `src/training/ling6/Ling6ProgressPanel.tsx`

### 단정 금지

- `미검증`: 12개일 때 좁은 폭 겹침. % 면 0.22 격자 대비.

---

## 인계 — 2026-08-31 16:48

새 채팅 AI용. **이번 세션 = 통계 선 그래프 UI만 전환(레이아웃 유지).**

### 한 일

- 세 벌 SVG(`TrendChart` / `PercentTrend` / `Ling6PassTrend`)에 선 아래 면적·마지막 점 강조.
- 색은 기존 테마. 짙은 히어로 카드·타일 레이아웃·y축은 안 바꿈.
- `docs/training-stats-graphs.md` 공통 UI 표 갱신.

### 핵심 경로

- `src/training/TrendChart.tsx`
- `src/training/PercentTrend.tsx`
- `src/training/ling6/Ling6ProgressPanel.tsx`

### 단정 금지

- `미검증`: 실기기 점 겹침·면 채움 대비.

---

## 인계 — 2026-08-31 16:18

새 채팅 AI용. **이번 세션 = 통계 그래프 데이터·UI 지도 md.**

### 한 일

- `docs/training-stats-graphs.md` 추가. 세 벌 차트(데이터 게이트·축·UI)와 파일 지도.
- `docs/README.md`·`training-stats-recommendation.md`에 링크.

### 핵심 경로

- `docs/training-stats-graphs.md`

### 단정 금지

- 세 차트 합치기·실기기 점 겹침은 미검증. 코드는 안 바꿈.

---

## 인계 — 2026-08-31 15:46

새 채팅 AI용. **이번 세션 = ActionButton 눌림을 투명도 대신 살짝 축소.**

### 한 일

- `pressed`: `opacity: 0.7` 삭제, `scale: 0.97`. disabled 투명도는 그대로.
- `ActionButton`을 쓰는 시작·다시 연습·처음으로·뒤로 가기 등에 일괄 적용.
- 보기 카드·빙고·헤더 아이콘은 안 건드림.

### 핵심 경로

- `src/components/ui/action-button.tsx`

### 단정 금지

- 0.97 체감·실기기 확인은 미검증.

---

## 인계 — 2026-08-31 15:37

새 채팅 AI용. **이번 세션 = 오늘 연습 끝 약한 소리 16/34, 목록은 이름+점수 16만.**

### 한 일

- 「약한 소리」 16, 악기 그림 34. 아래 목록 그림 제거. `피아노`·`0/3` 둘 다 16.
- 결과 문장 20은 그대로(다른 탭과 맞춤).

### 핵심 경로

- `src/training/inst/InstSessionScreen.tsx`

### 단정 금지

- 그림 3장×긴 문장이 좁은 폭에서 접히는 정도는 실기기 미검증.

---

## 인계 — 2026-08-31 15:26

새 채팅 AI용. **이번 세션 = 오늘 연습 끝에서 아쉬움 문장을 「약한 소리」+기존 악기 그림으로 바꿈.**

### 한 일

- `instWeakestIds`: 틀린 횟수 공동 1위 1~3개 id. 4개 동점·전부 맞춤은 null.
- 요약 카드 오른쪽 위: `약한 소리` + 해당 webp 28dp. 통계 탭·저장 형식은 안 바꿈.

### 핵심 경로

- `src/training/inst/instSession.ts`
- `src/training/inst/InstSessionScreen.tsx`

### 단정 금지

- 좁은 화면에서 긴 결과 문장+그림 3개 줄바꿈은 실기기 미검증.

---

## 인계 — 2026-08-31 15:00

새 채팅 AI용. **이번 세션 = 악기 소리 연습 끝 「아쉬움」 문장이 동점 둘·셋을 같이 짚음.**

### 한 일

- `instWeakestCopy`: 틀린 횟수 공동 1위가 2·3이면 `피아노·기타`처럼 `·`로 이어 말함.
- 다 맞춤·넷이 같은 횟수로 틀림 → 여전히 null. 전체 % 그래프·저장은 그대로.

### 핵심 경로

- `src/training/inst/instSession.ts`
- `src/training/inst/__tests__/instSession.test.ts`

### 단정 금지

- 없음. 통계 탭 악기별 저장은 이번 세션에서 안 함.

---

## 인계 — 2026-08-31 10:47

새 채팅 AI용. **이번 세션 = 악기 보기 칸 그림을 70~90dp에 맞춤. 글자는 그대로.**

### 한 일

- `choiceImage`: 64 고정 → 폭 100% · `aspectRatio` 1 · `maxHeight` 90. `contain` 유지.
- 보기·미리보기 칸 `paddingVertical` `Spacing.three`→`two`. 미리보기는 `maxHeight` 64.
- 글자(`choiceLabel`·`choiceFamily`)는 안 바꿈. 화면별 배율 훅은 안 넣음.

### 핵심 경로

- `src/training/inst/InstSessionScreen.tsx`

### 단정 금지

- `미검증`: 짧은 폰 568dp·태블릿 실기기.
- `주의`: 플루트는 가로 관이라 같은 칸에서도 면적이 작아 보일 수 있음.
- 이전 인계의 「검은 배경」은 잘못봄. WebP는 투명.

---

## 인계 — 2026-08-31 10:40

새 채팅 AI용. **이번 세션 = 악기 소리 보기 칸 아이콘을 `assets/4-inst/` WebP로 교체.**

### 한 일

- `Instrument.icon`(SVG `IconName`)을 `image: require("@/assets/4-inst/*.webp")`로 바꿈.
- `InstSessionScreen` 미리보기·보기 칸·집계 행을 `Image`(`resizeMode: contain`)로 그림.
- 듣기 확인·통계의 `pianoKeys` SVG는 그대로. `icon.tsx`의 guitar/violin/flute SVG는 안 지움.

### 핵심 경로

- `src/training/inst/instruments.ts` · `InstSessionScreen.tsx`
- `assets/4-inst/{piano,guitar,violin,flute}.webp`

### 단정 금지

- `미검증`: 실기기에서 칸 크기·짧은 화면.
- `주의`: WebP가 검은 배경이라 밝은 카드 위에 사각이 남을 수 있음.

---

## 인계 — 2026-08-28 11:22

새 채팅 AI용. **이번 세션 = 소리 구분 idle 안내 이미지를 기록 0건일 때만 표시.**

### 한 일

- idle `ling6_back.webp`가 항상 보이던 것을 `history.length === 0`일 때만 그리도록 되돌림.
- 연습 중 고르기 칸 6장(`sound.image`)은 그대로 항상 표시.

### 핵심 경로

- `src/training/ling6/Ling6SessionScreen.tsx` idle `Image`

### 단정 금지

- `미검증`: 실기기에서 기록 0건/1건 이상 idle 화면.

---

## 인계 — 2026-08-28 11:12

새 채팅 AI용. **이번 세션 = 선택 버튼 눌림 scale 촉감을 공용 훅으로 4개 화면에 통일. 구현 완료.**

### 한 일

- `src/hooks/use-press-scale.ts` 신설: `Animated.Value(1)` 지연 초기화, `onPressIn`→0.96·`onPressOut`→1 spring(`useNativeDriver: true`). 빙고 타일과 같은 방식.
- `ChoiceCell` 4곳(ling6·wrs·wrsTwoChar·sentClosed): `Pressable`을 `Animated.View`(`transform: [{ scale }]`)로 감싸고 `onPressIn/Out` 연결. `usePressScale`·`Animated` import 추가.
- 레이아웃 보존: `choiceCell`의 `width`(31.5%/48%)를 `choiceCellOuter`로 옮기고 `choiceCell`은 `width:"100%"`. sentClosed는 `overflow:hidden`을 `choiceCell`에 유지.
- freq·pitch2afc는 선택 버튼이 인라인 `Pressable`(숫자 1~3)이고 구조가 달라 이번 범위에서 제외.

### 핵심 경로

- `src/hooks/use-press-scale.ts`
- `src/training/ling6/Ling6SessionScreen.tsx` · `wrs/WrsSessionScreen.tsx` · `wrs/WrsTwoCharScreen.tsx` · `sentClosed/SentClosedSessionScreen.tsx`

### 단정 금지

- `추정`: native driver spring이라 JS·layout 부담 없음. 고르는 중 동작이라 실시간 오디오 겹침 낮음.
- `미검증`: 실기기에서 눌림 체감·그리드 3열/2열 폭 유지 확인 안 함.
- `주의`: `WrsSessionScreen.test.tsx`는 오디오 모듈 미모킹으로 suite 로드 실패 — clean tree에서도 동일, 이번 변경 무관.

---

## 인계 — 2026-08-28 10:38

새 채팅 AI용. **이번 세션 = `SessionProgressBar` 채움 폭을 즉시 점프에서 짧게 밀어 채우기로. 구현 완료.**

### 한 일

- `SessionProgressBar.tsx`: `Animated.Value(ratio)`를 지연 초기화 `useState`로 한 번만 생성(`equalizer.tsx` 방식). `ratio` 변화 시 `Animated.timing`(260ms, `FILL_MS`)로 밀어 채움. `interpolate` `0→"0%"`,`1→"100%"`. 첫 렌더는 `mounted` ref로 애니메이션 생략(`setValue`). `fill`을 `Animated.View`로 교체.
- 테스트: Animated 보간이라 `width`가 문자열이 아님 → fake timer로 `runAllTimers` 후 `__getValue()`로 폭 확인하도록 조정. 4개 통과.
- 빙고는 막대 자체가 없어 대상 아님(칸이 진행). 쓰는 탭(ling6·sentClosed·WrsTwoChar·WrsSession·am·freq·pitch2afc)은 컴포넌트만 바꿔 자동 반영.

### 핵심 경로

- `src/training/SessionProgressBar.tsx`
- `src/training/__tests__/SessionProgressBar.test.tsx`

### 단정 금지

- `주의`: `width(%)`는 layout이라 `useNativeDriver: false`. Equalizer `scaleY`(native)와 달리 JS 스레드를 거친다.
- `추정`: 높이 5px·시행당 1회·260ms라 부담 작을 것으로 봄.
- `미검증`: 듣기 중 오디오 끊김 영향·실기기 밀림 체감 측정 안 함.

---

## 인계 — 2026-08-27 17:05

새 채팅 AI용. **이번 세션 = 소리 높낮이 선택 화면에 공용 토글·안내문 통합 + 카드 터치 즉시 시작.**

### 한 일

- `PtaSessionScreen` picker에 공용 `SessionModeToggle`(기존 `mode` state 재사용) + 공용 안내문 1개 추가. 두 종목이 토글 공유.
- 카드 터치 = 즉시 시작: `openTrack`에서 `autoStart` state를 켜고 종목 화면에 `autoStart`/`onAutoStartConsumed` 전달 → idle 건너뜀. `backToPicker`에서 리셋.
- 통계는 종목별 분리(B안): 헤더에 통계 버튼 2개(pitch2·freq). `StatsEntryButton`에 `accessibilityLabel` prop(기본값 유지) 추가로 라벨 중복 방지.

### 핵심 경로

- `src/training/pta/PtaSessionScreen.tsx`
- `src/components/ui/stats-entry-button.tsx`

### 단정 금지

- `미검증`: 실기기에서 카드 터치 → 즉시 재생·토글 반영·통계 2개 진입.
- `주의`: 헤더 버튼 3개(듣기준비+통계2)라 좁은 폭에서 넘칠 수 있음(미확인).
- `주의`: 종목 화면 idle 분기는 이 경로에서 미사용(죽은 분기). 요약 「다시 연습」은 종목 화면 내부에서 동작.

---

## 인계 — 2026-08-27 16:41

새 채팅 AI용. **이번 세션 = 단어 빙고 오답 시 이전 정답 칸 재팝 버그 수정.**

### 한 일

- `BingoTile` 팝(0.5→1 spring)은 정답 칸·완성 줄에서만이 의도. 그런데 오답 `feedback`에서 이전 정답 칸이 다시 팝했다.
- 원인: 정답 때 `lastMarked`가 그 칸에 남고 오답은 안 바꿔서, `isMarked && index === lastMarked`가 계속 참.
- 수정: tile 조건에 `lastCorrect === true` 추가. `BingoBoard`에 `lastCorrect` prop 전달(running=`lastCorrect`, summary=`undefined`).

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`

### 단정 금지

- `미검증`: 실기기에서 정답 팝 유지·오답 미발화 확인 안 함.

---

## 인계 — 2026-08-27 16:08

새 채팅 AI용. **이번 세션 = 소리 구분 idle 이미지 반응형 + 소리 높낮이 연습 화면에 헤더 버튼.**

### 한 일

- 소리 구분 idle `ling6_back.webp`: 고정 350·`contain` → 화면 높이 45%·`cover`.
- 소리 높낮이: 선택 화면에만 있던 듣기 준비·기록 버튼을 높낮이 비교·다른 음 찾기 idle·요약에도.
- 패턴은 떨림 `statsRow`. 기록 종목은 비교=pitch2, 다른 음=freq. 진행 중에는 숨김.

### 핵심 경로

- `src/training/ling6/Ling6SessionScreen.tsx`
- `src/training/pta/PtaSessionScreen.tsx`
- `src/training/pitch2afc/PitchCompareScreen.tsx`
- `src/training/freq/FreqSessionScreen.tsx`

### 단정 금지

- `주의`: `cover`라 안내 이미지 가장자리 잘림 가능.
- `미검증`: 실기기에서 히어로와 헤더 버튼 겹침.

---

## 인계 — 2026-08-27 14:54

새 채팅 AI용. **이번 세션 = 앱 시작 탭을 떨림 → 소리 구분.**

### 한 일

- 원인: expo-router `index` = 떨림이라 콜드 스타트가 항상 떨림.
- `index.tsx` → 소리 구분. 떨림 → `am.tsx`. `ling6.tsx` 삭제.
- `app-tabs.tsx` 트리거: `index`=소리 구분, `am`=떨림. 하단 탭 순서는 그대로.

### 핵심 경로

- `src/app/index.tsx` · `src/app/am.tsx` · `src/components/app-tabs.tsx`

### 단정 금지

- `미검증`: 백그라운드 복귀 시 마지막 탭 유지(OS).

---

## 인계 — 2026-08-27 14:49

새 채팅 AI용. **이번 세션 = 소리 구분·문장 듣기 idle 「시작」 글자 크기 맞춤.**

### 한 일

- 원인: 두 탭만 `textScale` 미전달 → 기본 14px. 떨림·음고 idle은 1.2배.
- idle 「시작」만 1.2배. 요약·진행 중·단어 듣기는 그대로.

### 핵심 경로

- `src/training/ling6/Ling6SessionScreen.tsx`
- `src/training/sentClosed/SentClosedSessionScreen.tsx`

### 단정 금지

- `미검증`: 실기기 육안.

---

## 인계 — 2026-08-27 14:45

새 채팅 AI용. **이번 세션 = 다른 음 찾기 idle 웰니스 고지 한 줄 삭제.**

### 한 일

- 높낮이 비교와 같이 idle 제목 아래 「웰니스 연습 · 병원…」과 `heroCaption` 제거.
- 진행 중 헤더 고지는 그대로.

### 핵심 경로

- `src/training/freq/FreqSessionScreen.tsx`

### 단정 금지

- `미검증`: 실기기 idle 레이아웃.

---

## 인계 — 2026-08-27 14:43

새 채팅 AI용. **이번 세션 = 높낮이 비교 idle 웰니스 고지 한 줄 삭제.**

### 한 일

- idle 제목 아래 「웰니스 연습 · 병원…」과 `heroCaption` 제거.
- 진행 중 헤더 고지·다른 탭 고지는 그대로.

### 핵심 경로

- `src/training/pitch2afc/PitchCompareScreen.tsx`

### 단정 금지

- `미검증`: 실기기 idle 레이아웃.

---

## 인계 — 2026-08-27 14:41

새 채팅 AI용. **이번 세션 = 적응 연습 idle 캡션 문구만 교체.**

### 한 일

- 「난이도가 맞춰지는」→「들리는 정도에 맞춰」. 떨림·다른 음·높낮이 비교 idle만.
- 링6·단어·문장 안내는 안 바꿈(고정 횟수라 해당 없음).

### 핵심 경로

- `src/training/am/AmSessionScreen.tsx`
- `src/training/freq/FreqSessionScreen.tsx`
- `src/training/pitch2afc/PitchCompareScreen.tsx`

### 단정 금지

- `미검증`: 실기기 idle 캡션 육안.

---

## 인계 — 2026-08-27 14:30

새 채팅 AI용. **이번 세션 = 소리 점검을 5탭 헤더로 맞춤(링6·문장 추가).**

### 한 일

- 듣기 준비(볼륨 맞추기)를 소리 점검(A4 순음)으로 재정의. `sampleHz` 제거.
- 소리 구분·문장 듣기 idle/요약 헤더에도 같은 점검 버튼.
- 접근성 라벨 「소리 점검」. 홈·설정 화면은 없음(5탭이 전부).

### 핵심 경로

- `src/training/ListeningCheckScreen.tsx` — `CHECK_TONE_HZ` 440 고정
- `src/training/ling6/Ling6SessionScreen.tsx`
- `src/training/sentClosed/SentClosedSessionScreen.tsx`
- `docs/listening-check-volume-by-tab.md`

### 단정 금지

- `미검증`: 실기기 점검음·두 탭 뒤로가기.
- `주의`: 빙고는 점검 버튼 없음.

---

## 인계 — 2026-08-27 13:28

새 채팅 AI용. **이번 세션 = 듣기 준비 현황에 링6 녹음 vs 문장 TTS 분리.**

### 한 일

- 소리 구분: 직접 녹음·`prep-ling6-wav.mjs` 수치. 듣기 준비 아님.
- 문장: 미리 만든 Heami wav. 실시간 `expo-speech` 아님.
- 단어 듣기 TTS 문제와 문장을 같은 줄에 두지 않음.

### 핵심 경로

- `docs/listening-check-volume-by-tab.md`

### 단정 금지

- `주의`: `ling6Play.ts` 웹 임시본 주석은 그대로.

---

## 인계 — 2026-08-27 13:22

새 채팅 AI용. **이번 세션 = 듣기 준비 vs 퀴즈 음량 탭별 현황 문서.**

### 한 일

- 5탭: 샘플 유무·엔진·게인·조정이 퀴즈에 이어지는지 정리.
- 단어 듣기: 순음 샘플 vs TTS → 조정 의미 약함(핵심).
- 링6·문장: 듣기 준비 없음. PTA는 같은 `playPureTone` 계열.

### 핵심 경로

- `docs/listening-check-volume-by-tab.md`
- `docs/README.md`

### 단정 금지

- `미검증`: 실기기 체감. 맞추는 방법 합의 없음.

---

## 인계 — 2026-08-27 13:10

새 채팅 AI용. **이번 세션 = 단어 듣기 헤더에 듣기 준비 아이콘.**

### 한 일

- 목록·한 글자·두 글자 idle/요약: 통계 왼쪽에 헤드폰.
- PTA와 같게 화면 갈아끼움. 샘플은 440 Hz 순음.
- 빙고는 통계 아이콘이 없어 안 넣음.

### 핵심 경로

- `src/training/wrs/WrsTabScreen.tsx`
- `src/training/wrs/WrsSessionScreen.tsx`
- `src/training/wrs/WrsTwoCharScreen.tsx`

### 단정 금지

- `주의`: 연습은 TTS. 샘플음은 순음.
- `미검증`: 실기기.

---

## 인계 — 2026-08-27 13:03

새 채팅 AI용. **이번 세션 = 떨림 듣기 준비 히어로를 headphones로.**

### 한 일

- 헤더 헤드폰으로 연 듣기 준비 히어로가 `vibrate`였음.
- PTA와 같게 `trackIcon="headphones"`.
- idle 「떨림 찾기」 히어로 `vibrate`는 그대로.

### 핵심 경로

- `src/training/am/AmTabScreen.tsx`

### 단정 금지

- `미검증`: 실기기.

---

## 인계 — 2026-08-27 12:50

새 채팅 AI용. **이번 세션 = 듣기 준비를 관문에서 빼고 통계처럼 아이콘으로 연다.**

### 한 일

- idle/카드 「연습 시작」은 바로 세션. 듣기 준비 화면은 안 끼움.
- 헤더 `headphones` 버튼(`ListeningCheckEntryButton`). 통계 왼쪽.
- 안내·소리 들어보기 유지. 「연습 시작」삭제. 「뒤로 가기」만(통계와 같음).
- 소리 높낮이 귀풀기/연습 토글은 세션 idle로(듣기 준비 `extra` 제거).
- 떨림 `onBeforeStart`·`autoStart`·`needsListeningCheck` 제거.

### 핵심 경로

- `src/components/ui/listening-check-entry-button.tsx`
- `src/training/ListeningCheckScreen.tsx`
- `src/training/am/AmTabScreen.tsx`, `AmSessionScreen.tsx`
- `src/training/pta/PtaSessionScreen.tsx`

### 단정 금지

- `미검증`: 실기기. 진행 중에는 아이콘 숨김(통계와 같음).

---

## 인계 — 2026-08-27 11:29

새 채팅 AI용. **이번 세션 = 떨림 듣기 준비를 idle 시작마다 다시 띄움.**

### 한 일

- `if (checked) return true`·`checked` 상태 제거.
- idle 「연습 시작」마다 듣기 준비. 통과 후 `autoStart`는 그대로.
- idle 문구는 항상 「듣기 준비가 이어집니다」.

### 핵심 경로

- `src/training/am/AmTabScreen.tsx`
- `src/training/am/AmSessionScreen.tsx` — `needsListeningCheck` 주석만.

### 단정 금지

- `미검증`: 실기기. PTA 한 번 통과 스킵은 그대로.

---

## 인계 — 2026-08-27 11:16

새 채팅 AI용. **이번 세션 = 떨림 idle 첫 시작 문구를 듣기 준비에 맞춤.**

### 한 일

- 첫 시작(`!checked`): 「시작을 누르면 듣기 준비가 이어집니다」.
- 통과 후: 기존 「난이도가 맞춰지는 연습이 이어집니다」 유지.
- 게이트·화면 전환은 그대로.

### 핵심 경로

- `src/training/am/AmSessionScreen.tsx` — `needsListeningCheck`
- `src/training/am/AmTabScreen.tsx` — `needsListeningCheck={!checked}`

### 단정 금지

- `미검증`: 실기기. freq·pitch2 idle 문구는 이번엔 안 바꿈.

---

## 인계 — 2026-08-27 11:10

새 채팅 AI용. **이번 세션 = 듣기 준비 「연습명」자막 제거.**

### 한 일

- `{trackTitle}`(듣기 준비 밑 떨림 찾기 등) 삭제. prop·`subtitle`·호출부 인자도 제거.
- 아이콘은 남김. AM·freq·pitch2 듣기 준비가 같은 화면.

### 핵심 경로

- `src/training/ListeningCheckScreen.tsx`
- `src/training/am/AmTabScreen.tsx`, `src/training/pta/PtaSessionScreen.tsx`

### 단정 금지

- `미검증`: 아이콘만으로 연습 구분이 충분한지. 리빌드 불필요.

---

## 인계 — 2026-08-27 10:57

새 채팅 AI용. **이번 세션 = 귀풀기/연습 토글 비선택 칸을 2차 버튼처럼.**

### 한 일

- 비선택: `surface`+`border`, 라벨 `text`, 힌트 `textSecondary`.
- 선택: 기존 accent 틴트·테두리·글자 유지. 난이도 암시 방침 유지.

### 핵심 경로

- `src/training/SessionModeToggle.tsx` — AM·freq·pitch2·듣기 준비가 이 컴포넌트만 씀.

### 단정 금지

- `미검증`: 실기기에서 비선택이 충분히 눌려 보이는지. 리빌드 불필요.

---

## 인계 — 2026-08-27 04:40

새 채팅 AI용. **이번 세션 = 팔레트 1순위 교체 + 테스트 환경 복구.** 다음은 **2순위**.

### 한 일

- `theme.ts`의 `Colors.light`·`Shadows`를 "Softer Blue"로 교체. 컨셉(Clean Clinical·라이트 전용) 유지, 배치 무변경.
  `accent` `#1668E3`→`#2C6BB8`, `highlight` `#F36C1C`→`#DA7333`, 배경 `#F6F9FD`→`#F7F9FB`. 그림자 opacity 0.08→0.05 / 0.35→0.2.
- 주석에 박힌 대비비 수치를 새 값으로 전부 재계산해 갱신.
- 대비 규칙(AA 4.5:1 · `accentTint` 위 글자 · `highlight` 3:1) 앱 전체 감사 → **위반 0건**. 하드코딩 색 0건.
- 안 돌던 `npm test` 복구: `jest-expo`·`@types/jest`·`.bin/jest` 누락(설치 중단 흔적)이 원인. `npm install`로 해결.
  **27 suites / 238 tests 전부 통과, `tsc` 에러 0건.**
- `docs/session-2026-08-27-팔레트-jest.md` 신규 작성(비유 포함 상세 요약). `answer.md`에 Jest 설명 블록 추가.

### 핵심 경로

- `src/constants/theme.ts` — 이번 변경 전부
- `app.json` 17·34행 — **스플래시/아이콘이 아직 옛 색** `#EAF2FE`/`#F6F9FD`. 2순위 대상
- `src/components/app-tabs.tsx`, `src/components/ui/icon.tsx` — 2순위 나머지
- `docs/session-2026-08-27-팔레트-jest.md` — 상세 배경

### 단정 금지

- **리빌드 필요 여부 미확인.** `app.json`은 네이티브라 색을 바꾸면 `npm run android` 재빌드가 필요할 수 있으나 이번 세션에서 검증 안 함.
- **실기기 화면 확인 안 함.** 팔레트는 수치(대비비)로만 검증했고 눈으로 본 적 없다.
- `src/training/sentClosed/SentClosedSessionScreen.tsx`의 미커밋 변경은 **이번 세션 것이 아니다.**
  `showIdlePreview`를 첫 세션 한정→항상으로 바꾼 로직 변경. 의도 확인 필요.
- `accentTint` 면 위 글자는 `accent`·`text`만 AA. `textMuted`(4.41)·`textSecondary`(4.18)·`positive`(4.01)는 미달 — 2순위에서 면을 바꾸면 글자색도 같이 봐야 한다.
- npm 취약점 17건(moderate 11 / high 6) 미조사.

---

## 인계 — 2026-08-26 17:15

새 채팅 AI용. **이번 세션 = 빙고 쉬운 판 설명 문구(코드 변경).**

### 한 일

- 목록 카드 설명: `덜 비슷한` → `소리가 많이 다른 단어로 줄을 만드는 연습`.
- 제목 `빙고 · 쉬운 판`·옆 카드 `비슷한 소리`는 그대로.

### 핵심 경로

- `src/training/wrs/WrsTabScreen.tsx`

### 단정 금지

- 없음. 리빌드 불필요.

---

## 인계 — 2026-08-26 17:09

새 채팅 AI용. **이번 세션 = 빙고 요약 UI 위계(코드 변경).**

### 한 일

- 안 맞춘 칸: 순백 → `accentTint`+가는 테두리. 맞춘 줄만 진한 파랑.
- 통계: 흰 카드 3장 → tint 한 줄(줄/칸/단어). `accentTint` 위 라벨은 `text`.
- 요약 버튼 2줄: 방금 난이도 primary, 다른 난이도+뒤로. idle 3버튼 행은 그대로.
- `lastDifficulty` 복구(요약 primary).

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`
- `src/training/wrs/__tests__/WrsBingoScreen.test.tsx`

### 단정 금지

- `미검증`: 실기기 요약 레이아웃.
- `주의`: idle은 예전처럼 버튼 3개 한 행. 리빌드 불필요.

---

## 인계 — 2026-08-26 16:55

새 채팅 AI용. **이번 세션 = 링 6 UI 명칭 → 「소리 구분」(코드 변경).**

### 한 일

- 탭·헤더·통계 칩을 **소리 구분**. `kind=ling6`·폴더·저장 키는 그대로.
- `training-stats-recommendation.md` 탭 표·칩 목록만. 과거 인계·impl-log는 안 고침.

### 핵심 경로

- `src/components/app-tabs.tsx` · `src/training/ling6/Ling6SessionScreen.tsx` · `src/training/statsFeed.ts`

### 단정 금지

- `미검증`: 실기기 탭 라벨 잘림.
- `주의`: 코드·문서 안의 「링 6」 모듈 별칭은 남아 있음. 리빌드 불필요.

---

## 인계 — 2026-08-26 16:40

새 채팅 AI용. **이번 세션 = 문장 듣기 idle 미리보기 9장→6장(코드 변경).**

### 한 일

- idle·기록 0일 때만 `SCENES` 섞어 6장. 다시 idle이면 다시 섞음.
- 칸 높이 100→150, `PREVIEW_FIGURE_SCALE` 1.3→1.5. 가로 3칸(3×2).
- 연습 중 고르기 3장·장면 9·18문항은 그대로.

### 핵심 경로

- `src/training/sentClosed/SentClosedSessionScreen.tsx`

### 단정 금지

- `미검증`: 실기기 6장·배율 1.5 잘림.
- `주의`: 기록 있으면 미리보기 안 나옴(기존). 리빌드 불필요.

---

## 인계 — 2026-08-26 16:30

새 채팅 AI용. **이번 세션 = 빙고 요약 「다시 하기」 제거(코드 변경).**

### 한 일

- 요약 전용 「다시 하기」 행 삭제. idle·요약 버튼이 같아짐: 비슷한 소리 / 쉬운 판 / 뒤로 가기.
- `lastDifficulty` 상태 삭제(그 버튼만 쓰던 값).

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`

### 단정 금지

- `미검증`: 실기기 요약→난이도 버튼으로 재시작.
- `주의`: 같은 난이도 한 탭 재시작은 없음. 방금 쓰던 쪽 버튼을 다시 누르면 됨. `jest` 통과, 리빌드 불필요.

---

## 인계 — 2026-08-26 16:17

새 채팅 AI용. **이번 세션 = 빙고 난이도를 목록 카드로 옮김(코드 변경).**

### 한 일

- 단어 듣기 목록: `단어 빙고` 한 장 → `빙고 · 쉬운 판` / `빙고 · 비슷한 소리` 두 장. 카드 탭이면 바로 시작(한·두 글자와 같은 `autoStart`).
- `WrsBingoScreen`: `autoStart`·`initialDifficulty`. 음성 안내 재시도는 `pendingDifficulty`로 같은 판 유지.
- idle은 중지 후 `resetRun`용으로 유지. 요약의 난이도·다시 하기는 그대로.

### 핵심 경로

- `src/training/wrs/WrsTabScreen.tsx`
- `src/training/wrs/WrsBingoScreen.tsx`
- `src/training/wrs/__tests__/WrsBingoScreen.test.tsx`

### 단정 금지

- `미검증`: 실기기에서 목록 카드→바로 낭독.
- `주의`: `autoStart`는 마운트 `useEffect`(제스처 밖). 첫 페인트 idle 한 프레임 가능(한·두 글자와 동일). `tsc` 통과, 리빌드 불필요.

---

## 인계 — 2026-08-26 16:02

새 채팅 AI용. **이번 세션 = 떨림 요약 버튼 정리(코드 변경).**

### 한 일

- `AmSessionScreen` 요약 액션: primary를 idle=「연습 시작」/summary=「처음으로」로 분기. 요약의 「다시 연습」 제거.
- 이유: 떨림은 `onBack` 없음 → idle 복귀 길이 「처음으로」뿐. 「다시 연습」은 즉시 새 세션이라 소리가 곧장 남. 하나만 남기면 「처음으로」가 나음(사용자 결정).
- `onStart`은 idle에서 계속 사용. `resetToIdle`을 요약 primary로 승격.

### 핵심 경로

- `src/training/am/AmSessionScreen.tsx`

### 단정 금지

- `미검증`: 실기기 요약→「처음으로」→idle 흐름.
- `주의`: 요약에서 바로 재시작하려면 「처음으로」→「연습 시작」 두 번(한 번 재시작 없앤 트레이드오프). `tsc` 통과, 리빌드 불필요.

---

## 인계 — 2026-08-26 15:52

새 채팅 AI용. **이번 세션 = 단어 듣기 라우팅 정리(코드 변경).**

### 한 일

- `WrsSessionScreen`(한 글자)·`WrsTwoCharScreen`(두 글자): 요약의 「처음으로」 버튼 삭제. 목록에서 `autoStart`로 idle을 건너뛰는데 「처음으로」가 다시 idle로 보내 목록엔 없던 안내 화면이 뜨던 문제. `resetRun`은 중지 확인에서 계속 사용.
- `WrsTabScreen`(목록): 헤더에 `StatsEntryButton` 추가. `showStats` 상태 + `StatsScreen(initialKind="wrs1")` + BackHandler 분기.
- 교차검증 정정: idle 재진입은 한 글자·**두 글자 둘 다** 해당(첫 판단 「두 글자엔 없다」는 오독이었음). `PitchCompareScreen`·`FreqSessionScreen`엔 「처음으로」 없음. am(떨림)·wrs1·wrs2에 있었음.

### 핵심 경로

- `src/training/wrs/WrsSessionScreen.tsx`
- `src/training/wrs/WrsTwoCharScreen.tsx`
- `src/training/wrs/WrsTabScreen.tsx`

### 단정 금지

- `미검증`: 실기기에서 목록 통계 버튼·「다시 연습」 흐름.
- `주의`: 목록 통계는 `wrs1`로 열림. 두 글자는 `StatsScreen` 안 탭 전환으로 봐야 함.
- `주의`: 빙고 idle(난이도)·파일 라우트 승격은 안 함. `tsc` 통과, 리빌드 불필요.

---

## 인계 — 2026-08-26 14:10

새 채팅 AI용. **이번 세션 = 토큰 절약 문서의 범용판 신설(문서만, 코드 0).**

### 한 일

- `docs/ask-token-budge-universal.md` 신설. 스택 무관 범용판. §0~§9, 12.4 KB, 최장 줄 103자.
- 구성: 비용 원천 표 / 탐색 계단 5단계 / 상황별 처방 10개 / 세션 운영 / 요청 쓰는 법 / 문서 형식 / 하지 말 것 / 단정 금지.
- 기존 `ask-token-budget.md`는 손대지 않음. 역할을 「이 앱 실측」으로 갈라 둠.
- `docs/README.md` 4곳 등록(축 ⑥, 역할표, 결정표, 파일 목록).

### 핵심 경로

- `docs/ask-token-budge-universal.md`(신)
- `docs/ask-token-budget.md`(기존·이 앱 실측)
- `docs/README.md`

### 단정 금지

- `추정`: 400줄·200자·앞뒤 3줄은 편의 기준. 문서 §8에 명시함.
- `미검증`: 탐색을 하위 에이전트에 위임하는 편이 실제로 싼지.
- `주의`: 파일명 `budge`는 사용자가 준 그대로. `budget` 오타일 수 있고 정정 여부 미결정. 정정하면 README 4곳·impl-log 경로 동반 수정.

---

## 인계 — 2026-08-26 13:52

새 채팅 AI용. **이번 세션 = 통계 화면에서 「다른 연습」 줄 제거.**

### 한 일

- `OtherTrainingCard` 삭제. 고른 칩의 제목·그래프·지우기만.
- `GROUP_LABEL`·`glanceOf*`·`relativeDayCopy` 등 근황 API 삭제.

### 핵심 경로

- `src/training/StatsScreen.tsx`
- `src/training/statsFeed.ts`

### 단정 금지

- `미검증`: 칩만으로 다른 종목 찾기.

---

## 인계 — 2026-08-26 02:35

새 채팅 AI용. **이번 세션 = 문장 듣기 미리보기·고르기 확대 수치 상향.**

### 한 일

- scale 1.2→1.4 (`PREVIEW_FIGURE_SCALE`, `CHOICE_FIGURE_SCALE`).
- 미리보기 높이 88→100, 고르기 높이 160→180. 가로 3칸 유지.

### 핵심 경로

- `src/training/sentClosed/SentClosedSessionScreen.tsx`

### 단정 금지

- `미검증`: 1.4 잘림, 작은 폰 고르기 스크롤.

---
## 인계 — 2026-08-26 02:31

새 채팅 AI용. **이번 세션 = 문장 듣기 고르기 3칸 인물 확대(가로 3칸 유지).**

### 한 일

- `ChoiceCell`: 클립 + `CHOICE_FIGURE_SCALE` 1.2, 이미지 높이 160, padding 제거.
- `PREVIEW_FIGURE_SCALE`는 사용자가 둔 1.2 유지.

### 핵심 경로

- `src/training/sentClosed/SentClosedSessionScreen.tsx` — `CHOICE_FIGURE_SCALE`

### 단정 금지

- `미검증`: 작은 폰에서 스크롤 여부. 실기기 우산·발 잘림.

---
## 인계 — 2026-08-26 02:21

새 채팅 AI용. **이번 세션 = 문장 듣기 idle 3x3 인물 확대.**

### 한 일

- `SentClosedSessionScreen` `PreviewCell`: 클립 + scale 1.65. 에셋 파일은 안 자름.
- 고르기 칸(`ChoiceCell`)은 그대로 `contain`.

### 핵심 경로

- `src/training/sentClosed/SentClosedSessionScreen.tsx` — `PREVIEW_FIGURE_SCALE`

### 단정 금지

- `미검증`: 실기기에서 우산·발 잘림. 배율은 상수만 바꾸면 됨.

---
## 인계 — 2026-08-26 00:08

새 채팅 AI용. **이번 세션 = `main`을 `doc_update`로 한 칸 되돌림. 잔가지는 그대로.**

### 한 일

- 사용자가 `main`은 `2b614d6`까지, 그 다음부터 `new-content`이길 원함. `bc0011a`(인계)가 `main`에 붙어 한 칸 밀려 있었음.
- 로컬·원격 `main`을 `2b614d6`으로 `reset` + `push --force-with-lease`. `bc0011a`는 `new-content`에만 남음.

### 핵심 경로

- `main` / `origin/main` = `2b614d6` (`doc_update`)
- `new-content` / `origin/new-content` = `31fcc08`
- 분기점 = `2b614d6` → `bc0011a`부터 잔가지

### 단정 금지

- 없음. 성능 영향 없음.

---
## 인계 — 2026-08-25 23:56

새 채팅 AI용. **이번 세션 = `new-content`를 로컬 `main`(인계) 위에 rebase. 충돌은 `handoff4.md`만.**

### 한 일

- `git rebase main` 중 `문장추가이미지수정중`이 `docs/handoff4.md`에서 충돌. 23:36(git 되돌림) 블록을 위, 16:58(문장 듣기) 이하를 그 아래에 두고 해결.
- rebase 완료. 로컬 `new-content`: `bc0011a` → `e6fe98c`(계획안생성) → `fe09267`(문장추가이미지수정중).
- 커밋 해시가 바뀜. `origin/new-content`는 옛 해시. force-push 아직 안 함.
- `origin/main`은 여전히 옛 `계획안생성`(`b3cd71e`). `gimsansan` force-push 대기.

### 핵심 경로

- `docs/handoff4.md`
- 로컬 `main` = `bc0011a`
- 로컬 `new-content` = `fe09267`
- `origin/main` = `b3cd71e`
- `origin/new-content` = 옛 `ae7df58`(behind)

### 단정 금지

- `주의`: `new-content`는 `git push --force-with-lease origin new-content`. `main`은 `gimsansan`으로 `git push --force-with-lease origin main`. 둘 다 아직 원격 미반영.
- 성능 영향 없음.

---
## 인계 — 2026-08-25 23:36

새 채팅 AI용. **이번 세션 = 로컬 `main`만 `doc_update`로 되돌림. 원격 `origin/main`은 권한 없어 못 돌림.**

### 한 일

- `계획안생성`(`b3cd71e`)은 `main`이 아니라 `new-content` 작업으로 봄.
- 로컬 `main`을 `2b614d6`(`doc_update`)로 `reset --hard`.
- `origin/main` force-push 시도 → **403** (`gimsansan/mmn-amp1`에 `kss25746-cpu` 쓰기 권한 없음). 원격은 아직 `b3cd71e`.
- `나중계획안.md`는 `origin/new-content`(`ae7df58`)에 남아 있음.

### 핵심 경로

- 로컬 `main` = `2b614d6`
- `origin/main` = `b3cd71e` (미변경)
- `origin/new-content` = `ae7df58`

### 단정 금지

- `주의`: 지금 `git pull` 하면 로컬 `main`이 다시 `계획안생성`으로 올라감. 원격은 `gimsansan` 계정으로 `git push --force-with-lease origin main` 필요.
- 성능 영향 없음.

---
## 인계 — 2026-08-26 13:00

새 채팅 AI용. **기록 줄 길이 200자 규칙 확정.** 앞 12:55 블록의 미결정을 닫음. 코드 변경 0.

### 한 일

- `.cursor/rules/android-dev-client.mdc` 기록 원칙 아래 「줄 길이」 한 줄 — `impl-log_2.md`·`handoff4.md`는 **한 줄 200자 이내**.
- 표 한 칸에 문단 금지. 길면 **같은 칸 이름으로 행을 나눈다**.
- `impl-log_2.md` §기록 형식에 「줄 길이 (필수)」 절 신설 — 이유·사례·규칙 파일 위치.
- 사용자가 말한 「`impl-log_1.md` §기록 형식」은 그 파일이 직전에 닫혔으므로 `impl-log_2.md`에 적용.

### 핵심 경로

- `.cursor/rules/android-dev-client.mdc` · `docs/impl-log_2.md`

### 단정 금지

- `추정`: 200자는 편의 기준. 측정으로 나온 최적값이 아니다.
- `주의`: 과거 파일(`impl-log_1.md` 등)의 긴 줄은 고치지 않았다. 누적형 원칙.
- 앞 12:55·12:45 블록의 미결정 2건은 **모두 해소**됐다.

---
## 인계 — 2026-08-26 12:55

새 채팅 AI용. **impl-log 정본이 `impl-log_2.md`로 바뀜.** 코드 변경 0.

### 한 일

- `docs/impl-log_2.md` 신설 = **현재 정본**. `impl-log_1.md`는 「과거 2」로 닫음(2026-08-26 12:45까지). 로그 내용은 복사하지 않음.
- 이유: `impl-log_1.md` 126.6 KB로 닫힌 `impl-log.md`(135.3 KB)와 거의 같아짐. `Read` 비용이 파일 크기에 비례.
- 규칙 파일 3곳 갱신 — 기록 대상이 `impl-log_2.md`. 금지 목록에 `impl-log_1.md` 추가.
- 갱신형 문서 6개 포인터 수정: 루트 `README.md`, `docs/README.md`, `dev-client-setup-context.md`, `amp-mdt-training-design.md`, `improvement-backlog.md`, `fix-reviews.md`.
- 기록 형식 템플릿에 「한 칸이 길면 같은 칸 이름으로 행을 나눠라」 안내 한 줄. **강제 규칙은 아님.**

### 핵심 경로

- `docs/impl-log_2.md`(신) · `docs/impl-log_1.md`(닫음) · `.cursor/rules/android-dev-client.mdc`

### 단정 금지

- `주의`: 새 항목은 **`impl-log_2.md`에만**. `impl-log_1.md`·`impl-log.md`는 추가 금지.
- 과거 누적형 문서(`handoff2/3`, `impl-log.md`, `fix-reviews` 블록 안)의 `impl-log_1` 언급은 **그때 기록이라 고치지 않았다**.
- **미결정 1건** — 규칙 파일·템플릿에 「한 줄 200자」를 강제로 넣을지. 사용자가 이번엔 로테이션만 지시.

---
## 인계 — 2026-08-26 12:45

새 채팅 AI용. **토큰 비용 가이드 신설. 코드 변경 0.** 앞 11:20 블록(링 6 음원 교체)이 이번 세션의 코드 작업.

### 한 일

- `docs/ask-token-budget.md` 신설. `ask-*` 계열(⑥ 읽기·질문). 앱 런타임 성능 문서와 분리.
- 실측 근거: 앞 세션 최대 소비는 `node_modules` 타입 정의 **691줄 전체 읽기**. 테스트 실행은 저렴(출력을 잘라 받음).
- 문서 크기 실측을 문서에 박음. `impl-log_1.md` 127 KB, 최장 줄 **1298자**(표 한 칸에 문단).
- `docs/README.md` 4곳에 등록. impl-log 항목을 **짧은 줄**로 작성해 새 형식 시연.

### 핵심 경로

- `docs/ask-token-budget.md`(신) · `docs/README.md` · `docs/impl-log_1.md`

### 단정 금지

- `추정`: 비용 순위는 줄 수·바이트 기준. 과금 토큰 계측 아님.
- `미검증`: 프롬프트 캐시 효과. 크면 「세션 길이」 항목의 무게가 줄어든다.
- **미결정 2건** — 규칙 파일·impl-log 템플릿에 「한 줄 200자」를 넣을지, `impl-log_2.md`로 넘길지. 사용자가 장단점만 물어본 상태로 결정 안 함.

---
## 인계 — 2026-08-26 11:20

새 채팅 AI용. **링 6 자극을 합성에서 녹음 wav 재생으로 교체.** 구 `ling6Synth.ts` 삭제.

### 한 일

- `playLing6Target`을 `expo-audio` 파일 재생으로. 구조는 `sentClosed/play.ts`와 같음. `LING6_DURATION_SEC` 0.8→1.0이고 **무음 시행도 같은 1.0초** — 다르면 길이만으로 「못 들었어요」가 골라짐.
- `scripts/prep-ling6-wav.mjs`가 원본을 모노·1.0초·RMS -20 dBFS로 맞춰 `assets/ling6/001~006.wav` 생성. 44.1 kHz 유지(리샘플 안 함). ffmpeg 없어서 Node로 16bit PCM 직접 다룸.
- 첫 시행 뜸 700 ms + 「곧 들어요…」. 단어·문장 듣기와 같은 방식.
- `sounds.ts`에 `audio` + `ling6SoundOf()`. `ling6Synth.ts`(324줄) 삭제.
- 한국어 TTS 임시안은 **폐기** — 「스」·「쉬」·「음」에 모음이 붙어 고립 마찰음·비음이 안 되고, Heami는 22050 Hz라 `/s/` 고역이 잘림.

### 핵심 경로

- `src/training/ling6/ling6Play.ts`(신) · `__tests__/ling6Play.test.ts`(신) · `sounds.ts` · `Ling6SessionScreen.tsx`
- `scripts/prep-ling6-wav.mjs`(신) · `assets/ling6/001~006.wav`(신)

### 단정 금지

- `주의`: 현 음원은 lingsixsoundscheck.com에서 받은 **개인 확인용** 임시본. 배포 전 직접 녹음 필요(라이선스 미확인). 원본 `{mm,oo,ah,ee,sh,s}.wav`는 재가공용으로 남겨 둠(참조 0).
- `미검증`: 실기기 청취. `/s`·`ʃ`·`m` 식별, 무음이 길이로 티나는지, 중지 경로가 `pause()` 뒤 상태 갱신으로 resolve되는지(문장 듣기 기존 패턴).
- `추정`: RMS 정규화는 스펙트럼이 다른 여섯 소리의 체감 크기를 완전히 맞추지 못함. 구 합성의 `/m/` 0.7 감쇠는 옮기지 않음.
- 확인: `tsc` 통과, `jest` 250 통과, `expo lint` 오류 0. **리빌드 불필요.**

---
## 인계 — 2026-08-25 16:58

새 채팅 AI용. **문장 듣기 기록 v1 걷어냄 + 통계 문서 맞춤.** 아래 14:51 블록(「% 없음」「18개 연습」)은 그때 기록. 고치지 않음.

### 한 일

- 저장 요약은 맞힌 수·비율 필수(`SentClosedSummary`). v1·반쪽은 `list`에서만 빠짐. 다음 `append`가 걸러진 목록을 덮어씀. 키·`schemaVersion` 2 유지.
- 통계 행·근황은 한 글자와 같이 `n/18 · %`. `hasSentClosedPercent`·`missingTrendCopy` 삭제. 세션 끝 문구는 그대로 「문장 18개를 들었어요」(`sentClosedResultCopy`).
- `training-stats-recommendation.md`에 문장 듣기 탭·`kind=sent`·칩 7·그룹 5·저장소 5 반영.

### 핵심 경로

- `src/training/sentClosed/store.ts` · `SentClosedProgressPanel.tsx` · `statsFeed.ts` · `__tests__/store.test.ts`
- `docs/training-stats-recommendation.md`

### 단정 금지

- `미검증`: 실기기에 남은 v1 키가 있으면 목록에서 안 보이다가, 새 18회 저장 때 디스크에서 빠짐. 리빌드 불필요.

---
## 인계 — 2026-08-25 16:41

새 채팅 AI용. **문장 듣기 store 테스트 보강.** `store.ts`는 사용자 정리본 유지.

### 한 일

- append 뒤에도 v1(들은 횟수만)이 남는지, 맞힌 수/비율 한쪽만 있으면 목록에서 버리는지 테스트 추가. 8 passed.
- `store.ts` 로직은 변경 없음.

### 핵심 경로

- `src/training/sentClosed/__tests__/store.test.ts`

### 단정 금지

- `미검증`: 실기기 v1 기록 유무. 리빌드 불필요.

---
## 인계 — 2026-08-25 14:51

새 채팅 AI용. **문장 듣기 Closed 3-AFC 1차 구현.**

### 한 일

- 하단 5탭. 맨 오른쪽 **문장 듣기** (`src/app/sent.tsx`, Trigger `sent`).
- 장면 9 = 그림 `assets/9_img/` + 임시 TTS `assets/9_sent/*.wav`(Heami, 모노 22kHz). 문장 해요체 고정.
- 문항 18 = A형(같은 사람 3장) + B형(같은 행동 3장). 음원 9개 재사용. 칸 위치는 세션마다 섞음.
- 듣기 → 그림 3장 탭 → 맞았어요/아쉬워요. 요약은 「18개 들었어요」. % 없음. 18개 완료만 `training.sentClosedSessions.v1`에 저장(50상한).
- 통계 `kind=sent` / 그룹 `sent`. 근황 「18개 연습」.

### 핵심 경로

- `src/training/sentClosed/scenes.ts` · `trials.ts` · `play.ts` · `store.ts` · `SentClosedSessionScreen.tsx`
- `src/components/app-tabs.tsx` · `src/app/sent.tsx`
- `src/training/statsFeed.ts` · `StatsScreen.tsx`
- `scripts/gen-sent-closed-tts.ps1` · `scripts/sent-closed-tts.json`

### 단정 금지

- `주의`: wav는 **임시 TTS**. 사람 녹음으로 갈 것. `playSentClosedScene`은 파일만 갈아끼우면 됨.
- `미검증`: 실기기 5탭·재생·이미지 픽셀 내용.
- 리빌드 불필요(JS+에셋. `expo-audio` 기존 의존성).

---
## 인계 — 2026-08-21 11:08

새 채팅 AI용. **이번 세션 = 문서만. 학습 노트 3개 + docs 지도 정정. 코드 변경 0.**

### 한 일

- 학습 노트 3개 신설. 앞 세션 코드 수정의 **사후 설명**이지 새 결정이 아님.
  - `as-const-리터럴타입-노트.md`: `theme.ts` `as const` → 리터럴 타입. `useTheme(): Record<ThemeColor, string>`로 넓힌 이유(`keyof`는 영향 없어 `themeColor` 자동완성 유지).
  - `animated-value-초기화-노트.md`: `useRef(new Animated.Value()).current` 폐기 → 지연 초기화 `useState`. 인자는 매 렌더 계산됨 + 렌더 중 ref 접근 둘 다 해결. `useMemo`는 캐시를 버릴 수 있어 부적합. 3곳(`equalizer.tsx:34`, `WrsBingoScreen.tsx:478·629`).
  - `ref-vs-state-노트.md`: 렌더에서 ref를 읽으면 화면이 밀림. `WrsTwoCharScreen`은 옆줄 `setPhase`가 우연히 재렌더를 일으켜 맞아 보였을 뿐. `PitchCompareScreen:513`은 진행 중 `mode`와 `runModeRef.current`가 같아 분기 자체가 불필요했음. 짝 패턴은 `WrsBingoScreen` `markedRef`+`marked`(53·59행).
- `testing-guide.md` **손대지 않음** — jest CSS 매퍼·devDeps가 이미 적혀 있었음. `npx jest` 실측 **216 passed / 22 suites**로 문서 수치 확인.
- `docs/README.md`: **⑦ 학습 노트** 카테고리 신설(정본 표·결정표·파일 목록·§5 신뢰도 표). 결정표에 남용 방지 조건 — 「여러 파일에서 반복될 때만, 한 곳뿐이면 코드 주석」.
- 같은 파일에서 **인계 정본을 `handoff4.md`로** 바로잡음(표기가 `handoff.md`로 남아 있었음). 원칙 5 추가: 번호는 **이어붙임이지 사본이 아님** — 분량이 많아지면 넘기고 옛 파일을 얼린다(사용자 규칙, 줄 수 기준 없음). 폐지된 `handoff-YYYY-MM-DD.md` 날짜 사본과 다름.
- `handoff.md`·`handoff2.md`·`handoff3.md` 머리말에 「**읽을 때**: 그때의 기록이라 지금과 다를 수 있고 그래도 고치지 않는다」 한 줄. 블록은 안 건드림.

### 핵심 경로

- `docs/as-const-리터럴타입-노트.md`
- `docs/animated-value-초기화-노트.md`
- `docs/ref-vs-state-노트.md`
- `docs/README.md`
- `docs/handoff.md` · `handoff2.md` · `handoff3.md`(머리말만)

### 단정 금지

- `주의`: 워킹트리에 **앞 세션 코드 변경분이 커밋 안 된 채** 남아 있음(`git status` 수정 17 + 신규 테스트·`WrsVoiceGuideScreen`). 이번 세션이 더한 것은 문서뿐.
- 리빌드·`npm install` 불필요(문서만). `추정` 아님 — 코드 변경 0.
- `미검증`: 없음. 노트에 적힌 동작 근거는 앞 세션 수정과 `npx jest` 실측에서 옴.

---

## 인계 — 2026-08-21 08:39

새 채팅 AI용. **이번 세션 = 단어 통계 표 + 음고 지우기 안내 삭제. 키 합치기는 뒤.**

### 한 일

- `training-stats-recommendation.md` §4: 한 글자·두 글자 표시 표(공통 `WrsProgressPanel`·높을수록·청력 검사 아님·25/12·2회+·목록 8·저장 50·키 분리). impl-log_1 `16:47`.
- `SessionHistoryScreen`: 「연습별로 기록을 지워요」 삭제. 버튼 라벨만. impl-log_1 `17:06`. 하단 3칸 재배치는 중단.
- 표시 뼈대 완전 통일·저장 키 합치기·문항 로그는 **뒤**. 키 합치기 ≠ 한눈에 보기(그건 홈 요약 화면).
- `git fetch` 후 `origin/feat_wrs` 맞춤. HEAD `eb5e640` 문서업댓. 인계 정본은 **`docs/handoff4.md`**.

### 핵심 경로

- `docs/training-stats-recommendation.md`
- `src/training/SessionHistoryScreen.tsx`
- `docs/handoff4.md`

### 단정 금지

- `미검증`: 실기기 통계 UX.
- `추정`: **리빌드 불필요**(JS·문서).

---

## 인계 — 2026-08-21 02:31

새 채팅 AI용. **이번 세션 = 뒤로 버튼 라벨 통일.**

### 한 일

- 통계 `돌아가기`, 듣기 준비 `뒤로가기` → **「뒤로 가기」**. 동작 변경 없음.

### 핵심 경로

- `src/training/TabStatsScreen.tsx`
- `src/training/SessionHistoryScreen.tsx`
- `src/training/ListeningCheckScreen.tsx`

### 단정 금지

- 없음

## 인계 — 2026-08-21 02:23

새 채팅 AI용. **이번 세션 = 소리 높낮이·단어 듣기 시작 단계 축소.**

### 한 일

- 소리 높낮이: 카드 → 듣기 준비(「소리 들어보기」+ 귀풀기/연습) → **바로 세션**. idle「연습 시작」생략. 떨림 `autoStart`와 같음.
- 단어 듣기: 한/두 글자 카드 → **바로 시작**. 빙고는 목록 3번째 카드(한 글자 헤더 버튼 제거). 빙고 idle은 난이도 선택 때문에 유지. 「맞히기로」→「뒤로 가기」.
- 링 6·떨림 탭은 안 건드림. 기준음 3단 UI는 이전 합의대로 안 넣음.

### 핵심 경로

- `src/training/pta/PtaSessionScreen.tsx`
- `src/training/pitch2afc/PitchCompareScreen.tsx`
- `src/training/freq/FreqSessionScreen.tsx`
- `src/training/ListeningCheckScreen.tsx`
- `src/training/wrs/WrsTabScreen.tsx`
- `src/training/wrs/WrsSessionScreen.tsx`

### 단정 금지

- `미검증`: 실기기에서 듣기 준비 통과 → 바로 자극, 단어 카드 → 바로 TTS.
- `추정`: 리빌드 불필요(JS만).
- `주의`: 빙고는 목록에서 들어가도 난이도 idle이 남음.

## 인계 — 2026-08-21 02:08

새 채팅 AI용. **이번 세션 = `feat_wrs` 전환 + 높낮이 계단 설명(코드 없음).**

### 한 일

- `git fetch` 후 `git switch feat_wrs`(로컬 추적 `origin/feat_wrs`). 이전 작업 브랜치는 `modi_tabs`.
- 번들 실패: `wrsTts.ts` → `expo-speech`. `package.json`에는 있고 `node_modules`에는 없음 → `npm install` + **dev client 리빌드**.
- 높낮이 비교 Ask 정리(화면 주파수 고르기 **이 레포에 한 번도 없음**. HH 프리셋은 병합 때 안 옮김. `2b2b691` 설정 탭도 프리셋 없음 → `37f6412` 설정 탭 삭제).
- 엔진: 기준 **440Hz** · 시작 간격 **200cent**(50은 첫 스텝) · 2-down-1-up · 스텝 반전 0–1:**50** / 2–3:**20** / 4+:**10** · 연습 종료 반전 **6** · 귀풀기는 한도 없음(칸은 같이 줄어듦) · 반전=방향 전환(시작부터 연속 오답은 반전 0) · 평균 시 앞 반전 2개 버림.
- ±300cent면 B음 약 **370–523Hz**. 클램프 200–2000에 안 걸림. 로그는 `__DEV__`+잘릴 때만. 3단 기준음을 넣어도 세션당 좁은 점. 회화 대역을 덮지 않음.
- 기준음 3단 UI: **지금은 안 넣기로.** 클램프는 녹음 대비가 아니라 나중에 기준음을 낮/높게 둘 때 안전망.

### 핵심 경로

- `src/training/pitch2afc/StaircaseEngine.ts`
- `src/training/pitch2afc/constants.ts`
- `src/training/pitch2afc/PitchCompareScreen.tsx`
- `src/training/sessionMode.ts`
- `src/training/wrs/wrsTts.ts`

### 단정 금지

- `미검증`: `npm install`·리빌드 후 단어인지도 TTS 실기기.
- `관례`: 말소리 대역 숫자(250–4000 vs 250–8000 vs 전화 300–3400).
- `주의`: 맞힌 간격·반전 평균 ≠ 청력 역치.
- `추정`: 리빌드는 **expo-speech 설치 시에만**. 이번 Ask 정리만이면 JS 리빌드 불필요.
