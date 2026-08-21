# 테스트 가이드 — `__tests__` 폴더는 무엇이고 무엇을 못 하나

이 문서는 "`__tests__` 폴더와 `*.test.ts` 파일이 뭐냐"는 질문에서 출발했다.
역할과 한계를 같이 적는다 — **한계를 모르면 통과 표시를 과신하게 된다.**

작성: 2026-08-21

---

## 1. 무엇인가

`*.test.ts` / `*.test.tsx`는 **코드를 검사하는 별도의 코드**다. 사람이 앱을 켜서
눌러보는 대신, 함수에 값을 넣고 기대한 답이 나오는지 기계가 확인한다.

실제 파일 예 (`src/training/wrs/__tests__/wrsHangul.test.ts`):

```ts
it("감은 ㄱ·ㅏ·ㅁ으로 분해된다", () => {
  expect(decompose("감")).toEqual({ cho: 0, jung: 0, jong: 16 });
});
```

읽으면 그대로 문장이다 — "`decompose("감")`을 부르면 이 값이 나와야 한다."
맞으면 통과, 다르면 실패하고 어디가 어떻게 달랐는지 찍어 준다.
이런 `it(...)` 하나가 테스트 하나다.

## 2. 앱에는 들어가지 않는다

이 파일들은 **개발용이다.** 사용자 휴대폰에 설치되는 앱에는 포함되지 않는다.
용량·속도에 영향이 없고 사용자는 존재를 모른다.
`jest`가 `package.json`의 `devDependencies`에 있는 것이 그 뜻이다.

## 3. 어떻게 찾아서 도는가

```bash
npx jest          # 또는 npm test
npx jest wrsBingo # 이름이 맞는 것만
npx jest --listTests
```

`jest.config.js`가 시키는 대로 프로젝트를 뒤져 **`__tests__` 폴더 안의 파일과
`.test.ts(x)`로 끝나는 파일을 전부 자동으로** 찾는다. 어딘가에 목록을 등록할
필요가 없다 — 그 이름으로 파일을 만들어 두면 다음 실행부터 포함된다.

### 이 저장소의 jest 설정

`jest.config.js`에서 두 가지를 맞춰 준다.

| 항목 | 이유 |
| --- | --- |
| `preset: 'jest-expo/android'` | RN·Expo 모듈을 테스트에서 흉내 낸다 |
| `moduleNameMapper`의 `@/*` | `tsconfig`의 경로 별칭을 Jest에도 동일 적용 |
| `moduleNameMapper`의 `\.css$` | `constants/theme.ts`가 `global.css`를 임포트하는데 Jest는 CSS를 못 읽는다 → `jest/styleMock.js`로 대체 |

CSS 규칙은 `@/*`보다 **먼저** 와야 한다. 순서가 바뀌면 `@/global.css`가
별칭으로 새서 파싱에 실패한다.

## 4. 지금 있는 것

```
216 tests / 22 suites
```

크게 두 갈래다.

### (a) 로직 테스트 — 원래부터 있던 것

스토어·스테어케이스·세션 규칙 같은 **순수 함수**를 검사한다.
트랙을 만들 때 그 트랙의 규칙 테스트를 같이 만들어 온 흐름이다.

| 개수 | 파일 |
| ---: | --- |
| 43 | `training/__tests__/sessionStore.test.ts` |
| 34 | `pitch2afc/__tests__/StaircaseEngine.test.ts` |
| 31 | `pitch2afc/__tests__/trainingFlow.test.ts` |
| 21 | `pitch2afc/__tests__/SessionManager.test.ts` |
| 18 | `ling6/__tests__/ling6Session.test.ts` |
| 7 | `wrs/__tests__/wrsBingo.test.ts` |
| 6 | `am/__tests__/amStaircase.test.ts` |
| 6 | `freq/__tests__/freqStaircase.test.ts` |
| 6 | `ling6/__tests__/ling6Store.test.ts` |
| 5 | `wrs/__tests__/wrsDistractors.test.ts` |
| 4 | `wrs/__tests__/twoCharSession.test.ts` |
| 3 | `freq/__tests__/freqSession.test.ts` |
| 3 | `wrs/__tests__/twoCharStore.test.ts` |
| 3 | `wrs/__tests__/wrsHangul.test.ts` |
| 3 | `wrs/__tests__/wrsSession.test.ts` |
| 3 | `wrs/__tests__/wrsStore.test.ts` |
| 2 | `wrs/__tests__/wrsTrend.test.ts` |
| 1 | `wrs/__tests__/wrsWords.test.ts` |

### (b) 화면 테스트 — 2026-08-21 추가

`@testing-library/react-native`으로 컴포넌트를 실제로 그려 보고 확인한다.

| 개수 | 파일 | 보는 것 |
| ---: | --- | --- |
| 4 | `wrs/__tests__/WrsVoiceGuideScreen.test.tsx` | 안내 문구·4단계·버튼 콜백·`checking` 잠금 |
| 8 | `wrs/__tests__/wrsTts.test.ts` | `hasKoreanVoice()` 판별·재시도·캐시 안 함 |
| 4 | `training/__tests__/SessionProgressBar.test.tsx` | 채움 폭 비율·상한·0 나눗셈 |
| 2 | `wrs/__tests__/WrsSessionScreen.test.tsx` | 보기 4개 렌더·답 선택 시 진행 막대 증가 |

화면 테스트에 필요해서 devDependency 두 개가 늘었다.
`react-test-renderer`는 프로젝트의 `react`와 **버전을 정확히 맞춰야** 설치된다
(19.2.3). 안 맞으면 `npm install`이 peer 충돌로 거부한다.

```bash
npm install --save-dev @testing-library/react-native react-test-renderer@19.2.3
```

### 화면 테스트를 쓸 때의 요령

- **`getByRole` / `getByText`로 집는다.** 스타일 값으로 요소를 찾으면
  깨지기 쉽다 — 진행 막대를 폭(`%`)으로 찾으려다 보기 칸의 `48%`를 잘못
  집은 적이 있다. 그래서 `SessionProgressBar`에 `accessibilityRole="progressbar"`와
  `accessibilityValue`를 붙였다. 테스트가 안정될 뿐 아니라 스크린리더에도 이롭다.
- **바깥 세계는 `jest.mock`으로 끊는다.** TTS·저장소·`expo-router`처럼
  기기가 필요한 것은 가짜로 바꾼다. `WrsSessionScreen.test.tsx` 위쪽이 예다.

---

## 5. 못 하는 것 — 반드시 알아야 할 한계

### (a) React Compiler 관련 버그를 못 잡는다

이 프로젝트는 React Compiler가 켜져 있다(`app.json`의 `experiments.reactCompiler`).
컴파일러는 JSX 조각을 **의존값이 바뀔 때만 다시 만들도록** 캐시하는데,
**ref는 의존값으로 치지 않는다.** 그래서 렌더에서 `someRef.current`를 읽으면
값이 바뀌어도 화면이 안 따라올 수 있다.

문제는 **Jest에서는 이게 재현되지 않는다는 것**이다. 실측으로 확인했다:

> `WrsSessionScreen`의 진행 막대를 일부러 `outcomesRef.current.length`로
> 되돌려 놓고 `WrsSessionScreen.test.tsx`를 돌렸더니 **그대로 통과했다.**

즉 이 테스트는 "진행 막대가 늘어난다"는 동작은 지켜 주지만,
**컴파일러 때문에 생기는 얼어붙음은 감지하지 못한다.**

> **이 부류의 방어선은 테스트가 아니라 lint다.**
> `react-hooks/refs` 규칙이 렌더 중 ref 접근을 **에러로** 막는다.
> 그래서 `npx eslint src`를 통과시키는 것이 `npx jest`만큼 중요하다.

### (b) 실제 기기·소리는 못 본다

2026-08-21에 "재생 중 이퀄라이저 막대가 안 움직인다"는 문제가 있었다.
원인은 **기기에 한국어 TTS 음성이 없어서** 발화가 4ms 만에 `onError`로
끝나는 것이었다. 216개 테스트 중 어느 것도 이걸 잡지 못한다 —
TTS는 `jest.mock`으로 가짜를 쓰기 때문이다.

기기 설정, 실제 소리, 애니메이션의 체감, 레이아웃 깨짐은 **직접 켜서 봐야 한다.**

### (c) 통과 = 안전이 아니다

`jest` 통과가 보장하는 것은 **"검사 대상으로 적어 둔 규칙이 안 깨졌다"**까지다.
테스트가 없는 곳은 그냥 검사되지 않았을 뿐, 멀쩡하다는 뜻이 아니다.

---

## 6. 요약

| 도구 | 잡는 것 | 못 잡는 것 |
| --- | --- | --- |
| `npx tsc --noEmit` | 타입 불일치 | 실행 중 논리 오류 |
| `npx eslint src` | 렌더 중 ref 접근 등 컴파일러 위험 | 값이 틀린 계산 |
| `npx jest` | 로직 규칙, 화면 렌더·상호작용 | 컴파일러 최적화 영향, 실제 기기·소리 |
| 기기에서 직접 | 나머지 전부 | (사람이 놓친 것) |

**네 가지가 겹쳐야 한 겹씩 메워진다.** 코드를 고친 뒤에는 앞의 셋을 돌리고,
화면·소리에 손댔으면 기기에서 한 번 본다.
