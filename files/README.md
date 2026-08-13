# Handoff: 훈련 화면 UI 개선 (Training Session Screens)

## Overview
청능 연습(Auditory training) 앱의 **훈련 진행 화면** 3종에 대한 UI 개선 디자인입니다. 로직·문구·상태 흐름은 현행과 동일하게 유지하고, **레이아웃·시각 위계·간격·색·탭 타겟만** 개선합니다. 대상 화면:

1. **높낮이 비교 (Pitch 2-AFC)** — `PitchCompareScreen.tsx`. 두 소리 중 어느 쪽이 높은지 "더 낮아요 / 더 높아요" 2지선다.
2. **다른 음 찾기 (Freq 3-AFC)** — `FreqSessionScreen.tsx`. 세 소리 중 다른 하나(1/2/3)를 고르는 3지선다.
3. **떨림 찾기 (AM 3-AFC)** — `AmSessionScreen.tsx`. 세 소리 중 떨리는 하나(1/2/3)를 고르는 3지선다.

2·3번은 `SessionModeToggle.tsx`로 묶이는 동일 구조의 세션 화면이므로, 3-AFC 레이아웃은 두 파일에 동일하게 적용합니다.

## About the Design Files
`prototype/HearingTraining.dc.html` 은 **HTML로 만든 디자인 레퍼런스**입니다 — 의도한 모양과 동작을 보여주는 프로토타입이며, 그대로 복사해 배포할 프로덕션 코드가 아닙니다. 작업 목표는 이 HTML 디자인을 **기존 React Native (Expo) 코드베이스의 패턴·라이브러리로 재현**하는 것입니다. 즉 `StyleSheet.create`, 기존 `theme.ts` 토큰, `Card`/`ActionButton` 컴포넌트를 그대로 사용해 구현하세요.

`current_source/` 에는 현재 화면 구현과 공유 컴포넌트가 들어 있습니다. **로직(오디오 재생, 스텝 진행, 채점, 저장)은 절대 바꾸지 마세요.** 오직 렌더링/스타일 계층만 교체합니다.

## Fidelity
**High-fidelity (hifi).** 색·타이포·간격·라운드까지 최종값입니다. 아래 스펙대로 픽셀 단위로 재현하되, 원시 hex 대신 가능한 한 `theme.ts` 토큰으로 매핑하세요.

---

## Design Tokens
현행 `theme.ts` 팔레트(Clean Clinical, light)를 유지합니다. 아래는 프로토타입에서 쓴 실제 값 → 토큰 매핑 가이드입니다.

| 용도 | Hex | 매핑 |
| --- | --- | --- |
| 화면 배경 | `#F6F9FD` | `Colors.light.background` |
| 카드/버튼 면 | `#FFFFFF` | `Colors.light.surface` |
| 강조(선택·진행·아이콘) | `#1668E3` | `Colors.light.tint` |
| 강조 연한 면 (선택된 타일) | `#EAF2FE` | tint 8~10% |
| 강조 연한 테두리 | `#CFE0F7` | tint 24% |
| 본문 텍스트 | `#10233A` | `Colors.light.text` |
| 보조 텍스트 | `#6B7A8A` | `Colors.light.textMuted` |
| 캡션/라벨 | `#8A9BAD` | `Colors.light.textSubtle` |
| 기본 테두리 | `#E4EBF3` | `Colors.light.border` |
| 진행바 트랙 | `#E4EBF3` | border |
| 카드 그림자 | `0 8px 18px rgba(16,35,58,0.06)` | `Shadows.card` |
| 강조 버튼 그림자 | `0 6px 12px rgba(22,104,227,0.32)` | tint glow |

**Spacing**: 화면 패딩 `20px 22px 26px`. 요소 간 gap `12px`(버튼 행)·`14~16px`(섹션). 
**Radius**: 큰 카드/선택 타일 `20px`, 액션 버튼 `14px`, pill `999px`. 
**Typography**: 본문 IBM Plex Sans KR. **모든 수치(전환 카운트, 1/2/3 번호)는 IBM Plex Mono** — 계기판 느낌. 
- 화면 제목: `22px / 700 / letter-spacing -0.01em`
- 고지 캡션: `12px / 400 / #8A9BAD`
- 진행 pill 텍스트: mono `13px`
- 프롬프트("두 번째 소리가…"): `16px / 600 / #6B7A8A`, 가운데 정렬
- 선택 라벨("더 높아요"): `18px / 600 / #10233A`
- 3-AFC 숫자: mono `36px / 500`

---

## Screens / Views

### 공통 헤더 (3개 화면 동일)
세로 스택, 가운데 정렬, gap 8px:
1. **제목** — 22px/700 (`높낮이 비교` / `다른 음 찾기` / `떨림 찾기`)
2. **고지 캡션** — `웰니스 연습 · 병원 검사·진단을 대신하지 않아요` 12px/#8A9BAD
3. **진행 pill** — 흰 배경, `1px #E4EBF3` 테두리, radius 999px, padding `6px 14px`, mono 13px. 내용 예: `연습 3 · 전환 1/8`. (현행 상태값 그대로 바인딩)

헤더 아래 **슬림 진행바** (신규): height 5px, radius 999px, 트랙 `#E4EBF3`, 채움 `#1668E3`. 폭 = 현재 전환/총 전환 비율(예: 1/8 → 12.5%). margin-top 12px.

### 1. 높낮이 비교 (PitchCompareScreen — 2-AFC)
- **Layout**: `flex:1` 세로 스택. 헤더 → 진행바 → (flex:1 중앙 영역) → 선택 버튼 행 → 중지 버튼.
- **중앙 재생 표시**: 세로 가운데 정렬. 4개 막대 이퀄라이저(각 width 4px, 색 `#1668E3`, `eqbar` 키프레임으로 scaleY 0.35↔1, 0.9s, stagger 0.15s) + 프롬프트 텍스트 `두 번째 소리가 더 높았나요, 낮았나요?`. RN에서는 `Animated`로 막대 스케일 반복.
- **선택 버튼 (2열, gap 12px)**: 각 `flex:1`, min-height **132px**(큰 탭 타겟), 흰 면, `1.5px #E4EBF3` 테두리, radius 20px, `Shadows.card`. 세로 스택 가운데: 화살표 아이콘 30px(`#1668E3`, 아래=더 낮아요 / 위=더 높아요) + 라벨 18px/600. 눌림 시 테두리·면을 tint(`#EAF2FE`/`#CFE0F7`)로.
- **중지 버튼**: 폭 100%, min-height 48px, 흰 면 + border, radius 14px, 정사각 stop 아이콘 14px + `중지` 15px/600. margin-top 16px.

### 2·3. 다른 음 찾기 / 떨림 찾기 (Freq·AM — 3-AFC)
`SessionModeToggle`로 묶이는 동일 레이아웃. 제목·프롬프트만 모드별로 다름:
- Freq: 제목 `다른 음 찾기`, 프롬프트 `다른 음을 고르세요`
- AM: 제목 `떨림 찾기`, 프롬프트 `떨리는 소리를 고르세요`
- **Layout**: 헤더 → 진행바 → (flex:1 중앙: 이퀄라이저 3막대 + 프롬프트 16px/600/#6B7A8A) → 선택 타일 행 → 중지 버튼.
- **선택 타일 (3열, gap 12px)**: 각 `flex:1`, **`aspect-ratio: 1`**(정사각, 큰 탭 타겟), radius 20px, `1.5px #E4EBF3` 테두리, 흰 면, `Shadows.card`. 가운데 mono 숫자 36px/500. **선택/포커스 타일은** 면 `#EAF2FE` + 테두리 `#CFE0F7` + 숫자색 `#1668E3` (프로토타입의 1번 타일이 이 상태 예시).
- **중지 버튼**: 2번 화면과 동일.

---

## Interactions & Behavior
- **오디오 재생 인디케이터**: 소리가 재생되는 동안만 이퀄라이저 애니메이션을 돌리고, 정지 시 멈춤/흐리게. 현행 재생 상태 플래그에 바인딩.
- **선택 → 채점 → 다음 전환**: 현행 로직 유지. 정/오답 피드백 시각은 현행 규칙을 따르되(난이도를 색으로 암시하지 않음), 눌린 타일에 tint press 상태만 부여.
- **진행바/pill**: 전환 인덱스 변화에 따라 폭·텍스트 갱신.
- **중지**: 현행 동작(세션 중단 → 요약/이전 화면) 유지.
- **탭 타겟**: 모든 선택 요소 최소 변 48px 이상(2-AFC 132px, 3-AFC 정사각 타일). 접근성 라벨 유지.

## State Management
신규 상태 없음. 현행 상태(재생 여부, 현재 전환 index/총 개수, 현재 난이도, 정답 카운트, 세션 모드)를 그대로 사용해 진행바 폭·pill 텍스트·프롬프트만 파생 렌더링합니다.

## Assets
아이콘은 모두 인라인 SVG 스트로크 아이콘(2px)로 표현 — 기존 아이콘 세트(예: `@expo/vector-icons` 또는 프로젝트의 아이콘 컴포넌트)로 대체하세요: 상/하 화살표, 정지(사각), 파형/이퀄라이저. 별도 래스터 에셋 없음. 폰트는 IBM Plex Sans KR / IBM Plex Mono — 코드베이스에 없으면 본문은 시스템 폰트, 수치는 기존 monospace 토큰으로 대체 가능.

## Files
- `prototype/HearingTraining.dc.html` — 전체 프로토타입(브라우저에서 바로 열림). 상단 탭에서 `높낮이 비교`·`다른 음 찾기`·`떨림 찾기` 화면 확인.
- `current_source/PitchCompareScreen.tsx`, `FreqSessionScreen.tsx`, `AmSessionScreen.tsx` — 개선 대상 현행 화면.
- `current_source/SessionModeToggle.tsx` — 2·3 화면을 묶는 토글.
- `current_source/theme.ts` — 색·간격·라운드·그림자 토큰(매핑 대상).
- `current_source/card.tsx`, `action-button.tsx` — 재사용 컴포넌트.
