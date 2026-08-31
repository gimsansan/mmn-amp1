# 훈련 통계 그래프 — 데이터 받기·표시·UI

> **역할**: 통계 화면에서 **선·막대가 기록을 받아 그리는 방식**과 **공통/종목별 UI**.  
> **정본**: 코드. 숫자·축·색은 아래 경로. 이 문서는 지도.  
> **관련**: 수집·표시 방침은 [`training-stats-recommendation.md`](./training-stats-recommendation.md).  
> 왜 이 훈련인가는 [`amp-mdt-training-design.md`](./amp-mdt-training-design.md).  
> **방침**: 여기 숫자는 **점수·청력 검사·진단이 아님**(웰니스·훈련).

코드가 바뀌면 **이 자리를 고친다**(갱신형).

---

## 0. 어디에 뜨나

기록 그래프는 **통계 화면만** 그린다.

| 화면 | 파일 | 그래프 |
|------|------|--------|
| 연습 기록(통합) | `src/training/StatsScreen.tsx` | 있음. 칩 하나당 본문 하나 |
| 연습 세션(듣기·고르기) | `*SessionScreen.tsx` 등 | **없음**. 진행 막대·이퀄라이저는 그래프가 아님 |

입구: 헤더 차트 버튼(`StatsEntryButton`) → `StatsScreen`(`initialKind` = 그 탭).  
시작·요약 화면에 추이 선·목록을 쌓지 않는다.

한 번에 그래프 **하나**. 여덟 종목을 세로로 쌓지 않는다.

---

## 1. 데이터를 받아 그리는 흐름

```
저장소(*Store) --loadStatsFeed--> StatsFeed
  --칩 kind--> KindPanel
  --종목 패널--> 점 배열
  --SVG/막대--> 화면
```

| 단계 | 동작 | 파일 |
|------|------|------|
| 읽기 | 포커스 때 저장소 여섯을 **한 번** 읽음 | `statsFeed.ts` `loadStatsFeed` |
| 보관 | `feed` state. 칩만 바꾸면 **다시 안 읽음** | `StatsScreen.tsx` |
| 고르기 | `kind`로 패널 하나 | `KindPanel` |
| 점 만들기 | 시간순·대표값·% 등 종목 규칙 | 각 `*ProgressPanel` / `SessionTrendPanel` |
| 그리기 | 폭을 잰 뒤에 SVG | `PercentTrend` · `TrendChart` · `Ling6PassTrend` |

하나가 깨져도 나머지는 빈 목록으로 보여 준다(`loadStatsFeed`의 `catch`).

표시 게이트(공통 취지):

- 기록 0건 → 패널 없음. 「아직 ○○ 기록이 없어요」.
- 선 그래프는 **점 2개 이상**일 때만. 1건이면 안내 문구이거나 그래프 카드 생략.
- 선·면적은 저장 상한(종목별 50)까지 **전부**. 원은 12개 이하면 전부, 13개 이상이면 첫·끝만.
- 차트 폭(`onLayout`)이 0이면 SVG를 안 그림(첫 프레임 깜빡임 방지).

로딩: 「불러오는 중…」. 실패: 「기록을 불러오지 못했어요」.

---

## 2. 탭(칩) → 어떤 그래프

칩 순서 = `STATS_KINDS` (`statsFeed.ts`).

| kind | 칩 이름 | 패널 | 그리는 것 |
|------|---------|------|-----------|
| `ling6` | 소리 구분 | `Ling6ProgressPanel` | 맞힌 개수 선 + (조건 되면) 음소 막대 |
| `pitch2` | 높낮이 비교 | `SessionTrendPanel` + `TrendChart` | cent 추이 |
| `freq` | 다른 음 찾기 | 위와 같음 | cent 추이 |
| `wrs1` | 한 글자 | `WrsProgressPanel` + `PercentTrend` | 맞힌 % 선 |
| `wrs2` | 두 글자 | 위와 같음 | 맞힌 % 선 |
| `am` | 떨림 | `SessionTrendPanel` + `TrendChart` | dB 추이 |
| `sent` | 문장 듣기 | `SentClosedProgressPanel` + `PercentTrend` | 맞힌 % 선 |
| `inst` | 악기 소리 | `InstProgressPanel` + `PercentTrend` | 맞힌 % 선 |

세 벌이다. **공통 차트 컴포넌트 하나는 없다.**

---

## 3. 공통 UI (선 그래프)

세 SVG가 **같은 겉모습**을 복제한다. 합친 컴포넌트는 아님.

| 항목 | 지금 코드 |
|------|-----------|
| 라이브러리 | `react-native-svg`. **Skia 없음** |
| 높이 | `CHART_HEIGHT = 132` |
| 중간 점 | 반지름 3, 채움 `theme.accent`. **12개 이하**면 전부, **13개 이상**이면 첫·끝만 |
| 마지막 점 | 반지름 5, 흰 면(`theme.surface`) + 주황 테두리 3px(`theme.highlight`) |
| 선 | `theme.accent`, 두께 2.5, round join/cap |
| 면 | 선 아래 `LinearGradient`. cent/dB `0.35` → 0. %·링6 `0.22` → 0 (격자선 대비) |
| 격자·축 글 | `theme.border` / `theme.textMuted`, SVG 글자 9 |
| 아래 축 글 | `ThemedText` small, 14 / lineHeight 20 |

통계 화면 껍데기(탭 줄·제목·등장 애니메이션)는 `StatsScreen`. 그래프 SVG와 별개.

`주의`: 본문 등장에 Reanimated(`FadeInLeft`/`FadeInRight`)를 쓴다. 선 자체는 정적 SVG.

---

## 4. 패밀리별 — 데이터와 표시

### 4.1 `PercentTrend` — 맞힌 비율(위가 잘함)

**쓰는 곳**: 한 글자 · 두 글자 · 문장 · 악기.

**받는 데이터** (`wrsTrend.ts` `PercentSessionRecord`):

- `id`, `savedAt`(ISO)
- `summary.percent`(0~100), `correctCount`, `trialCount`

악기·문장 기록도 이 모양이라 `chronologicalWrs`를 그대로 쓴다.

**표시 동작**

1. `canShowWrsTrend`: 기록 **2건 이상**.
2. `chronologicalWrs`: `savedAt` 오름차순(오래 → 최근).
3. x = 시각(`Date.parse`). 간격은 캘린더 시간에 비례.
4. y = 고정 0~100. **%가 클수록 위.**
5. 격자·왼쪽 숫자: 0 / 50 / 100.
6. 아래 축: 첫·끝 날짜(`M/D`) + 「기록 0~100%」.
7. 선 아래 면 채움(그라데이션 `0.22`). 출발 점선 **없음**.

패널 카드 문구: 「맞힌 비율 변화」 / 「높을수록 더 많이 맞춤」 / 「청력 검사가 아니에요.」  
아래 「최근 연습」 최대 8줄은 **리스트**이지 그래프가 아님.  
목록 순서는 스토어 정렬(최신이 앞). 그래프만 `chronologicalWrs`로 오래→최근.

### 4.2 `TrendChart` — cent·dB (좋아지면 내려감)

**쓰는 곳**: 높낮이 비교 · 다른 음 찾기 · 떨림. 감싸는 쪽은 `SessionTrendPanel`.

**받는 데이터** (`TrendPoint`): `value` + `savedAt`.

`value`는 트랙마다 다름 (`pickRepresentative`):

| track | 필드 | 단위 |
|-------|------|------|
| `pitch2` | `meanReversalCents` | cent |
| `freq` | `meanReversalDeltaCents` | cent |
| `am` | `meanReversalDepthDb` | dB |

대표값이 없는(짧은) 세션은 **점을 안 넣음**. 점이 2개 미만이면 선 대신 안내:  
「숫자가 나온 연습이 2회 이상이면 선을 그려 드려요」.

**표시 동작**

1. 목록은 최신이 앞 → `collectPoints`가 **오래→최근**으로 뒤집음.
2. x = 점 **인덱스 등간격**. 날짜 간격이 아님.
3. y 범위 = 점들의 min~max (+ 있으면 출발선 값). 값이 같으면 가운데 수평.
4. **값이 클수록 위**. 대표값은 작을수록 더 세밀 → 좋아지면 선이 **내려감**.
5. 출발선(`referenceValue`)은 **가짜 점이 아님**. 점선 + 짧은 라벨(예: 시작 200).
6. 선 아래 `LinearGradient` 면(`0.35`). `useId`로 그라데이션 id가 안 겹치게 함.
7. 아래 축: 「가장 오래된」 / 「최근」(날짜 숫자 아님).

카드 UI(`SessionTrendPanel`만):

- 위 누적 카드: 연습 횟수 · 푼 문항 · 평균 정답률(참고용).
- 그래프 카드: 최근 큰 숫자 + 「처음→최근」또는 직전 3회 평균→최근.
- 「작을수록…」읽는 법 + 매 연습 시작값·범위 안내.

### 4.3 `Ling6ProgressPanel` — 맞힌 개수 + 음소 막대

**데이터**: `SavedLing6Record`. 하루 1건(`dateKey`). `summary.passCount`, `byPhoneme`.

**선 (`Ling6PassTrend`, 이 파일 안 SVG)**

1. 날짜키 오름차순. **2일 이상**일 때만.
2. 1일이면 「내일 또 하면 선이 생겨요」.
3. x = `dateKey`를 일 번호로. 시간에 비례.
4. y = 0 ~ `SOUND_TRIAL_COUNT`(소리 개수, 코드 상수). **개수가 많을수록 위.**
5. 격자 0 / 3 / 6은 코드에 고정. 소리 개수와 맞춰 둔 것.
6. 아래 축: 첫·끝 짧은 날짜 + 「기록 0~6」.
7. 선 아래 면 채움(그라데이션 `0.22`). 막대와 별개.

**막대 (`Ling6WeaknessBars`, View — SVG 아님)**

- `ling6WeaknessSnapshot`(최근 창 `LING6_WEAKNESS_WINDOW`).
- `ready`일 때만 카드. 음소마다 아쉬움(틀린 횟수) 높이.
- 강조 음소는 `theme.highlight`, 나머지는 `theme.chartMuted`.

---

## 5. 비슷해 보이는데 왜 세 벌인가

겉(높이·점·선 색)은 같고, **축의 뜻**이 다르다.

| | % 선 | cent/dB 선 | 링6 선 |
|--|------|------------|--------|
| 단위 | 0~100% 고정 | 기록 min~max | 맞힌 개수 0~N |
| 잘함 방향 | **위** | **아래**(값↓) | **위** |
| x | 시각 | 회차 등간격 | 날짜키 |
| 부가 | 면 채움 | 출발 점선·면 채움 | 면 채움 + 음소 막대 |

`PercentTrend.tsx` 주석: `TrendChart`와 **위가 잘함**이 달라 축을 따로 둔다.  
`TrendChart.tsx` 주석: 2026-08-12 목업 — 값이 클수록 위(이전 「위=잘함」반전은 폐기).

한 컴포넌트에 합치면 방향을 뒤집거나 단위를 섞을 위험이 있다.

---

## 6. 파일 지도

**그리기**

- `src/training/PercentTrend.tsx`
- `src/training/TrendChart.tsx`
- `src/training/ling6/Ling6ProgressPanel.tsx` (`Ling6PassTrend` · `Ling6WeaknessBars`)

**점 만들기·카드**

- `src/training/wrs/wrsTrend.ts` — % 정렬·2점 게이트·날짜 라벨
- `src/training/wrs/WrsProgressPanel.tsx`
- `src/training/sentClosed/SentClosedProgressPanel.tsx`
- `src/training/inst/InstProgressPanel.tsx`
- `src/training/SessionTrendPanel.tsx`

**읽기·칩**

- `src/training/StatsScreen.tsx` — `KindPanel`이 위 패널을 고름
- `src/training/statsFeed.ts` — `loadStatsFeed`, `STATS_KINDS`

**저장(그래프 원본)**

- `src/training/ling6/ling6Store.ts`
- `src/training/sessionStore.ts` — pitch2 / freq / am
- `src/training/wrs/wrsStore.ts` · 두 글자 스토어
- `src/training/sentClosed/store.ts`
- `src/training/inst/instStore.ts`

색: `src/constants/theme.ts` (`accent`, `highlight`, `surface`, `chartMuted`, `border`).

테스트: `src/training/wrs/__tests__/wrsTrend.test.ts` (정렬·게이트). SVG 스냅샷은 없음.

---

## 7. 손댈 때

| 바꾸려는 것 | 손대는 파일 | 같이 바뀌는 칩 |
|-------------|-------------|----------------|
| % 선 모양 | `PercentTrend.tsx` | wrs1 · wrs2 · sent · inst |
| 악기만 % 선 | `PercentTrend`에 props 분기, 또는 inst 전용. 공유 파일을 통째로 바꾸지 말 것 | — |
| cent/dB 선 | `TrendChart.tsx` | pitch2 · freq · am |
| 선 카드 문구·최근 숫자 | `SessionTrendPanel.tsx` | 위 세 칩 |
| 링6 선·막대 | `Ling6ProgressPanel.tsx`만 | ling6 |
| 칩·헤더·빈 화면 | `StatsScreen.tsx` | 전체 통계 껍데기. 선 공식은 아님 |

연습 세션 화면을 고쳐도 **기록 그래프는 안 바뀐다.**

---

## 8. 단정 금지

- 그래프 숫자가 청력·진단·점수라는 해석 — **금지**(제품 방침).
- 세 벌을 하나로 합쳐도 축이 안전한지 — **미검증**. 지금은 의도적으로 분리.
- 격자 0/3/6이 소리 개수와 영원히 같다는 보장 — **코드가 정본**. 상수를 문서에 고정하지 말 것.
- 실기기에서 12개일 때 좁은 폭 겹침·% 면 0.22 대비 — **미검증**.
- `onLayout` 후 SVG 마운트가 저사양에서 끊기는지 — **미검증**. 중사양 기준, Skia 안 씀.
