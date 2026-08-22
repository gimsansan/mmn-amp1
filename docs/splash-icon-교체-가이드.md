# 스플래시·앱 아이콘 교체 가이드 (P3-1)

> **작성**: 2026-08-22 · 브랜치 `color_ui`
> **왜**: 앱의 첫 화면과 홈 화면 얼굴이 **Expo 기본 브랜딩**이었다. **배포 전 필수**.
> **상태**: **①②③ 모두 적용 · 실기기 확인함**(2026-08-22). `expo prebuild -p android` + `npm run android`로 재빌드해 **스플래시가 새 마크로 바뀐 것을 확인**했다(`--clean` 없이 됐다).

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

## 쓴 원본 — `assets/images/splash.png`

사용자가 준 **귀 + 파형** 저폴리 렌더(512×512, 배경 투명). **이 파일이 원본이다** —
아래 6개는 전부 여기서 구웠으므로, 그림을 바꾸려면 **이것만 갈고 다시 구우면 된다.**

### ★ 손본 것 둘 — 그냥 넣으면 안 됐다

**① 가운데가 안 맞았다.** 그림이 `x 63~403 · y 103~380`으로 왼쪽 위에 치우쳐 있었다.
잘라서 정사각 가운데로 다시 맞췄다. **안드로이드 적응형 아이콘은 바깥이 잘리므로
이 작업을 건너뛰면 귀 끝이 잘린다.**

**② 너무 창백했다(대표색 `#CCD7E0`).** 앱 배경 `#F6F9FD` 위에 그냥 올리면
**대비 1.38:1 — 사실상 안 보인다.**

| 배경 | 원본 그대로의 대비 |
|---|---|
| 앱 배경 `#F6F9FD` | **1.38:1** ❌ |
| 이전 스플래시 `#208AEF` | 2.42:1 |
| 앱 강조 `#1668E3` | 3.48:1 |
| 짙은 남색 `#10233A` | 10.85:1 |

사용자 선택(「다」)에 따라 **배경은 앱 색 그대로 두고 그림을 파랑으로 재색**했다.
켤 때 **스플래시 → 앱에서 색이 튀지 않는 것**을 택한 것이다.

재색은 **밝기(3D 음영)를 그대로 두고 색조만 옮긴다** — 어두운 곳 `#0A3E8F`,
밝은 곳 `#6AA2E8` 사이로 원본 밝기를 다시 편다. 대표색 `#497FC9` ·
앱 배경 대비 **3.85:1**. 명암을 뒤집지 않으므로 입체감이 살아 있다.

> **512뿐이라 아이콘(1024)은 2배 확대했다.** 저폴리라 티는 적지만 조금 무르다.
> 1024 원본이 생기면 `splash.png`를 갈고 다시 구울 것.

## 구운 것


| 쓰임 | 파일 | 크기 | 어떻게 |
|---|---|---|---|
| 스플래시 마크 | `splash-icon.png` | 512² · 투명 | 여백 없이 그림만(크기는 `imageWidth`가 정한다) |
| 앱 아이콘 | `icon.png` | 1024² · **불투명** | 바탕 `#EAF2FE` · 마크 78%(런처가 모서리를 깎는다) |
| 적응형 앞면 | `android-icon-foreground.png` | 512² · 투명 | 마크 **60%** — 가운데 66% 안전지대 안 |
| 적응형 뒷면 | `android-icon-background.png` | 512² | `#EAF2FE` 단색 |
| 테마 아이콘 | `android-icon-monochrome.png` | 432² · 투명 | 검은 실루엣만(시스템이 색을 입힌다) |
| 웹 파비콘 | `favicon.png` | 48² · 불투명 | 아이콘과 같은 구성 |

> 굽는 코드는 커밋 메시지가 아니라 **이 문서의 규칙**이 정본이다. 다시 구울 일이
> 생기면 위 비율(78% / 60%)과 색을 그대로 쓸 것.

### 색은 앱 색에 맞출 것

지금 스플래시 배경 `#208AEF`는 **앱 색이 아니다.** 그대로 두면 스플래시에서 앱으로
넘어갈 때 **파랑 → 흰색으로 한 번 튄다.**

| 이름 | 값 | 출처 |
|---|---|---|
| 앱 배경 | `#F6F9FD` | `src/constants/theme.ts` `background` |
| 강조(마크 색) | `#1668E3` | 같은 파일 `accent` |
| 옅은 강조 면 | `#EAF2FE` | 같은 파일 `backgroundSelected` |

---

## ② 스플래시 — ✅ 적용함

`app.json`의 `expo-splash-screen` 블록을 이렇게 바꿨다.

```jsonc
[
  "expo-splash-screen",
  {
    "backgroundColor": "#F6F9FD",   // ← #208AEF 에서. 앱 배경과 같은 색
    "image": "./assets/images/splash-icon.png",
    "imageWidth": 180                // ← 76 에서
  }
]
```

`imageWidth`는 **마크가 화면에서 차지할 너비(dp)** 다. 76은 작은 로고용이었다.

---

## ③ 앱 아이콘 — ✅ 적용함

경로는 원래 맞았으므로 **파일만 같은 이름으로 덮었다.**
`adaptiveIcon.backgroundColor`도 `#E6F4FE` → **`#EAF2FE`**(마크 바탕과 같은 색)로 맞췄다.

`ios.icon`(`./assets/expo.icon`)은 iOS 전용이라 **안 건드렸다** — 안드로이드 전용 앱이다.

---

## ★ 반영 절차 — `app.json`만 고치면 화면은 안 바뀐다

**여기서 대부분 막힌다.** 스플래시 값은 이미 네이티브 쪽에 **구워져 있다.**

```
android/app/src/main/res/values/colors.xml:2    <color name="splashscreen_background">#208AEF</color>
android/app/src/main/res/values/styles.xml:10   windowSplashScreenAnimatedIcon → @drawable/splashscreen_logo
```

`android/`는 `.gitignore:43`으로 **git이 무시**한다(= 생성물이다. 손으로 고치지 말 것 — 다음 prebuild에서 날아간다).

```bash
npx expo prebuild -p android     # app.json → 네이티브 리소스 다시 굽기
npm run android                  # = expo run:android. 기기를 연결한 채로
```

`--clean` **없이도 대개 된다** — 스플래시 플러그인이 `colors.xml`·`styles.xml`과
drawable을 다시 쓴다. 다만 **예전 마크의 밀도별 drawable이 남을 수 있다.**
고쳤는데 옛 그림이 계속 보이면 그때 붙일 것.

```bash
npx expo prebuild -p android --clean   # android/를 지우고 다시 만든다
```

`--clean`은 `android/`를 **통째로 지운다.** 거기 손으로 넣은 게 있으면 사라진다.
지금은 없다(전부 `app.json`에서 생성됨).

### 확인

| 볼 것 | 통과 기준 |
|---|---|
| 앱 켜기 | 스플래시가 **새 마크**로 뜨고, 앱으로 넘어갈 때 **색이 안 튄다** |
| 스플래시가 내려가는가 | **첫 화면에서 멈추지 않는다**(위 `hideAsync` 참고) |
| 홈 화면 아이콘 | Expo 「∧」가 아니다 |
| 앱 서랍 · 최근 앱 | 같은 아이콘 |

> 아이콘은 **런처가 캐시**한다. 안 바뀌어 보이면 앱을 지우고 다시 설치할 것.

---

## ★ 옛 아이콘이 옆에 남아 있다면 — 캐시가 아니라 **다른 앱**이다

2026-08-22에 실제로 겪었다. 새 아이콘이 **옛 아이콘을 덮지 않고 옆에 생겼다.**

원인은 **패키지 이름이 바뀐 것**이다. 안드로이드는 `applicationId`가 다르면
**완전히 다른 앱**으로 보므로 덮어쓰지 않고 나란히 깔린다.

| 패키지 | 설치 | |
|---|---|---|
| `com.harmonitune.app` | 2026-08-22 | **지금 앱**(`app.json`의 `android.package`) |
| `com.vlondy.harmonitune` | 2026-08-10 | 옛 빌드 — 지웠다 |

**둘 다 이름이 「청능 애플리케이션」이라 앱 목록에서 구분이 안 된다.**
아이콘을 홈 화면 밖으로 끌어내도 **바로가기만 지워지고 앱은 남는다**(실제로 그렇게 됐다).

```bash
adb shell pm list packages | grep harmoni   # 뭐가 깔렸는지 먼저 본다
adb shell pm path <패키지>                   # APK가 남아 있으면 아직 설치된 것
adb uninstall com.vlondy.harmonitune        # 패키지로 찍어야 헷갈리지 않는다
```

> **앱마다 저장 공간이 따로다.** 옛 앱에 쌓인 연습 기록은 옮겨지지 않고 같이 사라진다.
> 패키지 이름을 또 바꾸게 되면 **기록이 끊긴다**는 뜻이다 — 바꾸지 말 것.
