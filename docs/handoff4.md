# 인계4

> **정본**: 이 파일. 최신 블록을 **맨 위**에 추가. `docs/handoff.md`·`handoff2.md`·`handoff3.md`에는 넣지 않음.  
> 사용자(2026-08-21 02:08): 이후 인계는 여기. `handoff3.md`는 과거.  
> 사용자(2026-08-19 01:09): 블록에 **`### 합의` / `### 안 한 일` / `### 다음` 넣지 않음.**

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
