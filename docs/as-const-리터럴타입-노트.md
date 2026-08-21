# `as const`와 리터럴 타입 — 페인트 통 라벨 이야기

이 문서는 "왜 `contentColor = theme.onAccent`에서 타입 에러가 났나"라는 질문에서
출발했다. 답만 적으면 다음에 또 같은 데서 막히므로, **왜 그렇게 되는지**를
비유 → 실제 코드 → 우리가 고른 해법 순서로 적는다.

작성: 2026-08-21
관련 파일: `src/constants/theme.ts`, `src/hooks/use-theme.ts`, `src/components/ui/action-button.tsx`

---

## 1. 한 줄 요약

`Colors` 팔레트 끝에 붙은 `as const` 때문에 색 값의 타입이 `string`이 아니라
`"#10233A"`처럼 **그 색 하나만 허용하는 타입**이 됐고, 그래서 `let`에 담은 뒤
다른 색을 재대입할 수 없었다. 코드가 틀린 게 아니라 **타입이 쓸데없이 좁았던
것**이다.

## 2. 비유 — 페인트 통에 붙는 라벨

물감 창고를 생각하자.

- `Colors`는 **팔레트**다. 칸마다 색이 담겨 있다.
- `let contentColor = theme.text`는 **빈 통을 하나 꺼내 한 스푼 떠 담는 것**이다.

여기서 타입스크립트가 하는 일이 있다. 새 통에 **라벨을 붙인다.** 그런데 라벨을
뭐라고 쓸지는 *처음 담긴 게 무엇인지* 보고 정한다.

| 팔레트가 "색이란 건 아무 색이나 된다"고 말해주면 | 팔레트가 "이건 바로 이 물감이다"라고 못박으면 |
| --- | --- |
| 라벨: **"색 담는 통"** | 라벨: **"#10233A 전용 통"** |
| 나중에 흰색을 부어도 OK | 흰색을 부으려는 순간 막힘 |

`as const`가 바로 오른쪽 칸을 만드는 표시다. "이 값들은 그냥 색이 아니라, **바로
이 물감**이다"라고 타입스크립트에게 못박는다.

## 3. 실제로 무슨 일이 있었나

### 3-1. 팔레트 쪽 (`src/constants/theme.ts`)

```ts
export const Colors = {
  light: {
    text: '#10233A',
    onAccent: '#FFFFFF',
    danger: '#9B3B3B',
    // ...
  },
} as const;   // ← 이 두 글자가 원인
```

`as const`가 없었다면 `Colors.light.text`의 타입은 `string`이다.
`as const`가 붙으면 타입이 `"#10233A"`가 된다 — **값이 곧 타입**이 된다.
이런 걸 *리터럴 타입(literal type)* 이라 부른다.

### 3-2. 쓰는 쪽 (`src/components/ui/action-button.tsx`)

```ts
let contentColor = theme.text;      // 타입 추론: "#10233A"  ← 통에 라벨이 좁게 붙음
if (primary) {
  contentColor = theme.onAccent;    // "#FFFFFF"를 넣으려 함 → 에러
} else if (variant === 'danger') {
  contentColor = theme.danger;      // "#9B3B3B" → 에러
}
```

에러 메시지는 대략 이렇게 나온다.

```
Type '"#FFFFFF"' is not assignable to type '"#10233A"'.
```

읽으면 그대로다 — **"이 통은 `#10233A` 전용인데요?"**

### 3-3. 왜 `const`가 아니라 `let`인데도 막히나

`let`은 "값을 바꿀 수 있다"는 뜻이지 "아무 값이나 넣을 수 있다"는 뜻이 아니다.
`let`은 **타입 안에서만** 자유롭다. 라벨이 `"#10233A"`면 넣을 수 있는 값은
`"#10233A"` 하나뿐이라 사실상 못 바꾸는 통이 된다.

> 참고: `let x = "hello"`처럼 **문자열 리터럴을 직접** 쓰면 타입스크립트가 알아서
> `string`으로 넓혀준다(widening). 이번 건 그렇게 안 되는데, 원본이
> `as const` 객체의 속성이라 이미 "이건 그 값이다"로 고정돼 있기 때문이다.

## 4. 고치는 두 가지 방법

| | 비유 | 코드 |
| --- | --- | --- |
| **A. 통마다 라벨 고쳐 붙이기** | 이 통 하나만 "색 담는 통"으로 다시 라벨링 | `let contentColor: string = theme.text` |
| **B. 팔레트가 내줄 때부터 넓히기** | 팔레트가 색을 꺼내줄 때부터 "물감" 취급 | `useTheme(): Record<ThemeColor, string>` |

- **A**는 그 줄만 고친다. 간단하지만 같은 패턴이 나올 때마다 반복해야 한다.
- **B**는 근원에서 한 번만 고친다. 대신 앱 전체에서 색의 16진값을 타입으로
  아는 능력을 포기한다.

## 5. 우리가 고른 것과 그 이유

**B를 골랐다.** `src/hooks/use-theme.ts`:

```ts
export function useTheme(): Record<ThemeColor, string> {
  return Colors.light;
}
```

반환 타입을 명시해서 `theme.text`가 `string`으로 나오게 했다. 이유는 두 가지다.

1. **잃는 게 없다.** 색의 16진값을 *타입으로* 알아야 하는 곳이 앱에 없다.
   색은 스타일에 넘겨 쓰는 값이지, 타입으로 분기하는 대상이 아니다.
2. **자동완성은 그대로다.** `themeColor` prop의 자동완성은 값이 아니라
   **키**에서 나온다:

   ```ts
   export type ThemeColor = keyof typeof Colors.light;
   // → 'text' | 'background' | 'accent' | 'onAccent' | ...
   ```

   `keyof`는 `as const`와 무관하게 키 이름을 그대로 뽑아준다. 그래서
   `<ThemedText themeColor="accent">`의 자동완성과 오타 검사는 살아 있다.

즉 **`as const`는 팔레트에 그대로 두고**(키 목록을 뽑는 데 필요하다),
**값을 꺼내는 문 하나에서만 넓혔다.**

## 6. 다음에 같은 증상을 만나면

증상: `Type '"..."' is not assignable to type '"..."'` — 양쪽 다 따옴표가 붙은
구체적인 문자열이면 리터럴 타입 문제다.

점검 순서:

1. 값의 출처를 따라간다. 어딘가에 `as const`가 붙어 있는지 본다.
2. 그 값의 **정확한 문자열을 타입으로 알 필요가 있는가?**
   - 있다 (예: `'primary' | 'secondary'` 같은 variant 이름) → 좁은 게 맞다.
     받는 쪽 타입을 유니온으로 넓혀라. `let v: 'primary' | 'secondary' = ...`
   - 없다 (예: 색 16진값, 폰트 이름) → 넓혀라. 근원(훅·게터)에서 한 번에
     넓히는 쪽이 호출부마다 `: string`을 붙이는 것보다 낫다.

## 7. 용어 한 줄 정리

- **리터럴 타입** — 값 하나만 허용하는 타입. `"#10233A"`, `42`, `true`.
- **`as const`** — 객체·배열 안의 값을 전부 리터럴 타입으로 고정하는 표시.
  덤으로 전부 `readonly`가 된다.
- **넓히기(widening)** — `"#10233A"`를 `string`으로, `42`를 `number`로 되돌리는 것.
- **`keyof typeof X`** — `X`의 **키 이름들**을 유니온 타입으로 뽑기.
  값이 아니라 키라서 `as const` 여부와 상관없이 동작한다.
