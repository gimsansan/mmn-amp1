# USB 실기기 → 에뮬레이터 (초보 가이드)

> **목적**: 폰 USB 디버깅만 쓰다가 **에뮬레이터**로 바꿀 때, 명령이 **왜** 필요한지·하면 **무엇이** 바뀌는지.
> **대상**: `adb` / Metro / Gradle 이 헷갈리는 사람.
> **근거**: 2026-08-28 세션(Pixel_7 AVD, PowerShell / Git Bash).

---

## 0. 한 줄로

폰과 에뮬은 **다른 기기**다. JS만 고쳤으면 **그 기기에 앱이 이미 있으면** `npm start`만 하면 된다.
에뮬에 앱이 **한 번도 없으면** `npm run android`로 **그 에뮬에** 설치한다.

---

## 1. 원리 — 세 층이 따로 돈다

비유: PC는 **공장**, 에뮬/폰은 **매장**, Metro는 **오늘 메뉴판(JS)** 을 매장에 보내는 방송이다.

| 층 | 무엇 | 하는 일 | 안 켜면 |
|----|------|---------|---------|
| 에뮬레이터 | 가상 안드로이드 폰 | 화면·터치·오디오가 있는 **기기** | 설치·실행할 곳이 없음 |
| 앱(dev client) | 기기에 깔린 APK | 네이티브 모듈이 들어 있는 **상자** | Metro가 붙을 상자가 없음 |
| Metro | `npm start` | JS/TSX를 기기에 실시간으로 보냄 | 상자는 뜨지만 최신 화면이 안 옴 |

이 앱은 **Expo Go 불가**. `react-native-audio-api`, Skia, Rive 등이 Go에 없어서
**우리 전용 APK(dev client)** 가 기기에 있어야 Metro가 붙는다.

### 왜 USB 폰에 있던 앱이 에뮬에 자동으로 안 오나

USB로 쓰던 실기기(예: SC_01M)와 Pixel_7 에뮬은 **저장소가 완전히 다른 두 대**다.
폰에 깔아 둔 APK는 에뮬 안으로 **복사되지 않는다.** 그래서 에뮬을 처음 쓰면
아이콘이 없거나, 있어도 예전에 깔아 둔 다른 빌드일 수 있다.

### JS만 고쳤는데 리빌드가 필요 없다는 말

| 고친 것 | 어느 층 | 필요한 것 |
|---------|---------|-----------|
| `src/` 의 `.tsx` / `.ts` | Metro(메뉴판) | `npm start` 후 저장하면 다시 묶임 |
| `package.json` 네이티브 모듈, 플러그인, Kotlin/Java | APK(상자) | `npm run android` 로 **다시 설치** |

2026-08-27 소리 높낮이 통합은 JS/TSX만이었다. **그 기기(폰)에 이미 APK가 있으면**
네이티브 리빌드는 필요 없었다. **에뮬이 그 APK를 아직 안 갖고 있으면** 설치는 한 번 해야 한다.

---

## 2. 명령이 하는 일 (오해부터)

### `adb devices` — 앱이 있나 보는 명령이 **아님**

`adb`는 PC가 안드로이드 기기를 **조종하는 리모컨**이다.
`adb devices`는 「지금 리모컨에 뭐가 잡혔나」만 본다.

| 출력 | 뜻 |
|------|-----|
| `emulator-5554    device` | 에뮬이 붙었고 명령 받을 준비됨 |
| `offline` | 화면은 떠도 adb가 아직 못 씀. 조금 기다리거나 Cold Boot |
| 목록이 비어 있음 | 에뮬이 꺼졌거나 adb가 못 찾음 |
| `adb: command not found` | 그 터미널 PATH에 `adb`가 없음. 아래 §5 |

앱 설치 여부는 **에뮬 앱 서랍의 「청능 애플리케이션」 아이콘**으로 본다.
패키지 이름은 `com.harmonitune.app` (`app.json`).

### `npm start` vs `npm run android`

| 명령 | 하는 일 | 끝나면 |
|------|---------|--------|
| `npm start` | Metro만 켬. **이미 깔린** APK에 JS를 붙임 | 터미널이 Node로 남음 |
| `npm run android` | Gradle로 APK를 **지금 잡힌 기기**에 빌드·설치·실행 | 끝나면 종종 Metro(Node)가 이어서 뜸 |

아이콘이 보이면 상자는 있다 → **`npm start`만**. 아이콘이 없으면 **`npm run android`**.

에뮬을 **처음** 쓰면 거의 항상 `npm run android`가 필요하다.
실기기 USB만 쓰던 상태면 에뮬에는 보통 없으므로 **설치부터**.

### 에뮬 켜기 — Android Studio를 안 켜도 됨

에뮬은 SDK 안의 `emulator.exe`가 띄운다. Studio는 그 버튼을 눌러 주는 UI일 뿐이다.

이미 **화면에 에뮬이 떠 있으면** 켤 명령을 다시 치지 않는다. 중복으로 두 대가 뜨거나
포트가 꼬일 수 있다. 그때는 `adb devices`만 보면 된다.

---

## 3. 추천 순서 (이미 에뮬이 떠 있는 경우)

프로젝트 폴더: `D:\mnn_1`. USB 폰은 **빼 둔다.**
실기기가 붙어 있으면 `npm run android`가 폰을 집을 수 있다.

1. 에뮬 화면이 켜져 있는지 확인. (꺼져 있으면 §4로 켠다.)
2. 기기가 잡혔는지:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

`emulator-5554    device` 가 나와야 한다.

3. 앱 아이콘이 **있으면** → `npm start`
4. 앱 아이콘이 **없으면** → `npm run android` (몇 분 걸림. §6)
5. 앱이 Development servers만 뜨면 Metro 주소:

- `http://10.0.2.2:8081` — 에뮬이 **PC(호스트)** 를 보는 주소
- 또는 `adb reverse tcp:8081 tcp:8081` 후 `http://127.0.0.1:8081`

USB 때 쓰던 폰 LAN IP(`192.168.x.x`)는 에뮬과 무관하다.

---

## 4. 에뮬이 꺼져 있을 때 명령으로 켜기

PowerShell:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -list-avds
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_7
```

`-list-avds`에 나온 **정확한 이름**을 `-avd`에 넣는다. 이 세션에서는 `Pixel_7`.
이 터미널은 **에뮬이 켜져 있는 동안 로그가 계속 나온다.** 끄면 에뮬도 같이 꺼진다.
다른 터미널에서 `adb` / `npm`을 쓴다.

---

## 5. 터미널 종류 — 같은 PC라도 문법이 다름

| 셸 | `adb`가 PATH에 없으면 | `grep` |
|----|----------------------|--------|
| **PowerShell** (`PS D:\mnn_1>`) | `& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" ...` | `Select-String` |
| **Git Bash** (`MINGW64`) | `"$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe" ...` | `grep` |

PowerShell에서 Git Bash처럼 `"경로" shell ...`만 치면
`식 또는 문에서 예기치 않은 'shell' 토큰`이 난다. `&`가 있어야 실행 파일로 본다.

패키지 확인(선택, 아이콘이 있으면 생략):

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell pm list packages | Select-String harmonitune
```

`package:com.harmonitune.app`가 나오면 설치된 것.

---

## 6. `npm run android` 도중 — 정상으로 보이는 것들

### Gradle 99% + `:app:buildCMakeDebug[x86_64]`

에뮬 CPU는 보통 **x86_64**다. CMake는 네이티브(C++)를 그 CPU용으로 컴파일한다.
여기가 제일 오래 걸린다. 몇 분은 **관례**로 흔하다. 끝날 때까지 기다린다.

하드링크 실패 후 `Doing a slower copy instead` — Windows에서 `.so` 복사가
하드링크 대신 복사로 바뀐 경고. **실패가 아니다.** 조금 느려질 뿐.

### 터미널 탭이 `java`에서 `node`로 바뀜

`npm run android` 앞부분은 Gradle(**Java**). 설치가 끝나면 Expo가 Metro(**Node**)를
같은 터미널에서 이어 켤 때가 많다. 에러 없이 바뀌면 **정상**.

### 에뮬 터미널의 빨간 글

부팅 직후 자주 보인다. **에뮬 홈 화면이 이미 보이면** 아래는 대개 무시해도 된다.

| 메시지 | 왜 나오나 | 어떻게 되나 |
|--------|-----------|-------------|
| `Unable to connect to adb daemon on port: 5037` | adb 서버가 아직 안 뜸 | 곧 `daemon started successfully`가 나옴 |
| `adb.exe: device offline` | 에뮬이 덜 부팅된 채 명령을 보냄 | 부팅이 끝나면 `device`가 됨 |
| `glAttachShader ... error 0x502` | 에뮬 GPU 번역 경고 | 화면이 그려지면 치명으로 보지 않는 경우가 많음 (**관례**) |

---

## 7. 이렇게 하면 무엇이 달라지나

1. 에뮬이 켜짐 → PC에 **가상 폰 한 대**가 생김.
2. `adb devices`가 `device` → PC가 그 폰에 설치·로그·실행 명령을 보낼 수 있음.
3. `npm run android` 성공 → 그 가상 폰에 **우리 APK**가 깔리고 앱이 뜸.
4. `npm start` → 저장한 JS가 그 앱으로 흘러감. 아이콘을 다시 깔 필요는 없음.
5. 다음부터(JS만 수정) → 에뮬만 켜고 `npm start`. USB reverse는 **안 해도 됨.**

USB reverse는 「폰의 127.0.0.1:8081을 USB로 PC Metro에 넘기는」 실기기용 트릭이다.
에뮬은 같은 PC 안이라 `10.0.2.2` 또는 에뮬용 reverse로도 Metro에 닿는다.

---

## 8. 자주 하는 실수

- 에뮬이 이미 떠 있는데 `-avd Pixel_7`를 또 실행.
- USB 폰을 꽂은 채 `npm run android` → **폰에** 설치될 수 있음.
- 아이콘이 있는데 `npm run android`를 매번 실행 → 시간만 씀(JS만 바뀐 경우).
- Git Bash 명령을 PowerShell에 붙여 넣음.
- `adb devices`로 앱 유무를 판단함.

---

## 9. 단정 금지

| 표시 | 내용 |
|------|------|
| **관례** | CMake 99%가 수분 걸리는 것, `0x502` GPU 로그를 화면이 정상이면 무시하는 것 |
| **미검증** | 모든 AVD 이름·모든 Windows PATH에서 위 경로가 동일한지 |
| **주의** | 에뮬 터미널을 Ctrl+C로 끄면 에뮬 프로세스도 같이 죽는 경우가 많음 |
| **없음이 아닌 사실** | 패키지 ID는 `app.json`의 `com.harmonitune.app`. 이 세션 AVD는 `Pixel_7` |
