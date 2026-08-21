# ref를 렌더에서 읽지 마라 — 조용히 밀리는 화면

이 문서는 "왜 `outcomesRef.current.length`를 `outcomeCount` state로 바꿨나"라는
질문에서 출발했다. 이 버그는 **에러도 안 나고 화면도 대개 멀쩡해 보이기 때문에**
왜 고쳤는지 모르면 다음에 그대로 되돌리게 된다.

작성: 2026-08-21
관련: `docs/animated-value-초기화-노트.md`(같은 규칙의 다른 얼굴), `docs/testing-guide.md` §5-(a)
바꾼 곳:
- `src/training/pitch2afc/PitchCompareScreen.tsx:513`
- `src/training/wrs/WrsTwoCharScreen.tsx` (`trials`, `outcomeCount` 신설)

---

## 1. 한 줄 요약

**ref는 바꿔도 리액트가 화면을 다시 그리지 않는다.** 그래서 ref에 든 값을 렌더에서
읽어 화면에 그리면, 값이 바뀌어도 **화면은 옛날 값 그대로** 남는다.
지금까지 맞게 보였던 건 옆에 있던 `setPhase` 같은 다른 state 변경이 **우연히**
재렌더를 일으켜 줬기 때문이다.

## 2. state와 ref는 무엇이 다른가

둘 다 "렌더 사이에 값을 들고 있는 상자"다. 차이는 **바꿨을 때 리액트가 아느냐**다.

| | `useState` | `useRef` |
| --- | --- | --- |
| 값 바꾸는 법 | `setX(v)` | `ref.current = v` |
| 바꾸면 다시 그리나 | **그린다** | **안 그린다** |
| 새 값을 언제 읽나 | 다음 렌더부터 | **즉시** |
| 렌더 중에 읽어도 되나 | 된다 | **안 된다** |

핵심은 마지막 두 줄이 **맞바꿈 관계**라는 것이다.

- `setX(v)`를 부른 직후 같은 함수 안에서 `x`를 읽으면 **아직 옛날 값**이다.
  이번 렌더의 `x`는 이미 정해져 있고, 새 값은 다음 렌더에서 온다.
- `ref.current = v`는 **그 자리에서 바로** 읽힌다. 대신 화면은 모른다.

그래서 둘 중 하나만으로는 안 되는 상황이 생긴다. 3절을 보라.

## 3. 왜 ref를 쓰고 싶어지나 — 정당한 이유가 있다

WRS 세션 코드는 이렇게 생겼다.

```ts
// 소리를 재생하고, 끝나면 다음 문항으로 넘어가는 비동기 흐름
await speakWrsWord(trial.target);
const next = trialIndex + 1;
if (next >= trialsRef.current.length) { ... }
```

`await` 다음 줄은 **몇 초 뒤에** 실행된다. 그런데 이 함수는 그 사이 렌더된 최신
컴포넌트가 아니라, **함수가 만들어졌던 그 시점의 렌더**에 갇혀 있다. 그때의 state
값을 그대로 들고 있다. 이걸 *stale closure(낡은 클로저)* 라고 한다.

그래서 "지금 이 순간의 진짜 값"이 필요한 비동기 콜백에서는 state를 못 믿는다.
`ref.current`는 상자가 하나뿐이라 **항상 최신**이다. 이건 ref의 정당한 용도다.

문제는 그 ref를 **화면 그리는 데까지** 갖다 쓴 것이다.

## 4. 실제 사례 두 개

### 4-1. `WrsTwoCharScreen` — 진행 막대가 얼어붙는다

```tsx
// 전
const currentTrial = trialsRef.current[trialIndex];   // 렌더에서 ref를 읽음
// ...
<SessionProgressBar current={outcomesRef.current.length} total={TWO_CHAR_TRIAL_COUNT} />
```

답을 하나 고르면 `outcomesRef.current`에 결과가 하나 붙는다. 하지만 그건 리액트가
모르는 변경이라 **그것만으로는 막대가 안 움직인다.**

그런데 실제로는 움직였다. 왜냐하면 바로 아래 줄에:

```ts
outcomesRef.current = [...outcomesRef.current, { ... }];
setOutcomeCount(outcomesRef.current.length);   // ← 지금은 이 줄이 있다
setLastCorrect(correct);
setLastTarget(trial.target);
setPhase("feedback");                          // ← 예전엔 이게 재렌더를 일으켜 줬다
```

`setPhase`가 재렌더를 부르고, 그 김에 `outcomesRef.current.length`가 다시 읽혀서
막대가 맞게 그려졌다. **우연히 맞았던 것이다.**

이 우연은 언제든 깨진다.

- `setPhase`를 지우거나 순서를 바꾸면 막대가 멈춘다.
- 리액트가 렌더를 건너뛰기로 판단하면 멈춘다. **React Compiler는 "입력이
  안 바뀌었으면 다시 안 그려도 된다"고 판단하는데, ref 변경은 입력으로
  안 친다.**
- 원인이 두 줄 떨어진 무관해 보이는 코드에 있어서 **디버깅이 지옥이다.**

### 4-2. `PitchCompareScreen` — 표시되는 목표치가 밀린다

```ts
// 전
const targetReversals = targetReversalsFor(
  phase === "idle" ? mode : runModeRef.current,
);
```

"진행 중엔 ref가 진짜 세션 값이니까 ref를 읽자"는 의도였다. 논리는 맞지만
**렌더에서 읽으면 안 된다**는 문제가 그대로다.

그런데 여기선 더 간단히 풀렸다. 확인해 보니:

- 모드 토글은 `SessionHeader`가 **idle에서만** 그린다 → 진행 중엔 `mode`가 안 바뀐다.
- `onStart`에서 `runModeRef.current = mode`로 **그대로 복사**한다.

즉 **진행 중에는 `mode`와 `runModeRef.current`가 항상 같은 값**이다.
분기 자체가 필요 없었다.

```ts
// 후 — state 하나로 충분하다
const targetReversals = targetReversalsFor(mode);
```

> 교훈: ref를 렌더에서 읽고 싶어질 때, 먼저 **"정말 state와 다를 수 있나?"**를
> 확인하라. 다르지 않으면 ref는 그냥 없애면 된다.

## 5. 고친 방법 — 짝으로 둔다

`WrsTwoCharScreen`은 4-2처럼 없앨 수 없었다. 비동기 콜백에서 최신 값이 진짜로
필요하기 때문이다. 그래서 **둘 다 둔다.**

```ts
const trialsRef = useRef<TwoCharTrial[]>([]);   // 비동기 콜백이 읽는 최신 값
const [trials, setTrials] = useState<TwoCharTrial[]>([]);   // 화면이 그리는 값
const [outcomeCount, setOutcomeCount] = useState(0);
```

쓸 때는 **같이 갱신한다.**

```ts
const nextTrials = createTwoCharTrials(nextTwoCharListIndex(rows.length));
trialsRef.current = nextTrials;   // 콜백용
setTrials(nextTrials);            // 화면용
```

읽을 때는 **자리에 맞게 갈라 쓴다.**

| 읽는 자리 | 쓰는 것 |
| --- | --- |
| 렌더 (`const currentTrial = trials[trialIndex]`) | **state** |
| 비동기 콜백 (`trialsRef.current[index]`, `await` 뒤) | **ref** |

이 짝 패턴은 새로 만든 게 아니다. `WrsBingoScreen`이 이미
`markedRef`(53행) + `marked`(59행)로 같은 형태를 쓰고 있었다 — 콜백은
`markedRef.current`를 읽고, 타일은 `marked`로 그린다.

### 중복이 낭비 아닌가

값 하나를 두 군데 두는 게 께름칙할 수 있다. 하지만 이건 **역할이 다른 두 개**다.

- ref = "지금 이 순간의 진실" (비동기 흐름용)
- state = "화면에 그려진 것" (렌더용)

리액트에서 이 둘은 원래 시점이 다르다. 하나로 합치려는 시도가 오히려 버그를
만든다. 대신 **갱신을 빠뜨리지 않도록 항상 붙여 쓰라** — 둘을 떨어뜨려 놓으면
그때부터 어긋난다.

## 6. 왜 테스트로는 못 잡나

`docs/testing-guide.md` §5-(a)에 실측이 적혀 있다.

> `WrsSessionScreen`의 진행 막대를 일부러 `outcomesRef.current.length`로
> 되돌려 놓고 `WrsSessionScreen.test.tsx`를 돌렸더니 **그대로 통과했다.**

테스트 환경에서는 옆의 `setPhase`가 재렌더를 일으켜 주므로 우연이 그대로
재현된다. **이 부류의 방어선은 테스트가 아니라 lint다** —
`react-hooks/refs` 규칙이 렌더 중 ref 접근을 에러로 막는다.

```bash
npx eslint src      # jest만큼 중요하다
```

## 7. 판단 기준

새로 값을 만들 때 **딱 한 가지만 물으면 된다.**

> **이 값이 바뀌면 화면이 달라져야 하나?**

| 답 | 쓸 것 |
| --- | --- |
| 예 | `useState` |
| 아니오, 비동기 콜백에서 최신 값만 필요 | `useRef` |
| 둘 다 | **짝으로** — ref는 콜백에서, state는 렌더에서 |
| 예 + 만들기가 비싸고 정체성 유지 필요 (`Animated.Value`) | `useState(() => new X())` — [Animated 노트](./animated-value-초기화-노트.md) |

**"렌더 함수 안에서 `.current`가 보이면 의심하라."** 예외는 사실상 없다.

## 8. 용어 한 줄 정리

- **재렌더(re-render)** — 컴포넌트 함수를 다시 실행해 화면을 갱신하는 것.
  `setX`는 일으키고, `ref.current = v`는 안 일으킨다.
- **stale closure(낡은 클로저)** — `await`나 타이머 뒤의 코드가 옛 렌더의 값을
  들고 있는 현상. ref를 쓰는 정당한 이유.
- **React Compiler** — 입력이 안 바뀌었으면 재렌더를 건너뛰는 최적화.
  ref 변경을 입력으로 치지 않으므로, 우연히 맞던 코드가 여기서 깨진다.
- **`react-hooks/refs`** — 렌더 중 ref 접근을 에러로 막는 린트 규칙.
