# 청능 애플리케이션 (rn-hear-1)

React Native / Expo SDK 57 기반 **청능 웰니스·훈련** 앱. 안드로이드 우선, **dev-client** 전용(Expo Go 불가).

📖 **문서 지도 — 어떤 문서를 어떤 순서로 읽는지: [`docs/README.md`](./docs/README.md)**

상세 컨텍스트: [`docs/dev-client-setup-context.md`](./docs/dev-client-setup-context.md)  
훈련·자극 설계(AMP/MDT·트랙): [`docs/amp-mdt-training-design.md`](./docs/amp-mdt-training-design.md)

## 요구 환경

- Node.js **22.13+**
- JDK + Android Studio (compile/target SDK 36)
- 에뮬레이터 또는 USB 디버깅 실기기

## 시작하기 (Android)

```bash
npm install                   # postinstall에서 metro 패치 적용
npx expo run:android          # dev client 빌드·설치 (네이티브 변경 시 재실행)
npm start                     # expo start --dev-client
# Bundle Mode 최초/설정 변경 후: npx expo start --dev-client -- --reset-cache
```

상태 점검:

```bash
npm run doctor
```

## 왜 Expo Go가 아닌가

`react-native-audio-api`, `@shopify/react-native-skia`, `rive-react-native`, Reanimated/worklets 등 **커스텀 네이티브 모듈**을 사용합니다. 기기에 한 번 설치한 **development build**에 Metro를 붙이는 방식입니다.

## 프로젝트 구조 (요약)

| 경로 | 역할 |
|------|------|
| `src/app/` | expo-router 화면 |
| `src/components/` | UI 컴포넌트 |
| `babel.config.js` | worklets Bundle Mode |
| `metro.config.js` | SVG transformer + Bundle Mode |
| `patches/` | metro / metro-runtime Bundle Mode 패치 |
| `docs/dev-client-setup-context.md` | 스택·설정·경량화 방침 |
| `docs/amp-mdt-training-design.md` | 웰니스·훈련 / ①② 트랙·AM 스펙 |
| `docs/공개저장소-제거목록.md` | 공개 정리로 뺀 내부 문서 목록 |
| `docs/README.md` | **문서 지도** — 설명·가이드·설계만 |
| `.cursor/rules/android-dev-client.mdc` | Cursor AI always-apply 규칙 |

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm start` | Metro (dev-client) |
| `npm run android` | `expo run:android` |
| `npm run lint` | ESLint (`expo lint`) |
| `npm test` | Jest (`jest-expo/android`) |
| `npm run doctor` | `expo-doctor` |

## 경량화 방침

중사양 안드로이드 기준. 저사양 전용은 하지 않음. 측정·훈련 화면은 듣는 중 애니메이션을 얹지 않고 정적으로. 결과·연출은 중사양에 맞춰 Rive/Skia 사용 가능. 자세한 내용은 `docs/dev-client-setup-context.md` §5.
