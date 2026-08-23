# 청능 애플리케이션 (rn-hear-1)

React Native / Expo SDK 57 기반 **청능 웰니스·훈련** 앱. 안드로이드 우선, **dev-client** 전용(Expo Go 불가).

훈련·자극 설계: [`docs/amp-mdt-training-design.md`](./docs/amp-mdt-training-design.md)  
통계 수집·표시: [`docs/training-stats-recommendation.md`](./docs/training-stats-recommendation.md)

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

## 프로젝트 구조 (요약)

| 경로 | 역할 |
|------|------|
| `src/app/` | expo-router 화면 |
| `src/components/` | UI 컴포넌트 |
| `babel.config.js` | worklets Bundle Mode |
| `metro.config.js` | SVG transformer + Bundle Mode |
| `patches/` | metro / metro-runtime Bundle Mode 패치 |
| `docs/amp-mdt-training-design.md` | 훈련·자극 설계 |
| `docs/training-stats-recommendation.md` | 통계 수집·표시 |

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm start` | Metro (dev-client) |
| `npm run android` | `expo run:android` |
| `npm run lint` | ESLint (`expo lint`) |
| `npm run doctor` | `expo-doctor` |

## 경량화 방침

중사양 안드로이드 기준. 저사양 전용은 하지 않음. 측정·훈련 화면은 듣는 중 애니메이션을 얹지 않고 정적으로. 결과·연출은 중사양에 맞춘다.
