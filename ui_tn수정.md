# UI 수정 로그 — 누적

> **규칙**: 이 문서는 **누적**한다. 새 기록은 **맨 위**에 추가하고, 기존 블록은 지우거나 덮어쓰지 않는다.
> **범위**: 화면·UI 변경 작업의 실행 기록(무엇을 왜 어떻게 바꿨나). 결정의 정본은 `docs/` 아래 문서다.

---

## 2026-08-22 · 푸시 · 팔레트 이력 전수 · 「색이 안 변했다」의 원인 (코드 변경 없음)

**브랜치**: `color_ui` → **`origin/color_ui` 생성 (이 갈래의 첫 원격 반영)**
**코드 변경 없음.** 앞 블록 이후 벌어진 일과, 대화로만 오갔던 조사 결과를 여기 남긴다.

### 푸시했다 — 이 갈래가 처음 원격에 올라갔다

```
git push -u origin color_ui   → * [new branch]  color_ui -> color_ui
```

- 커밋 9개 · 파일 24개 · +1416 / −374 (문서 2개 853줄 포함)
- `color_ui`에 업스트림이 없었으므로 **새 원격 브랜치가 생겼다.** 기존 브랜치는 건드리지 않았다
- **`ui_chips_suisei`는 여전히 업스트림이 없지만 안전하다** — `color_ui`가 그 위에 쌓기만 했으므로
  그 커밋은 전부 `origin/color_ui`에 포함돼 있다. `git merge-base --is-ancestor`로 확인
- `git log --oneline --branches --not --remotes` → 비어 있음. 푸시 안 된 커밋 없음
- 곁가지: `two_feat`이 **behind 5**다. 원격이 앞서 있다는 뜻이고 이 작업과 무관하다. 손대지 않았다

### 변곡점 — 「컬러적으로 변한 게 없는 것 같다」

작업을 마치고 나온 지적인데, **맞는 말이었다.** 원인은 코드가 아니라 **비교 기준선**이었다.

| 무엇과 비교하나 | 색 차이 |
|---|---|
| 부모 `ui_chips_suisei` | **`chartMuted` 하나뿐** — 사실상 같다 |
| `d37a654` | 색 4개 교정 + 신규 1개 + 글자 40곳 — **뚜렷하다** |
| `main` | 팔레트가 통째로 다르다 |

`color_ui`는 `ui_chips_suisei`에서 갈라졌고, **큰 색 변경(`a1a5bd7`)은 이미 그 아래에 있었다.**
그래서 부모 기준으로 보면 아무것도 안 변한 게 맞다. 이 브랜치가 팔레트에 더한 것은
`chartMuted` 하나이고, 그마저 **링 6 기록 7일치가 있어야 보이는 패널**의 막대 색이다.

**교훈으로 남긴다**: 「변했나」를 물을 때는 **무엇과 비교하는지를 먼저 말해야 한다.**
브랜치가 겹겹이 쌓인 상태에서는 같은 작업이 「전부 바뀜」도 되고 「그대로」도 된다.

### `theme.ts` 팔레트 전체 이력 — 이번에 처음 전수 조사했다

| 커밋 | 무엇을 했나 |
|---|---|
| `a9916a7` Initial | Expo 기본 템플릿 — `#000000` / `#ffffff` / `#F0F0F3`, **다크 모드 있음**, 토큰 5개 |
| `a91dc8e` | **「Clean Clinical」 전면 교체** — 지금 앱 인상의 뼈대. **다크 모드는 여기서 사라졌다** |
| `c05fac1` | `highlight` `#F5833F` · `positive` `#1F9D6B` · `positiveTint` 추가 |
| `592620c` | `positiveTint` 제거 |
| `79a35bb` | `danger` `#9B3B3B` 추가 |
| `a1a5bd7` | **대비 교정 4개** (앞 블록 참고) |
| `95d50ac` · `fd2e693` | 이 브랜치 — 주석 규칙 + `chartMuted` |

**`a91dc8e`가 가장 큰 변곡점이다.** 「흰 바탕에 회색 면」이 **「옅은 파란 바탕에 흰 카드」**로
뒤집혔다. 지금 우리가 「Clean Clinical 톤을 깨지 말 것」이라고 부르는 제약이 여기서 생겼다.

토큰별 사용 규모(팔레트를 흔들 때 영향 범위):

```
textMuted      47곳     ← a1a5bd7의 체감 변화가 거의 전부 여기서 나온다 (2.85 → 4.82, 대비 1.7배)
textSecondary  40곳     ← 4.40 → 4.78. 거의 티가 안 난다
highlight       8곳     ← 전부 비텍스트
positive        2곳
chartMuted      1곳     ← 7일치 기록 전엔 화면에 안 나온다
```

### 정정 — 앞 블록의 「글자 크기 47곳」은 **42곳**이다

`a1a5bd7`을 실측했다.

```
a1a5bd7:  +fontSize:14  42줄
          −10.5×1  −11×5  −11.5×5  −12×14  −12.5×8  −13×8  −13.5×1  =  42줄
```

즉 **`a1a5bd7`이 14px로 올린 곳은 42곳**이다. 「47」이 나온 건 뒤 커밋까지 합산했기 때문으로 보인다 —
`26fe5df`(ScreenHeader)가 죽은 스타일을 지우면서 `fontSize: 12` **5줄을 통째로 삭제**했다.
42 + 5 = 47. **올린 것 42 + 지운 것 5**이지, 47곳을 올린 게 아니다.

`d37a654` 기준 누적으로 보면 `+fontSize: 14`가 **40줄**이다(42에서 뒤 커밋이 2줄을 지웠다).
가장 작던 값은 **10.5px**(`SessionModeToggle` 힌트)였다.

### 만든 것 — 검토 페이지와 학습 문서

- **푸시 전 검토 페이지**(아티팩트): https://claude.ai/code/artifact/60d9ace1-b0da-47c4-8ab6-af21884e54b0
  색 5개의 이전/지금을 **실제 카드 견본**으로 재현했다(흰 카드 · `#F6F9FD` 바탕 · 테두리 1px ·
  반경 18 · 아이콘 타일 44 — 앱 지오메트리 그대로). 대비비를 터미널에서 볼 수 없어서 만든 것.
  같은 파일 경로로 다시 게시하면 같은 URL로 갱신된다
- **`깃_학습_질문지.md`** (저장소 루트, 아직 커밋 안 함) — 커밋 · 푸시 · 브랜치 · 업스트림 ·
  분기 · 동기화 개념을 순서대로 익히는 프롬프트 22개 + 부록 5개.
  이 저장소의 실제 브랜치·커밋 이름을 예시로 박아 뒀다

### 미결 — 변동 없음

앞 두 블록에서 넘어온 셋이 그대로다.

1. **14px 상향이 좁은 화면에서 넘치는지** — 실기기 미확인
2. **`chartMuted` 2.21이 충분한가** — 링 6 기록 7일치 필요(`ling6Session.ts:206`)
3. **안드로이드 그림자** — `Shadows.card`가 iOS 모양 값인데 이 저장소엔 `ios/`가 없다

② 카드 경계는 앞 블록에서 **닫았다.** 다시 열지 말 것 — 다시 열 조건은 그 블록에 적어 뒀다.

---

## 2026-08-22 · ② 카드 경계 — **현행 유지로 닫는다** (결정만, 변경 없음)

**브랜치**: `color_ui` · **코드 변경 없음**

인계문 `인계_컬러.md` ②와 바로 앞 블록의 「미결 1」을 **닫는다.** 카드 경계는 지금 값으로 간다 —
`border` `#E4EBF3`(흰 카드 1.20:1) · 카드 vs 배경 1.06:1 · `Shadows.card`.

### 닫은 근거 — 올릴 수 있는 폭이 애초에 좁다

「실기기로 봐야 안다」고 미뤄 뒀던 항목인데, 보기 전에 **천장부터 재 봤더니 낮았다.**

| 테두리 | 흰 카드 대비 | |
|---|---|---|
| `#E4EBF3` | 1.20 | 현재 — **이대로 간다** |
| `#D3DEEA` | **1.36** | 인계문의 중간 안 |
| `#C7D5E5` | 1.49 | |
| `#BACBDF` | 1.65 | 톤 한계쯤 |
| `#7397C1` | 3.03 | WCAG 1.4.11 통과. 「Clean Clinical」이 죽는다 |

즉 톤을 지키면서 갈 수 있는 범위는 **1.20 → 1.36~1.65**다. 사람 눈으로 겨우 갈릴 차이 하나를
얻자고 카드가 있는 전 화면을 흔드는 거래다. 값어치가 안 맞는다.

**인계문 수치 하나를 정정한다.** ②에 `#D3DEEA`를 「≈1.5」로 적어 뒀는데 실제로는 **1.36**이다.
1.5를 원하면 `#C7D5E5`까지 가야 한다.

### 반대쪽 레버는 **막혀 있다** — 이번에 확인한 것

「테두리 대신 페이지 배경을 낮춰 흰 카드를 띄우면 되지 않나」를 재 봤다. **못 쓴다.**

| 배경 | 흰 카드 대비 | `textMuted` 대비 |
|---|---|---|
| `#F6F9FD` | 1.06 | 4.56 (현재) |
| `#E7EEF6` | 1.17 | **4.12** |
| `#DCE6F2` | 1.26 | **3.82** |

`themed-view.tsx:15`가 `background`를 화면 바탕으로 깔고 그 위에 캡션·라벨이 얹힌다.
배경을 낮추면 카드는 1.06 → 1.26밖에 안 오르는데 `textMuted`가 **AA 아래로 떨어진다** —
`a1a5bd7`이 올려놓은 것을 도로 무너뜨린다. 카드 대비를 올리는 레버는 **테두리 하나뿐**이고,
그 하나의 천장이 위 표다.

### 그래서 이건 「미확인」이 아니라 「결정」이다

앞 두 블록과 인계문이 ②를 **「실기기 없이는 결정할 수 없다」**로 넘겨 왔는데,
그 전제가 틀렸다. 실기기가 답할 수 있는 건 「1.36이 1.20보다 나은가」뿐이고,
**어느 쪽이든 앱이 달라지지 않는다.** 재는 비용이 얻는 것보다 크다. 닫는다.

다시 열려면 조건이 필요하다 — **실사용자가 「카드가 어디서 끝나는지 모르겠다」고 말할 때.**
그때는 테두리가 아니라 카드 간 간격·그림자를 먼저 볼 것.

### 곁가지 — 안드로이드 그림자

이 저장소엔 `ios/`가 없다(안드로이드 전용, RN 0.86 · newArch). `Shadows.card`는
`shadowOpacity 0.08` / `shadowRadius 18`처럼 **iOS 모양의 값**인데 안드로이드에서 실제로
무엇이 먹는지는 확인하지 않았다. 카드 윤곽을 다시 볼 일이 생기면 **여기부터** 볼 것 —
테두리보다 이쪽이 헐거울 수 있다.

### 남은 미결 (②를 뺀 나머지)

1. **`chartMuted` 2.21이 충분한가** — 실기기 필요. 링 6 기록이 **7일치** 쌓여야 패널이
   렌더된다(`ling6Session.ts:206`)는 점도 같이 기억할 것. 그전엔 볼 방법이 없다
2. **14px 상향이 좁은 화면에서 넘치는지** — 계속 열려 있다

---

## 2026-08-22 · 컬러 인계문 이어받기 — 옅은 파란 면 규칙 · 링 6 막대 토큰화

**브랜치**: `color_ui` (`ui_chips_suisei`에서 분기)
**커밋**: `95d50ac` 규칙+세그먼트 힌트 / `fd2e693` 링 6 막대
**검증**: `eslint` 0 errors(기존 경고 14 그대로) · `tsc` exit 0 · `jest` 23 suites / 230 tests 통과

`인계_컬러.md`의 남은 과제 5건 중 **①③⑤를 닫았다.** ②는 실기기가 필요해 손대지 않았고
④는 감시 항목이라 손댈 것이 없었다.

### ① 세그먼트 힌트 — 활성일 때만 깨지던 곳

`SessionModeToggle.tsx`의 힌트는 활성 세그먼트 안에 있는데, 활성이면 바닥이 `accentTint`가 된다.
흰 면에서 4.82로 통과하던 `textMuted`가 거기서 **4.28**이 된다.

인계문의 선택지 (a)~(d)를 다 쓰지 않고 **다섯 번째 안**을 골랐다 — 활성일 때 힌트도
**라벨과 같은 `accent`(4.52)**로 둔다.

| 안 | 왜 안 골랐나 |
|---|---|
| (a) `textSecondary` | 4.24라 더 나쁘다 |
| (b) 활성 배경을 더 옅게 | `accentTint`는 17곳이 공유한다. 한 곳 때문에 전부 흔든다 |
| (c) 틴트 전용 토큰 신설 | 「면을 알아야 색을 고른다」는 부담이 남는다. 이 버그가 그렇게 생겼다 |
| (d) 활성일 때 `text` | 14.08로 안전하지만 힌트가 라벨보다 진해져 위계가 뒤집힌다 |
| **(e) 라벨과 같은 `accent`** | **새 토큰 0개 · 팔레트 무변경 · 활성 세그먼트가 통째로 파랗게 물들어 선택 표시로도 읽힌다** |

위계가 죽지 않는 이유: 라벨은 `smallBold`, 힌트는 `small`이라 굵기가 층을 이미 지고 있다.
게다가 비활성 쪽의 `textSecondary`(4.78) / `textMuted`(4.82)는 대비가 사실상 같아서
**색으로 층을 나눈 적이 원래 없었다.**

### ③ 규칙을 주석으로 박았다

`accentTint` 주석에 **「이 면 위 글자색은 `accent`와 `text`뿐」**을 미달 수치와 함께 적었다
(`textMuted` 4.28 · `textSecondary` 4.24 · `positive` 4.05). `backgroundSelected`에도 포인터를 달았다.

**17곳을 전수 확인했다.** ① 말고는 문제없다:

- 아이콘 타일(`stats-entry-button`·`StatsScreen`·`WrsVoiceGuideScreen`·`ListeningCheckScreen`·
  히어로 마크 3종) → 내용물이 `accent`
- 카드형(`WrsTabScreen`·`PtaSessionScreen`) → 글자가 틴트 **밖**에 있다(`cardIcon` / `cardText` 분리)
- `PitchCompareScreen:146` → `pressed` 순간만 틴트, 글자는 `text`
- `WrsBingoScreen:570` 트레이 → 타일이 각자 흰 면/`accent` 면을 깔고 그 위에 글자가 얹힌다
- `app-tabs.tsx:15` 인디케이터 → 선택 라벨이 `accent`(4.52), 비선택은 흰 면의 `textMuted`(4.82)

### ⑤ 하드코딩 hex — 옮기다가 실제 문제를 하나 찾았다

`Ling6ProgressPanel.tsx`의 두 상수를 없앴다.

- `BAR_TRACK_BG "#EEF3F8"` = `borderSubtle`과 **같은 값**이라 그냥 토큰으로 바꿨다
- `BAR_MUTED "#D5DDE6"` → 새 토큰 **`chartMuted #94A7BB`**

옮기기 전에 재 봤더니 `#D5DDE6`는 트랙 대비가 **1.23:1**이었다. 강조 안 된 막대가
**사실상 안 보인다**는 뜻이다. 6개 소리의 아쉬움 횟수를 막대 높이로 견주는 패널인데
견줄 대상이 보이지 않으면 패널의 기능이 죽는다. **2.21:1**로 올렸다.

3:1까지 올리지 **않은** 이유: `#7F94AC`(2.79) 이상이면 `highlight`(트랙 대비 **2.70**)를 넘어서
「강조 안 된 막대가 강조된 막대보다 세다」가 된다. 색이 유일한 단서도 아니다 —
높이 + 라벨 색 전환 + `accessibilityLabel`의 횟수가 이미 있다(인계문 ④에서 확인된 사항).

**인계문 ⑤의 괄호는 파일 경로가 틀렸다.** `animated-icon.tsx:143`은
`src/components/ui/`가 아니라 `src/components/`에 있다. 판단은 맞다 —
`#208AEF`는 `AnimatedSplashOverlay` 전용이고 **`app.json`의 네이티브 splash `backgroundColor`와
같은 값이어야 한다.** 토큰으로 옮기면 네이티브 설정과 끊어진다. 그대로 둔다.

이로써 `src/` 안에서 팔레트를 우회하는 hex는 **splash 3개(`#208AEF` + 그라디언트 2)뿐**이고,
그건 팔레트가 아니라 네이티브 설정의 사본이다.

### 왜 두 커밋인가

앞 커밋들과 같은 기준 — **되돌릴 이유가 다르다.**
`95d50ac`는 수치가 강제한 교정이라 되돌릴 이유가 없다.
`fd2e693`은 막대 색이 눈에 띄게 진해지는 **보이는 변경**이라 취향으로 거부당할 수 있다.
붙여 두면 막대를 되돌리려다 규칙까지 딸려 나간다.

### 막힌 곳

**여전히 실기기·에뮬레이터로 본 적이 없다.** 이 블록의 수치도 전부 계산값이다.
특히 `chartMuted`는 「보이는가」를 눈으로 확인해야 값이 맞는지 안다.

### 미결

1. **② 카드 경계** — `border` 1.20:1 · 카드 vs 배경 1.06:1. 인계문대로 **위반이 아니라 판단 사항**이고
   실기기 없이는 못 정한다. 손대지 않았다
2. **`chartMuted 2.21`이 충분한가** — 실기기에서 봐야 한다. 부족하면 `#8A9EB4`(2.47)까지가
   `highlight`를 넘지 않는 한계다
3. **14px 상향이 좁은 화면에서 넘치는지** — 앞 블록에서 넘어온 미결. 그대로 열려 있다

---

## 2026-08-21 · 커밋 3분할 — 가독성 / ScreenHeader / 동작

**브랜치**: `ui_chips_suisei`
앞 블록 「남은 결정 1」을 실행했다. 22개 파일 한 덩어리를 성격별 3커밋으로 나눴다.

### 왜 나눴나

셋은 되돌릴 이유가 서로 다르다.

| 커밋 | 내용 | 되돌릴 상황 |
|---|---|---|
| ① 가독성 | 색 4개 + 글자 크기 47곳 | 실기기에서 글자가 넘칠 때 — **이것만** 되돌리면 된다 |
| ② `ScreenHeader` | 공용 컴포넌트 + 7개 화면 + 죽은 스타일 15블록 | 헤더 짜임을 다시 갈 때 |
| ③ 동작 | `BackHandler` · 터치 타깃 · 기록 지우기 위치 · jest 리졸버 | 거의 없음(버그 수정) |

①이 가장 되돌릴 가능성이 높고 ③이 가장 낮다. 붙여 두면 ①을 빼려다 ③까지 딸려 나간다.

### 나누기가 까다로웠던 이유

**파일이 그룹 간에 겹친다.** 6개 파일이 두세 그룹에 걸쳐 있다
(`StatsScreen`은 셋 다, `Ling6SessionScreen`·`WrsSessionScreen`·`WrsTwoCharScreen`도 셋 다).
그래서 파일 단위가 아니라 **헝크 단위**로 갈랐다 — 전체 diff 67헝크를 분류.

**순서가 강제된다.** ①을 먼저 넣어야 한다. ②가 지우는 `caption` 스타일 블록의 내용이
①에서 `fontSize: 12` → `14`로 바뀌기 때문에, ②를 먼저 넣으면 문맥이 안 맞아 적용에 실패한다.
→ ① 스테이지·커밋 → **남은 diff를 다시 뽑아** ② 분류 → 커밋 → 나머지 ③.

**헝크 하나는 손으로 쪼갰다.** `StatsScreen`의 스타일 헝크에 `otherValue`·`clearKindLabel`의
글자 크기(①)와 `footer`·`clearKind` 재배치(③)가 한 덩어리로 들어 있었다.
`git apply --cached --recount`로 줄 수 재계산을 맡기고 둘로 갈랐다.

### 딸려 들어간 것 하나

`SessionModeToggle.tsx`의 `ReadonlyArray<{...}>` → `readonly {...}[]`.
`eslint --fix`가 바꾼 것으로, 내가 의도한 변경이 아니다. 되돌릴 만큼의 문제가 아니라
같은 파일의 글자 크기 변경과 함께 **①에 담았다**. 기능 변화 없음.

### 검증

세 커밋 각각이 성립하는 상태다(중간 커밋도 컴파일된다).
최종 상태에서 `eslint` 0 errors · `tsc` exit 0 · `jest` 23 suites / 230 tests 통과.
**실기기 확인은 여전히 안 했다.**

---

## 2026-08-21 · 현재 상태 스냅샷 — 커밋 전 정리

**브랜치**: `ui_chips_suisei` (`feat_wrs_voice_guide`에서 분기)
**커밋된 것**: `0b2c535` 탭바 작업 1개뿐 — `StatsScreen.tsx` + 이 문서
**커밋 안 된 것**: 그 뒤 작업 **전부**. 워킹 트리 23개 항목(수정 22 + 신규 1).

### 문서 정리 내역

이 문서는 이제 최신 순 4블록이다. 누적 규칙상 옛 블록은 고치지 않고, 뒤집힌 판단은
**새 블록에서 닫는** 방식으로 처리했다.

| 블록 | 성격 | 뒤에서 뒤집힌 것 |
|---|---|---|
| 추천 항목 실행 | 실행 | — |
| 색 대비 조사 | 조사 | 추천 순서를 이걸로 대체 |
| UI 개선 추천 6건 | 조사 | **3번(AM 헤더) 철회** · 6번 「추정」 → 확정 · 색 축 누락 |
| 통계 화면 칩 → 탭바 | 실행 | `@testing-library` 미결 항목이 닫힘 |

즉 **오래된 블록일수록 뒤에 정정이 붙어 있다.** 나중에 읽을 때 맨 위부터 읽어야 한다.

### 지금 남은 결정 두 가지

1. **커밋 여부** — 22개 파일 변경이 한 덩어리다. 성격이 셋으로 갈려서 나눠 담을 수도 있다:
   가독성(색+크기) / `ScreenHeader` 도입 / `BackHandler`·터치 타깃·기록 지우기 위치
2. **실기기 확인** — 글자 상향이 좁은 화면에서 넘치는지. 이걸 먼저 하면 커밋 내용이 바뀔 수 있다

### 이 블록의 성격

코드 변경 없음. 문서·상태 정리만.

---

## 2026-08-21 · 추천 항목 실행 — 가독성(1+7) · ScreenHeader(4) · 8 · 2 · 5 · 6

**브랜치**: `ui_chips_suisei`
**변경**: 21개 파일 수정 + 1개 신규(`src/components/ui/screen-header.tsx`)
**검증**: `eslint` 0 errors · `tsc` exit 0 · **`jest` 23 suites / 230 tests 전부 통과**
**실기기 확인은 여전히 안 했다.** 레이아웃이 커진 곳(글자 14px 상향)은 눈으로 봐야 한다.

### 먼저 — 3번(AM 헤더)은 **틀린 진단이었다. 실행하지 않았다**

`AmSessionScreen`을 고치려고 열어 보니 제목이 **없는 게 아니라 다른 자리에 있었다.**

- `AmSessionScreen.tsx:341` — idle 화면 한가운데 히어로에 `type="heading"` **"떨림 찾기"** + 캡션이 이미 있다
- 같은 짜임을 `FreqSessionScreen`·`PitchCompareScreen`도 쓴다(`heroCaption`·`heroPromptScaled` 스타일이 셋 다 있음)
- 즉 화면은 두 부류다:
  - **목록·선택 화면**(WrsTab·Pta) + **WRS/링6 세션** → 왼쪽 위 `headerRow` 제목
  - **히어로 세션**(떨림·다른 음 찾기·높낮이 비교) → 가운데 큰 아이콘 + `heading` 제목
- AM이 `statsRow`(제목 없이 버튼만)인 이유도 있다 — AM 탭은 **피커 화면이 없어서**
  (탭 = 곧 연습) 통계 버튼이 세션 화면에 얹힐 자리가 거기뿐이다

→ 여기에 `ScreenHeader`를 넣으면 **한 화면에 제목이 둘**이 된다. 손대지 않았다.
앞 블록의 3번 항목은 **철회한다.**

### 1+7. 가독성 — 크기와 색을 같이

**색 (`src/constants/theme.ts`)** — 색조 유지, 명도만 낮춤. 각 값 옆에 대비비를 주석으로 박아 뒀다.

| 토큰 | 이전 | 이후 | 흰 카드 대비 |
|---|---|---|---|
| `textMuted` | `#8A9BAD` | `#607489` | 2.85 → **4.82** |
| `textSecondary` | `#6B7A8A` | `#667484` | 4.40 → **4.78** |
| `positive` | `#1F9D6B` | `#1A865B` | 3.45 → **4.56** |
| `highlight` | `#F5833F` | `#F36C1C` | 2.56 → **3.01** (8번) |

- 옛 hex를 하드코딩한 곳은 없었다(grep 확인) → 토큰만 바꾸면 전부 따라온다
- `highlight` 주석에 **「글자색으로 쓰지 말 것」**을 명시했다 — 3:1은 비텍스트 기준이다

**크기 — 47곳 일괄 상향**

- 스크립트로 `fontSize < 14`를 전부 14/20으로. `* TEXT_SCALE`(1.2)은 **실효 크기로 판정**해서
  이미 14 이상인 것(12*1.2 = 14.4 등)은 건드리지 않았다 — 바뀐 건 `ListeningCheckScreen` 1곳뿐
- `themed-text.tsx`의 `mono`·`code` 타입 자체가 12px였다 → 14/20. 이걸 쓰는 곳이 전부 따라 올라감
- `pill.tsx`: `MONO_BASE` 12/16 → 14/20. mono와 small이 같아지면서 **`surface` 전용 크기(13/18) 분기가 죽어** 같이 지웠다
- **SVG 차트 내부 눈금 라벨 `fontSize={9}` 3곳은 그대로 뒀다**
  (`TrendChart:129` · `Ling6ProgressPanel:217` · `WrsProgressPanel:137`).
  차트 기하(`PAD_BOTTOM` 등)를 같이 손봐야 하는데 **눈으로 확인 못 하는 상태에서 건드릴 곳이 아니다.** 미결로 남긴다

### 4. 공용 `ScreenHeader` — 신규 `src/components/ui/screen-header.tsx`

`{ title, caption?, action? }`. 6개 화면이 각자 갖고 있던 같은 마크업을 흡수했다.

| 적용 | action |
|---|---|
| `WrsSessionScreen` · `WrsTwoCharScreen` · `Ling6SessionScreen` | `StatsEntryButton`(idle·summary에서만) |
| `PtaSessionScreen` | `StatsEntryButton` |
| `WrsTabScreen` · `WrsBingoScreen` · `StatsScreen` | 없음 |

- **죽은 스타일 15개 블록 삭제** — `header`·`headerRow`·`caption`·`screenHeader`
- 캡션이 14/20이 되면서 `small` 타입 기본값과 같아져 **인라인 `style={styles.caption}`이 통째로 필요 없어졌다.**
  이게 원래 노렸던 "타입으로 흡수"다
- `StatsScreen` 캡션의 `numberOfLines={1}`도 뺐다 — 14px로 커지면 잘린다. 이제 줄바꿈된다
- 컴포넌트 주석에 **히어로 화면은 이걸 쓰지 않는다**고 못 박아 뒀다(위 3번 참고)
- `WrsVoiceGuideScreen`은 아이콘 마크가 제목 위에 오는 별도 짜임이라 제외

### 2. 터치 타깃 — 이번 탭 마무리

`StatsScreen`의 `styles.tab`에 `minHeight: 44` + 좌우 여백 `Spacing.three`. 32px → 44px.

### 5. 「기록 지우기」를 본문 맨 아래로

- 하단 고정 `footer`에서 빼내 **스크롤 본문 맨 끝**(「다른 연습」 카드 아래)으로 옮김
- `footer`에는 「뒤로 가기」만 남고 `fill`로 가로를 채운다
- 오른쪽 정렬 → **가운데 정렬**, 기록이 없으면 아예 렌더하지 않는다(전엔 흐리게 남아 있었다)

### 6. `BackHandler` — 추정이 아니라 **실제 문제였다. 고쳤다**

`src/components/app-tabs.tsx`가 **`NativeTabs`**(expo-router unstable-native-tabs)를 쓴다
→ 탭 화면이 마운트된 채 남는다 → 앞 블록의 우려가 성립한다.

- **재현 경로**: 링 6 연습을 시작(phase = playing)한 채 다른 탭으로 이동 → 그 탭에서 뒤로가기
  → 링 6의 `confirmEndSession` 알림이 뜬다
- 평범한 `useEffect`였던 4곳을 `useFocusEffect`로 바꿨다:
  `Ling6SessionScreen` · `WrsSessionScreen` · `WrsTwoCharScreen` · `WrsBingoScreen`
- 이유를 주석으로 남김 — 「`BackHandler`는 등록 역순으로 먼저 true를 문다」
- 이미 맞게 돼 있던 `AmTabScreen`·`PtaSessionScreen`·`WrsTabScreen`과 이제 전부 같은 모양

### 막힌 곳과 처리

**테스트가 깨졌다 — 내 변경 때문이다.**

`StatsScreen`에 넣은 `react-native-reanimated` import가 `WrsSessionScreen.test.tsx`를 통째로 넘어뜨렸다
(`TypeError: Cannot read properties of undefined (reading 'loadUnpackers')`).
import만으로 worklets 네이티브 모듈을 건드린다.

1. `jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"))` → **실패**.
   공식 목(`mock.ts`)이 내부에서 진짜 `index`를 import해서 같은 자리에서 넘어진다
2. `jest.config.js`에 **`resolver: 'react-native-worklets/jest/resolver.js'`** → **해결**.
   worklets 안에서만 `.native` 확장자를 빼 주는 패키지 제공 리졸버다
3. 1번 목은 **불필요해서 도로 뺐다** — 리졸버만으로 통과하는 걸 확인했고, 같은 일을 두 곳에서 하지 않는다

**`eslint --fix`가 범위 밖 파일을 건드렸다.**
저장소 테스트 4개에서 `jest.mock` 아래 두었던 import를 위로 끌어올렸다(`import/first`).
의도적으로 그렇게 둔 배치이고 이번 작업과 무관해서 **`git checkout`으로 되돌렸다.**
그 4개 파일의 `import/first` 경고 14건은 그대로 남아 있다.

### 결과 로그 — 변경 규모

```
 jest.config.js                                |   3 +
 src/components/themed-text.tsx                |   8 +-
 src/components/ui/pill.tsx                    |  11 +-
 src/constants/theme.ts                        |  23 +-
 src/training/ListeningCheckScreen.tsx         |   4 +-
 src/training/SessionModeToggle.tsx            |   8 +-
 src/training/SessionTrendPanel.tsx            |  30 +--
 src/training/StatsScreen.tsx                  |  61 +++---
 src/training/SummaryCard.tsx                  |   4 +-
 src/training/TrendChart.tsx                   |   4 +-
 src/training/am/AmSessionScreen.tsx           |  12 +-
 src/training/freq/FreqSessionScreen.tsx       |  12 +-
 src/training/ling6/Ling6ProgressPanel.tsx     |  20 +-
 src/training/ling6/Ling6SessionScreen.tsx     |  74 +++----
 src/training/pitch2afc/PitchCompareScreen.tsx |   8 +-
 src/training/pta/PtaSessionScreen.tsx         |  30 +--
 src/training/wrs/WrsBingoScreen.tsx           |  45 ++--
 src/training/wrs/WrsProgressPanel.tsx         |  12 +-
 src/training/wrs/WrsSessionScreen.tsx         |  84 +++----
 src/training/wrs/WrsTabScreen.tsx             |  28 +--
 src/training/wrs/WrsTwoCharScreen.tsx         |  80 +++----
 22 files changed, 546 insertions(+), 316 deletions(-)
```

신규(추적 전): `src/components/ui/screen-header.tsx` — 50줄.
`ui_tn수정.md`는 위 통계에서 제외했다(문서).

### 결과 로그 — 검증 명령 출력

```
$ npx eslint src --ext .ts,.tsx
✖ 14 problems (0 errors, 14 warnings)
eslint exit: 0
  └ 경고 14건은 전부 저장소 테스트 4개의 import/first — 손대지 않기로 한 것

$ npx tsc --noEmit -p tsconfig.json
tsc exit: 0

$ npx jest --silent
Test Suites: 23 passed, 23 total
Tests:       230 passed, 230 total
jest exit: 0
```

`jest`가 처음 통과했다. **앞 블록에서 「미결」로 적었던 `@testing-library/react-native` 미설치가
해소돼 있었다** — `node_modules/@testing-library/react-native`가 생겼고, 그래서
`tsc` 오류 4건도 함께 사라졌다. 그 항목은 닫힌다.

테스트 수가 228 → 230으로 는 것은 새 테스트를 쓴 게 아니라,
넘어지던 `WrsSessionScreen.test.tsx`(2건)가 이제 실제로 돌기 때문이다.

### 미결

- **SVG 차트 눈금 라벨 9px 3곳** — 차트 기하를 같이 봐야 해서 남김
- **카드 경계 판단**(앞 블록 「판단 사항」) — 실기기 확인 필요
- **실기기 확인 전체** — 글자가 커지면서 좁은 화면에서 넘치는 곳이 있을 수 있다.
  특히 `SessionModeToggle`(10.5 → 14, 배율 33%)과 `SessionTrendPanel`(8곳)
- **커밋 안 함** — 워킹 트리에 그대로 있다

---

## 2026-08-21 · 색 대비(contrast) 조사 — 앞 6건에서 빠졌던 축 (조사만, 변경 없음)

**브랜치**: `ui_chips_suisei`
**상태**: 조사·제안 단계. **코드 변경 없음.** 실기기 확인도 안 함.
**계기**: "컬러에 대한 추천은 안 보이는 거 같아 왜지?" — 정당한 지적.

### 왜 빠졌나

앞 블록(UI 개선 추천 6건)의 스캔 축이 **구조와 타이포**였다 — `fontSize` grep, 터치 타깃,
헤더 일관성, `BackHandler`. **대비비를 계산하는 패스를 아예 돌리지 않았다.**
색은 눈으로 보면 "깔끔한 의료기기 톤"이라 문제없어 보이고, 실제 문제는 **숫자를 뽑아야만**
드러나는데 그 단계를 건너뛴 것. 놓친 축이 맞다.

### 계산 결과 — `Colors.light` 전체 (WCAG 2.1 상대휘도)

| 색 | 배경 | 비율 | 판정 |
|---|---|---|---|
| `text` #10233A | 흰 카드 | 15.87 | AA ✓ |
| `text` #10233A | 배경 #F6F9FD | 15.03 | AA ✓ |
| `accent` #1668E3 | 흰 카드 | 5.09 | AA ✓ |
| `onAccent` #FFFFFF | `accent` | 5.09 | AA ✓ — **이번 탭바 안전** |
| `danger` #9B3B3B | 흰 카드 | 6.81 | AA ✓ |
| `textSecondary` #6B7A8A | 배경 | **4.16** | 미달 (4.5 필요) |
| `textSecondary` #6B7A8A | 흰 카드 | **4.40** | 미달 (간발) |
| `positive` #1F9D6B | 흰 카드 | **3.45** | 미달 |
| `textMuted` #8A9BAD | 흰 카드 | **2.85** | **실패** |
| `highlight` #F5833F | 흰 카드 | **2.56** | **실패** |
| `border` #E4EBF3 | 흰 카드 | 1.20 | 아래 「판단 사항」 참고 |

### 7. `textMuted` 2.85:1 — 47곳에서 쓰이고, 14px 문제와 **곱해진다**

앞 블록 1번(14px 하한)과 독립된 문제가 아니라 **겹쳐서 악화된다.**

- 최악: `SessionModeToggle.tsx:109` — `textMuted` + **10.5px**. 작은 데다 흐리다
- **법적으로 중요한 문구가 전부 `textMuted`다**:
  `PitchCompareScreen.tsx:236`의 disclaimer,
  `Ling6SessionScreen.tsx:373` *"연습 기록이에요. 청력 검사·진단 결과가 아니에요."*
- → 1번을 「가독성」 항목으로 재편할 때 **크기와 색을 같이** 봐야 한다

### 8. `highlight` 2.56:1 — 차트에서 가장 봐야 할 점이 가장 안 보인다

세 추이 그래프 모두 **최근 1회 점**을 `highlight`로 칠한다.

- `TrendChart.tsx:153-154` · `WrsProgressPanel.tsx:160-161` · `Ling6ProgressPanel.tsx:240-241`
- `Ling6ProgressPanel.tsx:128` — 약한 소리 막대 채움색
- 비텍스트 요소 기준 **3:1에도 못 미친다**

### 색 단독 인코딩 — 확인해 보니 문제없음

방어가 이미 돼 있다. 이 축은 손댈 것 없다.

| 위치 | 색 외의 단서 |
|---|---|
| `Ling6ProgressPanel:128` 약한 소리 막대 | 막대 **높이** + 라벨 색 전환(`text`/`textMuted`) + `accessibilityLabel`에 횟수 |
| 추이 그래프 최근 점 | **채움 원 vs 빈 원**(`fill={isLast ? highlight : surface}`) |
| `WrsBingoScreen:476` 3색 | 컨페티 — 의미 없음(장식) |

### 제안값 — 색조 유지, 명도만 낮춤

```
textMuted      #8A9BAD → #607489   2.85 → 4.56
textSecondary  #6B7A8A → #667484   4.16 → 4.52
positive       #1F9D6B → #1A865B   3.45 → 4.56
highlight      #F5833F → #F36C1C   2.56 → 3.01  (비텍스트 3:1 충족) ← 권장
                       → #C8510A   2.56 → 4.53  (텍스트로도 쓸 경우)
```

`highlight`는 **오렌지 특성상 4.5:1을 맞추면 벽돌색**이 되어 "따뜻한 대비색"이라는
`theme.ts:38`의 원래 의도가 죽는다. 차트 마크로만 쓰이므로 3:1인 `#F36C1C`를 권한다.

`positive`는 `Ling6SessionScreen.tsx:368`에서 **`smallBold` 14px 글자색**으로 쓰인다.
WCAG 대형 텍스트 기준은 18.66px 굵은 글씨부터라 여기엔 해당 없음 → 4.5:1이 필요하다.

### 판단 사항 — 카드 경계 (위반 아님, 트레이드오프)

- `border` #E4EBF3가 흰 카드 위에서 **1.20:1**
- 카드(흰색)와 배경(#F6F9FD)의 차이도 **1.06:1**
- 즉 카드 윤곽이 거의 테두리 + `Shadows.card`(opacity 0.08)에만 의존한다
- 3:1을 맞추려면 `#7397C1` 수준 → **「Clean Clinical」 톤이 무너진다**
- → 규칙 위반으로 처리하지 말고, **실기기에서 노안 조건으로 카드 구분이 되는지** 확인할 것

### 다크 모드

`theme.ts:14-16`에 **의도적으로 안 하기로 한 결정**(2026-08-11)이 기록돼 있다. 재론하지 않는다.

### 추천 순서 (앞 블록 것을 이걸로 대체)

**1+7 「가독성」으로 묶기(크기 + 색 동시) → 4 → 3 → 8 → 2 → 5 → 6 확인 → 카드 경계 판단**

### 조사 근거(재현용)

WCAG 2.1 상대휘도 공식으로 직접 계산했다. 재현 스크립트:

```js
const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const L = h => { const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16);
  return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b); };
const CR = (a,b) => { const l1 = L(a), l2 = L(b); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); };
// 기준: 본문 4.5:1 · 대형 텍스트(18.66px 굵게 / 24px) 3:1 · 비텍스트 UI 3:1
```

- `textMuted` 사용처: `grep -rn "textMuted" src --include=*.tsx` → **47건**
- `highlight` 사용처: `grep -rn "highlight" src --include=*.tsx`

---

## 2026-08-21 · UI 개선 추천 6건 — 코드 훑기 결과 (조사만, 변경 없음)

**브랜치**: `ui_chips_suisei`
**상태**: 조사·제안 단계. **코드 변경 없음.** 실기기 확인도 안 함.
**계기**: 탭바 작업 뒤 "그 외에 UI 개선 등을 이유로 추천할 것이 있을까?" 질문.

### 추천 순서

**1 + 4를 묶어 `ScreenHeader` + `ThemedText` 타입 정리 → 3이 딸려 옴 → 2 → 5 → 6 확인.**

---

### 1. 14px 하한 위반 50여 곳 — 가장 큰 건

`themed-text.tsx:62`에 프로젝트가 스스로 못 박아 둔 규칙:

> *"화면에서 fontSize를 11~13으로 인라인으로 줄이지 말 것 — 이 타입을 쓴다.
> (고령·난청 사용자 가독성: 14px 미만 금지.)"*

**18개 파일 50여 곳이 이 규칙을 어기고 있다.** 차트 축 라벨(`TrendChart.tsx:187` 등 SVG 텍스트)을
예외로 쳐도 대부분은 본문·캡션이다.

| 위치 | 크기 |
|---|---|
| `SessionModeToggle.tsx:141` | **10.5px** |
| `Ling6ProgressPanel.tsx:306` · `AmSessionScreen.tsx:713` · `FreqSessionScreen.tsx:687` | 11px |
| 5개 훈련 화면의 `caption` | 전부 12px |
| `themed-text.tsx:111,128` (`mono` 타입 자체) | 12px — 이걸 쓰는 곳이 전부 딸려 들어감 |

- `allowFontScaling`을 끈 곳은 **없다** → OS 글자 크기 설정은 살아 있음
- 다만 기본 배율에서 10.5~12px는 이 앱 대상 사용자에게 작다
- **화면별로 고치지 말고 `ThemedText` 타입으로 흡수**하는 게 맞다.
  `caption` 14px가 이미 그 용도로 있는데 안 쓰이고 있음

### 2. 터치 타깃 44px 미만 — 이번에 만든 탭도 해당

- `hitSlop`이 앱 전체에서 `stats-entry-button.tsx:19` **한 곳뿐**
- 이번에 만든 `styles.tab` — `paddingVertical: 6` + `lineHeight: 20` = **약 32px**.
  기존 칩과 같은 높이라 회귀는 아니지만, **이번에 같이 올렸어야 했다**
- `ClearKindButton`은 `minHeight: 44`가 이미 있음 → 이 패턴을 탭에도 적용하면 된다

### 3. 떨림(AM) 화면만 헤더 구조가 다름

| 화면 | 구조 |
|---|---|
| WRS 한 글자·두 글자, 링 6, PTA | `headerRow` — 제목 + 통계 버튼(`space-between`) |
| **`AmSessionScreen.tsx:325`** | `statsRow` — **제목 없이** 버튼만 오른쪽 정렬 |

떨림 탭만 화면 제목이 없어 "여기가 어디인지"가 안 보인다. 다른 셋에 맞출 것.

### 4. `caption` 스타일이 5개 화면에 복붙

`fontSize: 12, lineHeight: 18`이 WRS 2개·PTA·링6·StatsScreen에 **각각 따로** 정의돼 있다.
1번을 고칠 때 **공용 `ScreenHeader` 컴포넌트**로 묶으면 3번(AM 헤더)도 같이 해결된다.

### 5. 「기록 지우기」가 「뒤로 가기」와 같은 줄

`StatsScreen` 하단 `footer`에 파괴적 동작이 주 동작과 나란히 상시 노출.
`Alert` 확인이 있어 오작동 위험은 낮지만 배치상 눈에 너무 잘 띈다.
→ 스크롤 본문 맨 아래로 내리는 쪽을 권함.

### 6. UI는 아니지만 — `BackHandler` 훅이 화면마다 다름

| `useFocusEffect` (맞음) | 평범한 `useEffect` (의심) |
|---|---|
| `AmTabScreen:61` · `PtaSessionScreen:96` · `WrsTabScreen:107` | `Ling6SessionScreen:155` · `WrsSessionScreen:116,123` · `WrsTwoCharScreen:130,137` · `WrsBingoScreen:111,118` |

탭 화면들이 동시에 마운트된 채로 남으면, 포커스 없는 화면의 핸들러가 등록된 채로 남아
뒤로가기를 가로챌 수 있다. RN `BackHandler`는 **등록 역순(LIFO)** 으로 호출하고 먼저 `true`를
반환한 핸들러에서 멈추기 때문.

**단, 이건 추정이다** — 탭 마운트 유지 여부에 달려 있어 실기기로 확인해야 확정된다.

### 조사 근거(재현용 명령)

- 14px 위반: `grep -rn "fontSize: 1[0-3]\b\|fontSize: 1[0-3]\." src --include=*.tsx`
- 글자 배율: `grep -rn "allowFontScaling\|maxFontSizeMultiplier" src` → **0건**
- 터치 타깃: `grep -rn "hitSlop" src --include=*.tsx` → **1건**
- 뒤로가기: `grep -rn "BackHandler" src` 후 각 파일에서 감싼 훅 확인

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
