# 인계2 — 링 6 (feat/ling6-tab)

> **과거**. **2026-08-19부터 새 인계는 `docs/handoff3.md`.** 이 파일에는 새 블록을 넣지 않는다.  
> 사용자(2026-08-18 14:09): 「인계문 작성해」를 **안 해도** 코드·설계가 바뀐 세션이면 여기에 저장. (이후 `handoff3`로 이전)  
> 사용자(2026-08-19 01:09): 이후 블록에 **`### 합의` / `### 안 한 일` / `### 다음` 넣지 않음.** 과거 블록은 그대로.

## 인계 — 2026-08-19 12:57

새 채팅 AI용. **이번 세션 = 링 6·단어인지도 헤더에서 세 연습 통계 버튼 제거.**

### 한 일

- `StatsEntryButton` → `SessionHistoryScreen`(`sessionStore` 세 연습)은 이 두 탭과 무관해 뺌.
- 탭 안 추이 패널·PTA/AM 헤더 통계는 그대로.
- impl-log_1 `12:57`.

### 핵심 경로

- `src/training/ling6/Ling6SessionScreen.tsx`
- `src/training/wrs/WrsSessionScreen.tsx`

### 단정 금지

- `미검증`: 실기기 헤더·뒤로가기.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 12:49

새 채팅 AI용. **이번 세션 = `feat_wrs`에 단어인지도 A(4지선다·TTS) + 시간×% 추이(가짜 점 없음).**

### 한 일

- `modi_tabs` → `feat_wrs`. 단음절 200풀, 혼동 규칙 오답 3개, 25시행 듣고 고르기. TTS `expo-speech` `ko-KR`. 25개 완료만 `training.wrsSessions.v1`.
- 그래프는 PI-PB(dB HL×%)·세 연습 계단식 아님. 링 6 **선**과 같게 가로=연습 시각, 세로=맞힌 %. 가짜 미리보기 점은 뺌(2회+만 선, 1회는 목록만).
- 링 6 **음소 그리드**는 안 넣음. 저장이 %만이라 칸을 못 채움. 축별 그리드는 미구현.
- impl-log_1 `11:36`·`12:36`·`12:42`.

### 핵심 경로

- `src/training/wrs/WrsSessionScreen.tsx`
- `src/training/wrs/wrsDistractors.ts`
- `src/training/wrs/wrsTts.ts`
- `src/training/wrs/wrsStore.ts`
- `src/training/wrs/WrsProgressPanel.tsx`
- `src/training/wrs/wrsTrend.ts`

### 단정 금지

- `주의`: **`expo-speech` → dev client 리빌드 필요.** 그래프 JS만은 리빌드 불필요.
- `미검증`: 실기기 한국어 TTS·단음절 받침·그래프.
- `추정`: 오답은 규칙 기반. 개인 혼동 행렬 없음.
- `주의`: % 추이는 검사 곡선이 아님.

---

## 인계 — 2026-08-19 12:42

새 채팅 AI용. **이번 세션 = 단어인지도 그래프에서 가짜 점 제거.**

### 한 일

- 실제 기록 2회 이상일 때만 선 그래프. 1회는 최근 목록만, 0회는 패널 없음.
- 링 6 `ensureTwoDays` 미리보기는 이 탭에 복사하지 않음.
- impl-log_1 `2026-08-19 12:42`.

### 핵심 경로

- `src/training/wrs/wrsTrend.ts`
- `src/training/wrs/WrsProgressPanel.tsx`

### 단정 금지

- `미검증`: 실기기 1회/2회 표시.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 12:36

새 채팅 AI용. **이번 세션 = 단어인지도 추이를 링 6처럼 시간×맞힌 비율로.**

### 한 일

- PI-PB(dB×%) 아님. 가로=연습 시각, 세로=맞힌 %.
- 링 6 `맞힌 개수 변화`와 같은 선 그래프. 점 2개 미만은 미리보기(저장 없음).
- idle·요약에 표시. impl-log_1 `2026-08-19 12:36`.

### 핵심 경로

- `src/training/wrs/WrsProgressPanel.tsx`
- `src/training/wrs/wrsTrend.ts`
- `src/training/wrs/WrsSessionScreen.tsx`

### 단정 금지

- `미검증`: 실기기 그래프.
- `주의`: % 추이는 검사 곡선이 아님.
- `추정`: **리빌드 불필요.**

---

## 인계 — 2026-08-19 11:36

새 채팅 AI용. **이번 세션 = 단어인지도 A(4지선다·TTS)를 `feat_wrs`에 구현.**

### 한 일

- `modi_tabs`에서 `feat_wrs` 분기.
- 단음절 200풀, 혼동 규칙 오답 3개, 25시행 듣고 고르기.
- TTS는 `expo-speech` `ko-KR`. 25개 완료만 `training.wrsSessions.v1`에 저장.
- 단위 테스트 15/15. impl-log_1 `2026-08-19 11:36`.

### 핵심 경로

- `src/training/wrs/WrsSessionScreen.tsx`
- `src/training/wrs/wrsDistractors.ts`
- `src/training/wrs/wrsTts.ts`
- `src/training/wrs/wrsStore.ts`

### 단정 금지

- `주의`: **`expo-speech` 추가 → dev client 리빌드 필요.**
- `미검증`: 실기기 한국어 TTS·단음절 받침.
- `추정`: 오답은 규칙 기반. 개인 혼동 행렬 없음.

---

## 인계 — 2026-08-19 03:07

새 채팅 AI용. **이번 세션 = 떨림 듣기 준비를 화면 전환으로.**

### 한 일

- 오버레이 제거. 소리 높낮이처럼 듣기 준비로 갈아끼움(아래 파란 버튼 elevation 관통 방지).
- 귀풀기/연습은 `AmTabScreen`이 들고 유지. 통과 후 `autoStart`는 그대로.
- impl-log_1 `2026-08-19 03:07`.

### 핵심 경로

- `src/training/am/AmTabScreen.tsx`
- `src/training/am/AmSessionScreen.tsx`

### 단정 금지

- `미검증`: 실기기 「연습 시작」→ 듣기 준비 → 세션.
- `추정`: **리빌드 불필요**.

---

## 인계 — 2026-08-19 02:54

새 채팅 AI용. **이번 세션 = 기록 화면 새로고침 버튼 제거.**

### 한 일

- 「새로고침」 뺌. 「돌아가기」는 파란 채움, 가로 글자+여백, 가운데.
- `reload`는 마운트·포커스·삭제에 유지.
- impl-log_1 `2026-08-19 02:54`.

### 핵심 경로

- `src/training/SessionHistoryScreen.tsx`

### 단정 금지

- `미검증`: 실기기 가운데·탭 복귀 갱신.
- `추정`: **리빌드 불필요**.

---

## 인계 — 2026-08-19 02:42

새 채팅 AI용. **이번 세션 = 링 6 「처음으로」 라벨 잘림.**

### 한 일

- 링 6 하단 버튼 `fill={false}`. 하단 패딩 `BottomTabInset + Spacing.four`.
- impl-log_1 `2026-08-19 02:42`.

### 핵심 경로

- `src/training/ling6/Ling6SessionScreen.tsx`

### 단정 금지

- `미검증`: 실기기 「처음으로」·탭바.
- `추정`: **리빌드 불필요**.

---

## 인계 — 2026-08-19 02:26

새 채팅 AI용. **이번 세션 = 통계 지우기를 탭에 맞게.**

### 한 일

- 목록·그래프는 전부. 지우기만 탭별: 떨림 `am`, 소리 높낮이 `pitch2`+`freq`.
- 링 6·단어인지도 통계 화면에는 sessionStore 지우기 없음.
- impl-log_1 `2026-08-19 02:26`.

### 핵심 경로

- `src/training/SessionHistoryScreen.tsx` (`clearTracks`)
- `src/training/am/AmTabScreen.tsx`
- `src/training/pta/PtaSessionScreen.tsx`

### 단정 금지

- `미검증`: 실기기 탭별 버튼.
- `추정`: **리빌드 불필요**.

---

## 인계 — 2026-08-19 02:19

새 채팅 AI용. **이번 세션 = 훈련 기록 트랙별 지우기.**

### 한 일

- `deleteSavedSessionsByTrack` + 테스트.
- 통계 화면 「기록 전체 삭제」→ 트랙 3개 지우기. 한 화면 조회는 유지.
- impl-log_1 `2026-08-19 02:19`.

### 핵심 경로

- `src/training/sessionStore.ts`
- `src/training/SessionHistoryScreen.tsx`

### 단정 금지

- `미검증`: 실기기 3버튼·확인·그래프 갱신.
- `추정`: **리빌드 불필요**.

---

## 인계 — 2026-08-19 02:13

새 채팅 AI용. **이번 세션 = 링 6 기록 지우기 버튼.**

### 한 일

- `clearLing6DailyRecords` + 테스트.
- idle·요약에 「링 6 기록 지우기」(확인 Alert). `sessionStore`는 안 지움.
- impl-log_1 `2026-08-19 02:13`.

### 핵심 경로

- `src/training/ling6/ling6Store.ts`
- `src/training/ling6/Ling6SessionScreen.tsx`

### 단정 금지

- `미검증`: 실기기 Alert·그리드 갱신.
- `추정`: **리빌드 불필요**.

---

## 인계 — 2026-08-19 02:04

새 채팅 AI용. **이번 세션 = 연습 탭을 떨림 전용 탭으로.**

### 한 일

- 「연습 선택」제거. `index.tsx` → `AmTabScreen`(링 6처럼 탭=그 연습).
- 하단 라벨 「떨림」, 아이콘 `md="vibration"`.
- 첫 시작만 듣기 준비 오버레이 후 바로 세션. 통계는 idle·요약 헤더.
- impl-log_1 `2026-08-19 02:04`.

### 핵심 경로

- `src/app/index.tsx`
- `src/training/am/AmTabScreen.tsx`
- `src/training/am/AmSessionScreen.tsx`
- `src/components/app-tabs.tsx`

### 단정 금지

- `미검증`: NativeTabs `vibration` 아이콘 실기기.
- `추정`: **리빌드 불필요**.

---

## 인계 — 2026-08-19 01:46

새 채팅 AI용. **이번 세션 = 연습 탭 최근 peek 카드 제거.**

### 한 일

- 연습 선택(`index.tsx`)에서 최근 연습 1줄 카드·로드 제거. 통계는 헤더 `StatsEntryButton`만.
- `peekLatestSession` / `LatestSessionPeek` 삭제(호출처 없음).
- impl-log_1 `2026-08-19 01:46`.

### 핵심 경로

- `src/app/index.tsx`
- `src/training/SessionHistoryScreen.tsx`

### 단정 금지

- `미검증`: 헤더 통계만으로 발견성 충분한지 실기기 미확인.
- `추정`: **리빌드 불필요**.

---

## 인계 — 2026-08-19 01:17

새 채팅 AI용. **이번 세션 = 경량화 방침을 중사양 기준·측정만 가볍게.**

### 한 일

- 규칙 `## 경량화`, README, `dev-client-setup-context` §0·§5 문구 맞춤.
- impl-log_1 `2026-08-19 01:17`.

### 핵심 경로

- `.cursor/rules/android-dev-client.mdc`
- `README.md`
- `docs/dev-client-setup-context.md`

### 단정 금지

- `추정`: **리빌드 불필요**.

---

## 인계 — 2026-08-19 01:09

새 채팅 AI용. **이번 세션 = 인계에서 합의·안 한 일·다음을 빼기로.**

### 한 일

- 규칙·`handoff2.md` 안내에 세 항목 생략 반영.
- impl-log_1 `2026-08-19 01:09`.

### 핵심 경로

- `.cursor/rules/android-dev-client.mdc`
- `docs/handoff2.md`

### 단정 금지

- `추정`: **리빌드 불필요**.

---

## 인계 — 2026-08-19 01:06

새 채팅 AI용. **이번 세션 = impl-log를 `_1`로 이어감.**

### 합의

- `impl-log.md`는 과거. 새 기록은 `docs/impl-log_1.md`만.

### 한 일

- `docs/impl-log_1.md` 신설.
- `impl-log.md` 상단에 추가 금지 안내.
- 규칙·문서 지도·README 등 링크를 `_1`로.
- impl-log_1 `2026-08-19 01:06`.

### 안 한 일

- 옛 `impl-log.md` 본문 이동·삭제.

### 핵심 경로

- `docs/impl-log_1.md`
- `.cursor/rules/android-dev-client.mdc`

### 다음

- 이후 구현 로그는 `impl-log_1.md`만.

### 단정 금지

- `추정`: **리빌드 불필요**.

---

## 인계 — 2026-08-19 01:04

새 채팅 AI용. **이번 세션 = 기록 전체 삭제를 작게.**

### 합의

- 확인 Alert가 있어도 전체 삭제 버튼은 크면 안 됨.
- 돌아가기 파란 채움은 유지.

### 한 일

- 전체 삭제: `ActionButton` → 오른쪽 작은 위험색 텍스트. Alert 유지.
- impl-log `2026-08-19 01:04`.

### 안 한 일

- AM 「가장 쉬움」 0 숨기기(대화만).
- 그래프 반전·캡션.

### 핵심 경로

- `src/training/SessionHistoryScreen.tsx`

### 다음

- 실기기에서 삭제 크기·돌아가기 색.

### 단정 금지

- `추정`: **리빌드 불필요**.

---

## 인계 — 2026-08-19 01:02

새 채팅 AI용. **이번 세션 = 기록 「돌아가기」를 연습 시작 색으로.**

### 합의

- 훈련 기록 하단 「돌아가기」 = 연습 시작과 같은 파란 채움.
- 「새로고침」은 그대로.

### 한 일

- `SessionHistoryScreen` 「돌아가기」 `variant="primary"`.
- impl-log `2026-08-19 01:02`.

### 안 한 일

- AM 「가장 쉬움」 0 숨기기(대화만).
- 그래프 반전·캡션.

### 핵심 경로

- `src/training/SessionHistoryScreen.tsx`

### 다음

- 실기기에서 돌아가기 색 확인.

### 단정 금지

- `추정`: **리빌드 불필요**.

---

## 인계 — 2026-08-19 00:19

새 채팅 AI용. **이번 세션 = 귀풀기 무제한 · 연습 전환 6.**

### 합의

- 귀풀기(`practice`): 전환·시행 한도 없음, 「전환 N」만, 직접 종료. 목록만.
- 연습(`measure`): 전환 6, 통계 포함. 토글 안내 문구 없음.
- 웰니스. 저장 키 유지.

### 한 일

- `sessionMode.ts` 상수·`null` 한도·캡션 헬퍼.
- freq/am 세션 종료 검사, 세 화면 UI.
- 설계 §6 문구. 테스트 139 passed.
- impl-log `2026-08-19 00:19`.

### 안 한 일

- 그래프 반전·캡션(이전 대화).
- 기록 초기화(사용자가 할 일).

### 핵심 경로

- `src/training/sessionMode.ts`
- `src/training/SessionModeToggle.tsx`

### 다음

- 실기기 토글·종료·통계.

### 단정 금지

- `추정`: **리빌드 불필요**.

---

## 인계 — 2026-08-18 23:59

새 채팅 AI용. **이번 세션 = freq·am을 pitch2afc처럼 폴더로.**

### 합의

- 다른 음 찾기·떨림 찾기도 트랙 폴더.

### 한 일

- `src/training/freq/` · `src/training/am/`로 이동.
- 호출부 import·설계 정본 경로 갱신.
- 테스트 50 passed.
- impl-log `2026-08-18 23:59`.

### 안 한 일

- 그래프 반전·캡션 문구(대화만).
- 과거 로그 경로 일괄 수정.

### 핵심 경로

- `src/training/freq/`
- `src/training/am/`

### 다음

- 없음(구조만). 그래프 방향·캡션은 별도.

### 단정 금지

- `추정`: **리빌드 불필요**.

---

## 인계 — 2026-08-18 23:14

새 채팅 AI용. **이번 세션 = 통계 하단 3버튼을 탭 가까이.**

### 합의

- 버튼 모양·구성은 그대로.
- 아래 빈 칸만 줄여 하단 탭 근처로. 위 집계·그래프 공간만 그만큼 확보.

### 한 일

- `SessionHistoryScreen`: `edges={["top","left","right"]}`, `paddingBottom: Spacing.three`.
- `BottomTabInset` 제거(이 화면만).
- impl-log `2026-08-18 23:14`.

### 안 한 일

- 다른 탭 화면 패딩 변경.
- 실기기 겹침 확인.

### 핵심 경로

- `src/training/SessionHistoryScreen.tsx`

### 다음

- 실기기: 통계 하단 버튼이 탭과 겹치는지, 그래프가 더 보이는지.

### 단정 금지

- `추정`: **리빌드 불필요**.
- `미검증`: NativeTabs가 레이아웃을 이미 밀어 올리는지. 겹치면 `paddingBottom`만 조금 되돌리면 됨.

---

## 인계 — 2026-08-18 15:11

새 채팅 AI용. **이번 세션 = 음고 2종을 소리 높낮이 탭으로 이동.**

### 합의

- 높낮이 비교·다른 음 찾기 → PTA(소리 높낮이) 탭.
- 연습 탭 = 떨림 찾기 + 통계.
- 기존 세션 화면·저장 재사용.

### 한 일

- `PtaSessionScreen`: 2카드 → 듣기 준비 → pitch2/freq.
- `index.tsx`에서 음고 제거.
- 하드웨어 뒤로가기: 두 탭 모두 `useFocusEffect`.
- impl-log `2026-08-18 15:11`.

### 안 한 일

- 통계 버튼을 소리 높낮이 탭에도 두기.
- 실기기 확인.

### 핵심 경로

- `src/training/pta/PtaSessionScreen.tsx`
- `src/app/index.tsx`

### 다음

- 실기기: 탭 목록·뒤로가기·측정 저장→통계.

### 단정 금지

- `추정`: **리빌드 불필요**.
- `미검증`: 실기기 탭 전환·BackHandler 포커스 분리.

## 인계 — 2026-08-18 14:59

새 채팅 AI용. **이번 세션 = README 대상 기기 문구만 변경.**

### 합의

- README 경량화 방침: 「저사양 안드로이드」→「중간 사용 안드로이드」.

### 한 일

- `README.md` 해당 한 줄.
- impl-log `2026-08-18 14:59`.

### 안 한 일

- 다른 문서(dev-client-setup-context, cursor rules 등)의 「저사양」은 그대로.

### 핵심 경로

- `README.md`

### 다음

- 다른 문서도 같은 표현으로 맞출지.

### 단정 금지

- `주의`: 앱 경량화 코드는 안 바꿈. 문구만.
- **리빌드 불필요.**

## 인계 — 2026-08-18 14:52

새 채팅 AI용. **이번 세션 = 단어인지도(WRS)를 하단 탭으로 연결.** 세션 로직은 없음.

### 합의

- PTA와 같은 파일 라우트. 라우트 이름 `wrs`.
- 탭 순서: 링 6 · PTA(소리 높낮이) · 단어인지도 · 연습.

### 한 일

- `NativeTabs.Trigger name="wrs"` (라벨 단어인지도, `md="chat"`).
- `src/app/wrs.tsx` → `@/training/wrs/WrsSessionScreen`.
- 자리 화면만.
- impl-log `2026-08-18 14:52`.

### 안 한 일

- 단어 자극·시행·저장.
- 실기기 4탭·라벨 잘림 확인.

### 핵심 경로

- `src/app/wrs.tsx`
- `src/components/app-tabs.tsx`
- `src/training/wrs/WrsSessionScreen.tsx`

### 다음

- 단어인지도 세션 화면.
- 좁은 기기에서 라벨 길이.

### 단정 금지

- `추정`: JS 라우팅 → **리빌드 불필요**.
- `미검증`: 실기기 4탭·chat 아이콘·라벨 잘림.
- `주의`: 자리 화면. 역치형 SRT가 아님(WRS 자리).

## 인계 — 2026-08-18 14:26

새 채팅 AI용. **이번 세션 = PTA를 하단 탭으로 연결.** 세션 로직은 없음.

### 합의

- `src/app/pta.tsx` + `src/training/pta/` → 링 6와 같은 파일 라우트.
- 탭 순서: 링 6 · PTA · 연습.

### 한 일

- `NativeTabs.Trigger name="pta"` (라벨 PTA, `md="hearing"`).
- `pta.tsx` → `@/training/pta/PtaSessionScreen`.
- 자리 화면만 (`PtaSessionScreen.tsx`).
- impl-log `2026-08-18 14:26`.

### 안 한 일

- PTA 자극·시행·저장.
- 탭 라벨 한국어화.
- 실기기 3탭 확인.

### 핵심 경로

- `src/app/pta.tsx`
- `src/components/app-tabs.tsx`
- `src/training/pta/PtaSessionScreen.tsx`

### 다음

- PTA 세션 화면.
- 라벨·아이콘·순서 바꿀지.

### 단정 금지

- `추정`: JS 라우팅 → **리빌드 불필요**.
- `미검증`: 실기기 3탭·hearing 아이콘.
- `주의`: 자리 화면. 역치·진단 카피 없음.

## 인계 — 2026-08-18 14:09

새 채팅 AI용. **인계 저장소 = `docs/handoff2.md`만.** 14:01은 `handoff.md`에서 여기로 옮김.

### 합의

- 링 6·현재 브랜치 인계는 `handoff2.md` 상단. `handoff.md` **금지**.
- 「인계문 작성해」를 안 해도, 코드·설계가 바뀐 세션이면 `handoff2.md`에 저장.

### 한 일

- `handoff.md` 14:01 삭제 → `handoff2.md`로 이전.
- `.cursor/rules/android-dev-client.mdc` 저장 경로를 `handoff2.md`로 변경.

### 안 한 일

- `handoff.md` 과거 블록 이관. README 링크 변경.

### 핵심 경로

- `docs/handoff2.md` · `.cursor/rules/android-dev-client.mdc`

### 다음

- 이후 인계는 이 파일만. 미리보기 유지 vs 되돌리기는 사용자.

### 단정 금지

- `주의`: `handoff.md`는 과거 로그. 사용자가 다시 열기 전 추가 금지.
- **리빌드 불필요.**

## 인계 — 2026-08-18 14:01

새 채팅 AI용. **이번 세션 = `feat/ling6-tab` 로컬 체크아웃 + 링 6 진행 패널 이틀 미리보기(저장 안 함).** 미리보기 JS만, 리빌드 불필요.

### 합의

- 원격 새 브랜치: `fetch` + `switch`. `pull` 불필요(로컬=원격).
- 진행 패널 「맞힌 개수 변화」는 점이 2개 필요. 실기록 0~1일이면 **화면만** 전날 채워 이틀 보이게. 결과는 시드 난수. AsyncStorage 안 씀.
- `label`(음·우·아·이·쉬·스)은 그림 아래·정답 문구·접근성용. 빈 문자열로 지우지 않기로 함(대화). 코드는 그대로.
- 용량 줄이기: 프로젝트 폴더(당시 ~12.5GB). `android/**/build`·`.expo` 우선, `node_modules`는 재설치. 폰 APK와 별개.

### 한 일

- `git fetch` 후 `git switch feat/ling6-tab`(로컬 추적 생성). 현재 브랜치 `feat/ling6-tab`.
- `ensureTwoDays` / `previewRecord`: 2일+ 실기록 유지, 1일→전날 가짜, 0일→어제·오늘 가짜. idle은 기록 없어도 패널 표시.
- impl-log `2026-08-18 13:50`. 인계용 impl-log 한 줄 **안 넣음**.

### 안 한 일

- 미리보기 되돌리기(사용자에게 복원 코드는 설명함, 미적용).
- 커밋. 실기기에서 가로축 이틀·추이선 확인.

### 핵심 경로

- `src/training/ling6/Ling6ProgressPanel.tsx`(`ensureTwoDays`)
- `src/training/ling6/Ling6SessionScreen.tsx`(idle/요약 패널 가드 완화)
- `src/training/ling6/sounds.ts`(001~006 ↔ 음소)

### 다음

- 미리보기 유지 vs 되돌리기 결정. 되돌리면 패널은 `chronological`+`length===0` null, 추이는 `>=2`일 때만, idle은 `history.length>0`일 때만 패널.
- 실기록 2일 쌓이면 가짜는 자동으로 안 붙음.
- 커밋은 사용자.

### 단정 금지

- `주의`: 실기록 1일에 붙는 전날은 가짜. 통계로 읽으면 안 됨.
- `미검증`: 실기기 미리보기 레이아웃.
- **리빌드 불필요**(이번 미리보기). 용량 정리 후 `npm install`·`npm run android`는 이미 한 상태.

---

## 인계 — 2026-08-18 06:56

새 채팅 AI용. **이번 세션 = 코드 변경 없음.** 그리드·합성음 이해·음원 교체 방향만. Ask 위주. 리빌드 불필요.

### 합의·이해

- 날짜 칸 = 그날 **마지막 완주**. 같은 날 합치지 않음. 중도 종료는 안 남김. 그리드 전체가 초록이 되는 게 아님(그날 세로줄만).
- 主 그리드 유지. X·Y 한 줄(0~6)은 이미 보조. 主를 선만으로 바꾸면 음소별 P/F가 사라짐 → 변환 안 함.
- 표는 기록 있는 날만 오른쪽(최근)으로 붙음. 빈 날 칸 없음. 화면 넘치면 **가로 드래그**(스크롤바 숨김). 저장 상한 50일. 30일도 같은 UI.
- 자극은 **합성 근사**. 본체 `ling6Synth.ts`. 음·우·아·이 = F1/F2 사인 2개. 쉬·스 = 흰잡음+필터(배경 잡음 아님). 정상 청력에도 맞추기 어려움 = 품질 문제. 실제 녹음이면 쉬워질 것으로 **추정**.
- F1/F2 Hz: /m/ 250·1175(게인0.7) / /u/ 300·870 / /a/ 730·1090 / /i/ 270·2290. /ʃ/ BP 2500, /s/ HP 4000.
- 사용자: 6음소 WAV를 **다른 프롬프트**에서 생성 예정. 앱 반영은 아직.

### 한 일

- 결과·그리드 성장·합성 한계 설명. 음원 생성 요청문 작성(채팅). 코드·커밋 없음.

### 안 한 일 / 미커밋

- WAV 교체·`playLing6Target` 재생 경로 변경 **안 함**.
- 그리드→X·Y 변환 **안 함**.
- `handoff.md` 안 넣음. 그리드·추이·daily 키 **여전히 미커밋**.

### 핵심 경로

- `ling6Synth.ts` · `Ling6ProgressPanel.tsx` · `ling6Store.ts` (`training.ling6Daily.v1`)
- 구키 `training.ling6History.v1` 안 읽음.

### 다음

- 그리드·추이 커밋은 사용자.
- WAV 6개(`001–006.wav`, 그림과 같은 번호) 오면 `playLing6Target`만 파일 재생으로 교체. 합성 경로 제거 가능. 리빌드 보통 불필요.
- 실기기: 가로 스크롤·같은 날 덮어쓰기·중도 종료 미기록.

### 단정 금지

- `미검증`: 격자 가독성·가로 스크롤. 폰 스피커 /s/·/ʃ/.
- `추정`: 실녹음이면 정상 청력 식별이 쉬워짐.
- **리빌드 불필요.**

## 인계 — 2026-08-18 06:15

새 채팅 AI용. **이번 세션 = 링 6 날짜 기록 스키마 + 음소×일자 그리드 + 맞힌 개수 추이.** 탭·연습 자체는 이미 `16baa08`. JS만, 리빌드 불필요.

### 합의

- 링 6는 **변별·훈련 기록**. 청력·보장구 간이 검사(착용 전/후·실시간 작동 체크)가 **아님**.
- 화면: 主 음소×일자 통과/실패 그리드(저음→고음 `/m/→/u/→/a/→/i/→/ʃ/→/s/`). 보조 일자별 맞힌 개수 0~6 선.
- 문구: 「이번 기록에서 6개 중 ○개」「지난 기록보다 ○개」. 판정형 금지.
- 「지난번」= 직전 **날짜** 기록. 같은 날 반복은 덮어씀(세션 횟수로 가로축이 안 늘어남).
- 저장소 분리. 연습 탭 `sessionStore`(측정 50·연습 30)와 공유하지 않음.
- 목업 「착용 전/후 추이 / 세션별 누적 점수」는 **그대로 안 씀**. 그래프 계열은 3번(시간 따라 변화)에 가깝되, 누적 점수·세션축이 아니라 날짜별 0~6.
- 그리드=View 격자. 추이=기존 `react-native-svg`. 차트 라이브러리·Skia 없음.
- 커밋은 사용자 직접.

### 한 일

- `training.ling6Daily.v1` 하루 1건 upsert, 음소별 P/F, 상한 50일.
- 6음 다 고른 세션만 날짜 기록. 중도 종료는 안 남김. 무음 2시행은 기록에 안 넣음.
- idle/요약에 그리드+추이. 고음(/s/·/ʃ/)이 6일+ 앞선 기록보다 늘면 고음 문구.
- 테스트 갱신. `npx jest` 152 통과(링 6 16). impl-log 2026-08-18 06:09.

### 안 한 일 / 미커밋

- `handoff.md`에 이 블록 **안 넣음**(사용자: handoff2로 분리).
- 착용 전/후 라벨·세션 누적 점수 축·연습/점검 토글 **안 함**.
- **미커밋**: 그리드·추이·daily 키 전부(`Ling6ProgressPanel.tsx` 신규 포함). 탭 본편은 `16baa08`에 있음.

### 핵심 경로

- `src/training/ling6/ling6Store.ts` · `ling6Session.ts` · `Ling6ProgressPanel.tsx` · `Ling6SessionScreen.tsx`
- 구키 `training.ling6History.v1`은 **안 읽음**.

### 다음

- 그리드·추이 커밋은 사용자.
- 실기기: 같은 날 덮어쓰기, 그리드 가로 스크롤, 추이선, 중도 종료 시 날짜 미기록.

### 단정 금지

- `미검증`: 실기기 격자 가독성·가로 스크롤.
- `추정`: 「지난주」= 오늘보다 6일 이상 앞선 가장 최근 기록.
- **리빌드 불필요.**
