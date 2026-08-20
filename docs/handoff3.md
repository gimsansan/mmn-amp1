# 인계3

> **정본**: 이 파일. 최신 블록을 **맨 위**에 추가. `docs/handoff.md`·`docs/handoff2.md`에는 넣지 않음.  
> 사용자(2026-08-19 12:59): 이후 인계는 여기. `handoff2.md`는 과거.  
> 사용자(2026-08-19 01:09): 블록에 **`### 합의` / `### 안 한 일` / `### 다음` 넣지 않음.**

## 인계 — 2026-08-20 16:41

새 채팅 AI용. **이번 세션 = 음고·떨림 통계 하단을 한 줄로.**

### 한 일

- `SessionHistoryScreen`: 돌아가기 왼쪽, 지우기 오른쪽. 같은 높이(`alignItems: flex-end`). 그래프 위 단독 행 제거. impl-log_1 `16:41`.
- 링6·단어 `TabStatsScreen` 하단은 그대로.

### 핵심 경로

- `src/training/SessionHistoryScreen.tsx`

### 단정 금지

- `미검증`: 실기기에서 음고 지우기 2개인 줄.
- `추정`: **리빌드 불필요**(JS만).

---

## 인계 — 2026-08-20 16:33

새 채팅 AI용. **이번 세션 = 링6·단어 추이에 「높을수록」.**

### 한 일

- 선 있을 때 「높을수록 더 많이 맞춤」. 링6 1일이면 숨김. 단어는 「청력 검사가 아니에요」 유지.
- 축 반전 없음. 한 글자·두 글자 공통 `WrsProgressPanel`. impl-log_1 `16:33`.

### 핵심 경로

- `src/training/ling6/Ling6ProgressPanel.tsx`
- `src/training/wrs/WrsProgressPanel.tsx`
- `docs/training-stats-recommendation.md`

### 단정 금지

- `주의`: 맞힌 개수·% ≠ 청력.
- `미검증`: 실기기 읽는 법 UX.
- `추정`: **리빌드 불필요**(JS만).

---

## 인계 — 2026-08-20 16:30

새 채팅 AI용. **이번 세션 = 음고·떨림 귀풀기 미저장. 연습만 트랙별 50.**

### 한 일

- 귀풀기 종료는 이번 결과 카드만. `append` 안 함. 「기기에 기록했어요」 없음.
- `MAX_PRACTICE_SESSIONS`(합 30) 삭제. `capByMode`는 연습(측정)만 트랙별 50.
- 기존 기기의 귀풀기 구기록은 다음 연습 저장 때 버림. impl-log_1 `16:30`.

### 핵심 경로

- `src/training/sessionStore.ts`
- `AmSessionScreen.tsx` · `FreqSessionScreen.tsx` · `PitchCompareScreen.tsx`
- `docs/training-stats-recommendation.md`

### 단정 금지

- `주의`: 읽기만으로는 구기록 안 지워짐.
- `미검증`: 실기기 귀풀기 종료 UX.
- `추정`: **리빌드 불필요**(JS만).

---

## 인계 — 2026-08-20 16:18

새 채팅 AI용. **이번 세션 = 링6 약점 1줄 + 음고·떨림 추이 읽는 법.**

### 한 일

- 링6 통계: 50일 격자 화면 제거(저장 50 유지). 약점=실기록 7건부터, 최근 7건 중 4회 이상만 색+문구. 추이선=전체. impl-log_1 `15:42`.
- 음고·떨림 추이: 제목 「음높이 차이 변화」. `처음→최근` 아래 작을수록 + 출발·범위(200·10~300 / 0·0~-30). 출발은 `TrendChart` 점선만(가짜 점 아님). impl-log_1 `16:16`.
- `SummaryCard`는 세션 끝(귀풀기·연습) 유지. 통계 목록·그래프 입력 아님. `SummaryCardHeader`는 호출부 없음.
- `WrsProgressPanel` L106 `records[records.length - 1]`는 Sonar 스타일 경고만. `.at(-1)` 미적용.

### 핵심 경로

- `src/training/ling6/ling6Session.ts` · `Ling6ProgressPanel.tsx`
- `src/training/SessionHistoryScreen.tsx` · `TrendChart.tsx`
- `docs/training-stats-recommendation.md`

### 단정 금지

- `주의`: 아쉬움 횟수·숫자 하락 ≠ 청력. 출발 200은 연습 시작값.
- `미검증`: 실기기 약점·추이 UX.
- `추정`: **리빌드 불필요**(JS만).

---

## 인계 — 2026-08-20 16:16

새 채팅 AI용. **이번 세션 = 음고·떨림 추이 읽는 법. 출발은 기준선만.**

### 한 일

- 제목 「들을 수 있는 최소 차이 변화」→「음높이 차이 변화」. 하단 작은 캡션 제거.
- `처음 293 → 최근 248` 바로 아래 「작을수록 더 비슷한 소리」+「매 연습은 200에서 시작 · 대략 10~300」.
- `TrendChart` 출발 점선(세션 점 아님, y범위에만 포함). 떨림은 0·0~-30 같은 패턴. impl-log_1 `16:16`.
- 개선/유지 배지·축 반전·가짜 점 없음. 링6은 안 건드림.

### 핵심 경로

- `src/training/SessionHistoryScreen.tsx`
- `src/training/TrendChart.tsx`
- `docs/training-stats-recommendation.md`

### 단정 금지

- `주의`: 숫자 하락 ≠ 청력. 출발 200은 연습 시작값이지 역치 아님.
- `미검증`: 실기기 읽는 법 UX.
- `추정`: **리빌드 불필요**(JS만).

---

## 인계 — 2026-08-20 15:42

새 채팅 AI용. **이번 세션 = 링6 통계 격자 제거 + 약점 1줄. 추이선 유지.**

### 한 일

- 통계에서 50일 P/F 격자 제거. 저장 50·하루 1건 upsert는 그대로.
- 약점: 실기록 7건부터. 최근 7건 중 4회 이상 아쉬운 음소만 색+문구(고정 순서 `/m/→/u/→/a/→/i/→/ʃ/→/s/`, 높이=아쉬움 횟수). 없으면 전부 회색·문구 없음. 격차·2위 없음.
- 맞힌 개수 선: 남은 점 전부. 자르기·스크롤 없음. impl-log_1 `15:42`.
- 측정 화면·저장 키 통합·음고/떨림 통계는 안 건드림.

### 핵심 경로

- `src/training/ling6/ling6Session.ts` · `Ling6ProgressPanel.tsx`
- `src/training/ling6/__tests__/ling6Session.test.ts`
- `docs/training-stats-recommendation.md`

### 단정 금지

- `주의`: 아쉬움 횟수 ≠ 청력. 청력·손상·검사 문구 금지.
- `미검증`: 실기기 약점 UX.
- `추정`: **리빌드 불필요**(JS만).

---

## 인계 — 2026-08-20 15:22

새 채팅 AI용. **이번 세션 = 음고·떨림 통계 카드 제거 + 종료 문구 공용화. 링6 약점은 합의만.**

### 한 일

- `SessionHistoryScreen`: 회차별 결과 카드·한 회 삭제 없음. 누적·선·트랙 지우기만. 저장 유지. 이번 결과 카드는 세션 화면. impl-log_1 `15:21`.
- `PitchCompareScreen` 로컬 `endReasonLabel` 삭제. `freqSession`만. 떨림은 재수출. `PitchCompareEndReason` = `SessionEndReason`. impl-log_1 `15:10`.
- 링6 약점 **코드 없음**. 합의: 격자 50일 안 씀. 음소 이름 색 + 맞힌 개수 선(0~6, 저장 50·선도 전체). 규칙 = **실기록 7건부터**, 최근 7건 중 **4회 이상 틀린 음소만** 강조(상한 없음, 없으면 전부 회색·문구 없음). 격차·2위 비교 없음. 청력 판정 문구 금지.

### 핵심 경로

- `src/training/SessionHistoryScreen.tsx`
- `src/training/pitch2afc/PitchCompareScreen.tsx` · `pitchSummary.ts`
- `src/training/freq/freqSession.ts`
- `docs/training-stats-recommendation.md`

### 단정 금지

- `주의`: 한 회 지우기 없음. 아쉬움 횟수 ≠ 청력. % ≠ 청력 향상.
- `미검증`: 실기기 통계·약점 UX.
- `추정`: **리빌드 불필요**(JS만). 50·300건 요약은 부하 아님.

---

## 인계 — 2026-08-20 15:21

새 채팅 AI용. **이번 세션 = 음고·떨림 통계에서 회차별 결과 카드 제거.**

### 한 일

- `SessionHistoryScreen`: 회차 `SummaryCard`·한 회 삭제 없음. 누적·선·트랙 지우기만. 저장은 유지.
- 요약의 이번 결과 카드는 세션 화면에 그대로. impl-log_1 `15:21`.
- 링6 약점 안내(7건·4회)는 **대화만**. 코드 없음.

### 핵심 경로

- `src/training/SessionHistoryScreen.tsx`
- `docs/training-stats-recommendation.md`

### 단정 금지

- `주의`: 한 회만 지우기는 없음.
- `미검증`: 실기기 통계 UX.
- `추정`: **리빌드 불필요**(JS만).

---

## 인계 — 2026-08-20 15:10

새 채팅 AI용. **이번 세션 = 높낮이 비교 종료 문구를 `freqSession.endReasonLabel`로.**

### 한 일

- `PitchCompareScreen` 로컬 `endReasonLabel` 삭제. 다른 음·떨림과 같은 함수.
- `PitchCompareEndReason` = `SessionEndReason` 별칭. impl-log_1 `15:10`.
- 링6 약점 안내(7건·4회·격자 제거)는 **대화만**. 코드 없음.

### 핵심 경로

- `src/training/pitch2afc/PitchCompareScreen.tsx`
- `src/training/pitch2afc/pitchSummary.ts`
- `src/training/freq/freqSession.ts`

### 단정 금지

- `추정`: **리빌드 불필요**(JS만).
- `미검증`: 요약 문구 실기기.

---

## 인계 — 2026-08-20 13:38

새 채팅 AI용. **이번 세션 = 통계 §5 화면 + 입구 통일. 저장 키 안 합침.**

### 한 일

- `SessionHistoryScreen`: `clearTracks`가 목록·그래프·평균에도. 떨림 → `am`만. 음고 → `pitch2`·`freq`(칩은 이 화면만).
- `Ling6ProgressPanel`: `ensureTwoDays` 제거. 1일 → 「내일 또 하면 선이 생겨요」. 0일 → 패널 숨김.
- 링6·한 글자·두 글자: idle/요약에서 차트·목록 제거. `StatsEntryButton` → `TabStatsScreen`. 요약의 이번 결과 카드·링6 0일 미리보기 칸 유지. 빙고 통계 없음.
- 기록은 안 지움. 표시 뼈대 완전 통일·키 통합 **안 함**. impl-log_1 `12:59`·`13:37`.

### 핵심 경로

- `src/training/SessionHistoryScreen.tsx`
- `src/training/TabStatsScreen.tsx`
- `src/training/ling6/Ling6ProgressPanel.tsx` · `Ling6SessionScreen.tsx`
- `src/training/wrs/WrsSessionScreen.tsx` · `WrsTwoCharScreen.tsx`
- `docs/training-stats-recommendation.md`

### 단정 금지

- `주의`: 음고 탭 평균은 pitch2+freq. % ≠ 청력 향상.
- `미검증`: 실기기 통계 UX.
- `추정`: **리빌드 불필요**(JS만).

---

## 인계 — 2026-08-20 13:37

새 채팅 AI용. **이번 세션 = 링6·단어 통계 입구를 헤더 차트로.**

### 한 일

- `TabStatsScreen`. 링6·한 글자·두 글자: idle/요약에서 차트·목록 제거. `StatsEntryButton` → 패널·지우기. 요약의 이번 결과 카드는 유지. 링6 기록 0일 미리보기 칸 유지.
- 음고·떨림 입구는 원래 헤더 버튼. 빙고 통계 없음. impl-log_1 `13:37`.

### 핵심 경로

- `src/training/TabStatsScreen.tsx`
- `src/training/ling6/Ling6SessionScreen.tsx`
- `src/training/wrs/WrsSessionScreen.tsx` · `WrsTwoCharScreen.tsx`

### 단정 금지

- `미검증`: 실기기 헤더 버튼 UX.
- `추정`: **리빌드 불필요**(JS만).

---

## 인계 — 2026-08-20 12:59

새 채팅 AI용. **이번 세션 = 통계 §5 화면 수정. 저장 키 안 합침.**

### 한 일

- `SessionHistoryScreen`: `clearTracks`가 목록·그래프·평균에도. 떨림 → `am`만. 음고 → `pitch2`·`freq`(칩은 이 화면만). 3트랙 합친 정답률 없음.
- `Ling6ProgressPanel`: `ensureTwoDays` 제거. 실기록만. 1일 → 「내일 또 하면 선이 생겨요」. 0일 → 패널 숨김(idle 미리보기 칸은 유지).
- 표시 템플릿·키 통합 **안 함**. impl-log_1 `12:59`.

### 핵심 경로

- `src/training/SessionHistoryScreen.tsx`
- `src/training/ling6/Ling6ProgressPanel.tsx`
- `docs/training-stats-recommendation.md` (§5 1·2 적용)

### 단정 금지

- `주의`: 음고 탭 평균은 pitch2+freq(그 탭). % ≠ 청력 향상.
- `미검증`: 실기기 통계 UX.
- `추정`: **리빌드 불필요**(JS만).

---

## 인계 — 2026-08-20 11:20

새 채팅 AI용. **이번 세션 = 탭 통계 추천 문서 + 질문 요령 문서. 통계 코드 없음.**

### 한 일

- `docs/training-stats-recommendation.md`. 범용 봉투 + `kind`만 꺼내기 + 없는 칸 안 그림. 음고·떨림 같은 상자 OK. `SessionHistoryScreen`이 3트랙 전부 펼침이 어긋남. 음고 칩은 음고 통계만. 떨림에서 열면 떨림만. 링6 가짜 점·합친 정답률 하지 말 것. 키 통합은 뒤.
- `docs/ask-app-behavior.md` 이 앱 질문 요령. `docs/ask-file-behavior.md` React 등 범용(별 파일). 사용자: 질문 요령은 앱 설계 인계 대상 아님. 이번은 「인계문 작성해」로 세션 기록.
- 통계 화면·스토어 **미변경**. impl-log_1 `09:06`(통계 문서).

### 핵심 경로

- `docs/training-stats-recommendation.md`
- `docs/ask-file-behavior.md` · `docs/ask-app-behavior.md`
- `src/training/SessionHistoryScreen.tsx` (필터 없음)

### 단정 금지

- `주의`: %·반전 평균 ≠ 청력 향상. 4키 즉시 합치지 말 것.
- `미검증`: 실기기 통계 UX.
- `추정`: **리빌드 불필요**(문서만).

---

## 인계 — 2026-08-20 09:06

새 채팅 AI용. **이번 세션 = 탭 통계 수집·표시 추천 문서. 코드 없음.**

### 한 일

- `docs/training-stats-recommendation.md`. 밥상(범용 봉투) + 나온 것만 담기 + 그 탭 `kind`만 + 없는 칸 안 그림.
- 음고·떨림 **같은 상자 OK**. 어긋남 = `SessionHistoryScreen`이 3트랙 전부. 음고 칩은 음고 통계만. 떨림에서 열면 떨림만.
- 링6 가짜 점·합친 정답률 하지 말 것. 키 통합은 뒤. impl-log_1 `09:06`.

### 핵심 경로

- `docs/training-stats-recommendation.md`
- `src/training/SessionHistoryScreen.tsx` (필터 없음, 참고)
- `src/training/sessionStore.ts`

### 단정 금지

- `주의`: %·반전 평균 ≠ 청력 향상. 4키 즉시 합치지 말 것.
- `미검증`: 실기기 통계 UX.
- `추정`: **리빌드 불필요**(문서만).

---

## 인계 — 2026-08-19 16:57

새 채팅 AI용. **이번 세션 = 두 글자 12개 4지 세션(표·TTS).**

### 한 일

- 한 장 12. 4지=정답+상 대립+같은 장 정답 중 음절 안 겹치는 2. 3장 순환(완료 횟수 % 3).
- 표는 사용자 이미지. UI에 SRT·표준 검사 이름 없음. 한 글자 200개·빙고 그대로.
- 기록 `training.twoCharSessions.v1`. 12개 다 고른 세션만 저장. 차트는 한 글자와 같은 맞힌 %.
- impl-log_1 `16:57`. 테스트 9 통과.

### 핵심 경로

- `src/training/wrs/twoCharLists.ts`
- `src/training/wrs/twoCharSession.ts`
- `src/training/wrs/twoCharStore.ts`
- `src/training/wrs/WrsTwoCharScreen.tsx`

### 단정 금지

- `주의`: 안 비슷한 2 ≠ 원표 지정. 음절 겹침만. 두 글자 ≠ dB HL 역치.
- `미검증`: 실기기 TTS.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 16:40

새 채팅 AI용. **이번 세션 = 단어인지도 탭을 단어 듣기로 바꾸고, 안에 한 글자/두 글자.**

### 한 일

- 하단 탭 라벨 「단어 듣기」. 5번째 탭 없음.
- 소리 높낮이처럼 선택: 한 글자(기존 단음절·빙고) / 두 글자(자리만, 세션 없음).
- UI에 SRT·어음인지역치·단어인지도 안 씀. 안쪽 라우트는 `wrs` 유지.
- impl-log_1 `16:40`.

### 핵심 경로

- `src/training/wrs/WrsTabScreen.tsx`
- `src/training/wrs/WrsTwoCharScreen.tsx`
- `src/training/wrs/WrsSessionScreen.tsx`
- `src/components/app-tabs.tsx`

### 단정 금지

- `주의`: 두 글자 ≠ dB HL 역치. 표·4지선다 아직 없음.
- `미검증`: 실기기 라벨·선택 카드.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 16:25

새 채팅 AI용. **이번 세션 = SRT를 단어인지도형 이음절 % 훈련으로. 코드 없음.**

### 한 일

- SRT = dB HL 역치 아님. 단음절(WRS)과 별 트랙, 자극만 이음절, 숫자=맞힌 %.
- 차트: 오디오그램·PI-PB·SRT–PTA(±6~10dB)·비교 주파수 제외. 단어인지도와 같게 가로=회차, 세로=맞힌 %.
- 목록: 사용자 표 KSBWLA1·2·3, 장당 정답 12. 보기=정답1+표의 어려운 오답1+안 비슷한 2. 장 순환. UI에 KS-BWL-A 표준 검사라고 쓰지 않음.
- 단음절 200개(`wrsWords.ts`)는 앱이 씀. 주석은 KS-MWL과 같다고 보지 않음(개발자용). 단음절 탭 교체·문장표·전문가 모드(개방형·검사자 채점)·병원 숫자 입력 안 함.
- 한 회 12 vs 장 둘(24) 미정. 사용자: 6열 배치 — 열 수는 스크린샷에서 미확인.
- 구현·표 파일화·진입점 없음.

### 핵심 경로

- `src/training/wrs/WrsSessionScreen.tsx` · `wrsWords.ts` · `WrsProgressPanel.tsx` (참고. SRT 코드 없음)
- PTA 탭은 음고 2종. 순음 dB HL 오디오그램 없음.

### 단정 금지

- `주의`: 공식 KS 표 저작권·200개=KS-MWL 여부는 미확인. 이름만 안 붙인 것. 법률 검토 아님.
- `주의`: 맞힌 % ≠ 청력/인지도 향상.
- `미검증`: 12단어 세션 신뢰도. TTS·실기기.
- `추정`: 구현 시 **리빌드 불필요**(JS·TTS).

---

## 인계 — 2026-08-19 15:11

새 채팅 AI용. **이번 세션 = 빙고 진입 아이콘을 줄 완성으로.**

### 한 일

- `IconName` `grid` 제거. `bingoLine` 추가: 3×3, 가운데 가로 채움, 나머지 stroke·opacity 0.45.
- `BingoEntryButton`이 `bingoLine` 사용.
- impl-log_1 `15:11`.

### 핵심 경로

- `src/components/ui/icon.tsx`
- `src/components/ui/bingo-entry-button.tsx`

### 단정 금지

- `미검증`: 실기기 28px 가독성.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 15:04

새 채팅 AI용. **이번 세션 = 단어 빙고 요약·격자·다시 하기.** 아래가 현재 코드.

### 한 일

- 한 칸으로 여러 줄: `findBingoLines` / `bingoLineCells`. 문구 「두 줄이 이어졌어요」·모든 줄 accent.
- 줄 완성 → `finishRun`(「다음」 없음). 중간 맞힘만 피드백.
- 요약: 「다시 하기」=방금 난이도·새 9칸, secondary. 그 아래 비슷한 소리/쉬운 판/맞히기로.
- TTS `lastError`는 맞히거나 요약에서 지움. 요약에는 안 보임.
- 판: 바둑격자(외곽 2px·내부 선, 틈·라운드·그림자 없음). `width: "90%"`.
- `paddingBottom: BottomTabInset`. 사용자 실측 후 `- Spacing.two`는 되돌림.
- `Radius` import 제거. Metro가 옛 `Radius.large`를 물면 `r` 리로드. 파일에 `Radius` 없음.
- impl-log_1 `14:26`~`14:59`.

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`
- `src/training/wrs/wrsBingo.ts`

### 단정 금지

- `미검증`: 실기기 격자·짧은 세로(진행 중 판은 스크롤 없음, 버튼은 스크롤 밖 고정). TTS `onError` 원인 미수정.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 14:59

새 채팅 AI용. **이번 세션 = 빙고 판 바둑격자·너비 90%.**

### 한 일

- 칸 틈·라운드·그림자 제거. 외곽 2px + 내부 선. `width: "90%"`.
- `paddingBottom: BottomTabInset` 유지.
- impl-log_1 `14:59`.

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`

### 단정 금지

- `미검증`: 실기기 격자·글자 크기.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 14:49

새 채팅 AI용. **이번 세션 = 빙고 하단 `BottomTabInset`만.**

### 한 일

- `paddingBottom: BottomTabInset`. `- Spacing.four` 제거.
- impl-log_1 `14:49`.

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`

### 단정 금지

- `미검증`: 실기기 탭 간격. 이전(56)보다 위로.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 14:44

새 채팅 AI용. **이번 세션 = 빙고 버튼을 탭 쪽으로 조금.**

### 한 일

- `paddingBottom` `Spacing.two` → `Spacing.one`.
- impl-log_1 `14:44`.

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`

### 단정 금지

- `미검증`: 실기기 탭 겹침.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 14:42

새 채팅 AI용. **이번 세션 = 빙고 「다시 하기」를 흰 면으로.**

### 한 일

- 요약 「다시 하기」 `secondary`. 줄 칸 accent와 겹치지 않게.
- impl-log_1 `14:42`.

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`

### 단정 금지

- `미검증`: 실기기 대비.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 14:39

새 채팅 AI용. **이번 세션 = 빙고 요약에 「다시 하기」(방금 난이도·새 판).**

### 한 일

- `lastDifficulty`. 요약: 판 아래 primary 「다시 하기」, 그 아래 비슷한 소리/쉬운 판/맞히기로.
- idle는 세 버튼만. 같은 9칸 재사용 아님.
- impl-log_1 `14:39`.

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`

### 단정 금지

- `미검증`: 실기기 두 줄 버튼·탭 여백.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 14:32

새 채팅 AI용. **이번 세션 = 빙고 한 줄이면 「다음」 없이 바로 요약.**

### 한 일

- 줄 완성이면 `finishRun`. 피드백·「다음」 생략. 요약 판에 줄 색.
- impl-log_1 `14:32`.

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`

### 단정 금지

- `미검증`: 실기기 마지막 칸→요약 체감.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 14:29

새 채팅 AI용. **이번 세션 = 빙고 칸 색 변수 TS 오류.**

### 한 일

- `BingoCell` `backgroundColor`/`borderColor`/`textColor`를 `string`으로. `as const` 좁힘 해제.
- impl-log_1 `14:29`.

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`

### 단정 금지

- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 14:26

새 채팅 AI용. **이번 세션 = 빙고 동시 두 줄 문구·TTS 오류가 요약에 안 남게.**

### 한 일

- `findBingoLines` / `bingoLineCells`. 한 칸으로 두 줄이면 「두 줄이 이어졌어요」·모든 줄 accent.
- 맞히거나 `finishRun`에서 `lastError` 지움. 요약에는 TTS 문구 숨김.
- impl-log_1 `14:26`.

### 핵심 경로

- `src/training/wrs/wrsBingo.ts`
- `src/training/wrs/WrsBingoScreen.tsx`

### 단정 금지

- `미검증`: 실기기 두 줄 색·문구.
- `추정`: **리빌드 불필요.** TTS `onError` 원인 자체는 미수정.

---

## 인계 — 2026-08-19 14:19

새 채팅 AI용. **이번 세션 = 빙고 하단 버튼 한 줄, 탭에 가깝게.**

### 한 일

- idle·요약: 비슷한 소리 / 쉬운 판 / 맞히기로 가로 한 줄.
- `paddingBottom`을 `Spacing.two`로. 본문 공간 확보.
- impl-log_1 `14:19`.

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`

### 단정 금지

- `미검증`: 실기기 글자 잘림·탭 겹침.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 14:14

새 채팅 AI용. **이번 세션 = 빙고 한 줄 색을 진행 중에도.**

### 한 일

- 한 줄이면 바로 요약이 아니라 피드백에서 세 칸 `accent`. 진행 판에 `line` 전달.
- 다음 → 요약.
- impl-log_1 `14:14`.

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`

### 단정 금지

- `미검증`: 실기기 세 칸 색.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 14:11

새 채팅 AI용. **이번 세션 = 빙고 요약은 제목만. 카드 중복 문구 삭제.**

### 한 일

- 끝 화면: `bingoResultCopy` 제목 + 판. `N칸을 칠하고 한 줄이…` 카드 없음.
- impl-log_1 `14:11`.

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`

### 단정 금지

- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 14:07

새 채팅 AI용. **이번 세션 = 빙고 요약 각주 문구 삭제.**

### 한 일

- 요약 카드 「연습이에요… 맞히기 기록에는 안 남아요」·`footnote` 스타일 제거.
- impl-log_1 `14:07`.

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`

### 단정 금지

- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 13:59

새 채팅 AI용. **이번 세션 = 빙고 TTS 직전에 `__DEV__` 로그.**

### 한 일

- `playCue`: `[WrsBingo] cue: 단어`. 릴리스엔 없음.
- impl-log_1 `13:59`.

### 핵심 경로

- `src/training/wrs/WrsBingoScreen.tsx`

### 단정 금지

- `미검증`: 실기기 Metro 로그.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 13:51

새 채팅 AI용. **이번 세션 = 단어인지도 헤더에서 빙고로 스와프. A는 본문.**

### 한 일

- 헤더 3×3 버튼 → 같은 탭에서 `WrsBingoScreen`. 맞히기로·뒤로 = A.
- 3×3 판, 들린 칸 칠함, 가로/세로/대각 1줄이면 끝. 쉬움 vs 비슷한 소리 판.
- A % 기록에 안 남김. Skia·Rive 없음.
- impl-log_1 `13:51`. 테스트 5/5.

### 핵심 경로

- `src/training/wrs/WrsSessionScreen.tsx`
- `src/training/wrs/WrsBingoScreen.tsx`
- `src/training/wrs/wrsBingo.ts`
- `src/components/ui/bingo-entry-button.tsx`

### 단정 금지

- `미검증`: 실기기 TTS·헤더·한 줄 색.
- `주의`: 빙고 저장·축 선택·소음 없음. A 진행 중엔 헤더 버튼 숨김.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 13:14

새 채팅 AI용. **이번 세션 = 세 연습 측정 상한을 트랙별 50으로. 귀풀기는 합쳐 30.**

### 한 일

- `capByMode`: 측정은 `freq`/`am`/`pitch2` 각 50. 한 트랙이 다른 트랙 그래프를 안 밀음.
- 귀풀기 30·링 6 50일·WRS 50세션은 그대로.
- impl-log_1 `13:14`. 테스트 43/43.

### 핵심 경로

- `src/training/sessionStore.ts`
- `src/training/__tests__/sessionStore.test.ts`

### 단정 금지

- `미검증`: 실기기 그래프 길이.
- `주의`: 상한은 append 때만. 읽기만으로는 안 자름.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 12:59

새 채팅 AI용. **이번 세션 = 인계 정본을 `handoff3.md`로. 링 6·WRS 헤더 통계 버튼 제거는 `handoff2` 12:57.**

### 한 일

- 새 인계는 `docs/handoff3.md`만. `handoff.md`·`handoff2.md` 추가 금지.
- 규칙 `.cursor/rules/android-dev-client.mdc` 경로 변경. 구 파일 상단에 과거 안내.
- impl-log_1 `12:59`.

### 핵심 경로

- `docs/handoff3.md`
- `.cursor/rules/android-dev-client.mdc`
- `docs/handoff2.md`
- `docs/handoff.md`

### 단정 금지

- 없음

---
