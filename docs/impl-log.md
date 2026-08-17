# 구현 · 결과 로그

> **목적**: 기능 구현·설정 변경 후 **무엇을 했는지 / 결과가 어땠는지**를 날짜별로 남긴다.  
> **대상**: 코드·네이티브·오디오·훈련 로직 등 실질 변경. 대화만으로 끝난 합의·설계는 `amp-mdt-training-design.md` 쪽(같은 표기 원칙 적용).  
> **규칙**: `.cursor/rules/android-dev-client.mdc` — 작업이 끝나면 이 파일에 항목을 추가한다.

---

## 기록 원칙 (확실 vs 단정 금지)

한 항목에 **두 축을 같이** 남긴다. 한쪽만 적고 끝내면 안 된다.

| 축 | 남길 것 | 예 |
|----|---------|-----|
| **확실한 쪽** | 근거(확인한 사실·파일), 결정, 구현 결과 | “`package.json`에 `^0.13.2` 확인”, “② MVP 순음 재생 성공” |
| **단정 금지 쪽** | 추정·가설·미검증·주의·성능 우려 | “실생활 청취 개선은 미검증”, “이 스텝 크기는 파일럿 추정” |

**표기 접두(설계 문서와 동일 취지)**  
`관례` · `가설` · `미검증` · `추정` · `주의` — 확신이 약한 문장 앞에 붙이거나, 아래 표의 **단정 금지** 칸에 모은다.  
없으면 `단정 금지 | 없음`이라고 명시한다(빈칸으로 두지 않음).

---

## 기록 형식

새 항목은 **위에 추가**(최신이 위). 복사용:

```md
### YYYY-MM-DD — 짧은 제목

| 항목 | 내용 |
|------|------|
| 트랙 | ② 주파수 / ① AM / 공통·인프라 / 문서 |
| 근거·결정 | 확인한 사실·합의·왜 이렇게 했는지 (확실한 쪽) |
| 변경 요약 | 한두 문장 |
| 주요 경로 | `src/...`, `docs/...` |
| 결과 | 성공 / 부분 / 실패 · 기기·명령 있으면 적기 |
| 확인 | 수동·doctor·테스트 등 |
| 단정 금지 | 추정·가설·미검증·주의 (없으면 `없음`) |
| 성능·주의 | 부정적 영향 있으면 명시, 없으면 `없음` |
| 다음 | 이어서 할 일(있으면) |
```

---

## 로그

### 2026-08-18 06:09 — 링 6 음소×일자 그리드·일자별 통과 개수 추이

| 항목 | 내용 |
|------|------|
| 트랙 | 링 6 |
| 근거·결정 | 사용자: 정답률 곡선·판정이 아니라 **훈련 기록**. 主 음소×일자 통과/실패 그리드(저음→고음 `/m/→/u/→/a/→/i/→/ʃ/→/s/`), 보조 일자별 맞힌 개수 0~6. 문구는 경험·변화형. 비교 대상은 직전 연습이 아니라 **직전 날짜 기록**. 하루 1레코드. 저장소는 연습 탭 `sessionStore`와 분리. 그리드는 View 격자, 추이선은 기존 `react-native-svg`(차트 라이브러리·Skia 없음). |
| 변경 요약 | `training.ling6Daily.v1`에 음소별 P/F upsert(같은 날 덮어씀, 상한 50일). 6음을 다 고른 세션만 날짜 기록. 요약 「이번 기록에서 6개 중 ○개」·「지난 기록보다 ○개」·고음이 지난주(6일+)보다 늘면 고음 문구. idle/요약에 그리드+추이. |
| 주요 경로 | `src/training/ling6/ling6Session.ts` · `ling6Store.ts` · `Ling6ProgressPanel.tsx` · `Ling6SessionScreen.tsx` · `__tests__/ling6*.test.ts` |
| 결과 | 성공(코드). `npx jest` 152 통과(링 6 16). |
| 확인 | 유닛 테스트. 실기기 그리드·가로 스크롤·추이선은 **미확인**. |
| 단정 금지 | `주의`: 구키 `training.ling6History.v1`(세션 append)은 읽지 않음. `주의`: 무음 2시행은 날짜 기록에 안 넣음. `추정`: 「지난주」는 6일 이상 앞선 가장 최근 기록. `미검증`: 실기기에서 격자 가독성. |
| 성능·주의 | 입력 화면은 그대로 정적 Image. 그리드/추이는 idle·요약만. **리빌드 불필요**(JS·SVG). |
| 다음 | 실기기에서 날짜 덮어쓰기·그리드·추이 확인. |

### 2026-08-18 05:22 — 하단 2탭 복원 + 링 6 말소리 구분 연습

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라(탭) / 링 6(신설) |
| 근거·결정 | 사용자: 링 6는 탐지 역치·측정형이 아니라 **변별·훈련형**(들은 소리를 그림에서 고름). 용어는 훈련 기록·맞힌 개수·변화 추이. 하단 **왼쪽 탭**이 필요해 일부러 뺐던 NativeTabs를 2탭으로 복원(좌 링 6 · 우 기존 연습). 통계는 연습 탭 헤더 아이콘·peek 유지. 음원 WAV는 아직 없어 **합성 근사**로 1차 재생(포먼트 2정현 + 마찰음 노이즈). 기록은 기존 `sessionStore`(측정 통계)와 섞지 않고 `training.ling6History.v1` 별도 키. |
| 변경 요약 | `_layout`을 `NativeTabs`로 되돌림. `ling6` 라우트 + 8시행(6음소 1회+무음 2, 첫 시행은 소리). 요약 카피 「이번 연습에서 N개 중 M개를 맞혔어요」·직전 대비 늘/줄. 그림 `assets/ling6/001–006.png`. |
| 주요 경로 | `src/app/_layout.tsx` · `src/app/ling6.tsx` · `src/components/app-tabs{,.web}.tsx` · `src/training/ling6/*` · `assets/ling6/` |
| 결과 | 성공(코드). `npx jest` 147 통과(링 6 11 포함). `tsc`는 기존 `action-button.tsx` 2건만(이번 변경과 무관). |
| 확인 | 유닛 테스트. 실기기 탭·청취·그림 선택은 **미확인**. |
| 단정 금지 | `주의`: 합성음은 무손실 음소 WAV가 아님. `미검증`: 폰 스피커에서 /s/·/sh/ 고주파 구분. `추정`: NativeTabs 복원은 JS 라우팅이라 **리빌드 불필요**. `주의`: 직전 연습과 비교(주 단위 「지난주」 집계 없음). 추이 그래프는 아직 없음. |
| 성능·주의 | 입력 화면은 정적 Image 격자(Skia/Rive 없음). 합성 노이즈 버퍼는 시행당 약 0.8초·1채널. |
| 다음 | 실기기에서 좌/우 탭·재생·선택. 무손실 WAV가 오면 합성 경로를 교체. 변화 추이 그래프(경험형 문구). |

### 2026-08-14 13:35 — 통계 하단 버튼 윤곽선을 글자색과 맞춤

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·UI (통계 하단) |
| 근거·결정 | 사용자: 하단 3버튼 글자색 그대로 윤곽선. 새로고침·연습 목록=잉크, 전체 삭제=danger. 다른 화면 버튼은 그대로. |
| 변경 요약 | `ActionButton`에 `outlineMatchLabel`. 통계 하단 3버튼만 켜 둠. |
| 주요 경로 | `src/components/ui/action-button.tsx`, `src/training/SessionHistoryScreen.tsx` |
| 결과 | 성공 (코드) |
| 확인 | 린트 |
| 단정 금지 | `미검증`: 실기기에서 잉크/빨강 테두리 대비. |
| 성능·주의 | 없음. **리빌드 불필요** (JS만). |
| 다음 | 없음 |

### 2026-08-14 13:33 — 전체 삭제 버튼 글자만 위험색

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·UI (통계 하단) |
| 근거·결정 | 사용자: 새로고침·연습 목록·전체 삭제는 모두 흰 면. 세 칸을 다른 색으로 칠하지 말 것. 전체 삭제만 글자를 낮은 채도 빨강으로. primary(파란 채움) 쓰지 않음. |
| 변경 요약 | `theme.danger` `#9B3B3B`. `ActionButton` `variant="danger"`(흰 면+테두리 유지). 통계 하단 전체 삭제만 적용. |
| 주요 경로 | `src/constants/theme.ts`, `src/components/ui/action-button.tsx`, `src/training/SessionHistoryScreen.tsx` |
| 결과 | 성공 (코드) |
| 확인 | 린트 |
| 단정 금지 | `미검증`: 실기기에서 흰 면·빨간 글자 대비. |
| 성능·주의 | 없음. **리빌드 불필요** (JS/토큰만). |
| 다음 | 없음 |

### 2026-08-14 12:42 — 기록 건별 삭제

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·UI (통계 목록) |
| 근거·결정 | 사용자: 전체 삭제만 있으면 거칠다. 연습·측정 구분 없이 한 건씩. 측정 건을 지우면 그래프·집계가 다시 계산됨(연습만 지우면 목록만). |
| 변경 요약 | `deleteSavedSession(id)` 추가(큐 경유). 카드 아래 「삭제」→확인 Alert. 없는 id는 no-op, 마지막 건이면 키 제거. |
| 주요 경로 | `src/training/sessionStore.ts`, `__tests__/sessionStore.test.ts`, `SessionHistoryScreen.tsx`, `docs/improvement-backlog.md` |
| 결과 | 성공 (코드) |
| 확인 | `jest sessionStore` **38 passed** |
| 단정 금지 | `미검증`: 실기기에서 측정 삭제 후 그래프 갱신·오탭 확인창. |
| 성능·주의 | 없음. **리빌드 불필요** (JS만). |
| 다음 | 실기기 확인. 트랙 필터·전체삭제 분리는 안 함. |

### 2026-08-14 12:30 — 끝내기·중지 확인창

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·UI (세 트랙 세션) |
| 근거·결정 | 사용자: 풀이 중 끝내기·중지 오탭으로 바로 종료·화면 전환됨. 기록 전체 삭제와 같은 확인 Alert로 막기로 함. |
| 변경 요약 | `confirmEndSession` 추가. 세 화면의 끝내기·중지는 확인 후에만 `onEndManual`. 종료 로직은 그대로. |
| 주요 경로 | `src/training/confirmEndSession.ts`, `FreqSessionScreen.tsx`, `AmSessionScreen.tsx`, `pitch2afc/PitchCompareScreen.tsx` |
| 결과 | 성공 (코드) |
| 확인 | 린트(기존 복잡도 경고만) |
| 단정 금지 | `미검증`: 실기기에서 확인창 뒤 종료·저장이 기존과 같은지. |
| 성능·주의 | 없음. **리빌드 불필요** (JS만). |
| 다음 | 실기기: 취소 시 이어서, 확인 시 요약. 하드웨어 뒤로가기는 이번 범위 아님. |

### 2026-08-14 11:10 — 기록 목록에 측정 배지

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·UI (통계 목록) |
| 근거·결정 | 사용자: 연습만 「연습」 배지 → 측정도 같은 방식. `mode` 없는 구버전은 배지 없음 유지. |
| 변경 요약 | `HistoryCard` 배지를 `sessionModeLabel`로. 연습→「연습」, 측정→「측정」. |
| 주요 경로 | `src/training/SessionHistoryScreen.tsx` |
| 결과 | 성공 (코드) |
| 확인 | 린트 확인 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음. **리빌드 불필요** (JS만). |
| 다음 | 실기기에서 목록 배지 대칭 확인 |

### 2026-08-14 10:54 — 추이 배지 제거

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·UI (통계 그래프 카드) |
| 근거·결정 | 사용자: 배지 안에 숫자가 없으니 형태도 불필요 → 관련 코드 전부 삭제. 비교 숫자는 `처음→최근` / `평균→최근` 한 줄만 남김. |
| 변경 요약 | `ScoreFraming`에서 배지 View·색 분기 삭제. `highlightTint`·`positiveTint` 제거(배지 전용). `positive`는 통계 아이콘 막대용으로 유지. |
| 주요 경로 | `src/training/SessionHistoryScreen.tsx`, `src/constants/theme.ts` |
| 결과 | 성공 (코드) |
| 확인 | 린트 확인 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음. **리빌드 불필요** (JS/토큰만). |
| 다음 | 실기기에서 그래프 헤더 우측이 숫자 한 줄만인지 확인 |

### 2026-08-14 10:50 — 추이 배지 문구 제거 · 유지 측 옅은 주황

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·UI (통계 그래프 카드) |
| 근거·결정 | 사용자: 「개선/유지」 텍스트 삭제. 배지 형태는 유지. 기준보다 작음=지금 옅은 초록(`positiveTint`) 그대로. 그 외=옅은 주황 테두리 추가. 서브텍스트(`처음→최근` 등)는 유지. |
| 변경 요약 | `ScoreFraming` 배지 문구 제거. `theme.ts`에 `highlightTint` `#FDE8D8` 추가. |
| 주요 경로 | `src/training/SessionHistoryScreen.tsx`, `src/constants/theme.ts` |
| 결과 | 성공 (코드) |
| 확인 | 린트 확인 |
| 단정 금지 | `주의`: 색만으로 비교를 암시하는 점은 남음. `미검증`: 흰 카드에서 옅은 초록·주황 대비. |
| 성능·주의 | 없음. **리빌드 불필요** (JS/토큰만). |
| 다음 | 실기기에서 빈 배지 크기·두 색 확인 |

### 2026-08-14 00:14 — 훈련 진행 화면 3종 UI (README hifi)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 (훈련 화면 렌더만) |
| 근거·결정 | `files/README.md` + `HearingTraining.dc.html`. 로직·문구·상태 흐름 유지, 진행 중 레이아웃·위계·간격·색·탭 타겟만. 토큰은 `theme.ts`의 accent/surface/border. |
| 변경 요약 | 높낮이 비교 2-AFC(132px 타일+화살표), 다른 음/떨림 3-AFC(정사각·36px 숫자)를 시안 레이아웃으로. 진행 pill(흰 면)·슬림 진행바·중앙 이퀄라이저(재생 중에만 움직임). idle·요약·채점·저장은 그대로. |
| 주요 경로 | `src/training/pitch2afc/PitchCompareScreen.tsx`, `FreqSessionScreen.tsx`, `AmSessionScreen.tsx`, `SessionProgressBar.tsx`, `src/components/ui/equalizer.tsx`, `pill.tsx`, `icon.tsx` |
| 결과 | 성공 (코드). 실기기 화면 대조는 미실시. |
| 확인 | 린트 통과. 로직 파일(`*Trial`/`*Session`/`SessionManager`) 미변경. |
| 단정 금지 | `미검증`: HTML 시안 대비 픽셀 일치(안드로이드 그림자·폰트). `주의`: 이퀄라이저는 장식이며 파형·난이도와 무관. 듣기 준비 화면 EQ 간격이 3→5로 같이 바뀜(같은 컴포넌트). |
| 성능·주의 | 막대 애니메이션은 기존과 같이 native driver. **리빌드 불필요** (JS/스타일만). |
| 다음 | 실기기에서 진행 3화면 대조. 홈/듣기준비/요약/통계는 이번 범위 밖. |

### 2026-08-13 16:49 — 기록 중복 축소 (인계·설계 숫자)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 인계 저장용 impl-log·대화만 인계·앱 상태 복붙·설계 문서 숫자 복사는 같은 사실의 중복. 정본을 한곳으로: 인계=`handoff.md`, 상태=백로그, 숫자=코드, impl-log=구현·설계 변경만. |
| 변경 요약 | `.mdc` 인계 절차에서 impl-log 4번 삭제. 생략 조건·상태 복붙 금지 추가. `handoff.md` 안내·`docs/README.md` 결정표 정렬. 설계 §3.1·§4.2·§6에서 스펙 숫자 복사 제거. 과거 인계·impl-log 블록은 누적형이라 미수정. |
| 주요 경로 | `.cursor/rules/android-dev-client.mdc`, `docs/handoff.md`(헤더만), `docs/README.md`, `docs/amp-mdt-training-design.md` |
| 결과 | 성공 (문서·규칙만) |
| 확인 | 수동. 코드 미변경. |
| 단정 금지 | `주의`: 백로그 진행 표는 2026-08-07 기준이라 최근 기능 상태와 어긋날 수 있음. 상태 정본으로 쓰려면 후속 갱신 필요. 옛 인계 블록의 상태 복붙은 그대로 남음. |
| 성능·주의 | 없음 (문서만, **리빌드 불필요**) |

### 2026-08-13 16:40 — 인계문 작성·저장

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 설계 문서 계단식 통일 반영(16:35) 후 인계. |
| 변경 요약 | 코드 변경 없음. `docs/handoff.md` 상단에 16:40 인계 추가, 본 로그 한 줄. |
| 주요 경로 | `docs/handoff.md`, `docs/impl-log.md` |
| 결과 | 성공 (문서만) |
| 확인 | 수동 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음 (문서만) |

### 2026-08-13 16:35 — 설계 문서 계단식 통일 반영

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 8월 13일 코드는 freq 시작 200·10~300·가변 50/20/10, am −30·6→4→2, 연습/측정 4/8로 바뀌었는데 `amp-mdt-training-design.md` §3·§6이 옛값(freq 10~150·시작 150·고정 ±10)을 가리킴. 숫자의 정본은 코드. 갱신형 설계 문서가 코드를 안 따라간 누락 → 문서만 맞춤. |
| 변경 요약 | §3.1·§4.2·§6·§6.1·§7·§8을 현재 코드 상수에 맞게 갱신. 연습/측정·정본=코드·미검증 표기 추가. 코드 변경 없음. |
| 주요 경로 | `docs/amp-mdt-training-design.md` |
| 결과 | 성공 (문서만) |
| 확인 | `freqStaircase.ts`·`amStaircase.ts`·`pitch2afc/constants.ts`·`sessionMode.ts`와 대조 |
| 단정 금지 | `미검증`: 통일 값은 설계 목적값, 실측 아님. `주의`: am −30은 바닥 반전 몰림 완화만. |
| 성능·주의 | 없음 (문서만, **리빌드 불필요**) |

### 2026-08-13 16:30 — 인계문 작성·저장

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | Cursor 규칙(.mdc alwaysApply vs globs, AGENTS.md 선택) 대화 합의 후 인계. 코드 변경 없음. |
| 변경 요약 | 코드 변경 없음. `docs/handoff.md` 상단에 16:30 인계 추가, 본 로그 한 줄. |
| 주요 경로 | `docs/handoff.md`, `docs/impl-log.md` |
| 결과 | 성공 (문서만) |
| 확인 | 수동 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음 (문서만) |

### 2026-08-13 15:41 — 인계문 작성·저장

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 모드별 독립 상한(측정 50·연습 30) 구현 후 인계. |
| 변경 요약 | 코드 변경 없음. `docs/handoff.md` 상단에 15:41 인계 추가, 본 로그 한 줄. |
| 주요 경로 | `docs/handoff.md`, `docs/impl-log.md` |
| 결과 | 성공 (문서만) |
| 확인 | 수동 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음 (문서만) |

### 2026-08-13 15:36 — 세션 보관 상한을 모드별 독립으로 분리

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 |
| 근거·결정 | 기존 합 상한(`MAX_SAVED_SESSIONS=50`, 모드 무관 `slice`)에서는 연습을 자주 하면 오래된 **측정**이 밀려 삭제 → 통계·추세 그래프 형상이 연습량에 흔들림(측정만 그래프에 그림). 사용자 결정: **독립 상한**(측정 50·연습 30, 합 최대 80). 로컬 요약 레코드라 80개도 가벼움. |
| 변경 요약 | 상수 `MAX_SAVED_SESSIONS` → `MAX_MEASURE_SESSIONS=50`·`MAX_PRACTICE_SESSIONS=30`. `capByMode` 신설: `merged`를 `isCountedInStats`로 갈라 각자 `slice` 후 원래 순서로 재구성. `appendRecord`가 이를 사용. 한 모드 초과 시 그 모드 오래된 것만 버림(타 모드 무간섭). |
| 주요 경로 | `src/training/sessionStore.ts`, `src/training/__tests__/sessionStore.test.ts` |
| 결과 | 성공. `npx jest sessionStore` **35 passed**, `tsc --noEmit` **0 error**. |
| 확인 | 테스트(측정 50 상한·연습 30 상한·모드별 독립 무간섭 케이스 신규)·타입체크·ReadLints. |
| 단정 금지 | `주의`: 기존 저장분에 이미 50개 이상 없으므로 마이그레이션 영향 없음(상한만 상향). `미검증`: 실기기에서 목록 80개 스크롤 체감. `참고`: 페이지네이션 불필요(FlatList 가상화). |
| 성능·주의 | 없음(JS만, **리빌드 불필요**). 목록 상한 50→80이나 FlatList 가상화라 부담 미미. |

### 2026-08-13 15:03 — 인계문 작성·저장

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | idle UI 다듬기(토글 테두리·간격·글자 배율) 후 인계. |
| 변경 요약 | 코드 변경 없음. `docs/handoff.md` 상단에 15:03 인계 추가, 본 로그 한 줄. |
| 주요 경로 | `docs/handoff.md`, `docs/impl-log.md` |
| 결과 | 성공 (문서만) |
| 확인 | 수동 |
| 단정 금지 | `미확인`: 실기기 체감(배율 1.1·간격 64) 미확정. |
| 성능·주의 | 없음 (문서만) |

### 2026-08-13 15:03 — idle 화면 토글 대비·간격·텍스트 ×1.1

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 |
| 근거·결정 | 토글 tint만으로는 선택 구분 약함 → accent 테두리. 선택 시 글자 밀림 방지용 투명 테두리 상시. idle 안내 글자가 작다 → 비율 ×1.1(토글·버튼 포함, 진행/요약 제외). 공용 컴포넌트는 `textScale` 기본 1로 전역 영향 차단. |
| 변경 요약 | `SessionModeToggle` 선택 테두리+`textScale`. `ActionButton`/`Pill`에 `textScale`. ListeningCheck·Freq/Am idle·Pitch idle에 `TEXT_SCALE=1.1`. 토글 `marginBottom: Spacing.six`(사용자 적용). |
| 주요 경로 | `SessionModeToggle.tsx`, `action-button.tsx`, `pill.tsx`, `ListeningCheckScreen.tsx`, `FreqSessionScreen.tsx`, `AmSessionScreen.tsx`, `PitchCompareScreen.tsx` |
| 결과 | 성공. `tsc --noEmit` 0 error. |
| 확인 | 타입체크·ReadLints. 실기기 체감은 사용자 확인 중. |
| 단정 금지 | `미검증`: ×1.1·간격 64는 체감 목적값. |
| 성능·주의 | 없음. 리빌드 불필요. |
| 다음 | 배율/간격 실기기 확정. 계단식 값 파일럿 청취. |

### 2026-08-13 11:29 — 인계문 작성·저장

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 「세 트랙 계단식 통일 + 연습/측정 토글」 구현 완료 후 인계. 연습/측정 UI 신규 생성 확인 포함. |
| 변경 요약 | 코드 변경 없음. `docs/handoff.md` 상단에 11:29 인계 추가, 본 로그 한 줄. |
| 주요 경로 | `docs/handoff.md`, `docs/impl-log.md` |
| 결과 | 성공 (문서만) |
| 확인 | 수동 |
| 단정 금지 | `미확인`: 실기기 UI·오디오 미검증(코드/테스트/타입만 통과). |
| 성능·주의 | 없음 (문서만) |

### 2026-08-13 11:16 — 세 트랙 계단식 통일 + 연습/측정 모드 토글 구현

| 항목 | 내용 |
|------|------|
| 트랙 | ② 주파수 / ① AM / 공통·인프라 |
| 근거·결정 | 11:10 인계 지시대로 구현. freq를 pitch2와 통일(시작200·10~300·가변50/20/10), am 하한 −30·3단계 스텝(6/4/2). 연습(반전4)/측정(반전8) 토글을 세 화면에 추가. 연습은 저장하되 `mode='practice'`로 통계·추세 제외(사용자 결정). idle 기본 모드=연습. |
| 변경 요약 | `freqStaircase`에 `STEP_SCHEDULE`·`stepForReversals`·`currentStep` 신설(pitch2식 가변 스텝 이식, `stepCents` 옵션 주면 고정=하위호환). `amStaircase`는 `stepSizeFor`를 `STEP_SCHEDULE_DB` 순회로 교체, `MIN_DEPTH_DB` −40→−30. `sessionStore`에 `SessionMode`·레코드 `mode?` 선택 필드·`append*(summary, mode)`·`isCountedInStats` 추가(mode 없으면 측정 간주). 통계 화면은 `statRows=rows.filter(isCountedInStats)`로 집계/추세만 필터, 목록엔 「연습」 배지. `peekLatestSession`도 측정 기준. 공통 `sessionMode.ts`+`SessionModeToggle.tsx` 신설, 세 화면(Freq/Am/PitchCompare)에서 세션 생성 시 `targetReversalsFor(mode)`·저장 mode 전달, 세션 중 모드는 `runModeRef`로 고정. |
| 주요 경로 | `src/training/freqStaircase.ts`, `amStaircase.ts`, `sessionStore.ts`, `SessionHistoryScreen.tsx`, `SummaryCard.tsx`, `sessionMode.ts`(신), `SessionModeToggle.tsx`(신), `FreqSessionScreen.tsx`, `AmSessionScreen.tsx`, `pitch2afc/PitchCompareScreen.tsx`, `__tests__/{freqStaircase,amStaircase}.test.ts`(신)·`sessionStore.test.ts` |
| 결과 | 성공. `npx jest src/training` 131 passed, `tsc --noEmit` 0 error. |
| 확인 | Jest(6 suites/131), 타입체크, ReadLints. 실기기 UI·오디오 미확인. |
| 단정 금지 | `미검증`: 200·10~300·50/20/10·am −30·6→4→2 전부 설계 목적값, 실측 아님. `주의`: am 바닥 반전 몰림은 −30으로 완화만, 근본 해결 아님. `확인됨`: 인계의 `LockedTrackChip` ReferenceError는 현재 코드에 없음(해소). 인계의 "freqStaircase/amStaircase 기존 테스트"는 실제 없었음 → 신규 작성. |
| 성능·주의 | 상수·토글 추가라 런타임 부담 사실상 없음. 네이티브·플러그인 변경 없음 → **리빌드 불필요**(dev client 재사용). Freq/Am 화면 인지복잡도 경고는 사전 존재(토글로 소폭 증가), 이번 리팩터링 대상 아님. |
| 다음 | 파일럿 청취로 값(스텝·범위·−30) 체감 검증. 필요 시 화면 컴포넌트 분해로 복잡도 경고 해소. |

### 2026-08-13 11:10 — 인계문 작성·저장 (새 창 구현 시작용)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 새 창에서 세 트랙 계단식 통일 구현을 바로 시작하기 위한 구현 지시서형 인계. 11:08 인계의 합의를 구현 순서·선행 확인 항목 중심으로 재정리. |
| 변경 요약 | 코드 변경 없음. `docs/handoff.md` 상단에 11:10 인계 추가, 본 로그 한 줄. |
| 주요 경로 | `docs/handoff.md`, `docs/impl-log.md` |
| 결과 | 성공 (문서만) |
| 확인 | 수동 |
| 단정 금지 | `미확인`: 구현 전 `sessionStore`·통계 화면 연습/측정 분기 미열람. 나머지 값은 `파일럿`(11:08 기록 참조). |
| 성능·주의 | 없음 (문서만) |
| 다음 | 새 창에서 구현 시작. `freqStaircase` 가변 스텝 이식·`amStaircase` 3단계·−30·연습/측정 토글·통계 분리. 테스트 동반 수정. |

### 2026-08-13 11:08 — 인계문 작성·저장 (세 트랙 계단식 통일 설계 합의)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 / 문서 |
| 근거·결정 | 전 구간 Ask 모드 질의응답으로 세 트랙 staircase 통일안 합의. freq를 pitch2에 맞춤(시작200·10~300·가변50/20/10), am은 dB라 값 통일 제외하되 하한 −40→−30·스텝 6→2→6→4→2. 연습(반전4·통계제외)/측정(반전8·통계포함) 토글. |
| 변경 요약 | 코드 변경 없음. `docs/handoff.md` 상단에 11:08 인계 추가, 본 로그 한 줄. |
| 주요 경로 | `docs/handoff.md`, `docs/impl-log.md` |
| 결과 | 성공 (문서만) |
| 확인 | 수동 |
| 단정 금지 | `파일럿`: 200·10~300·50/20/10·am −30·6→4→2 전부 미검증 설계값. `미확인`: `sessionStore`·통계 코드 연습/측정 분기 미열람. am 바닥 반전몰림 −30으로 완화만. |
| 성능·주의 | 없음 (문서만) |
| 다음 | 사용자가 위 합의대로 구현 요청 예정 (Agent). |

### 2026-08-13 09:56 — 인계문 작성·저장 (밸런스·관례·USB 디버깅 설명)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자 「인계도 작성해」. 세션 전 구간 Ask 모드 = 코드 변경 없음. 내용: 트랙 간 볼륨/주파수 밸런스 Q&A, 관례 검토, USB 실기기 디버깅(adb reverse·8081/5037/5555·`-c` 캐시) 개념 설명. |
| 변경 요약 | `docs/handoff.md` 상단에 `## 인계 — 2026-08-13 09:56` 추가(덮어쓰기 없음). |
| 주요 경로 | `docs/handoff.md` |
| 결과 | 저장 완료. |
| 확인 | 문서만. |
| 단정 금지 | `미확인`: `LockedTrackChip`(`SessionHistoryScreen.tsx:556`) 코드 실재 여부 — 다음 세션 확인 필요. |
| 성능·주의 | 없음. |

### 2026-08-13 09:10 — 인계문 작성·저장 (원격 브랜치·GitHub Code 탭)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자 「인계문 작성해」. 세션: `feat/single-tab-home` fetch/checkout + Code 탭 `/` 브랜치명 원인 확정. |
| 변경 요약 | `docs/handoff.md` 상단에 `## 인계 — 2026-08-13 09:10` 추가(덮어쓰기 없음). |
| 주요 경로 | `docs/handoff.md` |
| 결과 | 저장 완료. |
| 확인 | 문서만. |
| 단정 금지 | 없음(문서). |
| 성능·주의 | 없음. |

### 2026-08-13 01:52 — 인계문 작성·저장 (통계 버튼 UI·단일홈 후속)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자: 「인계문 적어줘」. |
| 변경 요약 | `docs/handoff.md` 상단에 「인계 — 2026-08-13 01:52」 추가(단일홈 기구현·통계 버튼 다색/보더/60×40/`size=28`·다음 실기기·단정 금지). |
| 주요 경로 | `docs/handoff.md`, `docs/impl-log.md` |
| 결과 | 저장 완료. |
| 확인 | 문서만. |
| 단정 금지 | 없음 |
| 성능·주의 | 없음 |

### 2026-08-13 — 통계 버튼 accentBorder

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 / UI |
| 근거·결정 | 사용자: 통계 Pressable에 보더가 조화롭게 보이길 원함. 기존 활성 칩 패턴(`accentTint`+`accentBorder`)과 맞춤. |
| 변경 요약 | `statsButton`에 `borderWidth: 1`, 런타임 `borderColor: theme.accentBorder`. |
| 주요 경로 | `src/app/index.tsx` |
| 결과 | 코드 반영. 리빌드 불필요. |
| 확인 | 실기기 미확인. |
| 단정 금지 | `미검증`: 실기기에서 다색 chart + 보더 대비 미확인. |
| 성능·주의 | 없음 |

### 2026-08-13 — 통계 chart 아이콘 막대별 fill (Icon 내)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 / UI |
| 근거·결정 | 사용자: 전용 다색 SVG 대신 `Icon` chart를 막대별 fill/stroke로 나누는 방식으로 재전환. |
| 변경 요약 | `icon.tsx` `chart`: 기준선 stroke(`color`) + 막대 3개 fill(`accent`/`highlight`/`positive`). `StatsChartIcon` 삭제, 홈 헤더는 다시 `Icon name="chart"`. |
| 주요 경로 | `src/components/ui/icon.tsx`, `src/app/index.tsx`, (삭제) `stats-chart-icon.tsx` |
| 결과 | 코드 반영. 리빌드 불필요(JS·SVG만). |
| 확인 | 타입·실기기 미확인. |
| 단정 금지 | `미검증`: 실기기 가시성·대비 미확인. `주의`: chart만 다색 예외(단색 선 세트 규칙과 어긋남). |
| 성능·주의 | Path 1 + Rect 3. 전용 컴포넌트 대비 구조 더 단순. |

### 2026-08-13 — 통계 헤더 아이콘 다색 SVG

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 / UI |
| 근거·결정 | 사용자: 통계 진입점이 UI상 눈에 띄게. 단색 `Icon` chart 대신 **전용 다색 SVG** 합의(단색 선 세트 규칙 유지). |
| 변경 요약 | `StatsChartIcon` 추가(막대 3개 fill: accent·highlight·positive). 홈 헤더 통계 버튼에서 `Icon name="chart"` 교체. `icon.tsx`의 `chart`는 유지(미사용). |
| 주요 경로 | `src/components/ui/stats-chart-icon.tsx`, `src/app/index.tsx` |
| 결과 | 이후 항목에서 Icon 내 fill 방식으로 되돌림·전용 파일 삭제. |
| 확인 | 타입·실기기 미확인. |
| 단정 금지 | `미검증`: 실기기에서 가시성·대비(특히 accentTint 배경 위) 미확인. |
| 성능·주의 | SVG Rect 3개·정적. 홈 헤더 1곳만. 부담 무시 가능 수준. |

### 2026-08-12 23:40 — 탭 2→1 단일면(홈) 축소 (방식 A: 상태 스와프)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 / UI |
| 근거·결정 | 사용자: "제안대로 한 탭으로 수정" + 구현 방식 **A(상태 스와프)** 선택. 기존 `index.tsx`가 이미 `track` 상태 머신이라 변경 최소·기존 패턴 일치. 새 브랜치 `feat/single-tab-home`에서 작업. |
| 변경 요약 | ① `_layout.tsx`: `NativeTabs`(app-tabs) → `Stack`(headerShown:false)로 교체, 탭 바 제거. ② `index.tsx`: `Track`에 `'stats'` 추가 → `SessionHistoryScreen`을 홈 안에서 스와프 렌더(`onBack=backToPicker`). 헤더 우측 **통계 아이콘**(`chart`) + 홈 상단 **peek 카드**(최근 세션 1줄 요약, 그래프 없음) 두 진입점. 홈 복귀 시 `listSavedSessions`로 peek 갱신. `BackHandler`로 안드로이드 하드웨어 뒤로가기 → 연습 목록 복귀. ③ `icon.tsx`: `chart`(막대 그래프) 추가. ④ `SessionHistoryScreen.tsx`: `peekLatestSession`/`LatestSessionPeek` export(내부 `trackView` 재사용, 중복 없음). ⑤ 삭제: `app-tabs.tsx`·`app-tabs.web.tsx`·`stats.tsx`(탭·구 route). |
| 주요 경로 | `src/app/_layout.tsx`, `src/app/index.tsx`, `src/components/ui/icon.tsx`, `src/training/SessionHistoryScreen.tsx` |
| 결과 | `tsc --noEmit` 0 · 편집 파일 린트 0. 리빌드 불필요(JS 라우팅·SVG만). |
| 확인 | 타입·린트만. 실기기 미확인. |
| 단정 금지 | `미검증`: 실기기에서 통계 진입/뒤로(하드웨어 back 포함)·peek 표시·자동 갱신·통계 push 마운트 재실행 미확인. `추정`: `NativeTabs`(unstable) 사용 제거는 JS만이라 리빌드 불필요로 보이나 다른 네이티브 설정 영향 미실측. `주의`: 하드웨어 back 핸들러가 훈련 세션 화면에서도 연습 목록으로 되돌림(세션 진행 상태 초기화) — 기존 `onBack` 버튼과 동일 동작이라 의도적. |
| 성능·주의 | peek는 `Card` 1개·정적, 홈 복귀 시 1회 `listSavedSessions`만. 통계는 매 진입 마운트(push 아님)라 재계산 발생하나 기록 50건 상한이라 부담 낮음. |

### 2026-08-12 23:25 — 인계문 작성·저장 (탭 2→1 단일면 설계)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자: "제안대로 한 탭으로 수정" 지시 전 인계문 작성 요청. 탭 바 제거·단일 홈 + 통계 진입 A(헤더 아이콘)·B(peek 카드) 병행 설계 합의. |
| 변경 요약 | `docs/handoff.md` 상단에 「인계 — 2026-08-12 23:25」 추가(설계·미결정 A/B·다음 작업·단정 금지). 코드 변경 없음. |
| 주요 경로 | `docs/handoff.md`, `docs/impl-log.md` |
| 결과 | 저장 완료. |
| 확인 | 문서만. |
| 단정 금지 | `미검증`: 구현 방식(A 상태 스와프 / B Stack) 미확정 · 실기기 미확인. `추정`: NativeTabs 제거 리빌드 불필요로 보이나 미실측. |
| 성능·주의 | 없음(문서). |

### 2026-08-12 — 떨림 추이 카드에 고정 active 칩

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·UI |
| 근거·결정 | 사용자: 그래프 A `TrackChips`와 같은 레이아웃을 떨림 카드에도, 트랙 1개라 **항상 선택(active)** UI. |
| 변경 요약 | `LockedTrackChip` 추가 → 떨림 `TrendGraphCard`에 `chips` 전달. 제목 `떨림 추이`·칩 `떨림 찾기`(그래프 A 제목/칩 구조와 맞춤). |
| 주요 경로 | `src/training/SessionHistoryScreen.tsx` |
| 결과 | 적용. 리빌드 불필요. |
| 확인 | 코드만. |
| 단정 금지 | 없음. |
| 성능·주의 | 없음(정적 View). |

### 2026-08-12 — 통계 헤더 캡션 한 줄 표시

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·UI |
| 근거·결정 | 사용자 요청: 통계 화면 헤더 고지 문구를 줄바꿈 없이 한 줄로. 원인=`styles.caption`의 `maxWidth: 220`. |
| 변경 요약 | `maxWidth` 제거 + `numberOfLines={1}`. |
| 주요 경로 | `src/training/SessionHistoryScreen.tsx` |
| 결과 | 적용. 리빌드 불필요. |
| 확인 | 코드만. |
| 단정 금지 | `미검증`: 매우 좁은 화면에서 말줄임(…) 여부·가독성. |
| 성능·주의 | 없음. |

### 2026-08-12 16:48 — 인계문 작성·저장

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자 「인계문 작성해」. 이번 세션 2건(ScoreFraming 기준 B · 탭 4→2) 구현 완료 상태를 인계. |
| 변경 요약 | `docs/handoff.md` 상단에 `## 인계 — 2026-08-12 16:48` 추가(덮어쓰기 없음). |
| 주요 경로 | `docs/handoff.md` |
| 결과 | 저장 완료. |
| 단정 금지 | 없음(문서). |
| 성능·주의 | 없음. |

### 2026-08-12 — 하단 탭 4→2 축소 (연습·통계) + 홈·설정 제거

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·UI / 인프라 |
| 근거·결정 | 홈은 순수 정적 안내(로고+카피)로 고유 기능 없음, 설정은 삭제 버튼+고지뿐 → 2탭으로 압축. 동작 성격에 맞춰 **연습=앱 정보(고지·버전)**, **통계=연습 기록 전체 삭제** 배치(사용자 결정). |
| 변경 요약 | ① `app-tabs.tsx`: 트리거 홈·설정 제거, **`index`(연습)·`stats`(통계) 2개**만. `index` 아이콘=explore.png. ② `src/app/index.tsx`: 홈 화면 폐기, **연습 picker를 index로 이전**(구 explore 내용). `ScrollView`(flexGrow:1)+하단 앱 정보 카드(`marginTop:'auto'`). ③ `SessionHistoryScreen.tsx`: 하단에 `연습 기록 전체 삭제`(CardDivider+확인 Alert+`clearSavedSessions`→reload, 기록 없으면 disabled). ④ `explore.tsx`·`settings.tsx` **삭제**. ⑤ `app-tabs.web.tsx`: 웹 탭도 연습(/)·통계(/stats)로 정합. |
| 주요 경로 | `src/components/app-tabs.tsx`·`app-tabs.web.tsx`, `src/app/index.tsx`, `src/training/SessionHistoryScreen.tsx` (삭제: `src/app/explore.tsx`·`settings.tsx`) |
| 결과 | `tsc --noEmit` 0. 라우팅·TSX만 → 리빌드 불필요(핫리로드). |
| 확인 | 타입 0·린트 내 코드 경고 0(SessionHistory L397 `.at` 경고는 기존 `recent` 계산, 미변경). 수동 확인 필요: 앱 진입=연습 탭·2탭만 노출·통계 하단 삭제 동작·작은 화면 스크롤. |
| 단정 금지 | `주의`: `index`를 진입 라우트로 삼아 `/` 유지(explore→index 이전). `NativeTabs`(unstable)에서 트리거 미등록 라우트 동작 회피 목적. `미검증`: 실기기에서 2탭·삭제 Alert·앱 정보 하단 정렬 렌더 미확인. `추정`: home.png 자산은 이제 미사용(삭제 안 함). |
| 성능·주의 | 없음(정적 화면·ScrollView). |
| 다음 | 실기기에서 진입·탭·삭제·스크롤 확인. |

### 2026-08-12 — ScoreFraming 비교 기준: 최근 3회 평균 ↔ 최신 (B 채택)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·UI |
| 근거·결정 | 초반 1점 편향 완화 위해 후보 B 채택. 사용자 결정: 창=3, 미달 시 A 폴백(처음↔최근). `recent < baseline`이면 개선, 아니면 유지(악화 문구 신설 안 함, §2-1 예외 유지). |
| 변경 요약 | `ScoreFraming`: 기준을 「처음값」→ **최신 제외 직전 N회 평균**(`SCORE_BASELINE_WINDOW=3`). 평균용 점(최신 제외)이 3개 미만이면 처음↔최근 폴백. 부제: `최근 3회 평균 X → 최근 Y` / 폴백 `처음 X → 최근 Y`. `points[len-1]`→`.at(-1)`로 정리. 주석 「하강 화살표」 잔존 문구 갱신. |
| 주요 경로 | `src/training/SessionHistoryScreen.tsx` (`ScoreFraming`) |
| 결과 | TSX만 변경 · 리빌드 불필요(핫리로드). |
| 확인 | 린트: 내 코드 경고 0(L396은 기존 `recent` 계산, 미변경). 수동 확인 필요: 점 2개(폴백)/4개 이상(평균)/평균보다 나쁨→유지. |
| 단정 금지 | `추정`: 창=3이 UX·통계적으로 최적이라는 보장 없음(가중치 미적용·단순 평균). `미검증`: 실데이터에서 평균 기준이 뱃지를 얼마나 자주 바꾸는지. `주의`: 「개선/유지」는 §2-1 성적 프레이밍 예외 — 한 컴포넌트에 모아 삭제 쉽게 유지. |
| 성능·주의 | 없음(작은 배열 slice/reduce). |

### 2026-08-12 — 인계문: ScoreFraming 비교 기준 재설계(미구현)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 / 문서 |
| 근거·결정 | 사용자: 화살표 삭제 후 「점이 많으면 과거 평균 vs 최근이 타당하지 않나」→ 설계 후보만 정리. 「인계문 적어줘 · 새 창에서 이어」. |
| 변경 요약 | `docs/handoff.md` 상단에 `## 인계 — 2026-08-12 16:11` 추가(A 처음↔최근 / B 과거평균↔최근 / C 직전↔최근). 코드 미변경. |
| 주요 경로 | `docs/handoff.md` · (대상) `src/training/SessionHistoryScreen.tsx` `ScoreFraming` |
| 결과 | 인계 저장 완료. 구현·기준 채택은 다음 창. |
| 확인 | 인계 블록 상단 추가·시각 기록. |
| 단정 금지 | `추정`: B가 최종이라는 보장 없음. `주의`: 「개선」은 §2-1 예외. |
| 성능·주의 | 없음(문서만). |

### 2026-08-12 — Dev Client 연결 학습 문서 추가

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 / 문서 |
| 근거·결정 | WiFi 환경 변경·USB reverse·Development servers·기존 WiFi ADB(`tcpip 5555`) 절차가 혼동되어, Metro(8081) vs adb(5555) 구분을 학습용으로 문서화. |
| 변경 요약 | `docs/dev-client-connection-guide.md` 신설. `docs/README.md`·`dev-client-setup-context.md`에 링크. |
| 주요 경로 | `docs/dev-client-connection-guide.md`, `docs/README.md`, `docs/dev-client-setup-context.md` |
| 결과 | 문서만. 코드·네이티브 변경 없음. |
| 확인 | 대화에서 USB+`127.0.0.1:8081` 연결 성공 맥락 반영. |
| 단정 금지 | `ERR_STREAM_PREMATURE_CLOSE` 해석·터널 지연은 **관례/추정**. 모든 LAN에서 WiFi Metro 성공은 **미검증**. |
| 성능·주의 | 없음 |

### 2026-08-12 — 추이 그래프 UI 목업 채택 + 실기기 확인

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·UI |
| 근거·결정 | 사용자 제공 목업(다크·「역치/cent」·개선 프레이밍) 중 **레이아웃만 채택**, 라이트 유지·용어 순화 유지로 합의(`layout_only`). 실기기: 그래프 A(초기값 예 30→21)·개선 배지 렌더 확인. |
| 변경 요약 | **`TrendChart`**: 그라데이션 면(SVG `LinearGradient`, `useId`로 그래프별 고유 id) + 굵은 라인 + 최근 점 강조색 + x축 시간 라벨(가장 오래된/최근). **y방향 반전**: 이전 「위=잘함」을 폐기하고 **값 클수록 위·좋아질수록(값↓) 라인 하강**(목업이 직관적). `formatValue` prop 제거. **카드**: 헤더에 큰 최근값 + 단위(음 높이 차이·최근 / dB·최근) + 「↓ N 개선/유지」 배지 + 「처음 X → 최근 Y」 + 하단 순화 캡션. **테마**: `highlight`(#F5833F)·`positive`/`positiveTint` 추가. |
| 「개선/점수」 | §2-1 예외 유지. `ScoreFraming` **단일 컴포넌트**로 모음(배지+처음→최근). 제거 시 카드의 `<ScoreFraming/>`만 삭제. (기존 `SCORE_FRAMING` 상수는 컴포넌트로 흡수) |
| 주요 경로 | `src/training/TrendChart.tsx`, `src/training/SessionHistoryScreen.tsx`, `src/constants/theme.ts` |
| 결과 | `npx tsc` 0 · 린트 0 · `npm test` **114 통과**. 순수 TSX + 기설치 svg → **리빌드 불필요**. |
| 확인 | tsc·jest·ReadLints + **실기기 그래프/배지 렌더**(사용자). |
| 단정 금지 | `주의`: y방향을 **목업대로 뒤집음**(이전 인계문 「위=잘함」과 반대). 「개선/처음→최근」 배지는 §2-1과 알면서 두는 예외. `미검증`: 떨림(am) 카드 실기기 표시·트랙 칩 전환·다크 아닌 라이트에서 목업 대비 체감. |
| 성능·주의 | 경량(SVG 면+라인, 점 최대 50). 결과·통계 화면 한정. |
| 다음 | am 카드·트랙 칩 실기기 확인. 필요 시 freq·am 계단식 회귀 테스트 추가(전용 테스트 없음). |

### 2026-08-12 — 통계 탭 추이 그래프 (그래프 A·B)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·UI (② 음고 · ① 포락 데이터 시각화) |
| 근거·결정 | 인계문(02:25) 「다음 작업」 그대로 구현. 데이터는 `sessionStore`에 이미 저장(freq=`meanReversalDeltaCents`, pitch2=`meanReversalCents`(cent), am=`meanReversalDepthDb`(dB)). 렌더링은 사용자 결정으로 **`react-native-svg`(이미 설치 15.15.4, Skia 아님) 라인 그래프** 채택. |
| 변경 요약 | **`TrendChart.tsx` 신설**: 경량 SVG 라인, **y축 반전**(값 작을수록=잘함 → min이 상단), 최근 점 강조, 상/하단 축값. **`SessionHistoryScreen`**: `AggregateCard` 아래 그래프 카드 2종 배선. **A=「들을 수 있는 최소 차이 추이」**(cent) — pitch2/freq를 **칩으로 트랙 선택**(과제 2택 vs 3택이라 겹치지 않고 하나씩). **B=「떨림 추이」**(am, dB 라벨 유지). 대표값 없는 세션 제외 → **2점 이상일 때만** 그리고 미만이면 순화 안내 문구. 용어 순화(문항·음 높이 차이·들을 수 있는 최소 차이) 적용. |
| 「개선/점수」 | §2-1 예외(사용자 결정 유지). 제거 쉽게 **`SCORE_FRAMING` 상수 + `TrendScoreBadge` 한 곳**에만 모음(첫값 대비 마지막값 작아지면 「개선」, 아니면 「유지」). |
| 주요 경로 | `src/training/TrendChart.tsx`(신설), `src/training/SessionHistoryScreen.tsx` |
| 결과 | `npx tsc` 0 · 린트 0 · `npm test` **114 통과**. 순수 TSX + 기설치 svg → **리빌드 불필요**(핫리로드). |
| 확인 | tsc·jest·ReadLints. **실기기 미확인**(그래프 렌더·칩 전환·축값 체감). |
| 단정 금지 | `주의`: 「개선/점수」·y축 반전(위=향상)은 §2-1과 알면서 두는 예외. `미검증`: 실기기 그래프 렌더·2점 이상 데이터 실제 축적 흐름·pitch2/freq 트랙 전환 체감. `추정`: `SCORE_FRAMING` 「유지」 문구·개선 판정(첫↔끝 단순 비교)이 최종이라는 보장 없음. |
| 성능·주의 | 경량(SVG 라인, 점 최대 50). 훈련 입력 화면 아님(결과·통계 화면 한정) → 규칙 위배 없음. |
| 다음 | 실기기에서 그래프 렌더·칩 전환·축값 확인. `SummaryCard`의 「전환」 라벨(→난이도 바뀐 횟수) 순화는 공용 컴포넌트라 이번 범위서 제외 — 필요 시 별도. |

### 2026-08-12 — 인계문 작성·저장 (02:25)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | §4-8·§4-9 완료 후 새 창 전환용 인계문. `docs/handoff.md` 상단에 `## 인계 — 2026-08-12 02:25` 추가(덮어쓰기 금지). 다음 작업(통계 탭 추이 그래프)의 설계 합의·용어 순화 매핑·y축 반전·「개선/점수」 라벨 유지(사용자 결정)·데이터 위치(`sessionStore` 대표값)를 정리. |
| 주요 경로 | `docs/handoff.md` |
| 결과 | 성공(문서) |
| 확인 | 상단 블록 시각 표기 |
| 단정 금지 | `주의`: 「개선/점수」·y축 반전은 §2-1과 알면서 두는 예외. `주의`: 딥링크 `exp+rn-hear-1` 캐시 의심(미확인). |
| 성능·주의 | 없음 |
| 다음 | 새 창에서 「인계 이어서」 → 통계 탭 그래프 구현 |

### 2026-08-12 — 설계 문서 3트랙 반영·시작값 정정 (병합 §4-9)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서(설계) |
| 근거·결정 | §4-9 = `amp-mdt-training-design.md` §3·§6에 병합 후 3트랙 반영 + HH 시작값 50/200 불일치 정정(계획 §4-9·§1 부수 발견). **실측**: `pitch2afc/constants.ts`(높낮이 비교=2AFC·시작 `INITIAL_CENTS` 200·10~300·스텝 50/20/10·`ASSESSMENT` 8/30은 평가용), `freqAfcTrial.ts`(`DEFAULT_AFC_N` 3=3AFC)·`freqStaircase.ts`(다른 음 찾기=10~150·±10·시작 150), `amAfcTrial.ts`(떨림=`DEFAULT_AFC_N` 3). 과학 계열은 여전히 ②(음고)·①(포락) 2계열, 제품 카드만 3개. |
| 변경 요약 | §3에 「3.1 병합 후 3트랙(제품 카드)」 표·계열 매핑 추가(높낮이 비교/다른 음 찾기=②, 떨림 찾기=①). §6에 「6.1 높낮이 비교(pitch2) 계단식 이식값」 추가(시작 200·10~300·가변 스텝 50/20/10·훈련 종료 반전4/시행40). 시작값 정정: HH 문서 50 폐기, 코드값 **200 채택**. §8 변경 이력 2줄 추가. |
| 주요 경로 | `docs/amp-mdt-training-design.md` (§3.1·§6.1·§8) |
| 결과 | 성공(문서). 코드 무변경 → 리빌드/테스트 무관. |
| 확인 | 값 3트랙 상수 실측 대조. |
| 단정 금지 | `추정`: pitch2 상한 300·가변 스텝·톤 1.0s/간격 0.5s 적정성 파일럿 미검증. `미검증`: 3카드 묶음 세션 길이·피로·이탈 실기기 미확인. |
| 성능·주의 | 없음(문서) |
| 다음 | (병합 §4 골격 완료) 실기기 확인 → 리빌드 필요 시 `npm run android`. |

### 2026-08-12 — app.json 리브랜딩 (병합 §4-8)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라(빌드·식별자) |
| 근거·결정 | §4-8 = `app.json` 이름·slug·패키지·아이콘을 HarmoniTune으로 + 온보딩 중복 제거(계획 §4-70·§79). **사용자 결정 2건**: (1) 표시(런처+화면 상단·설정) 이름은 **한글 유지**(`청능 애플리케이션`/`청능 연습`), 내부 식별자만 `harmonitune` → 화면 문자열 3곳(`index.tsx`·`app-tabs.web.tsx`·`settings.tsx`)은 **미변경**. (2) `android.package`/`ios.bundleIdentifier`를 `com.rnhear.app`→`com.harmonitune.app`로 변경(기존 설치와 별개 앱이 됨). 온보딩 중복은 실측 결과 이미 없음(`src`에 `onboarding.tsx` 없음, mnn `ListeningCheckScreen` 유지) → 제거할 것 없음. |
| 변경 요약 | `app.json`: `slug` `rn-hear-1`→`harmonitune`, `scheme` `rnhear`→`harmonitune`, `ios.bundleIdentifier`·`android.package` `com.rnhear.app`→`com.harmonitune.app`, `name`은 `청능 애플리케이션` 유지, 아이콘 경로 유지. `package.json`: `name` `rn-hear-1`→`harmonitune`. 코드/설정 내 구 식별자 잔재 없음(나머지 `rnhear`/`rn-hear-1` 참조는 문서뿐). |
| 주요 경로 | `app.json` · `package.json` |
| 결과 | 성공(코드 검증). `npx tsc --noEmit` 0 · `npm test` **114 통과**. **리빌드 필요**(패키지명·scheme 변경 → `npm run android`). |
| 확인 | tsc·test 통과. 실기기·런처 표시·딥링크(scheme) 미확인. |
| 단정 금지 | `미검증`: 새 package/scheme로 dev client 리빌드·설치·딥링크 동작 실기기 확인 안 됨. `주의`: 아이콘은 HarmoniTune 전용 에셋이 없어 기존 아이콘 유지 — 시각 리브랜딩 미완(에셋 확보 시 교체). `주의`: package 변경으로 기존 `com.rnhear.app` 설치본의 로컬 기록(AsyncStorage)은 승계 안 됨. |
| 성능·주의 | 없음(순수 설정 변경) |
| 다음 | 리빌드 후 실기기 확인 → §4-9(설계 문서 §3·§6 3트랙 반영, HH 시작값 50/200 불일치 정정) |

### 2026-08-11 — 인계문 작성·저장 (17:23)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | §4-7 완료 후 작업 중단·새 창 전환용 인계문. `docs/handoff.md` 상단에 `## 인계 — 2026-08-11 17:23` 블록 추가(덮어쓰기 금지). |
| 변경 요약 | §4-7(홈/통계/설정 이식·114 tests) 상태와 다음(실기기 확인·§4-8 리브랜딩 리빌드·§4-9 문서)을 인계문에 정리. |
| 주요 경로 | `docs/handoff.md` |
| 결과 | 성공(문서) |
| 확인 | 상단 블록 시각 표기 확인 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음 |
| 다음 | 새 창에서 「인계 이어서」 |

### 2026-08-11 — 홈/통계/설정 이식 (병합 §4-7)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라(UI·IA) |
| 근거·결정 | §4-7 = HH 홈·통계·설정·결과 이식 + §2-1 카피 적용. **HH 원본 실측**(`d:\harmonic_hear\app\{index,stats,settings,result}.tsx`) 결과, 그대로 이식 불가: (1) HH 통계/결과는 `TrainingStorage.thresholdCents`(역치) 대표 지표 기반인데 mnn은 `sessionStore`(pitch2/freq/am 요약, 역치 없음), (2) 「최고 역치」·「들을 수 있는 최소 차이」·「평가」 배지는 §2-1(역치·평가 금지, 순화)과 정면 충돌, (3) HH는 `COLORS`+Feather, mnn은 `ThemedText/Card/useTheme`, (4) mnn엔 설정 저장소·기준음 프리셋·진동 설정·온보딩 플래그가 **아예 없음**(그 항목은 새 저장소+훈련 로직 배선 필요→범위 밖). **사용자 결정**: IA=하단 탭 확장(홈·연습·통계·설정) · 테마=mnn 디자인 유지(§2-6) · 결과 화면=기존 인라인 `SummaryCard` 유지(HH result 라우트 신설 안 함). §2-3(3종 완성 후 기록 상위 이동) 발동 → 연습 기록을 통계 탭으로 승격, explore에서 기록 카드 제거. §2-5(온보딩 중복)=mnn `ListeningCheckScreen` 유지, HH `onboarding` 미이식. |
| 변경 요약 | `app-tabs.tsx`: 통계·설정 트리거 추가(전용 PNG 자산 없어 `sf`/`md` 시스템 심볼 사용). `SessionHistoryScreen.tsx`: 제목 「연습 기록」→「연습 통계」, 상단에 누적 요약 카드(`AggregateCard`: 연습 횟수·푼 문항·평균 정답률 + 트랙별 횟수, 「정답률 참고용·점수/진단 아님」 주석) 추가, `computeAggregate` 신설. `src/app/stats.tsx`·`src/app/settings.tsx` 신설(설정=앱 정보/버전(expo-constants)·의료기기 아님 고지·연습 기록 전체 삭제(Alert 확인→`clearSavedSessions`)). `explore.tsx`: 기록 카드·`history` 트랙·`SessionHistoryScreen` import 제거(훈련 3카드만). `index.tsx`: 홈 카피 3트랙+통계 탭 반영. |
| 주요 경로 | `src/components/app-tabs.tsx` · `src/app/stats.tsx` · `src/app/settings.tsx` · `src/app/explore.tsx` · `src/app/index.tsx` · `src/training/SessionHistoryScreen.tsx` |
| 결과 | 성공. `npx tsc --noEmit` 0 · 린트 0 · `npm test` **114 통과**. |
| 확인 | tsc·lint·test 통과(로직 무변경). 실기기 미확인. |
| 단정 금지 | `미검증`: 실기기에서 통계/설정 탭 표시·탭 아이콘(sf/md) 렌더·데이터 삭제 흐름. `추정`: `sf="chart.bar"/"gearshape"`·`md="bar_chart"/"settings"` 심볼명이 기기에서 의도대로 그려질지 미확인(타입은 통과). `추정`: HH result 라우트를 안 만든 것이 최종이라는 보장 없음(3종 UI 통합 재검토 가능). `주의`: HH의 기준음 프리셋·진동 토글·온보딩 replay는 mnn에 백엔드가 없어 **의도적으로 이식하지 않음**(가짜 컨트롤 방지). 필요해지면 별도 설정 저장소+훈련 배선이 선행돼야 함. |
| 성능·주의 | 없음(정적 UI). **리빌드 불필요** — `sf`/`md`는 이미 설치된 `expo-symbols`·expo-router 네이티브 탭이 처리(신규 네이티브 의존성·자산 없음). `추정`: 현재 dev client가 `expo-symbols` 포함 상태라는 전제(package.json에 이미 있음). |
| 다음 | 실기기 확인 · §4-8(`app.json` 이름·slug·패키지·아이콘 HarmoniTune화 — 이때 **리빌드 필요**) · §4-9(설계 문서 3트랙 반영). |

### 2026-08-11 — 연습 탭 섹션 재구성 (병합 §4-6)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라(UI) |
| 근거·결정 | 병합 계획 §4-6·§0 표: 훈련 3종을 「연습」 한 탭 안에 **계열별 섹션**으로 묶는다(토글 아님). 음고 2(높낮이 비교·다른 음 찾기) / 떨림 1(떨림 찾기, 포락). 기록은 훈련 트랙이 아니므로 섹션 밖 별도 항목 유지(§2-3: 상위 이동은 3종 완성 후). |
| 변경 요약 | `explore.tsx`의 평면 `TRACKS` 배열(4카드)을 `TRAINING_SECTIONS`(라벨+옵션)와 `HISTORY_OPTION`으로 분리. 카드 렌더를 `renderCard` 헬퍼로 추출(중복 제거). 섹션 라벨(`음고`/`떨림`) + 카드 목록 + 하단 기록 카드 순으로 렌더. 스타일 `sections`/`section`/`sectionLabel` 추가. |
| 주요 경로 | `src/app/explore.tsx` |
| 결과 | 성공. `npx tsc --noEmit` 0 · 린트 0. |
| 확인 | tsc·lint 통과. 로직 변경 없어 테스트 영향 없음(114 통과 유지 추정). |
| 단정 금지 | `미검증`: 실기기에서 섹션 레이아웃·터치 타깃 체감. `추정`: 기록 카드를 섹션 밖 별도로 둔 배치가 최종이라는 보장 없음(§4-7 홈/통계 상위 이식 때 재검토 가능). |
| 성능·주의 | 없음(순수 정적 UI, 추가 렌더 부담 없음). 리빌드 불필요. |
| 다음 | 실기기 확인 · §4-7(홈·통계·설정·결과 이식, 지표 카피 §2-1 적용). |

### 2026-08-11 — 인계문 작성·저장 (17:03)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | §4-5 완료 후 새 창 전환용 인계문. `docs/handoff.md` 상단에 `## 인계 — 2026-08-11 17:03` 블록 추가(덮어쓰기 금지). |
| 변경 요약 | §4-5(저장 스키마 `pitch2` 확장·114 tests) 상태와 다음(실기기 저장 흐름·§4-6 카드 재구성)을 인계문에 정리. |
| 주요 경로 | `docs/handoff.md` |
| 결과 | 성공(문서) |
| 확인 | 상단 블록 시각 표기 확인 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음 |
| 다음 | 새 창에서 「인계 이어서」 |

### 2026-08-11 — 「높낮이 비교」 세션 저장 (병합 §4-5)

| 항목 | 내용 |
|------|------|
| 트랙 | ② 음고(pitch 2AFC) / 공통·인프라 |
| 근거·결정 | §2-2 정본(`merge-host-decision.md` §4.1): **새 v2 키 신설 안 함**. 기존 `sessionStore`(`training.sessionHistory.v1`)의 `SessionTrack`에 값 하나(`'pitch2'`)만 추가하고, freq/am과 같은 `append*`·형태 검증 패턴을 그대로 따름. 요약 스키마의 단일 출처를 `PitchCompareScreen`의 로컬 타입에서 `src/training/pitch2afc/pitchSummary.ts`(`PitchCompareSummary`)로 승격 — 화면(생산)과 저장소(소비)가 같은 타입을 참조. cent 값은 진단 역치·점수가 아니라 난이도 참고값(웰니스 방침 유지). |
| 변경 요약 | `pitchSummary.ts` 신설(타입만). `sessionStore.ts`: `SessionTrack`에 `'pitch2'`, `SavedPitch2SessionRecord`, `isValidRecord`의 `pitch2` 분기(cent 3필드 `number\|null` 검증), `appendPitch2SessionSummary` 추가. `PitchCompareScreen.tsx`: 로컬 `PitchSummary`/`EndReason` 제거→공용 타입 사용, 세션 종료 시 `savedRef`로 1건 저장(중복 방지)·요약 화면에 저장 결과 문구 표시(freq/am 화면과 동일). `SessionHistoryScreen.tsx`: 유니온 확장으로 깨진 좁히기를 `trackView()` 헬퍼로 분리(freq/am/pitch2 3분기, 인지 복잡도도 낮춤). |
| 주요 경로 | `src/training/pitch2afc/pitchSummary.ts` · `src/training/sessionStore.ts` · `src/training/pitch2afc/PitchCompareScreen.tsx` · `src/training/SessionHistoryScreen.tsx` · `src/training/__tests__/sessionStore.test.ts` |
| 결과 | 성공(코드). `npx tsc --noEmit` 0, 린트 0(사전 존재 경고 `newId`의 `Math.random` 1건은 무관·미변경), `npm test` 4스위트·**114 tests** 통과(기존 109 + pitch2 5). |
| 확인 | 타입체크·린트·jest. 신규 테스트: 3트랙 동시 저장·pitch2 저장/조회·null 수치 허용·손상 레코드(pitch2에 freq 필드/문자열 cent) 폐기. **실기기 저장 후 기록 목록 표시는 미확인**. |
| 단정 금지 | `미검증` 실기기에서 세션 종료→저장→`SessionHistoryScreen` 표시 흐름. `추정` `pitchSummary.ts`가 최종 위치라는 보장 없음(3종 UI 통합 시 재검토 가능). `주의` `PitchCompareEndReason`은 null을 안 갖지만 저장소 검증(`isEndReasonOrNull`)·`endReasonLabel`은 null 허용이라 상위호환. |
| 성능·주의 | 없음(순수 TS·저장 1건 append, Skia/Rive/Reanimated 미사용). 네이티브·의존성·리소스 변경 없음 → **dev client 리빌드 불필요**(JS만). |
| 다음 | 실기기 청취+저장 흐름 확인. §4-6 연습 탭 카드 3개 재구성. 기록 화면 상위 이동은 3종 완성 후(§2-3). |

### 2026-08-11 — 인계문 작성·저장 (16:51)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | §4-4 완료 후 새 창 전환용 인계문. `docs/handoff.md` 상단에 `## 인계 — 2026-08-11 16:51` 블록 추가(덮어쓰기 금지). |
| 변경 요약 | 병합 §4-4(「높낮이 비교」 화면 라우팅·§2-1=(a) 훈련/웰니스) 상태와 다음(실기기 청취·§4-5 저장)을 인계문에 정리. |
| 주요 경로 | `docs/handoff.md` |
| 결과 | 성공(문서) |
| 확인 | 상단 블록 시각 표기 확인 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음 |
| 다음 | 새 창에서 「인계 이어서」 |

### 2026-08-11 — 「높낮이 비교」 세션 화면 라우팅 (병합 §4-4)

| 항목 | 내용 |
|------|------|
| 트랙 | ② 음고(pitch 2AFC) / 공통·인프라 |
| 근거·결정 | §2-1(역치·평가 카피) 결정 = **(a) 훈련 모드 + 웰니스 프레이밍**(사용자 선택). `SessionManager`의 `thresholdCents`를 대표 지표로 노출하지 않고, 기존 `FreqSessionScreen`처럼 `SummaryCard`에 「음높이 차이(최근 반전 cent 평균)·가장 쉬움/어려움」만 표시(점수·역치·진단 문구 없음). 세션 길이는 freq 파일럿과 동일 전환 4 / 시행 40(pitch2afc `ASSESSMENT` 8/30은 평가용이라 미사용). 재생 게인은 트랙 상수 `AUDIO.PEAK_GAIN_WAVE`(0.4) 대신 청취 확인과 같은 `0.15`로 맞춰 듣기 준비에서 맞춘 볼륨과 어긋나지 않게 함. 저장(영속)은 §4-5로 미룸 — 이 화면은 기록하지 않음. |
| 변경 요약 | A→B 두 톤 재생 헬퍼 `pitchCompareTrial.ts` 신설(`playPitchPair`, `pureTone` 재사용·중단 폴링). 세션 화면 `PitchCompareScreen.tsx` 신설(훈련 모드 2택: 「더 낮아요/더 높아요」, phase idle→playing→choose→feedback→summary). `explore.tsx`에 `pitch2` 트랙 카드(맨 위, 「높낮이 비교」) + 청취 확인 게이트(음고 트랙은 기준음 440Hz) 배선. |
| 주요 경로 | `src/training/pitch2afc/pitchCompareTrial.ts` · `src/training/pitch2afc/PitchCompareScreen.tsx` · `src/app/explore.tsx` |
| 결과 | 성공(코드). `npx tsc --noEmit` 0, 린트 0, `npm test` 4스위트·109 tests 통과(로직 변경 없음). |
| 확인 | 타입체크·린트·jest. **실기기 청취는 미확인**(아래 단정 금지). |
| 단정 금지 | `미검증` 실기기 A→B 청취·2택 판정 체감·세션 길이/피로. `추정` 게인 0.15가 1.0초 톤에서 적정한지 실측 안 함. `추정` 톤 길이 1.0s·간격 0.5s(트랙 `AUDIO` 값) 유지 — 파일럿 확정 아님. |
| 성능·주의 | 없음(정적 UI·순음 2회 재생, Skia/Rive/Reanimated 미사용). 네이티브·의존성·리소스 변경 없음 → **dev client 리빌드 불필요**(JS만, 핫리로드). |
| 다음 | 실기기 청취 확인 → §4-5 저장(`SessionTrack`에 `pitch2` 값 추가 + 테스트). §2 나머지(온보딩 중복·테마 택1)는 상위 이식 때. |

### 2026-08-11 — 인계문 작성·저장 (16:31)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 새 창 전환용 인계문. `docs/handoff.md` 상단에 `## 인계 — 2026-08-11 16:31` 블록 추가(추가·덮어쓰기 금지). |
| 변경 요약 | 병합 §4-2·§4-3(pitch2afc 로직 이식·109 tests) 상태와 다음 작업(§4-4 화면 라우팅·실기기, §2 미결정)을 인계문에 정리. |
| 주요 경로 | `docs/handoff.md` |
| 결과 | 성공(문서) |
| 확인 | 상단 블록 시각 표기 확인 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음 |
| 다음 | 새 창에서 「인계 이어서」 |

### 2026-08-11 — HH 음고 2AFC 로직 3종 이식 (병합 §4-2·§4-3 착수)

| 항목 | 내용 |
|------|------|
| 트랙 | ② 주파수(음고 2AFC) / 공통·인프라 |
| 근거·결정 | `merge/harmonitune` 브랜치에서 HH 로직만 먼저 이식(UI 미착수). 목적지 `src/training/pitch2afc/`(소스) + `pitch2afc/__tests__/`(테스트). 상수는 mnn UI 테마와 섞지 않고 트랙별 분리(§2-4)하려 `pitch2afc/constants.ts` 신설(`STAIRCASE/AUDIO/ASSESSMENT`만 HH `theme.ts`에서 이식). pitchUtils는 §4-3대로 mnn `cents.ts`에 흡수 — `centsToFreq`가 기존 `hzFromCents`와 수식 동일(`base*2^(cents/1200)`)이라 별칭, `clampFreq` 추가. 오디오→트레이닝 역참조 피하려 `clampFreq` 한도는 인자로 받고 호출부(StaircaseEngine)가 `AUDIO` 한도를 넘김. |
| 변경 요약 | HH `StaircaseEngine/SessionManager/trainingFlow` + 테스트 3개를 `pitch2afc/`로 배치·경로 교정. `cents.ts`에 `centsToFreq`·`clampFreq` 추가. `pitch2afc/constants.ts` 신설. import를 `./constants`·`../../audio/cents`로 연결. |
| 주요 경로 | `src/training/pitch2afc/{StaircaseEngine,SessionManager,trainingFlow,constants}.ts` · `src/training/pitch2afc/__tests__/*.test.ts` · `src/audio/cents.ts` |
| 결과 | 성공. `npm test` 전체 4스위트·109 tests 통과(pitch2afc 86 + 기존 sessionStore 23). |
| 확인 | `npm test`(jest, jest-expo Android preset). 린트 오류 없음. |
| 단정 금지 | `미검증` 실기기 청취·세션 길이/피로. `미검증` HH `@harmonitune/sessions` → mnn 키 마이그레이션 코드는 아직 없음(로직만 이식). `추정` `constants.ts` 분리가 최종 위치라는 보장은 없음(3종 완성 후 재검토 가능). |
| 성능·주의 | 없음(순수 로직·테스트만, UI/렌더 무관). |
| 다음 | §4-3 나머지(`pitchUtils`의 미사용 함수 정리 여부) · §4-4 높낮이 세션 화면 라우팅 + 실기기 청취 |

### 2026-08-11 — 병합 계획 문서에 저장·기록 방침 반영 + README 등록

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 저장·기록 합의(v2 키 없이 기존 `sessionStore`의 `track` 값 확장 · 기록 상위 이동은 3종 시점)가 `merge-host-decision.md` §4.1에만 있고 `merge-plan-harmonitune.md`에는 옛 「새 v2 키」 서술이 남아 있던 불일치를 정정. |
| 변경 요약 | `merge-plan-harmonitune.md` §2에 저장(v2 키 폐기)·기록 위치 항목 반영(뒤 번호 3→4·4→5·5→6), §3 storage 흡수 문구·§4 순서 5번·§7 단정 금지 v2 항목을 새 방침으로 교체. `README.md` 지도(§2 표·§6 목록)에 `merge-plan-harmonitune.md` 등록(이전 미등록). |
| 주요 경로 | `docs/merge-plan-harmonitune.md` · `docs/README.md` |
| 결과 | 성공(문서만) |
| 확인 | 두 병합 문서의 저장 방침이 일치(정본 host-decision §4.1, plan은 링크) |
| 단정 금지 | `미검증` 실제 병합·HH 세션 마이그레이션 코드 없음. `추정` 트랙 값 이름 예시. |
| 성능·주의 | 없음 |
| 다음 | 병합 착수 시 plan §4 순서대로 |

### 2026-08-11 — HarmoniTune×mnn 호스트 결정 문서 + 저장·기록 방침

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 병합 시 **제품=HarmoniTune · 코드 호스트=mnn_1**. 오디오 엔진은 양쪽 `react-native-audio-api`로 동일(문서 “Web Audio”는 규격명). 빌드 설정 비대칭(babel Bundle Mode·metro 패치·dev-client) 때문에 호스트는 mnn. 저장은 새 v2 키가 아니라 기존 `sessionStore`의 `track` 값 확장; 기록 화면 상위 이동은 훈련 3종 시점. |
| 변경 요약 | `docs/merge-host-decision.md`에 §4.1 저장·기록 방침·체크리스트·단정 금지 보강. `docs/README.md` 지도에 문서 등록. |
| 주요 경로 | `docs/merge-host-decision.md` · `docs/README.md` |
| 결과 | 성공(문서만) |
| 확인 | `sessionStore.ts`에 `track`·`schemaVersion`·`migrateRecord` 존재 확인(이전 대화 실측) |
| 단정 금지 | `미검증` 실제 병합·HH 세션 마이그레이션 미구현. `추정` 트랙 값 이름(`'pitch2'` 등)은 예시. `미독` HH `app/training.tsx`. |
| 성능·주의 | 없음 |
| 다음 | 병합 착수 시 §4.1·호스트 결론 따라 진행 |

### 2026-08-11 — `.idea/`를 gitignore에 추가

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 |
| 근거·결정 | IDE 로컬 설정이 스테이징에 섞이지 않게 함. |
| 변경 요약 | `.gitignore`에 `.idea/` 추가 · `git rm -r --cached .idea`로 인덱스에서만 제거(로컬 폴더는 유지). |
| 주요 경로 | `.gitignore` |
| 결과 | 성공 |
| 확인 | `git status`에서 `.idea` 스테이징 항목 사라짐 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음 |
| 다음 | 없음 |

### 2026-08-11 — 「Clean Clinical」 시안을 RN 화면으로 옮김(전 화면 재스타일)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라(UI) |
| 근거·결정 | Claude Design 프로젝트 `6b4737b1…`의 `청능연습-클린클리니컬.dc.html`(폰 목업 10장: 홈 / 연습 선택 / 연습 기록 / 듣기 준비 / ②·① 각 준비·진행·요약)을 **시각·레이아웃 스펙으로만** 참고해 RN 컴포넌트 + `StyleSheet`로 옮김. 시안이 화면마다 같은 카드·버튼·배지·수치 블록을 반복해서 쓰므로, 화면별로 스타일을 복사하지 않고 **공용 프리미티브를 먼저 만들고 6개 화면이 그것을 쓰는** 구조로 감. 시안 문구가 기존 앱 문구 그대로였으므로 **한국어 카피는 한 글자도 바꾸지 않음**. 같이 읽으라고 준 `support.js`는 `.dc.html` 렌더링용 생성 런타임(`dc-runtime`, 편집 금지)이라 **가져올 토큰이 없어 참고만 함**. |
| 변경 요약 | **토큰**: `theme.ts`에 Clean Clinical 팔레트(시그널 블루 `#1668E3` · 잉크 `#10233A` · 틴트 `#EAF2FE` · 면 `#FFFFFF` / 바탕 `#F6F9FD`)와 `surface`·`border`·`borderSubtle`·`textMuted`·`accent*`·`onAccent` 추가, `Radius`·`Shadows` 신설. `themed-text.tsx`에 `heading`·`screenTitle`·`metric`·`mono`(수치용 모노스페이스) 타입 추가. **공용 UI**(신규): `ui/icon.tsx`(react-native-svg 선 아이콘 8종) · `ui/card.tsx` · `ui/action-button.tsx`(primary/secondary 48px) · `ui/pill.tsx` · `ui/equalizer.tsx`(재생 중 막대 애니메이션). **훈련 공용**: `SummaryCard.tsx` 신규 — 세션 요약(①②)과 기록 목록이 **같은 카드**를 씀(기존엔 두 곳에 따로 있었음). **화면 6개** 재스타일: 홈·연습 선택·듣기 준비·②·①·연습 기록. **①② 세션 화면의 로직·상태 전이·오디오 호출은 건드리지 않음** — 렌더와 스타일만 교체(`progressCaption`에서 요약 분기만 JSX로 옮김). 탭 바는 선택 색만 시그널 블루로. |
| 주요 경로 | `src/constants/theme.ts` · `src/components/themed-text.tsx` · `src/components/ui/{icon,card,action-button,pill,equalizer}.tsx`(신규) · `src/training/SummaryCard.tsx`(신규) · `src/app/{index,explore}.tsx` · `src/training/{ListeningCheckScreen,FreqSessionScreen,AmSessionScreen,SessionHistoryScreen}.tsx` · `src/components/app-tabs.tsx` |
| 결과 | 성공 · **실기기 라이트 모드까지 확인됨** |
| 확인 | `npx tsc --noEmit` 통과 · `npx jest` **23/23 유지** · `npx expo lint` 신규 오류 0(남은 오류 2건은 기존 것: `use-color-scheme.web.ts`, `SessionHistoryScreen`의 `reload` 이펙트) · `npx expo export --platform web` 번들 성공 + 홈·연습 선택이 정적 렌더에서 예외 없이 그려짐 · **실기기(안드로이드 dev client, 리빌드 없이 리로드만) 사용자 육안 확인 — 요약 화면이 스크롤 없이 다 들어옴(최대 우려였음), 수치·카드·배지 이상 없음** |
| 단정 금지 | 확인은 **육안 대조**이고 시안과 픽셀 단위로 맞춘 것이 아님 — 여백·자간 차이는 남아 있을 수 있음. 확인 기기는 **1대뿐** — 더 작은 화면에서 요약이 넘치는지는 여전히 미확인(`추정`: 이 기기에서 여유가 있었으므로 대부분 통과할 것으로 봄). `추정`: `Shadows`의 안드로이드 `elevation`은 iOS `shadow*`의 blur/offset을 그대로 재현하지 못해 눈대중. `미검증`: `transformOrigin`(Equalizer)은 RN 0.74+ 기능 — 구형 안드로이드에서 확인 안 함. `주의`: 시안의 **설정(톱니) 버튼은 넣지 않음** — 대응 화면이 없어 눌리지 않는 버튼이 되므로. 폰 프레임·상태바·홈 인디케이터·하단 탭 바 그림은 **목업 장식**이라 제외(탭은 `NativeTabs`가 그림). 시안 폰트(Spline Sans / IBM Plex Mono)는 **번들하지 않음** — `Fonts.mono` 등 시스템 폰트로 대체해 자간·굵기가 시안과 다를 수 있음. `주의`: Equalizer는 **실제 파형이 아니라 장식**이며 자극 세기·난이도와 연동하지 않음(수치를 색·게이지에 싣지 않는 기존 방침 유지). |
| 성능·주의 | 화면당 그림자 있는 View가 늘고, 재생 중에만 막대 4개가 `useNativeDriver` transform 애니메이션을 돎(JS 스레드 부하 없음). 모션 최소화 설정이 켜져 있으면 멈춘 상태로 그림. `추정`: 훈련 입력 화면 경량화 방침에 영향 없다고 봄 — 측정하지 않음. |
| 다음 | 없음(아래 「다크 모드 안 함」 항목으로 이어짐) |

### 2026-08-11 — 요약 화면에 `ScrollView`(글자 확대 대비)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라(UI) |
| 근거·결정 | 세로 고정으로 **가로 회전 넘침은 막았지만 글자 크기 확대는 그대로 남아 있었음**(`allowFontScaling`을 끈 곳이 없어 시스템 설정 최대 200%를 그대로 따름). 사용자: **「스크롤뷰도 넣어줘」**. **버튼을 스크롤 안에 넣지 않고 밖에 고정**하는 쪽을 택함 — 안에 넣으면 `contentContainerStyle`에 `flexGrow: 1`을 줘야 시안의 바닥 고정이 유지되고, 무엇보다 **버튼이 화면 밖으로 밀릴 수 있음**. 밖에 두면 「다시 연습」·「연습 목록」이 **항상 보인다**. |
| 변경 요약 | ①② 세션 화면의 **요약 단계에만** `ScrollView` 추가 — 안에 `✓ 오늘 연습이 끝났어요` + `SummaryCard` + 저장 배지가 들어가고, 화면 제목과 하단 버튼은 밖에 남음. `ScrollView`가 `flex: 1`이라 **버튼이 자연히 바닥에 남으므로** 기존 `actionsBottom`(`marginTop: 'auto'`) 스타일은 **삭제**(두 화면 모두). 진행 중 화면은 **감싸지 않음** — 선택지 3칸이 고정돼야 하므로. |
| 주요 경로 | `src/training/FreqSessionScreen.tsx` · `src/training/AmSessionScreen.tsx` |
| 결과 | 성공 · JS만 → **리빌드 불필요**(리로드로 반영) |
| 확인 | `npx tsc --noEmit` 통과 · `npx jest` **23/23 유지** · `npx expo lint` baseline(오류 1·경고 4) 그대로 · `npx expo export --platform web` 번들 성공 · `actionsBottom` 잔재 0건(grep) |
| 단정 금지 | **글자를 실제로 키워서 확인하지 않음**(`미검증`) — 시스템 글꼴 200%에서 스크롤이 제대로 도는지는 기기에서 봐야 함. `추정`: 내용이 화면에 다 들어올 때는 스크롤바가 안 보이고 여백도 같은 값이라 **기존과 동일하게 보일 것**으로 봄(간격 토큰을 `safeArea`의 `gap`에서 `contentContainerStyle`의 `gap`으로 옮기며 같은 값을 씀). `주의`: **진행 중 화면과 「듣기 준비」 화면은 여전히 스크롤이 없음** — 글자를 크게 하면 거기가 먼저 깨질 수 있음(후속 후보). `주의`: 기록 목록은 원래 `FlatList`라 이 건과 무관. |
| 성능·주의 | 요약에서만 `ScrollView` 1개 추가. 진행 중 화면(자극 재생 경로)은 안 건드림 — 훈련 입력 화면 경량화 방침 유지. |
| 다음 | 리로드 후 요약에서 **시스템 글자 크기를 키워** 스크롤이 도는지 + 버튼이 계속 보이는지 확인 |

### 2026-08-11 — 세로 고정(가로 회전 차단) — **리빌드 필요**

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 |
| 근거·결정 | 요약 화면에 `ScrollView`가 없어 내용이 잘릴 수 있다는 지적에서 출발. 확인해 보니 `app.json`이 `"orientation": "default"`이고 코드에서 `ScreenOrientation.lockAsync`로 잠그는 곳도 **없어 가로 회전이 열려 있었음**(`AndroidManifest`도 `screenOrientation="unspecified"`). 요약 내용 높이를 스타일에서 더하면 **약 610dp**(헤더 90 + ✓줄 30 + 카드 330 + 배지 34 + 버튼 48 + 여백 80)인데 가로 모드 높이는 보통 400dp 미만 → **가로에서는 「다시 연습」 버튼에 닿을 수 없게 됨**. 선택지는 ①요약에 `ScrollView`(요약만 고침·리빌드 불필요) ②세로 고정(가로 문제를 **전 화면** 고침·리빌드 필요) → 사용자: **「세로 고정으로 해줘」**. 소리에 집중하는 훈련 앱이라 가로 레이아웃의 쓸모가 없다는 판단. |
| 변경 요약 | `app.json` `orientation`을 `default` → **`portrait`**(원본 설정). `android/`가 저장소에 커밋돼 있어 app.json만 고치면 반영되지 않으므로 `AndroidManifest.xml`의 `android:screenOrientation`도 `unspecified` → **`portrait`**로 **직접 수정**(`expo prebuild`를 돌리면 `android/`의 다른 수동 변경까지 덮어쓸 수 있어 손으로 맞춤). 두 곳을 같이 바꿔 **설정 원본과 생성물이 어긋나지 않게** 함. |
| 주요 경로 | `app.json` · `android/app/src/main/AndroidManifest.xml` |
| 결과 | 코드 반영 완료 · **네이티브 설정이라 리빌드 전까지는 적용 안 됨**(`npm run android`) |
| 확인 | `app.json` JSON 파싱 유효 · 매니페스트에 `screenOrientation="portrait"` 1건 반영 확인 · `npx tsc --noEmit` 통과 · `npx jest` **23/23 유지**(JS 변경이 없으므로 회귀 확인 목적) |
| 단정 금지 | **기기에서 회전 차단을 확인하지 않음** — 리빌드를 안 했기 때문(`미검증`). `주의`: 세로 고정은 **가로 문제만** 막는다 — **시스템 글자 크기 확대(`allowFontScaling`을 끈 곳 없음, 최대 200%)로 인한 넘침은 그대로 남아 있음.** 청능 훈련 앱 특성상 글자를 키워 쓰는 사용자가 있을 수 있어 `추정`으로 가장자리 사례가 아님 — 필요하면 요약에 `ScrollView`를 따로 넣어야 함. `주의`: `ios/` 폴더가 없어 iOS는 `app.json` 값만 반영됨(나중에 prebuild 시 적용). 태블릿에서도 세로로 고정됨 — 의도한 것인지는 확인 안 함. |
| 성능·주의 | 회전 시 레이아웃 재계산이 아예 없어짐. 부정적 영향 없음. |
| 다음 | `npm run android`로 리빌드 → 기기에서 **가로로 돌려도 안 돌아가는지** 확인 |

### 2026-08-11 — 죽은 코드 정리(스타터 잔재 3개 + 고아 에셋 2개)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 |
| 근거·결정 | 사용자: **「죽은 코드 정리해줘」**. `use-color-scheme`만이 아니라 `src` 전체에서 **들어오는 참조가 0인 파일**을 훑어서 확인함(파일명 기준 1차 집계 → `import`/`require` 문으로 2차 확인). 지운 것은 **전부 참조가 0**이고, 지운 파일이 끌어오던 다른 파일은 여전히 다른 곳에서 쓰여 **연쇄로 죽는 파일은 없었음**. |
| 변경 요약 | **삭제**: `components/hint-row.tsx` · `components/ui/collapsible.tsx` · `components/web-badge.tsx` (셋 다 Expo 스타터 잔재로 **이번 작업 이전부터 죽어 있던 것**) + `assets/images/expo-badge{,-white}.png` (`web-badge.tsx`만 쓰던 고아 에셋). `hooks/use-color-scheme{,.web}.ts`(다크 고정으로 죽은 것)는 **이 세션 밖에서 이미 지워져 있었음** — 결과적으로 의도한 상태와 같음. |
| 주요 경로 | `src/components/{hint-row,web-badge}.tsx` · `src/components/ui/collapsible.tsx` · `assets/images/expo-badge*.png` (모두 삭제) |
| 결과 | 성공 · JS/에셋만 → **리빌드 불필요** |
| 확인 | `npx tsc --noEmit` 통과 · `npx jest` **23/23 유지** · `npx expo lint` **오류 2 → 1로 줄어듦**(`use-color-scheme.web.ts` 것이 사라짐. 남은 1건은 기존 `SessionHistoryScreen`의 `reload` 이펙트) · `npx expo export --platform web` 번들 성공 + 정적 라우트 4개 그대로 |
| 단정 금지 | 참조 검사는 **정적 grep 기반** — 문자열로 동적 로딩하는 코드가 있으면 못 잡음(`추정`: 이 앱엔 그런 패턴이 없다고 봄, 전수 확인은 안 함). **삭제한 화면들을 실행해 본 적은 없음**(원래 아무 데서도 안 그려지던 것이라 확인할 화면 자체가 없음). `주의`: `npx expo lint`를 처음 돌릴 때 **`eslint.config.js`가 자동 생성됨**(스캐폴딩) — 내가 의도해서 만든 파일이 아니지만, 없으면 `npm run lint`가 매번 다시 만들려 하므로 남겨 둠. |
| 성능·주의 | 번들에서 파일 5개가 빠짐(웹 번들 크기 변화는 2.4MB로 표기상 동일 — 원래 트리셰이킹으로 빠지던 것으로 `추정`). 부정적 영향 없음. |
| 다음 | 없음 |

### 2026-08-11 — 다크 모드 구현 안 함(라이트 고정)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라(UI) |
| 근거·결정 | 사용자: **「다크 모드는 구현 안할거야」**. 원본 시안(Clean Clinical)이 **라이트 전용**이라 다크 팔레트는 내가 대비 관계만 뒤집어 만든 **추정치였고, 검증할 시안이 없었음** — 근거 없는 색을 코드에 남겨 두는 대신 지우기로 함. 「필요없는 것은 안 한다」는 기존 방침(2026-08-07)과 같은 결. |
| 변경 요약 | `theme.ts`에서 `Colors.dark` **삭제**, `ThemeColor = keyof typeof Colors.light`로 단순화. `useTheme()`는 OS 설정을 보지 않고 **항상 `Colors.light` 반환**(훅 형태는 유지 — 화면 호출부를 안 건드리고, 나중에 되살리면 여기서만 갈라주면 됨). `app-tabs.tsx`·`app-tabs.web.tsx`·`_layout.tsx`(`ThemeProvider`가 항상 `DefaultTheme`)도 라이트 고정. |
| 주요 경로 | `src/constants/theme.ts` · `src/hooks/use-theme.ts` · `src/components/app-tabs{,.web}.tsx` · `src/app/_layout.tsx` |
| 결과 | 성공 · JS만 바뀜 → **리빌드 불필요**(리로드로 반영) |
| 확인 | `npx tsc --noEmit` 통과 · `npx jest` **23/23 유지** · `npx expo lint` 기존 baseline(오류 2·경고 4) 그대로 |
| 단정 금지 | **`app.json`의 `userInterfaceStyle`은 `automatic` 그대로 둠** — 이건 네이티브 설정이라 바꾸면 리빌드가 필요해서 건드리지 않음. 따라서 JS가 그리는 화면은 전부 라이트지만, **OS 다크에서 네이티브 쪽(상태바 아이콘 등)이 어떻게 보이는지는 확인 안 함**(`미검증`). 거슬리면 `"light"`로 바꾸고 리빌드해야 함. `주의`: `src/hooks/use-color-scheme{,.web}.ts`가 **더 이상 아무도 안 쓰는 죽은 코드**가 됨 — 지우지 않고 남겨 둠(별도 정리 건). |
| 성능·주의 | `useTheme`가 훅 호출 없이 상수만 반환 → 리렌더 트리거가 하나 줄어듦. 부정적 영향 없음. |
| 다음 | 없음 |

### 2026-08-07 — P2-3 청취 조건 안내 + 백로그 범위 결정(안 함/보류 확정)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라(UI) · 문서 |
| 근거·결정 | 사용자: **「필요없는 것은 안 해도 된다」** → 백로그를 전부 하지 않기로 결정. **P0 4건 + P2-3까지만** 하고 멈춤. P2-3을 고른 이유: 청취 조건(스피커/이어폰·볼륨)이 통일되지 않으면 **앱이 쌓는 기록끼리 비교가 불가능**해 기록 앱으로서 존재 이유가 흔들림 + 과도 음량 안전. 나머지는 **써보며 실제 불편이 나오면** 고르기로. |
| 변경 요약 | `ListeningCheckScreen.tsx` 신규(이어폰 권장 + 샘플음으로 볼륨 맞추기 + 진단 아님 재고지). `explore.tsx`에서 트랙 진입 시 1회 표시 — **①② 공통 1개 화면**이라 두 훈련 화면은 **한 줄도 안 건드림**(P1-2를 키우지 않기 위해). 샘플음은 그 트랙에서 실제로 듣는 음(② 440 Hz / ① 1 kHz). 문서: 백로그에 **§6 「안 하기로 한 것」** 신설(P1-3·P2-1·P2-2·P2-6·P3-2·P3-3 + 사유·다시 열 조건), 보류(P1-2·P1-4·P3-1) 표기, easy 버전 상태 동기화. |
| 주요 경로 | `src/training/ListeningCheckScreen.tsx`(신규) · `src/app/explore.tsx` · `docs/improvement-backlog{,-easy}.md` · 리뷰 `docs/fix-reviews.md` |
| 결과 | 코드 반영 완료 · **동작 확인 미실시** |
| 확인 | `npx tsc --noEmit` 통과 · `npx jest` 23/23 유지 · 문서 링크 전수 검사 통과 |
| 단정 금지 | **에뮬 확인 안 함**(화면 UI라 눈으로 봐야 함). 이 화면이 **세션 간 비교 가능성을 실제로 높이는지 검증 안 됨** — 사용자가 안내를 무시하면 아무것도 강제되지 않음(`주의`). **기록에 청취 조건을 남기지 않음** — 나중에 조건 차이를 알 방법이 없음(후속 후보). **보정(calibration) 아님** — dB 수치 제시·볼륨 강제 없음, 청력 보호를 보장하지 않음. 화면 테스트 없음. 자극 스펙(게인 0.15 등)은 **바꾸지 않음**(여전히 임시값). |
| 성능·주의 | 화면 1개 추가(정적 텍스트 + 버튼). 훈련 입력 화면 경량화 방침에 영향 없음. |
| 다음 | **여기서 멈춤.** 에뮬에서 P0 4건 + P2-3 확인 → 써보면서 실제 불편이 나오면 그때 백로그에서 고르기 |

### 2026-08-07 — P0-3·P0-4 수정: 저장 데이터 형태 검증 · 테마 널 가드

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라(영속 · 테마) |
| 근거·결정 | **P0-3**: `readAll`이 배열 여부만 보고 `as SavedSessionRecord[]`로 캐스팅 — `as`는 런타임 검사가 아니므로 손상 레코드가 화면까지 흘러가 `toFixed` 등에서 목록 전체가 크래시 가능. 레코드에 버전 표시도 없어 구버전 구분 불가. **전체 폐기 대신 레코드 단위 드롭**을 택함(한 건 때문에 50건을 날리지 않기 위해). **P0-4**: RN 타입 선언(`ColorSchemeName`, non-null)과 구현(`?ColorSchemeName`)이 어긋나 런타임 null이 가능하고 타입 검사로 안 잡힘. |
| 변경 요약 | `sessionStore.ts`: `isValidRecord` 형태 검증(id·savedAt·track·summary 필수 필드, 수치는 **null 허용**) + `migrateRecord` 마이그레이션 자리 + `SESSION_RECORD_VERSION`(신규 레코드에 `schemaVersion` 기록, 없으면 v1로 간주). 읽을 때 버린 레코드는 다음 쓰기에서 저장소에서도 사라짐. `use-theme.ts`·`app-tabs.tsx`: `scheme === 'dark' ? 'dark' : 'light'`로 널 병합. sonarqube 힌트 반영해 `END_REASONS`를 `Set`으로. |
| 주요 경로 | `src/training/sessionStore.ts` · `src/hooks/use-theme.ts` · `src/components/app-tabs.tsx` · `src/training/__tests__/sessionStore.test.ts`(8→23케이스) · 리뷰 `docs/fix-reviews.md` |
| 결과 | 성공(P0-3) / 코드 반영·미검증(P0-4) |
| 확인 | `npx jest` **23/23 통과** · `npx tsc --noEmit` 통과 · **`migrateRecord` 검증을 무력화해 11건 실패 재현 후 복원** — 테스트가 결함을 실제로 잡는 것까지 확인 |
| 단정 금지 | 손상 데이터가 **실기기에서 발생한 적이 있는지 미확인** — 예방적 수정. 「기록 화면이 넘어진다」는 코드 경로 기반 **추론**이며 크래시 재현 아님. **P0-4는 테스트 없음**(RN 훅 목 비용 대비 2줄 수정) · 런타임 null 관측된 적 없음(`추정`). 검증은 **형태만** 봄 — `trialCount: -5` 같은 의미상 이상값은 통과. 불량 레코드를 **조용히 버려** 사용자 안내가 없음(`주의`). 에뮬 확인 **안 함**. |
| 성능·주의 | 읽을 때 레코드당 필드 검사 추가. 최대 50건이라 영향 없음으로 봄(`추정`). |
| 다음 | 에뮬 확인(기존 기록이 그대로 보이는지가 최우선) → P1-3(eslint 설정) 또는 P1-1(계단식·세션 테스트) |

### 2026-08-07 — 문서 구조 정리(중복 제거) · 인계문 날짜 사본 규칙 폐지

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자 「중복 줄이고 분류 규칙 세워라」. 실측: ① `handoff-2026-08-06.md`의 인계 블록 8개가 `handoff.md`와 **완전히 동일**(고유한 줄은 제목 2줄뿐) → 100% 중복 ② 수정 리뷰를 항목별 파일로 만들면 백로그 항목 수만큼 파일이 늘어남 ③ 「진행 상태」가 6곳에 흩어져 갱신 누락 위험. **정본(single source of truth) 개념을 도입해 문서별로 지정.** |
| 변경 요약 | (1) `fix-p0-1-review.md`+`fix-p0-2-review.md` → **`fix-reviews.md` 1개로 병합**(최신이 위, handoff·impl-log와 동일 관례). (2) **`handoff-YYYY-MM-DD.md` 규칙 폐지** — `.cursor/rules/android-dev-client.mdc` 4단계 삭제(5단계→4단계), `handoff-2026-08-06.md` 삭제(git 이력 보존). (3) `docs/README.md` **신규** — 갱신형/누적형 분류, 문서별 정본, 「어디에 적을지」 결정표, 목적별 읽는 순서. (4) `improvement-backlog.md` 맨 위에 **진행 현황 표**(상태 정본) + P0-2 추정 정정. (5) `improvement-backlog-easy.md` **237→131줄**(비유가 값어치 하는 항목만 남기고 나머지는 백로그 참조). |
| 주요 경로 | `docs/README.md`(신규) · `docs/fix-reviews.md`(신규·병합) · `.cursor/rules/android-dev-client.mdc` · `docs/handoff.md` · `docs/dev-client-setup-context.md` · `docs/improvement-backlog{,-easy}.md` · `README.md` · 삭제: `docs/handoff-2026-08-06.md`, `docs/fix-p0-*-review.md` |
| 결과 | 성공. docs 3,323 → **2,678줄**(−645). 파일 10 → 9개. 내부 링크 전수 검사 통과(깨진 링크 0). |
| 확인 | `comm`으로 날짜본이 `handoff.md`에 완전 포함됨을 확인 후 삭제 · 링크 전수 스크립트 |
| 단정 금지 | **이 로그 파일의 과거 항목에 남은 `handoff-2026-08-06.md` 참조는 고치지 않았음** — 누적형 문서는 과거 블록을 수정하지 않는 원칙(`docs/README.md` §3). 그 시점에는 실제로 그 파일이 있었으므로 기록으로서 정확하다. `주의` 앞으로 인계문 작성 시 날짜본을 만들면 안 됨. **남은 중복**: `improvement-backlog-easy.md`가 백로그의 병렬 판본이라는 성격은 축소했을 뿐 완전 해소 아님. 문서 총량은 이번 작업 이전(6개)보다 여전히 많음. |
| 성능·주의 | 없음(문서만) |
| 다음 | P0-3(형태 검증) → P0-4 → P1-1(계단식·세션 테스트) |

### 2026-08-07 — P0-2 수정: 저장 경쟁(기록 유실) + 첫 단위 테스트

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라(영속) |
| 근거·결정 | 백로그 P0-2. `append*`가 read→수정→write 3단계인데 잠금 없음 → 동시 호출 시 나중 쓰기가 앞 쓰기를 덮음. **테스트로 측정: 동시 2건→1건, 동시 5건→1건 남음**(백로그의 「한 건 유실 가능」 `추정`보다 나쁨). 라이브러리 없이 promise 체이닝 큐(13줄) 채택. |
| 변경 요약 | `sessionStore.ts`에 직렬화 큐 `enqueue()` 도입, 모든 접근(append·list·clear)을 큐 경유. append 두 함수의 복붙 본문을 `appendRecord(build)` 공통화하고 **레코드 생성을 큐 안으로** 이동(savedAt이 기록 순서와 일치). 내부 `readAll`/`writeAll` → `readAllRaw`/`writeAllRaw`. **export 시그니처 무변경.** 부수: `jest.config.js`에 `@/` moduleNameMapper, `tsconfig.json`에 `types: ["jest"]`(TS 6.0에서 `@types` 자동 포함이 동작하지 않아 명시 — `관찰`). |
| 주요 경로 | `src/training/sessionStore.ts` · `src/training/__tests__/sessionStore.test.ts`(신규 8케이스) · `jest.config.js` · `tsconfig.json` · 리뷰 `docs/fix-reviews.md` |
| 결과 | 성공 |
| 확인 | `npx jest` **8/8 통과** · `npx tsc --noEmit` 통과 · **수정 전 구현(HEAD)으로 되돌려 2건 실패 재현 후 복원** — 테스트가 결함을 실제로 잡는 것까지 확인. 에뮬 확인은 **안 함**(리뷰 §6). |
| 단정 금지 | 유실 비율은 **지연 있는 인메모리 목 기준**이며 실기기 AsyncStorage 타이밍과 같다는 뜻 아님. 앱에서 저장이 겹치는 실제 빈도 **미측정**. 큐는 **같은 JS 런타임 안에서만** 유효(프로세스 간 잠금 아님) — 클라우드 동기화 시 재검토. 성능 영향 「체감 없음」은 `추정`(실기기 미측정). **P0-3(레코드 형태 검증)은 그대로 남음.** 테스트는 `sessionStore`만 덮음. |
| 성능·주의 | 동시 저장이 직렬화되어 총 시간은 건수에 비례. 세션당 1회·수 ms 규모라 영향 없음으로 봄(`추정`). |
| 다음 | P0-3(형태 검증·마이그레이션) → P0-4 → P1-1(계단식·세션 테스트) |

### 2026-08-07 — P0-1 수정: 「중지」 미작동 · 기록 중복 저장

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라(①② 훈련 화면) |
| 근거·결정 | 백로그 P0-1. 중단 신호가 2개(`stopXTone()`=현재 소리만, `abortRef`=루프 중단)인데 `goSummary`가 앞의 것만 호출 → 남은 구간 계속 재생 + `runTrial`이 `setPhase('choose')`로 요약을 덮음 → 완료 세션 재채점 → 저장 2회. 대안 B(promise reject)·C(AbortController)는 **테스트 0개 상태(P1-1)에서 오디오 계층 변경은 회귀 위험**이라 보류하고 **표면적 최소** 수정 채택. |
| 변경 요약 | `goSummary`에서 `abortRef.current = true` 선행 + `savedRef`로 세션당 저장 1회 보장, `onChoose`에 `session.status !== 'active'` 가드, `onStart`·`resetToIdle`에서 `savedRef` 리셋. ①② **동일 적용**. 오디오·훈련 로직·저장 계층 **무변경**. |
| 주요 경로 | `src/training/FreqSessionScreen.tsx`, `src/training/AmSessionScreen.tsx` (+30/−2) · 리뷰 `docs/fix-reviews.md` |
| 결과 | 부분 — 코드 반영 완료, **동작 확인 미실시** |
| 확인 | `npx tsc --noEmit` 통과. 에뮬 재현·확인 **안 함**(리뷰 문서 §7 체크리스트) |
| 단정 금지 | **에뮬 미검증** — 「고친 것으로 보인다」 단계. P0-2(저장 read-modify-write 경합)는 `savedRef`로 **완화일 뿐 미해결**(인스턴스 단위). 저장 실패 시 재시도 없음(기존과 동일). 중단 시행이 요약 시행 수에 미포함되는 기존 동작은 그대로. sonarqube 인지 복잡도 20>15 경고는 수정 전부터 있었던 것으로 `추정`. |
| 성능·주의 | 없음(ref 2개·분기 2개 추가) |
| 다음 | 에뮬 확인(리뷰 §7) → P1-1 단위 테스트 → P0-2~P0-4 |

### 2026-08-07 — 개선 백로그 문서 작성

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자 「앱 파악 후 개선사항 md」 요청. `src` 전체(33파일)·설정·의존성 정독 후 P0~P3로 정리. `tsc --noEmit` 통과 확인, 테스트 파일 0개·ESLint 컨픽 없음·CI 없음 확인. |
| 변경 요약 | `docs/improvement-backlog.md` 신규. 코드 결함 4건(중단 미작동·중복 저장 / 저장 경쟁 / 저장 데이터 미검증 / 테마 널) + 구조·UX·정리 항목. 이어서 사용자 요청으로 `docs/improvement-backlog-easy.md`(비유 기반 쉬운 말 버전, 「청음 연습실」 비유 · 항목 번호 대응) 추가. 코드 변경 없음. |
| 주요 경로 | `docs/improvement-backlog.md`, `docs/improvement-backlog-easy.md` |
| 결과 | 성공(문서만) |
| 확인 | `npx tsc --noEmit` 통과 · 라인 참조는 `ec53d8f` 기준 |
| 단정 금지 | 결함 4건은 **코드 정독 추론 · 에뮬 재현 미실시**. 성능 개선 효과 미측정. 자극 스펙 확정 제안 아님(임시 유지). |
| 성능·주의 | 없음(문서만) |
| 다음 | 사용자 판단 — P0-1(중단·중복 저장) 우선 권장 |

### 2026-08-06 17:01 — 인계문 작성

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자 「넣어봐」— UI 방향 합의를 handoff 상단에 반영. 저장 문구 에뮬 확인·`ec53d8f` 푸시·자극 임시 유지 포함. |
| 변경 요약 | `## 인계 — 2026-08-06 17:01` 블록을 `handoff.md`·`handoff-2026-08-06.md` 상단에 추가. |
| 주요 경로 | `docs/handoff.md`, `docs/handoff-2026-08-06.md` |
| 결과 | 성공 |
| 확인 | 파일 상단 블록 |
| 단정 금지 | 색·게이지 구현 스펙 미정. |
| 성능·주의 | 없음(문서만) |
| 다음 | (선택) 다색·게이지 구현 · 자극/DOI(후순위) |

### 2026-08-06 16:37 — 연습 기록 UI 방향 합의(부분 차용)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서·UI |
| 근거·결정 | 사용자: 목업(글래스·다색·다지표)을 **그대로 구현하지 않음**. 피드백 항목 기준 — **미적용**: (2) score 카피, (4) 전환 카드 중복, (5) 난이도 축(쉬움~150/어려움~140식) 시각화. **일부 수용**: (1) 다색 **일부**, (3) 그래프·게이지 **소수만**. 이미지만큼 과하지 않게 소수 차용. |
| 변경 요약 | 합의만 문서화. 코드·테마 미변경. |
| 주요 경로 | `docs/impl-log.md`, `docs/amp-mdt-training-design.md` §8 |
| 결과 | 기록 완료 |
| 확인 | 사용자 확인 대화 |
| 단정 금지 | `주의` 색·게이지 구체 스펙·라이브러리 미정. `미검증` 시각화가 점수·진단으로 읽힐 여지 — 구현 시 카피는 기록·참고 유지. |
| 성능·주의 | 그래프 추가 시 이력 화면 부담 가능(입력 화면 아님). 과도한 Skia/차트는 피할 것. |
| 다음 | (선택) `theme.ts` 액센트 일부 + 이력에 게이지/그래프 1~2개 설계·구현 |

### 2026-08-06 16:19 — 인계문 작성

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자 「인계문 작성해」. 이력 UI·카드 타이포·TS 수정 반영. |
| 변경 요약 | `## 인계 — 2026-08-06 16:19` 블록을 `handoff.md`·`handoff-2026-08-06.md` 상단에 추가. |
| 주요 경로 | `docs/handoff.md`, `docs/handoff-2026-08-06.md` |
| 결과 | 성공 |
| 확인 | 파일 상단 블록 |
| 단정 금지 | 저장 문구 에뮬 미검증. DOI 미검토. |
| 성능·주의 | 없음(문서만) |
| 다음 | 에뮬 저장 문구·목록 재확인 · 색상(선택) · 자극/DOI(후순위) |

### 2026-08-06 16:02 — 연습 기록 카드 배치·글자 크기

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 |
| 근거·결정 | 사용자: 이력 UI 가독성·균형 — 배치·글자 크기 우선. |
| 변경 요약 | 카드: 제목|날짜 헤더, 연습/정답/전환 3열, 라벨·값 행. 화면 제목 28. 색상 변경 없음. |
| 주요 경로 | `src/training/SessionHistoryScreen.tsx` |
| 결과 | 코드 반영. |
| 확인 | lint. 에뮬 시각 확인은 사용자. |
| 단정 금지 | 레이아웃 만족도는 주관·미검증. 기록≠진단. |
| 성능·주의 | 카드당 View 증가(소폭). FlatList·텍스트만 유지. |
| 다음 | 에뮬 확인 · 색상(선택) · 자극/DOI(후순위) |

### 2026-08-06 16:01 — SessionHistoryScreen 유니온 좁히기 수정

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 |
| 근거·결정 | `summary`를 먼저 분해하면 `track` discriminant가 끊겨 TS 오류. 분기 안에서 `record` 분해. |
| 변경 요약 | `recordLines`에서 `track === 'freq'` 분기 후 각각 `summary` 접근. |
| 주요 경로 | `src/training/SessionHistoryScreen.tsx` |
| 결과 | 성공. `tsc --noEmit` exit 0. |
| 확인 | 해당 파일 lint 0 · 프로젝트 tsc 통과. 동일 패턴은 이력 화면만 사용. |
| 단정 금지 | 없음 |
| 성능·주의 | 없음 |
| 다음 | 이력 UI 가독성(배치·글자 크기) · 에뮬 영속 확인 |

### 2026-08-06 15:34 — 연습 기록 목록 UI

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 |
| 근거·결정 | 사용자: 인계 다음 권장 1·2 — 영속 확인 + 이력 목록 UI 구현. |
| 변경 요약 | `SessionHistoryScreen` 추가(요약 FlatList). 연습 탭에 「연습 기록」진입. 영속 저장 문구는 코드 경로 확인(`goSummary` → `setSaveNote('기기에 기록했어요')`). |
| 주요 경로 | `src/training/SessionHistoryScreen.tsx`, `src/app/explore.tsx` |
| 결과 | 코드 반영 성공. 에뮬 수동 종료·문구 확인은 미실시. |
| 확인 | 저장 문구 문자열·append 호출 코드 확인. 이력 UI 정적 검토. |
| 단정 금지 | 에뮬에서 「기기에 기록했어요」·목록 노출은 **미검증**. 기록≠진단·역치. |
| 성능·주의 | FlatList 최대 50건·텍스트만(경량). 진입 시 AsyncStorage 1회 읽기. |
| 다음 | 에뮬: ①·② 종료→저장 문구→연습 기록 목록 확인 · 자극/DOI(후순위) |

### 2026-08-06 15:32 — 인계문 작성

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자 「인계문 작성해」. 영속 MVP·DOI 보류·문서 커밋 반영(15:15 상단 갱신). |
| 변경 요약 | `## 인계 — 2026-08-06 15:32` 블록을 `handoff.md`·`handoff-2026-08-06.md` 상단에 추가. |
| 주요 경로 | `docs/handoff.md`, `docs/handoff-2026-08-06.md` |
| 결과 | 성공 |
| 확인 | 파일 상단 블록 |
| 단정 금지 | 영속 에뮬 확인 미검증. DOI 미검토. |
| 성능·주의 | 없음(문서만) |
| 다음 | 에뮬 영속 확인 · 이력 UI(선택) · 자극/DOI(후순위) |

### 2026-08-06 15:21 — 문서 커밋 준비(handoff·impl-log·설계 DOI 대기 표기)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자: 다음 권장 순서대로 · **3번 문서 커밋 필수**. DOI 전문가 검수는 외부 대기(완료 불가). |
| 변경 요약 | `amp-mdt-training-design.md` §4.4 열린 항목에 외부 전문가 대기 명시. handoff·impl-log 미커밋분 포함 커밋. |
| 주요 경로 | `docs/amp-mdt-training-design.md`, `docs/handoff.md`, `docs/handoff-2026-08-06.md`, `docs/impl-log.md` |
| 결과 | 성공(커밋 시점) |
| 확인 | 파일 상단·§4.4 |
| 단정 금지 | DOI 표는 여전히 임시·전문가 미검토. |
| 성능·주의 | 없음(문서만) |
| 다음 | 영속 수동 확인 · 이력 UI(선택) · DOI 전문가 |

### 2026-08-06 15:21 — 세션 영속 MVP(요약 로컬 저장)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 |
| 근거·결정 | 사용자: 다음 1번 영속 진행. AsyncStorage 이미 의존성. 요약만 저장(전체 trial 히스토리 아님). |
| 변경 요약 | `sessionStore.ts` 추가(최대 50건). ①·② 요약 진입 시 append. 요약에 「기기에 기록했어요」. |
| 주요 경로 | `src/training/sessionStore.ts`, `FreqSessionScreen.tsx`, `AmSessionScreen.tsx` |
| 결과 | 코드 반영 · 에뮬 수동 확인은 후속 |
| 확인 | 타입·저장 호출 경로 |
| 단정 금지 | 저장≠진단·역치. 이력 목록 UI 없음. 클라우드 동기화 없음. |
| 성능·주의 | 세션 종료 시 AsyncStorage 1회 write. 요약 화면만. 입력 중 부담 없음. |
| 다음 | 에뮬에서 종료→저장 문구 확인 · 목록 UI(선택) |

### 2026-08-06 15:15 — 인계문 작성

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자 「인계문 작성해」. ② min/max 재확인·자극 스펙 유지 반영. 추가+시각 규칙. |
| 변경 요약 | `## 인계 — 2026-08-06 15:15` 블록을 `handoff.md`·`handoff-2026-08-06.md` 상단에 추가. |
| 주요 경로 | `docs/handoff.md`, `docs/handoff-2026-08-06.md` |
| 결과 | 성공 |
| 확인 | 파일 상단 블록 |
| 단정 금지 | 유지≠스펙 확정. min/max·전환평균≠역치. |
| 성능·주의 | 없음(문서만) |
| 다음 | 영속·DOI(후순위) · 문서 커밋(요청 시) |

### 2026-08-06 14:22 — 인계문 작성

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자 「인계문 작성해」. 추가+시각 규칙. |
| 변경 요약 | `## 인계 — 2026-08-06 14:22` 블록을 `handoff.md`·`handoff-2026-08-06.md` 상단에 추가. |
| 주요 경로 | `docs/handoff.md`, `docs/handoff-2026-08-06.md` |
| 결과 | 성공 |
| 확인 | 파일 상단 블록 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음(문서만) |
| 다음 | 자극 스펙 · ② min/max(선택) · 영속·DOI(후순위) |

### 2026-08-06 — 요약 min/max 커밋

| 항목 | 내용 |
|------|------|
| 트랙 | ② 주파수 / ① AM |
| 근거·결정 | 사용자: min/max 변경 위치 확인 후 커밋. ① 에뮬에서 요약(0.0 / -22.0 등) 수동 확인됨. |
| 변경 요약 | `e378763` — easiest/hardest 요약 필·UI 커밋(워킹트리에만 있던 변경). |
| 주요 경로 | `src/training/amSession.ts`, `freqSession.ts`, `AmSessionScreen.tsx`, `FreqSessionScreen.tsx` |
| 결과 | 성공 |
| 확인 | ① 세션 요약 수동 · `git show e378763` |
| 단정 금지 | min/max·전환평균 ≠ 역치·점수. |
| 성능·주의 | 없음(요약 계산 O(n) history, 세션 단위). |
| 다음 | ② reload 확인(선택) · 자극 스펙 · 영속(후순위) |

### 2026-08-06 13:27 — 인계문 작성

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자 「인계문 작성해」. 추가+시각 규칙. |
| 변경 요약 | `## 인계 — 2026-08-06 13:27` 블록을 `handoff.md`·`handoff-2026-08-06.md` 상단에 추가. |
| 주요 경로 | `docs/handoff.md`, `docs/handoff-2026-08-06.md` |
| 결과 | 성공 |
| 확인 | 파일 상단 블록 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음(문서만) |
| 다음 | 요약 min/max reload 확인 · 커밋(선택) |

### 2026-08-06 — 요약: 이번 연습 가장 쉬움/어려움 표시

| 항목 | 내용 |
|------|------|
| 트랙 | ② 주파수 / ① AM |
| 근거·결정 | 사용자: 요약에 최고·최저 난이도 참고 표시. 「점수」아님 · 전환 용어 유지. |
| 변경 요약 | `summarize*`에 easiest/hardest 추가. 요약 UI에「이번 연습 · 가장 쉬움 · 가장 어려움」. |
| 주요 경로 | `freqSession.ts`, `amSession.ts`, `FreqSessionScreen.tsx`, `AmSessionScreen.tsx` |
| 결과 | 성공(코드). Metro reload로 확인. |
| 확인 | 타입·요약 필드 반영 |
| 단정 금지 | `주의` history min/max ≠ 임상 역치·점수. 시작값만 있고 시행 0이면 null. |
| 성능·주의 | 없음(요약 시 O(n) min/max, n≤40) |
| 다음 | reload 후 ①·② 한 세션씩 요약 확인 |

### 2026-08-06 — ① 떨림 찾기 청취 준비(에뮬 기동)

| 항목 | 내용 |
|------|------|
| 트랙 | ① AM |
| 근거·결정 | 다음 작업 1번. 코드 MVP는 있음 → 에뮬 청감 확인이 비어 있음. |
| 변경 요약 | Pixel_7(`emulator-5554`)·Metro·`com.rnhear.app` 기동. 앱 인텐트 전달. **청감 판정은 사용자**. |
| 주요 경로 | `AmSessionScreen` · 연습 탭「떨림 찾기」 |
| 결과 | 부분 — 기동·연결 OK. 클릭/길이/ISI/크기/세션감 **미청취(사용자)**. |
| 확인 | `adb devices` device · boot_completed=1 · 패키지 설치됨 |
| 단정 금지 | `미검증` 소리 품질·AM 가청성. 무음 시 Cold Boot 필요할 수 있음(`주의`). |
| 성능·주의 | 없음(기동만) |
| 다음 | 사용자 청감 메모 → 필요 시 상수 조정 |

### 2026-08-06 — UI 용어 순화(cent/Δ/반전/포락선)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·UI |
| 근거·결정 | 합의: UI `cent`/`Δ`/`반전` 순화. 「총 기회」비추천 → **난이도 전환/전환** 사용. |
| 변경 요약 | 홈·연습 목록·②/① 세션 화면·종료 사유 문구를 쉬운 말로 교체. 내부 상수/단위(cent·dB)는 코드 유지. |
| 주요 경로 | `FreqSessionScreen.tsx`, `AmSessionScreen.tsx`, `freqSession.ts`(`endReasonLabel`), `explore.tsx`, `index.tsx` |
| 결과 | 성공(문구). ① 에뮬 청감은 별도. |
| 확인 | 문자열 치환·린트 대상 파일 점검 |
| 단정 금지 | `주의` 「전환」이 반전(방향 바뀜) 전 의미를 100% 전달하진 않을 수 있음. 요약 숫자≠역치. |
| 성능·주의 | 없음(문구만) |
| 다음 | ① 청취 확인 · §4.4 DOI |

### 2026-08-06 — §4.4 임시 DOI·효과 한계

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 합의: 임시 DOI + 전문가 미검토로 §4.4 채움. |
| 변경 요약 | Levitt·Amitay×2·Galvin·Chatterjee DOI 표 + 훈련 효과 찬반·한계 단락. §7 체크 반영. |
| 주요 경로 | `docs/amp-mdt-training-design.md` §4.4·§7·§8 |
| 결과 | 성공(문서). 전문가 검수 없음. |
| 확인 | DOI 링크·저자명 웹 스니펫 대조 |
| 단정 금지 | `추정` 목록이 최적 인용은 아님. `미검증` 앱 효과·임상 표준 아님. **전문가 미검토**. |
| 성능·주의 | 없음(문서만) |
| 다음 | 전문가 검수 · 자극 스펙 확정 시 방법란 |

### 2026-08-06 12:59 — 인계문 작성(새 창용)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자: 새 창으로 넘어가니 「인계문 작성해」. handoff는 추가+시각 규칙 적용. |
| 변경 요약 | `## 인계 — 2026-08-06 12:59` 블록을 `handoff.md`·`handoff-2026-08-06.md` 상단에 추가. |
| 주요 경로 | `docs/handoff.md`, `docs/handoff-2026-08-06.md` |
| 결과 | 성공 |
| 확인 | 파일 상단 블록 확인 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음(문서만) |
| 다음 | ① 청취 / UI 순화 / 임시 DOI |

### 2026-08-06 — 규칙: handoff.md 추가+시각(덮어쓰기 금지)

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 / 문서 |
| 근거·결정 | 사용자: `handoff.md`는 인계문 요청 시 **추가**하고 **시간도 기록**. 규칙을 `.cursor/rules/android-dev-client.mdc`에 명시. |
| 변경 요약 | 인계문 절차를 덮어쓰기→상단 추가+`## 인계 — YYYY-MM-DD HH:mm`로 변경. 날짜본도 동일. 기존 handoff를 새 형식으로 맞춤. |
| 주요 경로 | `.cursor/rules/android-dev-client.mdc`, `docs/handoff.md`, `docs/handoff-2026-08-06.md` |
| 결과 | 성공 |
| 확인 | 규칙·파일 헤더 반영 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음(문서·규칙만). handoff가 길어질 수 있음 → 최신 블록만 읽으면 됨. |
| 다음 | 이후 「인계문 작성해」는 추가+시각 |

### 2026-08-06 — 인계문 작성(② 파일럿·① 코드·다음 후보)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자 「인계문 작성해」. ② 에뮬 청취·반전4·① 코드 MVP·UI 순화/DOI 미반영·다음 권장순 반영. |
| 변경 요약 | `handoff.md`·`handoff-2026-08-06.md` 덮어쓰기 + 채팅 출력. |
| 주요 경로 | `docs/handoff.md`, `docs/handoff-2026-08-06.md` |
| 결과 | 성공 |
| 확인 | 파일 반영 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음(문서만) |
| 다음 | ① 청취 / UI 순화 / 임시 DOI(사용자 선택) |

### 2026-08-06 — 파일럿: 반전 목표 6→4

| 항목 | 내용 |
|------|------|
| 트랙 | ② 주파수 / ① AM / 문서 |
| 근거·결정 | 사용자 에뮬 청취: 자극 스펙 파일럿 완료, 세션이 길다 → 반전 목표 **4**로 합의. |
| 변경 요약 | `DEFAULT_TARGET_REVERSALS` 6→4. ②·① 세션·UI가 동일 상수 사용. handoff·설계 §6 표기 갱신. |
| 주요 경로 | `src/training/freqSession.ts`, `docs/handoff.md`, `docs/handoff-2026-08-06.md`, `docs/amp-mdt-training-design.md` |
| 결과 | 성공(코드·문서). 재청취는 사용자. |
| 확인 | 상수·문서 반영. Metro reload면 적용(네이티브 리빌드 불필요). |
| 단정 금지 | `추정` 4가 최적 길이라는 보장 없음. 설계 관례 6~8보다 짧음. 요약 평균≠역치. |
| 성능·주의 | 없음(상수만). 세션이 짧아져 반전 평균 표본이 줄어들 수 있음. |
| 다음 | reload 후 길이감 재확인 · DOI 임시 목록(선택) |

### 2026-08-06 — ① AM MVP 착수(합성·n-AFC·계단식·세션·UI)

| 항목 | 내용 |
|------|------|
| 트랙 | ① AM |
| 근거·결정 | 사용자 선택 1번(① AM). 설계 §5 AudioParam AM+오프셋·안전장치3, §6 dB 계단식(6→2)·n-AFC “떨리는 것”. ②와 동일 세션 종료(당시 반전6/시행40, 이후 파일럿 반전4)·메모리만. |
| 변경 요약 | `amTone`·`amAfcTrial`·`amStaircase`·`amSession`·`AmSessionScreen` 추가. 연습 탭에 트랙 선택(다른 음/떨림). 홈 카피·설계 §7 체크 갱신. |
| 주요 경로 | `src/audio/amTone.ts`, `src/training/amAfcTrial.ts`, `src/training/amStaircase.ts`, `src/training/amSession.ts`, `src/training/AmSessionScreen.tsx`, `src/app/explore.tsx`, `src/app/index.tsx`, `docs/amp-mdt-training-design.md` |
| 결과 | 코드 반영 성공. 기기 재생 확인은 미실행. |
| 확인 | 타입/린트 로컬 점검(명령). 실기기 AM 청취 **미확인**. |
| 단정 금지 | 캐리어 1 kHz·fm 8 Hz·하한 −40 dB·스텝 6→2는 **추정/관례 제안**. RMS 등화가 교란을 완전히 막는다는 **미검증**. 효과 **미검증**. |
| 성능·주의 | AM은 노드가 순음보다 많음(carrier+mod+depth+am+gate). 연습 중 동시 트랙 전환 시 각 모듈 `stop*` 호출. AudioContext 2개(순음/AM 분리) — **주의**: 장기적으로 공유 검토 가능. |
| 다음 | 기기 수동 확인 · DOI·자극 스펙 확정 · 세션 영속(이후) |

### 2026-08-06 — 인계문 저장(규칙·② MVP 반영)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자 「네」→ 인계문 저장. 직전 세션: 인계문 출력=자동 저장 규칙 추가·② MVP 완료·영속은 이후. |
| 변경 요약 | `handoff.md`·`handoff-2026-08-06.md` 갱신(자동저장 규칙·한 일·다음 후보 반영). |
| 주요 경로 | `docs/handoff.md`, `docs/handoff-2026-08-06.md` |
| 결과 | 성공 |
| 확인 | 파일 반영 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음(문서만) |
| 다음 | ① AM 또는 기기/문서 확인(사용자 선택) |

### 2026-08-06 — 규칙: 인계문 출력=자동 저장

| 항목 | 내용 |
|------|------|
| 트랙 | 공통·인프라 / 문서 |
| 근거·결정 | 사용자: Ask에서 채팅만 출력하고 파일 미저장되는 문제 → Agent에서 인계문 출력 시 handoff·날짜본·impl-log를 한 세트로 저장하도록 규칙 보강. |
| 변경 요약 | `android-dev-client.mdc` 인계문 절에 트리거 확대(작성/저장/갱신·출력=저장), Ask 시 본문만 올리지 말 것·Agent 전환 안내 추가. |
| 주요 경로 | `.cursor/rules/android-dev-client.mdc` |
| 결과 | 성공 |
| 확인 | 규칙 문구 반영 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음(문서·규칙만) |
| 다음 | 「인계문 작성해」/「인계문 저장」 시 한 턴에 채팅+파일 3곳 |

### 2026-08-06 — 합의: 세션 영속은 이후

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자: 세션 영속(연습 결과 저장)은 MVP 필수 아님 → 이후에 넣기. |
| 변경 요약 | handoff 제품 합의·안 한 일·다음 후보에서 영속을「이후」로 명시. |
| 주요 경로 | `docs/handoff.md`, `docs/handoff-2026-08-06.md` |
| 결과 | 성공 |
| 확인 | 파일 반영 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음(코드 미변경) |
| 다음 | ① AM 또는 기기/문서 확인(사용자 선택) |

### 2026-08-06 — 인계문 갱신(②-1~5 완료 반영)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자: 인계문만 ②-5 반영으로 갱신(③번). |
| 변경 요약 | `handoff.md`·`handoff-2026-08-06.md`를 ② MVP 완료·다음 후보(①/영속/확인)로 맞춤. |
| 주요 경로 | `docs/handoff.md`, `docs/handoff-2026-08-06.md` |
| 결과 | 성공 |
| 확인 | 파일 반영 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음 |
| 다음 | 사용자 선택(① / 세션 영속 / 기기·문서) |

### 2026-08-06 — ②-5 정적 UI 연결

| 항목 | 내용 |
|------|------|
| 트랙 | ② 주파수 / 공통 UI |
| 근거·결정 | 설계 §5: 훈련 UI 정적·경량, 난이도↔시각 연동 금지, 큰 탭. §1 웰니스 카피. 확인용 Tone UI를 훈련 화면으로 정리. |
| 변경 요약 | `FreqSessionScreen` 분리·탭 타겟 확대·언마운트 abort. 탭 Tone→연습, 홈을 웰니스 진입(Expo 스타터 제거). |
| 주요 경로 | `src/training/FreqSessionScreen.tsx`, `src/app/explore.tsx`, `src/app/index.tsx`, `src/components/app-tabs.tsx` |
| 결과 | 부분 — 코드 반영. 기기에서 풀 세션 수동 확인은 이 세션 미실행. |
| 확인 | 린트. 수동: 홈 → 연습 → 시작/선택/요약. |
| 단정 금지 | `미검증` 효과. 요약 Δ ≠ 역치. `추정` 세션 임시값(반전 6·시행 40 등) 유지. |
| 성능·주의 | 홈에서 AnimatedIcon/Reanimated 제거 → 홈 런타임 부담 감소. 연습 UI는 정적(Rive/Skia 없음). 선택 버튼 minHeight만 확대(레이아웃 비용 미미). |
| 다음 | 기기 수동 확인 · ① 후순위 · DOI 보강 · 자극 스펙 확정 · 세션 영속(선택) |

### 2026-08-06 — ②-4 세션·종료 + handoff 동기화

| 항목 | 내용 |
|------|------|
| 트랙 | ② 주파수 / 문서 |
| 근거·결정 | 설계 §6: 반전 6~8 후 종료·마지막 반전 평균(관례). §5: 휴식은 시행 수 기준. 평균은 진단 역치로 쓰지 않음(§1). |
| 변경 요약 | `freqSession`(반전/시행상한/수동 종료·요약) + Tone summary UI. handoff를 ②-1~4 반영으로 갱신. |
| 주요 경로 | `src/training/freqSession.ts`, `src/app/explore.tsx`, `docs/handoff.md`, `docs/handoff-2026-08-06.md` |
| 결과 | 부분 — 코드·문서 반영. 기기에서 반전 6회 종료 미확인. |
| 확인 | 린트. 수동: 연습 → 반전 목표/끝내기 → 요약(역치 아님 문구). |
| 단정 금지 | `추정` 반전 6·최대 시행 40·평균 최근 4. `관례` 반전 종료. `미검증` 효과. 요약 Δ ≠ 임상 역치. |
| 성능·주의 | 세션 상태 메모리만(영속 저장 없음). UI 정적. |
| 다음 | ②-5 정적 UI 연결 |

### 2026-08-06 — ②-3 계단식 2-down-1-up (cent)

| 항목 | 내용 |
|------|------|
| 트랙 | ② 주파수 |
| 근거·결정 | 설계 §6·HarmoniTune 재사용: 연속 2정 −10 / 1오 +10, 범위 10~150. 훈련 적응(임상 역치 확정 아님). 난이도↔시각 연동 금지 → 시행 수만 진행 표시, Δ는 피드백 후. |
| 변경 요약 | `freqStaircase` 상태 머신 + Tone 탭을 적응 연습(다음/끝내기)으로 연결. |
| 주요 경로 | `src/training/freqStaircase.ts`, `src/app/explore.tsx` |
| 결과 | 부분 — 코드 반영. 기기 확인·반전 종료(②-4)는 없음. |
| 확인 | 린트. 수동: 연습 시작 → 선택 → 다음으로 Δ 변화 확인. |
| 단정 금지 | `추정` 시작 Δ=150. `관례` 2-down-1-up≈70.7% 수렴. `미검증` 훈련 효과. 반전 n회로 세션 종료는 ②-4. |
| 성능·주의 | 시행마다 순음 n회. 계단 상태는 JS 메모리만(영속 저장 없음). UI 정적. |
| 다음 | ②-4 세션·종료(반전 기준 등) |

### 2026-08-06 — 인계문 갱신(②-1·2 + 자극 임시값 표)

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자: 미확정 vs 코드 임시 vs 합의값을 **현 시점 상태**로만 기록하면 됨. handoff의「② 미구현」은 구버전. |
| 변경 요약 | `handoff.md`·`handoff-2026-08-06.md`에 ②-1·2 완료·다음 ②-3·자극 숫자 표 반영. |
| 주요 경로 | `docs/handoff.md`, `docs/handoff-2026-08-06.md` |
| 결과 | 성공 |
| 확인 | 파일 반영 |
| 단정 금지 | 자극 숫자 표의 임시값은 **제품 확정 아님**(추정). |
| 성능·주의 | 없음 |
| 다음 | ②-3 계단식 |

### 2026-08-06 — ②-2 한 시행 n-AFC

| 항목 | 내용 |
|------|------|
| 트랙 | ② 주파수 |
| 근거·결정 | 설계: n-AFC “다른 음”, 자극 종료 전 입력 비활성, 정오답 피드백 허용, 난이도↔시각 연동 금지. 순음 엔진 재사용. |
| 변경 요약 | 시행 생성·순차 재생·채점 모듈 + Tone 탭을 한 시행 UI로 교체. `playPureTone`이 종료까지 await. |
| 주요 경로 | `src/training/freqAfcTrial.ts`, `src/audio/cents.ts`, `src/audio/pureTone.ts`, `src/app/explore.tsx` |
| 결과 | 부분 — 코드 반영. 기기 청취·선택 확인은 이 세션 미실행. |
| 확인 | 린트. 수동: Tone → 시행 시작 → 자극 후 1~3 선택 → 정오답. |
| 단정 금지 | `추정` n=3, Δ=50 cent, ISI=0.35s(스펙 미확정). `미검증` 훈련 효과. 계단식(②-3) 없음. |
| 성능·주의 | 시행당 순음 n회+ISI. AudioContext 재사용. UI 정적(선택 버튼 동일 크기). `playPureTone` await로 호출부 블로킹(의도). |
| 다음 | ②-3 계단식 2-down-1-up (cent) |

### 2026-08-06 — ②-1 순음 재생 (`react-native-audio-api`)

| 항목 | 내용 |
|------|------|
| 트랙 | ② 주파수 |
| 근거·결정 | 인계·설계: 엔진=`react-native-audio-api` 순음, SoundPool 배제, A4 440 Hz 재사용, 온셋/오프셋 램핑(§5). ②를 다섯 단계로 나눌 때 1단계. |
| 변경 요약 | sine Oscillator+Gain 램핑 재생 모듈과 Tone 탭 확인용 정적 UI 추가. |
| 주요 경로 | `src/audio/pureTone.ts`, `src/app/explore.tsx`, `src/components/app-tabs.tsx` |
| 결과 | 부분 — 코드 반영. 기기에서 재생 청취는 이 세션에서 미실행. |
| 확인 | 타입/린트(로컬). 수동: Tone 탭 → 재생/중지 (dev-client). |
| 단정 금지 | `추정` 지속시간 0.5s·게인 0.15·램프 30ms는 확인용 기본값(자극 스펙 미확정). `미검증` 실생활 청취 개선·레벨(dB) 캘리브레이션 아님. |
| 성능·주의 | AudioContext를 모듈에 유지(재생마다 생성하지 않음). 재생마다 Oscillator/Gain 노드 생성·폐기(Web Audio 관례). 확인 UI는 정적·경량(Rive/Skia 없음). |
| 다음 | ②-2 한 시행 n-AFC |

### 2026-08-06 — 인계문 동작을 규칙 절로 명시

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자: docs 저장 동작을 규칙에도 넣을 것. |
| 변경 요약 | `android-dev-client.mdc`에「인계문 (필수)」절 추가(채팅+handoff.md+날짜 파일+impl-log). |
| 주요 경로 | `.cursor/rules/android-dev-client.mdc` |
| 결과 | 성공 |
| 확인 | 규칙 절 반영 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음 |
| 다음 | 없음 |

### 2026-08-06 — 인계문 MD를 docs에 저장

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자: 인계문은 채팅 출력 + `docs/` MD 저장. |
| 변경 요약 | `handoff.md`(최신)·`handoff-2026-08-06.md` 작성. 규칙·README·컨텍스트 링크 갱신. |
| 주요 경로 | `docs/handoff.md`, `docs/handoff-2026-08-06.md`, `.cursor/rules/android-dev-client.mdc` |
| 결과 | 성공 |
| 확인 | 파일·규칙·링크 반영 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음 |
| 다음 | ② MVP 착수 또는 「인계문 작성해」 시 동일 절차 |

### 2026-08-06 — 인계문 규칙 추가

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자: 「인계문 작성해」= 새 채팅 AI용 맥락 인계문 출력. |
| 변경 요약 | `android-dev-client.mdc` AI 행동에 인계문 규칙 1줄 추가. |
| 주요 경로 | `.cursor/rules/android-dev-client.mdc` |
| 결과 | 성공 |
| 확인 | 규칙 문구 반영 |
| 단정 금지 | 없음 |
| 성능·주의 | 없음 |
| 다음 | 없음 |

### 2026-08-06 — 기록 원칙(확실/단정 금지) 반영

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 근거·결정 | 사용자 합의: 근거·결정·결과와 함께 추정·미검증·주의를 미리 표시. §4 `관례`/`가설`/`미검증`과 동일 취지. |
| 변경 요약 | `impl-log` 형식·원칙 보강, Cursor 규칙·설계 문서 헤더에 기록 원칙 연결. |
| 주요 경로 | `docs/impl-log.md`, `.cursor/rules/android-dev-client.mdc`, `docs/amp-mdt-training-design.md`, `docs/dev-client-setup-context.md` |
| 결과 | 성공 |
| 확인 | 템플릿·규칙 문구 반영 |
| 단정 금지 | 과거 로그 항목은 구형식 유지(소급 재작성 안 함). 이후 항목부터 본 형식 의무. |
| 성능·주의 | 없음 |
| 다음 | ② MVP 등 실질 구현 시 본 형식으로 기록 |

### 2026-08-06 — 과학적 타당성·한계 문서화

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 변경 요약 | `amp-mdt-training-design.md`에 §4 추가: 구성/방법/전이 구분, ②·① 근거·한계, 효과 미검증·문헌 후속. 절 번호 재정렬. |
| 주요 경로 | `docs/amp-mdt-training-design.md` |
| 결과 | 성공 |
| 확인 | §4·체크리스트·변경 이력 반영 |
| 성능·주의 | 없음 |
| 다음 | ② MVP 구현 또는 §4.4 문헌·전문가 보강 |
| 단정 금지 | (소급) §4 자체에 미검증·가설 명시됨. 문헌 DOI는 아직 없음. |

### 2026-08-06 — 구현 로그 도입

| 항목 | 내용 |
|------|------|
| 트랙 | 문서 |
| 변경 요약 | `docs/impl-log.md` 신설. Cursor 규칙·README에 기록 의무/링크 추가. |
| 주요 경로 | `docs/impl-log.md`, `.cursor/rules/android-dev-client.mdc`, `README.md` |
| 결과 | 성공 |
| 확인 | 파일 생성·규칙 문구 반영 |
| 성능·주의 | 없음 |
| 다음 | ② 주파수 변별 훈련 MVP 착수 시부터 본 로그에 남김 |
| 단정 금지 | (소급) 당시 형식에 단정 금지 칸 없음 → 본 항목으로 원칙 보강. |
