# 답변 누적 — rn-hear-1 (HarmoniTune)

> **규칙**: 이 문서는 **누적**한다. 새 답변은 **맨 위**에 추가하고, 기존 블록은 지우거나 덮어쓰지 않는다.
> **범위**: 대화에서 오간 질문·답변의 보관용. 프로젝트 결정의 정본은 `docs/` 아래 문서다.
> **브랜치**: `feat_wrs`

---

## 2026-08-27 · 후속 — 2순위 팔레트 마감 (`app.json` · `app-tabs` · `icon`)

> 브랜치 `new-content`. 1순위(`theme.ts` 팔레트 교체)의 **후속**이다.
> 배치는 손대지 않았다 — 색만.

### 결론 — **실제로 고칠 게 2줄뿐이었다**

2순위로 지목된 파일 셋 중 **둘은 이미 맞아 있었다.**

| 파일 | 예상 | 실제 | 조치 |
|---|---|---|---|
| `app.json` | 옛 색 2곳 | **맞음** — 옛 색 그대로 | **2줄 교체** |
| `src/components/app-tabs.tsx` | 하드코딩 있을 수 있음 | 하드코딩 **0건** — 5개 색 전부 `Colors.light.*` 참조 | 없음 |
| `src/components/ui/icon.tsx` | `chart`가 색을 직접 씀 | `Colors.light.accent/highlight/positive` **토큰 참조** | 없음 |

`icon.tsx`의 `chart`는 "직접 쓴다"기보다 **토큰을 이름으로 부른다.**
`color` prop을 안 받고 팔레트를 직접 가리킬 뿐이라, 팔레트를 갈면 **자동으로 따라온다.**

### 바꾼 것 — `app.json` 2줄

| 위치 | 이전 | 이후 | 대응 토큰 |
|---|---|---|---|
| 17행 `adaptiveIcon.backgroundColor` | `#EAF2FE` | `#EAF1F9` | `accentTint` |
| 34행 splash `backgroundColor` | `#F6F9FD` | `#F7F9FB` | `background` |

> **왜 이것만 손으로 고치나.** `app.json`은 **앱이 켜지기 전에** 쓰이는 색이다.
> 스플래시와 런처 아이콘 배경은 JS가 돌기 전에 OS가 칠하므로 `theme.ts`를 못 읽는다.
> **페인트 통 목록은 집 안에 있는데, 이 두 곳은 현관 밖 담벼락**이라 따로 칠해야 한다.

덤으로 `src/hooks/use-theme.ts:11` 주석의 예시 hex를 `#10233A` → `#1B2B3D`로 고쳤다
(없어진 색을 예로 들고 있었다. 동작과 무관한 문서 정정).

### 검증

```
npx tsc --noEmit    →  에러 0건
npm test            →  27 suites / 238 tests 전부 통과 (35.3s)
```

옛 팔레트 hex 10개를 코드 전역에 훑어 **남은 것 0건**을 확인했다(`docs/` 제외).

### 확인은 했지만 **고치지 않은 것** — 통계 버튼의 주황 막대

`chart` 아이콘은 `StatsEntryButton`(헤더 우측)에서 **`accentTint` 바닥 위에** 올라간다.
그 위 세 막대의 비텍스트 대비(WCAG 1.4.11, 기준 3:1)를 재 봤다.

| 막대 | 색 | `accentTint` 위 대비 | 3:1 |
|---|---|---|---|
| 왼쪽 `accent` | `#2C6BB8` | 4.73 | 통과 |
| 오른쪽 `positive` | `#1A865B` | 4.01 | 통과 |
| **가운데 `highlight`** | `#DA7333` | **2.85** | **미달** |

**다만 이번 교체가 만든 문제가 아니다.** 옛 팔레트에서는 `2.67`이었고 지금은 `2.85` —
**미달이긴 하나 이전보다 나아졌다.** 즉 **기존부터 있던 것**이고 이번에 드러났을 뿐이다.

고치지 않은 이유: 손대려면 `highlight`를 더 어둡게 하거나(1순위 팔레트 재조정)
버튼 바닥을 흰색으로 바꿔야 하는데, **둘 다 2순위 범위 밖**이다.
그리고 이 버튼은 `accessibilityLabel="연습 통계 보기"`와 2px 테두리를 이미 갖고 있어
**막대 하나가 흐린 것이 기능을 막지는 않는다.** 판단이 필요한 사안이라 남겨 둔다.

### 아직 확인 안 된 것 (단정하지 않는다)

- `app.json`은 **네이티브 설정**이라 Metro 리로드로는 안 붙는다.
  스플래시/런처 아이콘을 실제로 보려면 **`npm run android` 재빌드**가 필요하다.
  이번 세션에서 **재빌드도, 실기기 확인도 하지 않았다.**
- 팔레트는 여전히 **대비비 수치로만** 검증됐다. 실기기 화면은 아직 아무도 안 봤다.


## 2026-08-27 · 후속 — 테스트 복구 **완료** · 바로 아래 블록 수치 정정

> 브랜치 `new-content`. **바로 아래 「Jest란 무엇인가」 블록의 후속이다.**
> 누적 문서라 아래 블록은 손대지 않는다. 달라진 것만 여기 적는다.

### 결론 — `npm install` 한 줄로 끝났다

아래 블록에서 진단한 그대로였다. 빠져 있던 것 전부 복구됐다.

| | 이전 | 지금 |
|---|---|---|
| `jest-expo` | X 없음 | **O** |
| `@types/jest` | X 없음 | **O** |
| `node_modules/.bin/jest` | X 없음 | **O** |

```
Test Suites: 27 passed, 27 total
Tests:       238 passed, 238 total
Time:        31.368 s
```

`npx tsc --noEmit`도 **에러 0건** — 테스트 파일 포함해 완전히 깨끗해졌다.
「`Cannot find name 'expect'`」가 `@types/jest` 누락 때문이라는 진단이 맞았다.

같은 세션에서 바꾼 `theme.ts` 팔레트가 깨뜨린 것도 없다.

### 아래 블록에서 **정정할 것 2가지**

**① 검사 개수는 210개가 아니라 238개다.**
아래 블록의 210은 `it(` / `test(` 패턴을 줄 시작에서 grep해 센 값이라 과소 집계였다.
`it.each` 같은 형태와 들여쓰기가 다른 것들이 빠졌다. **실제 실행 결과는 238개.**

**② 「210개 검사가 잠들어 있다」는 이제 해당 없음.**
아래 블록의 ⑤ "지금 당장 문제인가" 항목 두 개는 **둘 다 해소됐다.**

| 아래 블록이 지적한 것 | 지금 |
|---|---|
| 238개 검사가 잠들어 있다 | **해소** — 전부 돈다 |
| `tsc`가 테스트 에러에 묻혀 진짜 타입 에러를 못 본다 | **해소** — 에러 0건 |

### 곁다리 — 새로 생긴 것

`npm install`이 취약점 **17건**(moderate 11 · high 6)을 보고했다.
**별건이고 이번 세션에서 조사하지 않았다.** `npm audit`으로 확인 가능.

### 남은 것 — 규칙이 **코드로 강제되지 않는다**

`theme.ts` 주석의 대비비(AA 4.5:1 등)는 **주석일 뿐 검사가 없다.**
누가 색을 바꾸면 조용히 깨진다. 그동안은 테스트가 안 돌아 붙일 수 없었는데,
**이제 돌아가니 붙일 수 있게 됐다.**

상세 요약은 `docs/session-2026-08-27-팔레트-jest.md`, 인계는 `docs/handoff4.md` 맨 위 블록.

---

## 2026-08-27 · Jest란 무엇인가 · `npm test`가 안 도는 진짜 이유

> 브랜치 `new-content`. theme.ts 팔레트 작업 중 「테스트가 안 돌아간다」에서 나온 질문.

### ⓪ 먼저 정정 — jest는 **설치돼 있다**

앞선 답변에서 「jest가 설치돼 있지 않다」고 했는데 **틀렸다.**
`package.json`의 `devDependencies`에 `jest@^29.7.0`이 있고,
`node_modules/jest`도 실제로 깔려 있다(v29.7.0). 테스트 파일도 **27개** 있다.

안 도는 이유는 「없어서」가 아니라 **설치가 중간에 끊겨서**다. 아래 ③에서 정확히 짚는다.

---

### ① Jest란 무엇인가

**Jest = 자바스크립트 테스트 실행기.** 페이스북(Meta)이 만들었고 RN/Expo의 사실상 표준이다.

하는 일은 단순하다.

1. 이름이 `*.test.ts` / `*.test.tsx`인 파일을 **찾아서**
2. 각 파일을 **실행하고**
3. 「이 값이 이래야 한다」는 단언(assertion)이 맞는지 **채점해서**
4. **몇 개 통과 / 몇 개 실패**를 표로 뱉는다.

문법은 세 단어면 끝난다.

```ts
describe("wrsHangul", () => {        // ← 묶음 이름
  it("감은 ㄱ·ㅏ·ㅁ으로 분해된다", () => {   // ← 검사 하나
    expect(decompose("감")).toEqual({ cho: 0, jung: 0, jong: 16 });
  });                                //   ↑ expect(실제).toEqual(기대)
});
```

`expect(A).toEqual(B)` — **A가 B와 같으면 통과, 다르면 실패.** 이게 전부다.

**왜 필요한가.** 앱을 켜고 손으로 눌러 확인하는 걸 **자동으로, 몇 초 만에, 전부** 하는 것이다.
「받침 ㅄ이 대표음 ㅂ으로 처리되나?」를 확인하려고 매번 앱을 켜서 「값」이 든 문항이
나올 때까지 기다릴 필요가 없다.

---

### ② 이 앱에서 jest는 **무엇을 지키고 있나**

빈 껍데기가 아니다. 실제로 상당한 양이 쌓여 있다.

| | 개수 |
|---|---|
| 테스트 파일 | **27개** |
| 개별 검사(`it`) | **210개** |
| 로직 테스트 `.ts` | 23개 |
| 화면 테스트 `.tsx` | 4개 |

훈련 모드별로 붙어 있다.

| 위치 | 지키는 것 |
|---|---|
| `training/__tests__` | 세션 저장소, 통계 피드, 진행 바 |
| `am/`, `freq/`, `pitch2afc/` | **스테어케이스 알고리즘** — 정답/오답에 따라 난이도가 오르내리는 규칙 |
| `ling6/` | 링 6 재생·세션·저장 |
| `sentClosed/` | 문장 폐쇄형 문항 생성·저장 |
| `wrs/` | 13개 — 한글 자모 분해, 오답 보기 생성, 빙고, TTS, 추이 |

**두 종류가 섞여 있다.**

- **로직 테스트**(23개) — 화면 없이 함수만 부른다. 위의 `wrsHangul` 예시가 이것.
- **화면 테스트**(4개) — 실제로 화면을 그려 보고 눌러 본다.

```tsx
render(<WrsVoiceGuideScreen onRetry={onRetry} onBack={() => {}} />);
expect(screen.getByText("한국어 음성이 없어요")).toBeTruthy();  // 이 문구가 떠 있나?
fireEvent.press(screen.getByText("다시 확인"));                 // 눌러 본다
expect(onRetry).toHaveBeenCalled();                            // 반응했나?
```

**이게 왜 중요한가 — 이 앱 특성상.** 스테어케이스는 눈으로 검증이 거의 불가능하다.
「정답 2번 연속이면 한 칸 내리고, 오답 1번이면 두 칸 올린다」 같은 규칙이 맞게 도는지
손으로 확인하려면 수십 문항을 직접 풀어야 한다. 테스트는 그걸 0.1초에 한다.

---

### ③ `npm test`가 안 도는 이유 — **고장이 2개 겹쳤다**

증상:

```
> jest
'jest' is not recognized as an internal or external command
```

`package.json`에 `"test": "jest"`가 있는데도 이 메시지가 나온다.

**고장 1 — 실행 파일 바로가기(`.bin` shim)가 없다.**

`npm test`는 `jest`라는 **명령어**를 찾는다. npm은 설치할 때
`node_modules/.bin/jest.cmd` 같은 바로가기를 만들어 주는데, **그게 없다.**

```
node_modules/jest/bin/jest.js     ← O 알맹이는 있다
node_modules/.bin/jest.cmd        ← X 바로가기가 없다
node_modules/.bin/create-jest.cmd ← O 옆의 형제는 있다 (!)
```

같은 패키지가 만드는 바로가기 둘 중 **하나만** 있다. 설치가 중간에 끊긴 흔적이다.

**고장 2 — `jest-expo`가 아예 안 깔렸다.**

바로가기를 우회해서 직접 부르면 이번엔 다른 데서 넘어진다.

```
$ node node_modules/jest/bin/jest.js
● Validation Error: Preset jest-expo/android not found.
```

`jest.config.js` 첫 줄이 `preset: 'jest-expo/android'`다. **프리셋**은 RN/Expo 코드를
jest가 읽을 수 있게 번역해 주는 설정 묶음인데, 이게 없으면 한 줄도 못 읽는다.

**빠진 것 정리** (`package.json`엔 적혀 있으나 `node_modules`에 없음):

| 패키지 | 상태 | 없으면 |
|---|---|---|
| `jest` | **O 있음** | — |
| `@testing-library/react-native` | **O 있음** | — |
| `react-test-renderer` | **O 있음** | — |
| `jest-expo` | **X 없음** | 프리셋 오류로 전부 실패 |
| `@types/jest` | **X 없음** | `tsc`에서 `expect`·`it`을 모르는 에러 |
| `.bin/jest` 바로가기 | **X 없음** | `npm test` 명령어 자체가 안 잡힘 |

**`@types/jest`가 없는 게 앞서 본 그 에러다.**

```
error TS2304: Cannot find name 'expect'.
error TS2593: Cannot find name 'it'.
```

`npx tsc --noEmit` 돌렸을 때 `__tests__` 파일에서만 쏟아지던 에러 — 원인이 이것이다.
**코드가 틀린 게 아니라 타입 정의가 안 깔린 것뿐이다.**

---

### ④ 고치는 법 — 한 줄

```
npm install
```

`package.json`과 `package-lock.json`에는 필요한 게 **다 적혀 있다**(lock 파일 613KB, 정상).
빠진 것만 채우면 된다. 그래도 안 되면 확실한 쪽:

```
rm -rf node_modules
npm ci
```

`npm ci`는 `node_modules`를 지우고 lock 파일 그대로 처음부터 다시 깐다. 느리지만 확실하다.

확인:

```
npm test
```

27개 파일 / 210개 검사가 도는 표가 나오면 정상이다.

---

### ⑤ 왜 이렇게 됐나 · 지금 문제인가

**원인 추정**: `npm install` 도중 끊김(네트워크·Ctrl+C·디스크). 근거는 두 가지 —
같은 패키지의 바로가기가 `create-jest.cmd`만 있고 `jest.cmd`는 없다는 점,
그리고 `devDependencies` 중 일부만(`jest` O, `jest-expo` X) 깔렸다는 점.
`--omit=dev` 같은 의도적 제외였다면 **전부** 빠졌어야 한다.

**앱 실행에는 지장 없다.** 빠진 것들은 전부 개발용(`devDependencies`)이라
`npm run android` / `expo start`는 정상이다. **실제로 지금 손해 보고 있는 것**은 이 둘:

1. **210개 검사가 잠들어 있다.** 코드를 고쳐도 뭘 깨뜨렸는지 알 방법이 없다.
   특히 스테어케이스처럼 눈으로 검증이 안 되는 부분.
2. **`tsc`가 깨끗하지 않다.** 테스트 파일 에러에 묻혀서 **진짜 타입 에러가 나도 안 보인다.**

우선순위는 높지 않지만, `npm install` 한 줄이라 비용도 거의 없다.

---

## 2026-08-22 · git — 병합하면 뭐가 바뀌나 · 옛 시점으로 앱을 돌리는 법

> 브랜치 `color_ui`에서 물어본 것. 답만 남긴다.

### ① `main`에 병합하면 무엇이 바뀌나 — **앱은 안 바뀐다**

`main`은 **책갈피**다. 지금 그 책갈피는 **1쪽(`5fc1eed init`)에 꽂혀 있다.**
그동안 글은 `color_ui`에 **92쪽까지** 썼다. 기기에서 도는 앱도 그 원고다.

**병합은 책갈피를 92쪽으로 옮기는 일이다.** 원고를 고치거나 섞는 게 아니다.

| | |
|---|---|
| `main`이 앞서 나간 커밋 | **0개** |
| `color_ui`가 앞선 커밋 | **92개** |

양쪽이 **서로 다른 방향으로 간 게 없어서 충돌이 날 수 없다.** git이
「빨리 감기(fast-forward)」로 책갈피만 민다 — **병합 커밋(◆)조차 안 생긴다.**

```
[지금]                         [병합 후]
  ee2ad9a ● color_ui             ee2ad9a ● color_ui · main
          ⋮  92개                        ⋮  92개 그대로
  5fc1eed ● main                 5fc1eed ● init
```

**실제로 달라지는 것**: 새 컴퓨터에서 받으면 지금까진 **1쪽짜리 빈 앱**이 나왔는데,
병합 후엔 **실제 앱**이 나온다. 앱 동작·기기 상태는 그대로다.

**곁다리** — 옛 브랜치 8개(`two_feat` · `feat_wrs` · `feat/ling6-tab` · `modi_tabs` ·
`ui_chips_suisei` · `merge/harmonitune` · `feat/single-tab-home` ·
`feat_wrs_voice_guide`)는 **전부 `color_ui` 줄기 안에 이미 들어와 있다.**
살아 있는 작업이 아니라 **지나온 자취**다.

### ② 병합 후에도 중간 커밋으로 앱을 돌릴 수 있나 — **된다**

병합은 커밋을 지우거나 바꾸지 않는다. 92개 스냅숏은 그대로다.

**★ 다만 git에는 「설계도」만 있다.** `node_modules/`와 `/android`는
`.gitignore` 대상이라 저장돼 있지 않다(`.gitignore:4`·`43`).
옛 커밋을 꺼내면 **소스는 나오지만 조립된 앱은 안 나온다.**
`package-lock.json`은 추적되므로 **그때의 부품 목록은 정확히 복원된다.**

```bash
git switch -d <커밋번호>     # 그 시점으로
```

여기서 두 갈래다.

| 경우 | 언제 | 무엇을 |
|---|---|---|
| **가볍다** | `package.json`·`app.json`이 그대로 | `npm start` — 기기 앱은 그대로 두고 **Metro만** 그 시점 코드로. **1분** |
| **무겁다** | 그 둘이 바뀐 시점을 넘나들 때 | `npm ci` → `npx expo prebuild -p android` → `npm run android`. **5~10분** |

어느 쪽인지 미리 아는 법 — **아무것도 안 나오면 가벼운 경우다.**

```bash
git diff --stat <옛커밋> HEAD -- package.json app.json
```

**돌아올 때는 세트로**:

```bash
git switch color_ui
npm ci            # 무거운 경우였다면 부품도 되돌릴 것
```

> `npm ci`를 잊으면 **옛 부품으로 새 코드를 돌리게 되어** 엉뚱한 오류가 난다.

**기기의 연습 기록은 그대로 남는다.** 저장소는 앱(패키지)에 붙어 있지 코드 버전에
붙어 있지 않다. 형식이 안 맞는 기록은 P0-3에서 넣은 검증이 **조용히 버린다**(크래시 없음).

**지금 작업을 안 건드리고 옛 시점을 보려면** 폴더를 하나 더 만든다:

```bash
git worktree add ../mmn-옛버전 <커밋번호>
```

왔다 갔다 할 필요가 없어 **옛 버전과 지금을 나란히 비교**할 때 편하다.

### ③ 패키지 이름을 바꾸면 기록이 끊긴다 (같은 날 실제로 겪음)

새 아이콘이 옛 아이콘을 **덮지 않고 옆에 생겼다.** 캐시 문제가 아니라
`applicationId`가 `com.vlondy.harmonitune` → `com.harmonitune.app`으로 바뀌어
안드로이드가 **완전히 다른 앱**으로 본 것이다. 둘 다 이름이 「청능 애플리케이션」이라
앱 목록에서 구분이 안 되고, 홈 화면에서 끌어내면 **바로가기만 지워진다.**

```bash
adb shell pm list packages | grep harmoni   # 뭐가 깔렸는지
adb shell pm path <패키지>                   # APK가 있으면 아직 설치된 것
adb uninstall com.vlondy.harmonitune        # 패키지로 찍어야 안 헷갈린다
```

**앱마다 저장 공간이 따로다** — 옛 앱의 연습 기록은 옮겨지지 않고 같이 사라진다.
**패키지 이름은 바꾸지 말 것.**

---


## 2026-08-21 · 1차 전달물 — 공용 요약 카드 `SummaryCard.tsx`

> 진행: 상대가 순서(① 공용 → ② 떨림 → ③ 링6 → ④ PTA 3종)에 동의. 1차로 `SummaryCard.tsx`만 전달.

### 정정 — "세 탭 동시 적용"이 아니라 **탭 2개 · 화면 3개**

`SummaryCard`를 import하는 곳은 세 군데뿐이고, 탭 기준으로는 둘이다.

| 호출 지점 | 탭 | `meanLabel` |
|---|---|---|
| `src/training/am/AmSessionScreen.tsx:439` | 떨림(AM) | `"떨림 정도"` |
| `src/training/pitch2afc/PitchCompareScreen.tsx:556` | 소리 높낮이 → 높낮이 비교 | `"음높이 차이"` |
| `src/training/freq/FreqSessionScreen.tsx:417` | 소리 높낮이 → 다른 음 찾기 | `"음높이 차이"` |

**링 6 · 단어 듣기(WRS)는 이 카드를 안 쓴다.** 각자 요약을 따로 그린다 —
`Ling6SessionScreen`은 `phase === "summary"`에서 `Card size="large"`에 문구를 직접 조립하고
(`Ling6SessionScreen.tsx:374~`), WRS는 `WrsProgressPanel`로 간다.
→ 요약 화면 톤을 4탭 전체에 맞추려면 **이 파일 하나로는 안 되고 3벌을 각각 손봐야 한다.**
가성비가 제일 큰 건 여전히 맞지만("한 장으로 2탭"), 범위를 과장해서 전달하지 말 것.

### 발견 — 죽은 코드 1개

`SummaryCardHeader`(파일 105~135줄, `header` prop과 세트)는 **import하는 곳이 0이다.**
`SessionHistoryScreen`이 자체 `AggregateCard` + `TrendGraphCard`로 갈라지면서 남은 잔재.
파일 상단 주석 *"세션 끝(①②)과 기록 목록이 같은 모양을 쓴다"* 도 현재는 **사실이 아니다**.

- 전달문에 "여기 리디자인에 시간 쓰지 말라"고 명시해 뒀다.
- **미결**: `SummaryCardHeader` + `header` prop을 지울지 살릴지. 지우면 `SummaryCardProps.header`,
  `Stat`/`MetricRow` 아래 `header`·`headerTitleRow`·`badge`·`badgeText`·`headerDate` 스타일 5개가
  같이 정리된다. 기록 목록을 다시 카드 모양으로 되돌릴 계획이 없다면 삭제가 맞다.

### 전달문에 같이 넣은 맥락

- 값 문자열은 항상 `"약 N"` 형태이고 **단위(cent·dB)를 붙이지 않는다** — 계측값처럼 보이지
  않게 하려는 의도. 디자인에서 단위 라벨을 새로 만들지 말라고 못 박음.
- 값 없을 때 `"—"`(em dash)가 들어오므로 그 상태에서 정렬이 깨지지 않아야 함.
- 강조색은 **「연습」 한 칸에만** — 정답률을 점수처럼 보이게 하지 않으려는 기존 규칙.
- `footnote`("점수·청력 검사·진단 결과 아님")는 **삭제 금지**.
- 정리 요청한 비토큰 값: `Spacing.one + 2`, `Spacing.two - 2`, `fontSize: 10.5`, `paddingVertical: 1`.

### 산출물

- 붙여넣기용 전달문: `01-summarycard.md` (머리말 + 호출 실황 + 전체 코드 219줄)

### 다음

② 떨림(AM) — `AmTabScreen.tsx`(99) + `AmSessionScreen.tsx`(737). 상대 회신 후 전달.

---

## 2026-08-21 · "탭 화면 .tsx가 없다"는 지적에 대한 답 — 그런 파일은 없다

> 질문: claude.ai 쪽에서 "링6·PTA·떨림 탭의 진입/세션/요약 화면 `.tsx`가 필요하다.
> 예: `Ling6Screen.tsx`, `PtaScreen.tsx`, `AmScreen.tsx`"라고 요구해 옴.

### 결론

**요청한 이름의 파일은 없고, 앞으로도 생기지 않는다.** 파일을 덜 보낸 게 아니라
이 앱이 **진입/세션/요약을 파일로 쪼개지 않기 때문**이다.

각 세션 화면은 한 파일 안에서 `Phase` 상태로 세 국면을 전환한다:

```ts
type Phase = "idle" | "playing" | "choose" | "feedback" | "summary";
//            ↑ 진입     ↑───── 세션 ─────↑              ↑ 요약
```

- `phase === "idle"` → 상대가 말한 **진입 화면**
- `playing` / `choose` / `feedback` → **세션 화면**
- `phase === "summary"` → **요약 화면**

`Ling6SessionScreen.tsx`(779줄) 한 개가 링6 탭의 진입·세션·요약 **전부**다.
`src/app/ling6.tsx`는 6줄짜리 라우트 껍데기라 디자인 정보가 0이다.

### 탭 → 실제 파일 매핑

| 하단 탭 | 라우트(6줄, 붙일 필요 없음) | 실제로 붙여야 할 화면 파일 | 줄 |
|---|---|---|---|
| 링 6 | `src/app/ling6.tsx` | `src/training/ling6/Ling6SessionScreen.tsx` (진입+세션+요약 전부) | 779 |
| | | `src/training/ling6/Ling6ProgressPanel.tsx` (요약 하단 진척 패널) | 327 |
| 소리 높낮이(PTA) | `src/app/pta.tsx` | `src/training/pta/PtaSessionScreen.tsx` (**진입 = 트랙 2종 선택 리스트만**) | 306 |
| | | `src/training/pitch2afc/PitchCompareScreen.tsx` (높낮이 비교 세션+요약) | 780 |
| | | `src/training/freq/FreqSessionScreen.tsx` (다른 음 찾기 세션+요약) | 711 |
| 단어 듣기(WRS) | `src/app/wrs.tsx` | `src/training/wrs/WrsTabScreen.tsx` (진입) → `WrsSessionScreen` · `WrsTwoCharScreen` · `WrsBingoScreen` | 250 / 717 / 727 / 627 |
| 떨림(AM) | `src/app/index.tsx` | `src/training/am/AmTabScreen.tsx` (분기 껍데기, 99줄) | 99 |
| | | `src/training/am/AmSessionScreen.tsx` (진입+세션+요약 전부) | 737 |

### 주의할 비대칭 — PTA만 구조가 다르다

PTA는 `PtaSessionScreen`이라는 이름과 달리 **세션을 돌리지 않는다.** 트랙 2종
(`높낮이 비교` / `다른 음 찾기`) 카드 선택 화면일 뿐이고, 실제 문제 풀이는
`PitchCompareScreen` · `FreqSessionScreen`으로 넘어간다. 즉 PTA 탭 하나를 정리하려면
화면 파일이 **3개**(306 + 780 + 711 = 약 1,800줄) 필요하다. 이름만 보고 306줄짜리
하나만 붙이면 상대는 요약 화면을 한 번도 못 본다.

### 모든 탭이 공유하는 것 (탭별 파일보다 이게 먼저다)

- `src/training/SummaryCard.tsx` (219) — **요약 화면의 실체**. AM·PitchCompare·Freq가 전부 이걸 쓴다.
- `src/training/ListeningCheckScreen.tsx` (342) — 첫 시작 전 "듣기 준비" 화면. 링6를 뺀 전 탭 공통.
- `src/training/SessionHistoryScreen.tsx` (773) — 헤더 통계 버튼으로 스와프되는 통계 화면.
- `src/training/SessionModeToggle.tsx` (144) · `SessionProgressBar.tsx` (43) · `TrendChart.tsx` (190)

### 붙여넣을 답장 (그대로 복사)

````text
요청한 이름의 파일은 이 앱에 없습니다. 파일을 덜 보낸 게 아니라 구조가 다릅니다.

이 앱은 진입/세션/요약을 별도 파일로 나누지 않습니다. 각 세션 화면 한 파일 안에서
Phase 상태("idle" | "playing" | "choose" | "feedback" | "summary")로 세 국면을 전환합니다.
idle이 진입 화면, playing~feedback이 세션 화면, summary가 요약 화면입니다.
src/app/*.tsx는 6줄짜리 라우트 껍데기라 디자인 정보가 없습니다.

탭별 실제 파일:

[링 6]  src/training/ling6/Ling6SessionScreen.tsx (779줄, 진입+세션+요약 전부)
        src/training/ling6/Ling6ProgressPanel.tsx (327줄, 요약 하단 진척 패널)

[떨림(AM)]  src/training/am/AmTabScreen.tsx (99줄, 통계·듣기준비 분기 껍데기)
            src/training/am/AmSessionScreen.tsx (737줄, 진입+세션+요약 전부)

[소리 높낮이(PTA)] — 여기만 구조가 다릅니다
        src/training/pta/PtaSessionScreen.tsx (306줄) — 이름과 달리 세션을 돌리지 않고,
          트랙 2종을 고르는 진입 화면입니다.
        src/training/pitch2afc/PitchCompareScreen.tsx (780줄) — "높낮이 비교" 세션+요약
        src/training/freq/FreqSessionScreen.tsx (711줄) — "다른 음 찾기" 세션+요약
        PTA 탭을 정리하려면 이 3개가 다 필요합니다.

세 탭이 공유하는 화면(탭별 파일보다 이쪽이 먼저입니다):
        src/training/SummaryCard.tsx (219줄) — 요약 화면의 실체. AM·PitchCompare·Freq 공용
        src/training/ListeningCheckScreen.tsx (342줄) — 첫 시작 전 "듣기 준비" 화면, 공용
        src/training/SessionHistoryScreen.tsx (773줄) — 헤더 통계 버튼으로 스와프되는 통계 화면

합계가 4,000줄이 넘으니 한 번에 다 붙이지 않습니다. 어느 탭부터 볼지 하나만
지정해 주시면 그 탭 파일만 올리겠습니다. 요약 화면 톤을 먼저 잡을 거라면
SummaryCard.tsx 한 장이 세 탭에 동시에 적용되니 그게 가장 효율적입니다.
````

### 실전 권고

한 번에 다 올리지 말 것. 순서는 **① `SummaryCard.tsx` (세 탭 동시 적용) → ② 떨림
(`AmTabScreen` + `AmSessionScreen`, 구조가 가장 단순) → ③ 링6 → ④ PTA 3종** 이다.
PTA를 맨 뒤로 미루는 이유는 위의 비대칭 때문이다.

### 관련 경로

- 앞선 블록 [claude.ai 디자인 작업용 — 어떤 파일을 붙일 것인가](#) 의 3단계 표와 같은 목록이다.

---

## 2026-08-21 · claude.ai 디자인 개선 요청문 (붙여넣기용 정본)

> 질문: "파일만 첨부했는데 디자인 개선 요청문을 알려줘. 현재 앱 성격대로 디자인하되 **빙고만 게이미피케이션** 느낌으로."

전제: [claude.ai 디자인 작업용 — 어떤 파일을 붙일 것인가](#) 블록의 1단계 코어 파일이 첨부된 상태.
빙고 작업 시에는 `src/training/wrs/WrsBingoScreen.tsx`(627줄)와 `src/training/wrs/wrsBingo.ts`도 함께 첨부할 것.

### 요청문 전문

````text
# 역할
당신은 React Native(Expo) 앱의 UI/UX 디자이너 겸 구현자다. 첨부한 코드가 이 앱의 현재
디자인 시스템 전부다. 이걸 읽고 **현재 성격을 유지한 채 디자인을 개선**해달라.

# 앱이 무엇인가
「HarmoniTune」 — 난청인(인공와우·보청기 사용자, 고령 난청 포함)을 위한 **청능 웰니스·훈련**
안드로이드 앱. 병원 검사가 아니라 연습이다.
하단 4탭: 링 6 · 소리 높낮이(PTA) · 단어 듣기(WRS) · 떨림(AM).
각 탭은 [진입 화면 → 세션 화면(문제 풀이) → 요약 화면] 구조이고, 탭 헤더에서 통계 화면으로 스와프된다.

현재 디자인 톤은 「Clean Clinical」 — 화이트·블루 기반, 넓은 여백, 수치는 모노스페이스로
계기판처럼 읽히는 정밀 의료기기 느낌이다. 이 정체성은 **유지**한다.

# 절대 규칙 (어기면 못 씀)
1. 웹이 아니다. HTML/CSS/Tailwind/NativeWind 금지. **`StyleSheet.create` 기반 RN 코드**로만 답한다.
2. 색·간격·반경·그림자는 `@/constants/theme.ts`의 `Colors.light` / `Spacing` / `Radius` /
   `Shadows` 토큰만 쓴다. 새 하드코딩 값을 화면에 뿌리지 말고, 정말 필요하면 **theme.ts에
   토큰을 추가하는 형태로 제안**하라.
3. **다크 모드는 구현하지 않는다.** OS가 다크여도 라이트로 그린다. 다크 시안 만들지 마라.
4. 화면 골격은 유지: `SafeAreaView` + `maxWidth: 800`(`MaxContentWidth`) 가운데 정렬 +
   `paddingHorizontal: Spacing.four` + 하단 액션 버튼 행.
5. 성능 방침: **소리를 듣는 중(세션 진행 화면)에는 애니메이션을 얹지 않는다.** 정적으로 둔다.
   (배터리·발열·오디오 끊김 때문. 기기 사양 문제가 아니다.) 애니메이션·연출은
   **결과/요약 화면에서만** 허용한다.
6. 카피 톤: 웰니스·연습 어휘만. "진단·스크리닝·재활·치료·환자·청력 점수"는 금지어다.
   "점수"가 아니라 "기록", "검사"가 아니라 "연습"이다.
7. 접근성: 고령 사용자·난청 사용자 기준. 탭 타겟은 최소 48dp, 본문 14 이하로 줄이지 말 것,
   색만으로 정오답을 구분하지 말 것(아이콘·텍스트 병행). 카피는 전부 한국어.
8. 기존 컴포넌트(`Card`, `ActionButton`, `Pill`, `ThemedText`, `Icon`)를 최대한 재사용한다.
   새 컴포넌트는 정말 필요할 때만 만들고, 왜 필요한지 한 줄로 밝힌다.

# 요청 1 — 전체 화면: 현재 성격대로 다듬기
Clean Clinical을 **더 잘 지킨 버전**으로 개선해달라. 새 스타일로 갈아엎는 게 아니라 정제다.
봐줬으면 하는 것:
- 시각적 위계: 지금 화면마다 제목·설명·본문·버튼의 크기/간격이 제각각인지, 규칙이 서는지
- 여백 리듬이 `Spacing` 스케일(4/8/16/24/32)에서 벗어난 곳
- 카드·배지·버튼의 사용 규칙 (예: primary 버튼은 화면당 하나)
- 진행 상태(몇 문항 중 몇 번째)와 정오답 피드백이 한눈에 들어오는지
- 요약·통계 화면에서 수치가 계기판처럼 읽히는지

# 요청 2 — 단어 빙고 화면만 게이미피케이션
`WrsBingoScreen`(단어 듣기 탭 → 단어 빙고) **하나만** 예외로, 놀이처럼 느껴지게 해달라.
나머지 화면에는 이 톤을 절대 번지게 하지 마라.

빙고 화면의 현재 구조:
- 3×3 = 9칸 보드, 최대 18번 단서(단어)를 듣고 해당 칸을 눌러 표시 → 한 줄 완성이 목표
- 난이도 easy / hard 선택
- 단계: idle(난이도 선택) → playing(듣는 중) → choose(고르기) → feedback(정오답) → summary(결과)

원하는 것:
- 보드가 "문제지"가 아니라 "판"으로 보이게. 칸이 눌리는 맛, 표시된 칸의 만족스러운 상태 변화
- 줄이 완성되는 순간의 축하 연출 (단, **연출은 feedback/summary 단계에서만**, playing 중은 정적)
- 남은 기회·진행 상황을 게임 HUD처럼 (숫자를 계기판이 아니라 목표로 읽히게)
- 결과 화면은 성취감 있게. 다만 **점수·등급·랭킹·별점처럼 사람을 평가하는 표현은 금지**
  (규칙 6). "몇 줄 완성", "몇 개 맞음" 같은 사실 기술은 괜찮다.
- 팔레트는 그대로 쓰되 `accent`/`positive`/`highlight`를 더 과감하게 써도 된다.
  완전히 새로운 색이 필요하면 theme.ts에 토큰 추가로 제안하라.

# 산출물 형식
1. 먼저 **개선 방향 요약**(화면별로 "무엇이 문제였고 어떻게 바꿨는지" 3~5줄씩). 코드보다 먼저.
2. 그다음 **수정한 파일의 전체 코드**를 파일 경로와 함께. 일부만 잘라 붙이지 말고 통째로.
3. theme.ts에 토큰을 추가했다면 그 diff를 따로 보여주고, 왜 기존 토큰으로 안 되는지 밝혀라.
4. 한 번에 전부 하지 말고 **① 디자인 시스템 정리 → ② 공통 화면 → ③ 빙고** 순서로 나눠서
   진행하자. 지금은 ①과 개선 방향 요약까지만 하고, 내 확인을 받고 다음으로 넘어가라.
````

### 이 요청문이 방어하고 있는 것

| 규칙 | 근거 |
|---|---|
| RN StyleSheet 강제 | 웹앱이 아닌데 claude.ai는 기본적으로 웹 아티팩트를 뽑으려 함 |
| 토큰만 사용 | 스타일이 `theme.ts` + 화면별 `StyleSheet`에만 있음. 하드코딩이 섞이면 시스템이 무너짐 |
| 다크 금지 | 2026-08-11 결정(`theme.ts` 주석·`use-theme.ts`) |
| 듣는 중 애니메이션 금지 | `docs/dev-client-setup-context.md` §5 경량화 방침(배터리·발열·오디오 끊김) |
| 진단·점수 어휘 금지 | `docs/amp-mdt-training-design.md` §1 웰니스·훈련 프레이밍 |
| 48dp·색 단독 구분 금지 | 고령 사용자 접근성(같은 문서 §7 사용성 메모) |
| 단계 분할 진행 | 한 번에 시키면 700줄대 화면들을 뭉개서 뱉음 |

### 같이 하면 좋은 것

- 실기기 스크린샷 3장(빙고 idle / playing / summary)을 함께 첨부. 코드는 "규칙", 스크린샷은 "결과"라 상호보완.
- 빙고부터 급하면 산출물 형식 4항을 지우고 "빙고부터 해달라"로 교체.

---

## 2026-08-21 · claude.ai 디자인 작업용 — 어떤 파일을 붙일 것인가

> 질문: "앱의 디자인·레이아웃을 파악시키려면 claude.ai/new에 어떤 파일을 제시하는 게 좋은지 열거해줘"

### 먼저 알아야 할 것 (앱 성격)

- **Expo SDK 57 / React Native 0.86 + expo-router** 앱. 웹앱이 아니다 → 붙여넣은 쪽에서 나오는 산출물은 **HTML/CSS가 아니라 `StyleSheet.create` 기반 RN 코드**여야 한다. 프롬프트에 명시할 것.
- 스타일은 **CSS/Tailwind/NativeWind 없음**. 모든 값이 `src/constants/theme.ts` 토큰 + 각 화면 하단 `StyleSheet`에 인라인으로 들어있다. → **토큰 파일 1개 + 원자 컴포넌트 4개**면 디자인 언어의 90%가 전달된다.
- **라이트 전용**(다크 미구현, 2026-08-11 결정). 다크 시안을 요청하면 규칙 위반이니 프롬프트에서 미리 못 박을 것.
- 화면 골격 공통 규칙: `SafeAreaView` + `maxWidth: 800`(`MaxContentWidth`) 가운데 정렬 + `paddingHorizontal: 24` + 하단 액션 버튼 행.

---

### 1단계 · 필수 코어 (이거 10개면 디자인 시스템이 전달됨, 합계 약 740줄)

| 파일 | 줄 | 무엇이 담겼나 |
|---|---|---|
| `src/constants/theme.ts` | 120 | **가장 중요**. Clean Clinical 팔레트 전체, `Spacing`(2/4/8/16/24/32/64), `Radius`(12/14/20/24/999), `Shadows`(card·accent), `Fonts`, `BottomTabInset`, `MaxContentWidth` |
| `src/components/themed-text.tsx` | 117 | 타이포 스케일 전부 — `metric` 48 / `title` 32 / `heading` 26 / `screenTitle` 23 / `subtitle` 16 / `default`·`small` 14 / `mono` 12 |
| `src/components/ui/card.tsx` | 49 | 흰 카드(테두리+약한 그림자) + `CardDivider` |
| `src/components/ui/action-button.tsx` | 104 | 48px 액션 버튼 3종(primary/secondary/danger) |
| `src/components/ui/pill.tsx` | 93 | 알약 배지(accent/surface, mono 변형) |
| `src/components/ui/icon.tsx` | 162 | 앱에서 쓰는 아이콘 이름 집합(SVG/심볼 매핑) |
| `src/components/themed-view.tsx` | 16 | 화면 배경면 |
| `src/hooks/use-theme.ts` | 12 | 라이트 고정 진입점(다크 없음의 근거) |
| `src/app/_layout.tsx` | 18 | 루트 — 스플래시 + 탭 |
| `src/components/app-tabs.tsx` | 47 | **하단 4탭 구조**: 링 6 · 소리 높낮이 · 단어 듣기 · 떨림 |

### 2단계 · 화면 골격 패턴 (레이아웃 규칙을 보여주는 대표 3개)

| 파일 | 줄 | 왜 |
|---|---|---|
| `src/training/TabStatsScreen.tsx` | 102 | **가장 짧고 전형적인 화면 껍데기**. 헤더 → 스크롤 본문 → 하단 버튼 행 패턴의 교과서 |
| `src/training/wrs/WrsTabScreen.tsx` | 250 | 탭 진입 화면 = 카드 선택 리스트(아이콘 타일 + 제목 + 설명) |
| `src/training/am/AmTabScreen.tsx` | 99 | 위와 대비되는 단순 탭 진입 화면 |

### 3단계 · 손보려는 화면만 골라서 (전부 붙이지 말 것 — 700줄대다)

| 종류 | 파일 | 줄 |
|---|---|---|
| 세션(문제 푸는 화면) | `src/training/wrs/WrsSessionScreen.tsx` | 717 |
|  | `src/training/ling6/Ling6SessionScreen.tsx` | 779 |
|  | `src/training/pitch2afc/PitchCompareScreen.tsx` | 780 |
|  | `src/training/am/AmSessionScreen.tsx` | 737 |
|  | `src/training/wrs/WrsBingoScreen.tsx` | 627 |
|  | `src/training/pta/PtaSessionScreen.tsx` | 306 |
| 결과·통계 | `src/training/SummaryCard.tsx` | 219 |
|  | `src/training/TrendChart.tsx` | 190 |
|  | `src/training/SessionHistoryScreen.tsx` | 773 |
|  | `src/training/wrs/WrsProgressPanel.tsx` · `ling6/Ling6ProgressPanel.tsx` | 219 · 327 |
| 작은 부품 | `src/training/SessionProgressBar.tsx` · `SessionModeToggle.tsx` · `components/ui/equalizer.tsx` · `ui/stats-entry-button.tsx` | 43 · 144 · 146 · 46 |

### 4단계 · 맥락 보강(선택)

- `package.json` — RN/Expo 버전. "웹 코드 말고 RN 코드로" 를 뒷받침.
- `app.json` — 앱 아이콘·스플래시·배경색.
- `README.md`의 "프로젝트 구조" 표 — 폴더 역할.
- `docs/dev-client-setup-context.md` §5 — **경량화 방침**(측정·훈련 화면엔 듣는 중 애니메이션 금지, 결과 화면만 Rive/Skia 허용). 애니메이션 제안을 막는 제약이라 붙이면 좋다.

### 붙이지 말 것

`src/audio/**`, `src/training/**/*.ts`(세션·계단법·단어 목록 로직), `__tests__/**`, `src/app/*.tsx` 라우트 4개(각 6줄짜리 껍데기). 디자인과 무관하게 토큰만 잡아먹는다.

### 실전 권고

1. **1단계 10개 + 3단계에서 손볼 화면 1~2개**만 올린다. 한 번에 다 올리면 모델이 토큰 예산을 코드 읽기에 다 쓴다.
2. **실기기 스크린샷 2~3장**을 같이 붙이면 코드 10개보다 효과가 크다. 코드는 "규칙", 스크린샷은 "결과"라 둘이 상호보완이다.
3. 프롬프트 머리말 예시:
   > 이건 Expo/React Native 앱이다. 웹 HTML이 아니라 `StyleSheet.create` RN 코드로 답해라. 색·간격·반경은 반드시 `@/constants/theme.ts`의 `Colors.light`·`Spacing`·`Radius` 토큰만 쓰고 새 하드코딩 값을 만들지 마라. 다크 모드는 구현하지 않는다. 화면은 `SafeAreaView` + `maxWidth 800` 가운데 정렬 + 하단 액션 버튼 행 규칙을 지킨다.

---

## 2026-08-21 · 문항 로그 = 세션 하나의 채점표

> 질문: "20문항을 풀었다면 일종의 채점표와 같은 거네? 몇 번 문제, 정답/오답 여부, 그때 나온 랜덤 보기들 — 이것이 문항 로그라는 것이지?"

### 결론

**정확히 채점표입니다.** 지금은 그 표에서 **맨 아래 합계 줄만** 저장하고 표 본문을 버리고 있습니다.

> 참고: 문항 수는 두 글자 **12**(`TWO_CHAR_TRIAL_COUNT`), 한 글자 **25**(`WRS_TRIAL_COUNT`).

### 1. 실제 데이터로 만든 채점표 예 (두 글자 1장)

| # | 정답 | 나온 보기 4개 (랜덤 배치) | 내 선택 | 결과 |
|---|---|---|---|---|
| 1 | 편지 | 먼지 / **편지** / 마을 / 토끼 | 편지 | ✅ |
| 2 | 달걀 | 노래 / 육교 / **달걀** / 달력 | 달력 | ❌ |
| 3 | 시간 | **시간** / 시각 / 땅콩 / 허리 | 시간 | ✅ |
| 4 | 육군 | 안개 / 육교 / 저녁 / **육군** | 육교 | ❌ |
| … | … | … | … | … |
| 12 | 저녁 | 전역 / 신발 / **저녁** / 마음 | 저녁 | ✅ |

**요약: 12개 중 9개 (75%)** ← 지금은 **이 줄만** 저장됨

### 2. 지목한 3요소가 그대로 맞음

| 말한 것 | 코드 필드 |
|---|---|
| 몇 번 문제 | 배열 인덱스 |
| 정답/오답 여부 | `correct: boolean` |
| 그때 나온 랜덤 보기들 | `choices: [4개]` |

여기에 **내가 무엇을 골랐는지**(`choice`)가 하나 더 붙어야 완성입니다. 오답일 때 "틀렸다"보다 **"뭘로 잘못 들었는지"** 가 실제 정보이기 때문입니다.

### 3. 「그때 나온 랜덤 보기들」이 중요한 이유

보기는 매번 새로 뽑히므로, 로그가 없으면 **같은 오답도 의미가 달라집니다.**

위 표 2번 문항에서 정답 `달걀`의 짝으로 `달력`이 나왔는데, 이건 `twoCharLists.ts`에 **일부러 헷갈리게 짝지어 둔 `hard` 단어**입니다:

```ts
{ target: "달걀", hard: "달력" },
{ target: "노래", hard: "모래" },
{ target: "허리", hard: "머리" },
```

그래서 **같은 「달걀 틀림」이라도**:

- `달력`을 골랐다 → 종성 ㄹ/ㄱ 구분 문제 (**의미 있는 오답**)
- `토끼`를 골랐다 → 아예 못 들었거나 잘못 누름 (**다른 종류의 실패**)

보기 목록을 안 남기면 이 둘을 나중에 구분할 수 없습니다.

### 4. 한 글자 트랙은 한 단계 더

한 글자는 오답을 **혼동 축**으로 만듭니다 — `cho`(초성) / `jung`(중성) / `jong`(종성). 이미 `WrsTrialOutcome.axis`에 들어 있습니다. 로그를 남기면 「종성에서만 반복해서 틀린다」 같은 패턴이 문항 단위로 드러납니다.

### 관련 경로

- `src/training/wrs/twoCharLists.ts` — `TWO_CHAR_TRIAL_COUNT = 12` · 3장 · `{ target, hard }` 쌍
- `src/training/wrs/wrsSession.ts` — `WRS_TRIAL_COUNT = 25` · `WrsTrialOutcome`
- `src/training/wrs/wrsDistractors.ts` — 혼동 축 기반 오답 생성

### 다음 단계 (미착수)

저장 스키마에 `choices` · `choice` · `difficulty`를 추가하고 CSV 내보내기를 붙이면 위 표가 그대로 재현됨. **아직 안 함.**

---

## 2026-08-21 · 문항 로그란 무엇인가 — 단어 듣기 탭 기준

> 질문: "두 글자 컨텐츠에서 내가 1번을 택한 것, 보기가 무엇이고, 정답/오답이었는지 — 이런 걸 문항 로그라고 하는 건가?"

### 결론

**맞습니다.** 그리고 코드를 보면 **일부는 이미 만들어지고 있는데 버려지고 있고**, 일부는 아예 없습니다.

### 1. 지금 저장되는 것 — 숫자 3개뿐

`src/training/wrs/wrsSession.ts`

```ts
export type WrsSessionSummary = {
  trialCount: number;    // 25
  correctCount: number;  // 21
  percent: number;       // 84
};
```

25문항을 풀어도 AsyncStorage에는 **"25개 중 21개, 84%"** 만 남습니다.

### 2. 문항 로그 = 버려지는 부분

같은 파일에 **`WrsTrialOutcome`이 이미 정의되어 있습니다**:

```ts
export type WrsTrialOutcome = {
  target: string;        // 정답 단어
  choice: string;        // 내가 고른 것
  correct: boolean;      // 맞았나
  axis: ConfusionAxis;   // "cho" | "jung" | "jong"
};
```

세션 중 **메모리에는 이 배열이 쌓입니다.** 그런데 `summarizeWrs(outcomes)`가 이를 받아 숫자 3개로 접어버리고(`wrsSession.ts:48`), **원본 배열은 그대로 사라집니다.**

즉 "내가 무엇을 골랐고 맞았는지"는 **이미 계산되고 있으나 저장되지 않는** 데이터입니다.

### 3. 다만 「보기가 무엇이고」는 지금 없음

`WrsTrial`에는 보기 4개가 있습니다:

```ts
export type WrsTrial = {
  target: string;
  choices: readonly [string, string, string, string];  // ← 보기 4개
  axis: ConfusionAxis;
  difficulty: WrsDifficulty;
};
```

그러나 `WrsTrial` → `WrsTrialOutcome`으로 넘어갈 때 **`choices`와 `difficulty`가 따라오지 않습니다.**
문항 로그를 제대로 남기려면 outcome 타입에 이 둘을 추가해야 합니다.

### 4. 온전한 문항 로그 한 줄 (두 글자 트랙 기준)

| 필드 | 예 | 지금 상태 |
|---|---|---|
| 문항 번호 | 7 | 인덱스로 유도 가능 |
| 정답 | 사과 | ✅ 있음 |
| 보기 4개 | 사과 / 사자 / 나무 / 구름 | ❌ outcome에 없음 |
| 내가 고른 것 | 사자 | ✅ 있음 |
| 맞음 여부 | ✗ | ✅ 있음 |
| 혼동 축 | `jung` (중성) | ✅ 있음 (한 글자 트랙만) |
| 난이도 | `hard` | ❌ outcome에 없음 |
| 반응 시간 | 2.4초 | ❌ 측정 코드 자체가 없음 |
| 목록 번호 | 3장 | 두 글자는 `TWO_CHAR_LISTS` 인덱스로 가능 |

**두 글자 트랙 추가 이점**: `TwoCharTrial`에 `hard`(일부러 헷갈리게 만든 짝) 필드가 따로 있어, 로그를 남기면 **"의도적으로 비슷하게 낸 보기에 걸렸는지"** 까지 구분됩니다.

### 5. 왜 화면에 안 나오는가

**화면에서 쓸 데가 없기 때문입니다.**

- 결과 카드 → "25개 중 21개"면 충분
- 추이 그래프(`wrsTrend.ts`) → 퍼센트만 사용

문항 로그가 값을 갖는 건 **밖으로 꺼낼 때**입니다. 예를 들어 「종성(`jong`)에서만 반복적으로 틀린다」 같은 패턴은 **문항 단위 기록이 있어야 보이며**, 화면보다 내보낸 CSV를 사람이 검토하거나 나중에 분석할 때 쓰입니다.

### 관련 경로

- `src/training/wrs/wrsSession.ts` — `WrsTrial` · `WrsTrialOutcome` · `summarizeWrs`
- `src/training/wrs/twoCharSession.ts` — `TwoCharTrial`(`hard` 필드)
- `src/training/wrs/wrsDistractors.ts` — `ConfusionAxis` · `WrsDifficulty`
- `src/training/wrs/wrsStore.ts` · `twoCharStore.ts` — 요약만 저장
- `src/training/wrs/wrsTrend.ts` — 퍼센트만 사용

### 연관 백로그

- **P2-7** 기록 화면 기능 공백 — 내보내기 없음
- **P1-6** 저장 키 통합(🚫 안 함) — 내보내기는 집계 레이어로 해결

---

## 2026-08-21 · 저장 키 통합에 대한 검토

> 질문: "연습마다 저장 상자(키)가 따로인데 합쳐야 하나?" — 제시된 의견에 대한 검토
> **이 답변은 `docs/improvement-backlog.md` §2 P1-6 · §6 표에도 반영되어 있음**(그쪽이 프로젝트 정본).

### 결론

**합치지 않는 게 맞습니다.** 제시된 의견에 동의하며, 한 발 더 나아가 합치는 것은 중립이 아니라 손해입니다.

### 1. 사실 확인 — 키는 실제로 4개

| 키 | 담는 것 | 쓰기 방식 | 상한 |
|---|---|---|---|
| `training.sessionHistory.v1` | **freq + am + pitch2 (3트랙)** | append | 트랙별 50 |
| `training.ling6Daily.v1` | 링 6 | **날짜 upsert**(그날 1건 덮어쓰기) | 50일 |
| `training.wrsSessions.v1` | 한 글자 | append | 50 |
| `training.twoCharSessions.v1` | 두 글자 | append | 50 |

즉 "연습마다 상자가 따로"는 정확히는 **6트랙 / 4상자**입니다.

**결정적 증거는 이미 레포 안에 있음** — "음고·떨림은 이미 한 상자인데도 탭마다 나눠 보여 준다"는 주장은 `src/training/sessionStore.ts`에서 그대로 확인됩니다. 한 배열에 `track: 'freq' | 'am' | 'pitch2'`로 섞여 들어가고, 화면에서 필터링해 탭별로 보여줍니다.

**저장 구조와 표시 구조는 무관합니다.** 이 앱이 이미 스스로 증명하고 있습니다. 합쳐도 안 합쳐도 화면은 그대로고, 한눈에 보고 싶으면 화면을 만들어야 합니다.

### 2. 합치는 건 중립이 아니라 손해

`ling6Store`는 **날짜 upsert**입니다.

> `그날 점검 1건으로 덮어쓴다 … 같은 날짜를 치환하므로 가로축이 세션 횟수로 늘어나지 않는다`

나머지 셋은 **세션 append**입니다. 수명 주기가 다릅니다. 한 배열에 넣으면:

- 쓰기 경로에서 "이 레코드는 덮어쓰기냐 붙이기냐"를 매번 분기해야 함
- 상한도 지금처럼 트랙별로 따로 세야 함
- → **코드가 줄지 않고 늡니다**

`src/training/ling6/ling6Store.ts:11` 주석이 이미 그 이유를 적어놨습니다:

> `일자 1레코드. 기존 세션 append 키와 섞지 않는다.`

### 3. 마이그레이션 비용은 일회성이 아님

"기존 기록을 새 상자로 옮기는 일만 생긴다"고 보기 쉽지만, 실제로는 그 이관 코드를 **앞으로 계속 들고 다녀야** 합니다. 구버전 앱을 쓰던 기기가 언제 업데이트할지 모르니 옛 키 4개를 읽는 경로를 지울 수가 없습니다. **일회성 작업이 아니라 영구 부채입니다.**

### 4. 목적이 두 개인데, 둘 다 저장소 변경이 불필요

1. **홈 요약 화면** — 4번 읽어서 `Promise.all`로 합치면 끝. 작은 JSON 4개라 체감 지연 없음(`추정`, 실측 안 함).
2. **문항 로그 내보내기** — 마찬가지로 읽어서 합치는 함수 하나.

둘 다 `collectAllRecords()` 같은 **집계 모듈 하나**로 해결됩니다. 저장소 무변경 · 마이그레이션 0 · 기존 화면 영향 0.

### 권고

- 지금 통합 작업은 **하지 않음**
- 나중에도 "합치기"는 답이 아닐 가능성이 높음
- 필요가 생기면 **읽기 쪽 집계 레이어**를 추가

### 관련 경로

- `src/training/sessionStore.ts`
- `src/training/ling6/ling6Store.ts`
- `src/training/wrs/wrsStore.ts`
- `src/training/wrs/twoCharStore.ts`
