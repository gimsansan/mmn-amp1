# `useRef(new Animated.Value(0)).current`를 왜 버렸나

이 문서는 "`useRef(...).current`가 왜 린트 에러냐"는 질문에서 출발했다.
바꾼 코드만 보면 왜 굳이 `useState`를 쓰는지 이상해 보이므로, **문제 → 원인 →
대안 비교 → 우리가 고른 것** 순서로 적는다.

작성: 2026-08-21
관련: [ref vs state 노트](./ref-vs-state-노트.md) — 같은 규칙이 만드는 실제 버그
바꾼 곳 3군데:
- `src/components/ui/equalizer.tsx:34`
- `src/training/wrs/WrsBingoScreen.tsx:478` (`ConfettiBurst`)
- `src/training/wrs/WrsBingoScreen.tsx:629` (`BingoTile`)

---

## 1. 한 줄 요약

`useRef(new Animated.Value(0)).current`는 리액트 네이티브에서 오래 쓰인 관용구지만
**렌더 중에 ref를 읽는다.** `react-hooks/refs` 룰이 이걸 에러로 잡는다.
이 저장소는 이미 `equalizer.tsx`에서 **지연 초기화 `useState`**를 쓰고 있었고,
나머지도 거기에 맞췄다.

```ts
// 전
const scale = useRef(new Animated.Value(MIN_SCALE)).current;

// 후
const [scale] = useState(() => new Animated.Value(MIN_SCALE));
```

## 2. 먼저: 왜 애초에 `useRef`를 썼나

`Animated.Value`는 **딱 한 번만 만들어야 하는 물건**이다.

애니메이션이 도는 동안 이 객체 안에 "지금 0.7까지 왔다" 같은 진행 상태가 들어
있다. 렌더될 때마다 새로 만들면 매번 처음 값으로 리셋된 새 객체가 생기고,
화면에 붙어 있던 애니메이션은 버려진 옛 객체를 계속 움직이게 된다. 결과는
**애니메이션이 멈추거나 튀는 것**이다.

그런데 컴포넌트 함수는 렌더될 때마다 처음부터 다시 실행된다.

```ts
function Bar() {
  const scale = new Animated.Value(0);  // ← 렌더마다 새로 생김. 안 된다.
}
```

그래서 "렌더 사이에 값을 들고 있어 주는 상자"가 필요하고, 그게 `useRef`다.
`useRef(x)`는 `{ current: x }` 모양의 상자를 주는데, **그 상자는 렌더가 몇 번
돌든 같은 상자다.** 그래서 `.current`에 넣어 둔 `Animated.Value`가 유지된다.

여기까지는 의도가 맞다. 문제는 두 가지다.

## 3. 문제 1 — 인자는 매 렌더 계산된다 (조용한 낭비)

```ts
useRef(new Animated.Value(MIN_SCALE))
```

`useRef`는 **첫 렌더에만** 상자를 만들고 그 뒤로는 인자를 무시한다.
하지만 자바스크립트는 함수를 부르기 전에 **인자를 먼저 계산한다.** 그래서
`new Animated.Value(MIN_SCALE)`은 **매 렌더마다 실행되고**, 두 번째부터는
만들어지자마자 `useRef`에게 무시당하고 버려진다.

렌더 100번이면 `Animated.Value` 100개를 만들어 99개를 쓰레기로 버린다.
동작은 맞지만 낭비다. 이걸 **eager 초기화**라고 부른다.

## 4. 문제 2 — `.current`를 렌더 중에 읽는다 (린트가 잡는 지점)

이게 실제로 에러가 난 이유다.

리액트는 **렌더 함수가 순수하기를** 요구한다. 같은 입력이면 같은 결과가 나오고,
바깥 상태를 읽거나 쓰지 않아야 한다는 뜻이다. `ref`는 정의상 **렌더 밖에 사는
변경 가능한 값**이라, 렌더 중에 읽으면 이 약속이 깨진다.

왜 깨지면 곤란한지:

- 리액트 19의 동시 렌더링(concurrent rendering)은 렌더를 **중단하고 버리고 다시
  시작**할 수 있다. 버려진 렌더에서 ref를 만졌으면 그 흔적이 남는다.
- React Compiler는 순수하다는 전제로 렌더 결과를 **건너뛰거나 재사용**한다.
  ref를 읽으면 그 판단이 틀어진다.
- Strict Mode는 개발 중 렌더를 **두 번** 돌린다.

그래서 `react-hooks` 플러그인의 `refs` 룰이 "렌더 중 ref 접근"을 막는다.
`useRef(...).current`는 선언하는 그 줄에서 바로 `.current`를 읽으므로 정확히
걸린다.

> ref 자체가 나쁜 게 아니다. **이벤트 핸들러나 `useEffect` 안에서** 읽고 쓰는 건
> 정상이다 — 그건 렌더가 끝난 뒤니까. 막히는 건 "렌더 도중에" 읽는 것뿐이다.

## 5. 해법 — 지연 초기화 `useState`

```ts
const [scale] = useState(() => new Animated.Value(MIN_SCALE));
```

`useState`에 **값 대신 함수**를 넘기면, 리액트는 그 함수를 **첫 렌더에서 딱 한
번만** 부른다. 두 번째 렌더부터는 함수를 아예 부르지 않고 저장해 둔 값을 그대로
돌려준다. 이걸 **지연 초기화(lazy initializer)**라고 한다.

이게 두 문제를 동시에 푼다.

| | 매 렌더 `new` 호출? | 렌더 중 ref 접근? |
| --- | --- | --- |
| `useRef(new Animated.Value(0)).current` | 예 (낭비) | 예 (린트 에러) |
| `useState(new Animated.Value(0))` | 예 (낭비) | 아니오 |
| `useState(() => new Animated.Value(0))` | **아니오** | **아니오** |

화살표 함수가 핵심이다. `useState(new Animated.Value(0))`처럼 괄호를 빼면
`useRef`와 똑같이 매 렌더 새로 만들어 버린다 — 인자는 항상 먼저 계산되니까.

### 5-1. setter를 안 쓰는 게 이상하지 않나

```ts
const [scale] = useState(...);   // setter를 구조분해에서 뺐다
```

이상하지 않다. 여기서 `useState`는 **"상태를 바꾸려고"** 쓰는 게 아니라
**"한 번 만든 걸 계속 들고 있으려고"** 쓴다. 값이 바뀌는 건
`Animated.Value` 객체 *안쪽*이고, 그건 리액트 재렌더 없이 네이티브 쪽에서
처리된다. 그래서 setter를 부를 일이 없고, 아예 받지 않는 게 의도를 더 잘
드러낸다.

### 5-2. `useMemo`는 왜 안 되나

```ts
const scale = useMemo(() => new Animated.Value(0), []);   // 권하지 않음
```

동작은 대개 한다. 하지만 리액트 공식 문서가 명시하듯 **`useMemo`는 캐시를 언제든
버릴 수 있다** — 메모리 압박 같은 상황에서 다시 계산할 수 있다는 뜻이다.
"성능 최적화용이지 의미 보장용이 아니다." `Animated.Value`는 다시 만들어지면
애니메이션이 깨지므로, **보장이 필요한 자리에는 쓰면 안 된다.**
`useState`의 지연 초기화는 한 번만 실행됨이 **보장**된다.

### 5-3. RN의 `useAnimatedValue`는?

리액트 네이티브에 `useAnimatedValue(0)` 훅이 있다. 속은 사실상 같은 패턴이다.
이 저장소는 이미 `equalizer.tsx`가 `useState` 방식을 쓰고 있어서 **한 가지
방식으로 통일**하는 쪽을 골랐다. 새로 쓴다면 어느 쪽이든 무방하다.

## 6. 이 저장소의 3곳

**① `equalizer.tsx:34`** — 막대 하나의 세로 스케일. 기준이 된 코드다.

```ts
const [scale] = useState(() => new Animated.Value(MIN_SCALE));
```

**② `WrsBingoScreen.tsx:629` (`BingoTile`)** — 타일 등장 스프링.
초기값이 prop에 따라 갈리는데, 지연 초기화 함수 안이라 그냥 써도 된다.

```ts
const [scale] = useState(() => new Animated.Value(animate ? 0.5 : 1));
```

> 주의: 이 초기값은 **첫 렌더의 `animate` 값으로 한 번만** 정해진다. 나중에
> `animate`가 바뀌어도 초기값은 안 따라간다. 그래서 아래 `useEffect`에서
> `scale.setValue(...)`로 명시적으로 다시 맞춰 준다 — 이게 올바른 형태다.

**③ `WrsBingoScreen.tsx:478` (`ConfettiBurst`)** — 조각 16개를 배열로 한 번에.

```ts
const [pieces] = useState(() =>
  Array.from({ length: 16 }, (_, i) => ({
    left: (i * 6.1) % 92,
    // ...
    v: new Animated.Value(0),
  })),
);
```

여기선 `Animated.Value` 16개 + 위치·색·지연 같은 **랜덤성 있는 배치까지**
한 번만 계산돼야 한다. 매 렌더 다시 계산하면 컨페티가 렌더될 때마다 자리를
바꿔 튄다. 지연 초기화가 그걸 막는다.

## 7. 다음에 같은 판단을 할 때

**"렌더 사이에 유지돼야 하는 값"을 만들 때 무엇을 쓰나:**

| 상황 | 쓸 것 |
| --- | --- |
| 만드는 비용이 크거나 정체성이 유지돼야 하는 객체 (`Animated.Value`, `Map`, 클래스 인스턴스) 이고, **렌더에서 읽어야** 함 | `useState(() => new X())` |
| 렌더에서 **읽지 않고** 이펙트·핸들러에서만 쓰는 값 (타이머 ID, 이전 값 기억, DOM/뷰 참조) | `useRef(null)` + 이펙트에서 대입 |
| 값이 바뀌면 화면이 다시 그려져야 함 | 보통의 `useState` |
| 순수한 파생 계산이고, 다시 계산돼도 무해함 | `useMemo` |

**린트 에러를 만나면 먼저 물을 것:** "이 값을 렌더 중에 읽나?"
읽는다면 ref가 아니라 state다.

## 8. 용어 한 줄 정리

- **지연 초기화(lazy initializer)** — `useState`에 값 대신 함수를 넘겨, 첫 렌더에만
  실행되게 하는 것.
- **eager 초기화** — 인자를 미리 계산해 넘기는 것. 훅이 무시해도 계산 자체는 매번 일어난다.
- **렌더 순수성** — 렌더 함수는 같은 입력에 같은 출력을 내고 바깥을 건드리지 않아야 한다는 리액트의 약속.
- **`react-hooks/refs`** — 그 약속을 지키게 하려고 렌더 중 ref 접근을 막는 린트 룰.
