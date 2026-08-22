# 스플래시·앱 아이콘 교체 가이드 (P3-1)

> **작성**: 2026-08-22 · 브랜치 `color_ui`
> **왜**: 앱의 첫 화면과 홈 화면 얼굴이 **Expo 기본 브랜딩**이었다. **배포 전 필수**.
> **상태**: **① 오버레이 제거는 끝났다**(아래 「끝난 것」). ②③은 **이미지가 준비되면** 이 문서대로 하면 된다.

---

## 끝난 것 — ① Expo 로고 애니메이션 제거 (2026-08-22)

앱을 켜면 파란 화면 위로 **Expo 로고가 빛나며 떴다 사라지는 연출**이 있었다.
네이티브 스플래시 위에 React 컴포넌트로 한 겹 더 덧칠한 것이었다.

| 지운 것 | 무엇 |
|---|---|
| `src/components/animated-icon.tsx` | 오버레이 본체 |
| `src/components/animated-icon.web.tsx` | 웹판 |
| `src/components/animated-icon.module.css` | 웹판 스타일 |
| `assets/images/expo-logo.png` | Expo 로고 |
| `assets/images/logo-glow.png` | 뒤에 깔리던 빛 |

### ★ 같이 옮겨야 했던 것 — `hideAsync`

**오버레이를 지우는 것만으로는 안 된다.** 스플래시를 내리는 호출이
그 안에 들어 있었기 때문이다(`animated-icon.tsx:52`, `onLayout`에서 호출).

```
_layout.tsx:7   SplashScreen.preventAutoHideAsync()   ← 스플래시를 붙잡는다
animated-icon   SplashScreen.hideAsync()              ← 여기서만 놓아줬다
```

그냥 지우면 **붙잡은 채로 놓아주는 곳이 없어져 첫 화면에서 멈춘다.**
그래서 `_layout.tsx`의 `useEffect`로 옮겼다. **이 `useEffect`를 지우면 앱이 안 켜진다.**

> `catch(() => {})`는 개발 중 새로고침 때문이다 — 이미 내려간 스플래시를
> 다시 내리려 하면 거부된다. 삼켜도 되는 예외다.

### 남은 흔적 (P3-2 몫 · 지금은 안 건드림)

오버레이가 유일한 사용처였던 패키지 둘이 **쓰이지 않는 채로 남아 있다.**

| 패키지 | 지금 쓰는 곳 |
|---|---|
| `expo-image` | **없음** |
| `react-native-worklets` | **없음** |
| `react-native-reanimated` | `src/training/StatsScreen.tsx` — **살아 있음(지우지 말 것)** |

`assets/images/react-logo*.png` · `tabIcons/`도 스타터 잔재로 보인다.
**의존성 제거는 네이티브 재빌드를 부르므로 ②③과 함께 한 번에 하는 게 싸다.**

---

## 준비할 이미지 (사용자)

**원본 하나(정사각형 1024×1024 PNG, 배경 투명)** 만 주면 나머지는 이 문서대로 굽는다.

| 쓰임 | 파일 | 크기 | 주의 |
|---|---|---|---|
| 앱 아이콘 | `assets/images/icon.png` | 1024×1024 | 배경 **불투명**(투명하면 검게 나오는 기기가 있다) |
| 안드로이드 적응형 앞면 | `assets/images/android-icon-foreground.png` | 512×512 | **가운데 66%** 안에 그림을 둘 것 — 바깥은 기기 모양대로 잘린다 |
| 안드로이드 적응형 뒷면 | `assets/images/android-icon-background.png` | 512×512 | 단색이면 충분 |
| 흑백판 | `assets/images/android-icon-monochrome.png` | 512×512 | 테마 아이콘용. 실루엣만 |
| 스플래시 마크 | `assets/images/splash-icon.png` | 512×512 권장 | **배경 투명** · 여백 없이 그림만 |
| 웹 파비콘 | `assets/images/favicon.png` | 48×48 | |

### 색은 앱 색에 맞출 것

지금 스플래시 배경 `#208AEF`는 **앱 색이 아니다.** 그대로 두면 스플래시에서 앱으로
넘어갈 때 **파랑 → 흰색으로 한 번 튄다.**

| 이름 | 값 | 출처 |
|---|---|---|
| 앱 배경 | `#F6F9FD` | `src/constants/theme.ts` `background` |
| 강조(마크 색) | `#1668E3` | 같은 파일 `accent` |
| 옅은 강조 면 | `#EAF2FE` | 같은 파일 `backgroundSelected` |

---

## ② 스플래시 갈이

`app.json`의 `expo-splash-screen` 플러그인 블록을 고친다.

```jsonc
[
  "expo-splash-screen",
  {
    "backgroundColor": "#F6F9FD",        // ← #208AEF 에서
    "image": "./assets/images/splash-icon.png",
    "imageWidth": 160                     // ← 76 에서. 화면 폭에 대한 dp
  }
]
```

`imageWidth`는 **마크가 화면에서 차지할 너비(dp)** 다. 76은 작은 로고용이었다.
그림에 여백이 없다면 **150~200 사이**가 무난하다.

---

## ③ 앱 아이콘 갈이

`app.json`의 경로는 이미 맞다. **파일만 같은 이름으로 덮으면 된다.**

- `icon.png` · `favicon.png` · `android-icon-{foreground,background,monochrome}.png`
- `ios.icon`(`./assets/expo.icon`)은 iOS 전용 — **안드로이드 전용 앱이면 안 건드려도 된다.**

`adaptiveIcon.backgroundColor`(`#E6F4FE`)도 새 색에 맞출 것.

---

## ★ 반영 절차 — `app.json`만 고치면 화면은 안 바뀐다

**여기서 대부분 막힌다.** 스플래시 값은 이미 네이티브 쪽에 **구워져 있다.**

```
android/app/src/main/res/values/colors.xml:2    <color name="splashscreen_background">#208AEF</color>
android/app/src/main/res/values/styles.xml:10   windowSplashScreenAnimatedIcon → @drawable/splashscreen_logo
```

`android/`는 `.gitignore:43`으로 **git이 무시**한다(= 생성물이다. 손으로 고치지 말 것 — 다음 prebuild에서 날아간다).

```bash
npx expo prebuild -p android --clean   # app.json → 네이티브 리소스 다시 굽기
npx expo run:android                   # dev-client 다시 설치
```

`--clean`은 `android/`를 **지우고 다시 만든다.** 거기 손으로 넣은 게 있으면 사라진다.
지금은 없다(전부 `app.json`에서 생성됨).

### 확인

| 볼 것 | 통과 기준 |
|---|---|
| 앱 켜기 | 스플래시가 **새 마크**로 뜨고, 앱으로 넘어갈 때 **색이 안 튄다** |
| 스플래시가 내려가는가 | **첫 화면에서 멈추지 않는다**(위 `hideAsync` 참고) |
| 홈 화면 아이콘 | Expo 「∧」가 아니다 |
| 앱 서랍 · 최근 앱 | 같은 아이콘 |

> 아이콘은 **런처가 캐시**한다. 안 바뀌어 보이면 앱을 지우고 다시 설치할 것.
