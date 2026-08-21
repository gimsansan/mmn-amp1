# UI 수정 로그 — 누적

> **규칙**: 이 문서는 **누적**한다. 새 기록은 **맨 위**에 추가하고, 기존 블록은 지우거나 덮어쓰지 않는다.
> **범위**: 화면·UI 변경 작업의 실행 기록(무엇을 왜 어떻게 바꿨나). 결정의 정본은 `docs/` 아래 문서다.

---

## 2026-08-21 · 통계 화면 종목 칩 → 탭바 (`StatsScreen.tsx`)

**브랜치**: `feat_wrs_voice_guide`
**변경 파일**: `src/training/StatsScreen.tsx` 1개 (+242 / −52)

### 요청

> "칩들이 각 탭을 나타내는 통계의 진입점인데, 지금보다 **누르면 통계 화면이 나온다**는 느낌의 UI를 줄 수 있을까?"

### 사전 확인 — 헤더 구조 정정

질문이 "헤더에 통계 버튼들이 나열되어 있지?"로 시작했는데, 실제 구조는 그렇지 않았다.

| 위치 | 실제 |
|---|---|
| 각 연습 화면 헤더 | 통계 버튼 **1개뿐** (`StatsEntryButton`, 차트 아이콘 60×40). `phase === "idle" \|\| "summary"`일 때만 렌더 |
| 호출 5곳 | `WrsSessionScreen:285` · `WrsTwoCharScreen:301` · `Ling6SessionScreen:294` · `PtaSessionScreen:176` · `AmSessionScreen:326`(여기만 제목 없이 `statsRow` 단독 줄) |
| 통계 화면(`StatsScreen`) | **여기가 "나열"** — `screenHeader` **바깥**의 형제 요소로 `KindChips` 6개가 가로 스크롤 |

→ "나열"된 것은 헤더의 버튼들이 아니라 통계 화면의 **종목 칩 줄**이었다.

### 방향 결정

세 안을 제시하고 A안 채택.

- **A안 (채택)** 탭바 + 패널 제목줄 + 등장 애니메이션 — 한 화면 구조 유지, 되돌리기 쉬움
- B안 드릴다운 — 목록 카드 → 상세 화면 push. 가장 확실하지만 헤더 차트 버튼으로 들어온 사용자에게 한 단계가 더 생김
- C안 칩 강조만 — 코드 변경 최소, "화면이 열린다" 느낌은 가장 약함

### 실제 변경

**1. `KindChips` → `KindTabs`**

- 활성 탭: 옅은 틴트(`accentTint` 면 + `accent` 글씨) → **진한 파란 면 + 흰 글씨**(`accent` / `onAccent`)
- 활성 탭 아래 **삼각 꼬리** 추가 — RN에 도형이 없어 테두리 트릭(`borderTopWidth` 6 + 좌우 transparent).
  비활성은 `opacity: 0`으로 **자리만 유지** → 줄 높이가 흔들리지 않음
- **고른 탭이 잘리면 가운데로 스크롤**(`revealTab`). 종목이 6개라 한 화면에 안 들어오는데,
  기존엔 헤더 차트 버튼으로 「떨림」(마지막 탭) 통계를 열면 칩이 화면 밖에 있었다.
  각 슬롯 `onLayout`으로 x/width를 ref에 모으고, ScrollView `onLayout`·슬롯 `onLayout`·누를 때 각각 호출
- 라벨은 활성/비활성 **모두 `smallBold`**로 통일 — 굵기가 바뀌면 칩 너비가 변해 줄이 덜컹거린다
- 접근성 역할 `button` → `tab`, 컨테이너에 `tablist`

**2. `PanelHeading` 신규**

그래프 위에 **종목 아이콘 타일(44×44) + 이름(18px/700) + `기록 N회`**. 지금 보는 게 뭔지 그림과 글로 못 박는다.
아이콘은 각 종목이 훈련 화면에서 쓰는 것 그대로 재사용(`KIND_ICON`):

| kind | icon |
|---|---|
| `ling6` | `headphones` |
| `pitch2` | `bars` |
| `freq` | `findTone` |
| `wrs1` / `wrs2` | `oneChar` / `twoChar` |
| `am` | `vibrate` |

`panelTitle`은 18px — 화면 제목(`screenTitle` 23px) 한 단 아래이면서 **14px 하한 위**라
프로젝트의 "인라인으로 fontSize를 11~13으로 줄이지 말 것" 규칙에 걸리지 않는다.

**3. 등장 애니메이션**

- `Animated.View key={kind}` + `FadeInRight` / `FadeInLeft`, 220ms(`ENTER_MS`)
- 탭 줄에서 **오른쪽으로 가면 오른쪽에서** 들어온다
- 제목줄·그래프·「다른 연습」을 **한 덩어리로 묶어** 같이 밀려 들어오게 함 → "화면이 교체됐다"로 읽힘
- key가 `kind`라 **기록 삭제 후 `feed`만 갱신될 때는 움직이지 않는다**
- 종목 변경 시 본문 스크롤을 맨 위로 되돌림(`bodyRef.scrollTo({ y: 0 })`)

### 막힌 곳과 처리

- **`react-hooks/refs` 린트 위반**: 방향(`forward`)을 `useRef`에 담고 렌더 중 `.current`를 읽었더니
  *"Cannot access refs during render"* 에러. `kind`와 방향을 **한 상태로 묶어**(`TabView = { kind, forward }`) 해결.
  방향은 "어디서 어디로 갔나"라서 별도 state로 두면 한 프레임 어긋난다
- **Bash 히어독이 이 환경에서 깨짐**: `cat > file <<'TSX'`가 `unexpected EOF while looking for matching`으로
  실패(한글·백틱 섞인 대용량 내용). Write 도구로 전환해서 해결

### 검증

- `npx eslint src/training/StatsScreen.tsx` → **통과**
- `npx tsc --noEmit` → **StatsScreen 관련 오류 없음**
- **실기기/에뮬레이터 실행은 안 함** — 눈으로 확인하지 않았다

### 미결 / 기존 문제

- `@testing-library/react-native`가 `devDependencies`에는 있으나 `node_modules`에 **실제로 없음**
  (`node_modules/@testing-library`에 dom·jest-dom·user-event만 존재).
  이 때문에 `tsc`에 테스트 파일 오류 4건이 남는다 — **이번 변경과 무관한 기존 문제**, `npm i` 한 번 필요
- 이번에 손대지 않은 기존 14px 하한 위반: `caption`(11.5) · `otherValue`(12.5) · `clearKindLabel`(12.5)
