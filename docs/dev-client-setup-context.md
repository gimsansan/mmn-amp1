# 청능 앱 (rn-hear-1) — 초기 설정 & 프로젝트 컨텍스트

> **목적**: 이 RN 안드로이드 프로젝트를 `dev-client` 모드로 이어받는 AI 어시스턴트·개발자를 위한 컨텍스트.
> **근거**: 워크스페이스 실제 파일 확인 (`package.json` / `app.json` / `metro.config.js` 등, 2026-08 기준).
> **표기 원칙**: 파일로 직접 확인한 사실(**확실한 쪽**)과 **⚠ 미확인·추정·가설·미검증·주의(단정 금지)** 를 구분해 표시함. 구현 로그 형식: [`docs/impl-log_1.md`](./impl-log_1.md).
> **AI 규칙**: 짧은 always-apply 규칙은 `.cursor/rules/android-dev-client.mdc` 참고.

---

## 0. 한눈에

- 플랫폼: React Native 안드로이드 (iOS 스크립트도 있으나 안드로이드 우선)
- 실행 모드: **dev-client** (Expo Go 불가 — 이유는 §2)
- 앱 성격: 청능 **웰니스·훈련** 앱(진단·스크리닝 주장 지양). **오디오 실시간 합성 기반**. **중사양 기준**(측정 화면만 가볍게).
- 훈련·자극 설계(① AM/포락선 · ② 주파수, 엔진·계단식): [`docs/amp-mdt-training-design.md`](./amp-mdt-training-design.md)
- 문서 지도(분류·읽는 순서): [`docs/README.md`](./README.md)
- 구현·결과 로그: [`docs/impl-log_1.md`](./impl-log_1.md)(이어서) · [`docs/impl-log.md`](./impl-log.md)(과거) · 수정 리뷰: [`docs/fix-reviews.md`](./fix-reviews.md)
- 개선 백로그 + 진행 현황: [`docs/improvement-backlog.md`](./improvement-backlog.md)
- 인계문: **폐지**(2026-08-24). 제거 목록: [`공개저장소-제거목록.md`](./공개저장소-제거목록.md). 세션 기록은 `impl-log_1.md`
- 진입점: `package.json` → `"main": "expo-router/entry"` / 라우팅: `expo-router` (`src/app/`, typed routes)
- 프로젝트명: `rn-hear-1` (app.json name: "청능 애플리케이션")
- 워크스페이스 경로: `d:\mnn_1`

---

## 1. 확정 스택 (package.json 기준 — 확인됨)

**플랫폼 / 코어**
- Expo SDK `~57.0.10`, React Native `0.86.2`, React `19.2.3`
- New Architecture(Fabric): SDK 55부터 상시 활성(always-on) → 이 프로젝트는 New Arch 위에서 동작
- `expo-dev-client` `~57.0.10` 포함

**오디오 (핵심)**
- `react-native-audio-api` `^0.13.2` — 실시간 오디오 합성(Web Audio API 방식). app.json 플러그인에 등록됨.
- `expo-audio` `~57.0.3` — 오디오 재생/세션

**애니메이션 · 그래픽**
- `react-native-reanimated` `4.5.1` (+ `react-native-worklets` `0.10.1`)
- `@shopify/react-native-skia` `2.6.2` — 절차적 2D 렌더링
- `rive-react-native` `^9.8.5` — 벡터 상태 머신
- `react-native-svg` `15.15.4` (+ dev: `react-native-svg-transformer`) — SVG 컴포넌트 import 설정 **확인됨** (§4)

**입력 · 내비 · 저장 · 기타**
- `react-native-gesture-handler` `~2.32.0`
- `@react-native-async-storage/async-storage` `2.2.0`
- `expo-haptics`, `expo-screen-orientation`(orientation `"default"`), `expo-updates`, `expo-constants`, `expo-font`, `expo-asset`, `expo-splash-screen`, `expo-system-ui`, `expo-linking`, `expo-status-bar`

**테스트 / 도구**
- `jest` + `jest-expo/android` preset (`jest.config.js` 확인됨), `expo lint`(eslint-config-expo), TypeScript `~6.0.3`

**환경 요구 (검색 확인, SDK 57)**
- Node.js 최소 `22.13.x`
- Android 7+ / compile SDK 36 / target SDK 36

---

## 2. 왜 dev-client 모드인가 (중요)

이 프로젝트는 **Expo Go에 포함되지 않는 네이티브 모듈**을 사용함:
`react-native-audio-api`, `rive-react-native`, `@shopify/react-native-skia`, `react-native-reanimated`(worklets) 등.

→ Expo Go로 실행 불가. **커스텀 개발 빌드(dev client)** 를 한 번 만들어 기기에 설치한 뒤, 거기에 Metro 개발 서버가 붙는 구조.

- 개발 서버: `npm start` = `expo start --dev-client`
- dev client 빌드/설치: `npm run android` = `expo run:android`
  - SDK 57은 prebuild가 기본 → 네이티브 프로젝트 자동 생성 후 빌드됨.
  - 현재 워크스페이스에 `android/` 디렉터리 존재(확인됨).

---

## 3. 초기 설정 순서 (안드로이드)

1. **사전 준비**: Node 22.13+, JDK, Android Studio + SDK(compile/target 36), 에뮬레이터 또는 실기기(USB 디버깅).
2. **의존성 설치**: `npm install`
3. **dev client 최초 빌드·설치**: `npx expo run:android`
   - 네이티브 의존성/플러그인이 바뀔 때마다 **재실행(리빌드)** 필요.
4. **개발 서버 실행**: `npx expo start --dev-client` → 설치된 dev build에서 접속.
5. **실기기 연결(USB / WiFi / ADB)**: [`dev-client-connection-guide.md`](./dev-client-connection-guide.md) — Metro URL·`adb reverse`·WiFi ADB 구분.
6. **상태 점검(권장)**: `npm run doctor` (= `npx expo-doctor`)

---

## 4. 설정 파일 점검 결과 (파일로 확인함)

### babel.config.js
- **확인됨**: `babel-preset-expo` + `react-native-worklets/plugin` (`bundleMode: true`, `strictGlobal: true`).
- Expo 자동 worklets 추가는 `{ worklets: false, reanimated: false }`로 끄고, 옵션이 있는 플러그인을 **수동·맨 마지막**으로 등록함.
- 구 `react-native-reanimated/plugin` 이름은 사용하지 말 것.

### metro.config.js + SVG + Bundle Mode
- **확인됨**: `react-native-svg-transformer/expo` 사용.
- `assetExts`에서 `svg` 제거, `sourceExts`에 `svg` 추가.
- **확인됨**: `getBundleModeMetroConfig(config)` 적용 (SVG 설정 이후).
- 타입 선언: `src/types/svg.d.ts` — `*.svg` → `FC<SvgProps>` (확인됨).
- Metro 패치: `patches/metro+0.84.4.patch`, `patches/metro-runtime+0.84.4.patch` + `patch-package` (`postinstall`).

### 진입점 / 라우트
- 진입점: `expo-router/entry` (`package.json` main) — 별도 `index.ts` 없음.
- 라우트: `src/app/` — `_layout.tsx`, `index.tsx`, `explore.tsx` (확인됨).
- 경로 alias: `@/*` → `./src/*`, `@/assets/*` → `./assets/*` (`tsconfig.json`).

### tsconfig / eslint / jest
- `tsconfig.json`: `extends: expo/tsconfig.base`, `strict: true` (확인됨).
- 프로젝트 루트에 `eslint.config.*` / `.eslintrc*` **없음**. lint는 `expo lint` + `eslint-config-expo` 의존성으로 동작.
- `jest.config.js`: `preset: 'jest-expo/android'` (확인됨).

---

## 5. 경량화(중사양 기준 · 측정 화면만 가볍게)

- **Reanimated 메모리 이슈 우회 — 적용됨**: worklets **Bundle Mode** (`babel.config.js` + `metro.config.js` + metro/metro-runtime 패치).
  - 원인: RN 0.85+ Hermes 변경 → `react-native-reanimated` import만으로 Android 메모리 25~30% 증가 가능(SDK 56/57).
  - 적용 후 Metro는 **`--reset-cache`** 로 한 번 재시작 권장: `npx expo start --dev-client -- --reset-cache`
  - 네이티브 리빌드는 보통 불필요(JS/Metro 설정). 단, 이상 시 `expo run:android` 재시도.
  - **주의**: 독립 top-level Metro 다중 번들(동적 code-split 호스트/피처 분리)과 비호환. 이 앱은 단일 번들 전제.
  - 패치는 Metro 공식 반영 전 임시 우회. metro 버전 업 시 patch 파일 재확인.
- **설계 방침**:
  - **기준은 중사양.** 저사양 전용 최적화는 하지 않음.
  - 측정·훈련 입력 화면은 정적. 듣는 중에 Rive/Skia·무거운 애니메이션을 얹지 않음(배터리·발열·오디오 끊김 — 사양 문제가 아님).
  - 결과·연출 화면은 중사양에 맞춰 Rive/Skia 사용 가능.
  - 나무 성장은 연속 벡터 변형(Rive) 대신 **단계 이미지 전환(WebP + Reanimated)** 방식 검토 중.
  - 런타임 부담: 정적 이미지(WebP) < Reanimated < (Rive · Lottie · Skia).

---

## 6. app.json 상태 (확인됨 — 템플릿 잔재 정리됨)

이전 문서의 `threads-clone` 잔재는 **현재 워크스페이스에서 이미 교체됨**:

- `slug`: `"rn-hear-1"`
- `android.package` / `ios.bundleIdentifier`: `"com.rnhear.app"`
- `scheme`: `"rnhear"`
- `icon`: `./assets/images/icon.png`
- `android.adaptiveIcon`: foreground/background/monochrome 분리됨
- `name`: "청능 애플리케이션"
- 플러그인: `expo-router`, `expo-dev-client`, splash, `react-native-audio-api`, `expo-audio`, `expo-asset`, `expo-font`, `expo-screen-orientation`
- experiments: `typedRoutes`, `reactCompiler` true

---

## 7. 이 문서 사용법 (AI)

- §1 "확정 스택"은 사실로 취급.
- 코드를 작성/수정하기 전에 관련 설정 파일을 실제 읽고 확인할 것(추측 금지).
- 새 네이티브 의존성을 추가하면 dev client **리빌드**가 필요함을 전제로 안내할 것.
- 버전이 최신(SDK 57 / RN 0.86 / Reanimated 4)이라, 오래된 예제(예: `react-native-reanimated/plugin` 사용, 구 아키텍처 전제)를 그대로 적용하지 말 것.
- iOS 전용 속성/가이드를 기본 추천하지 말 것(안드로이드 우선).
