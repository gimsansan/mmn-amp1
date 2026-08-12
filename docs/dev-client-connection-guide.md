# Dev Client 연결 가이드 (학습용)

> **목적**: 실기기(Android)에서 Metro / Expo Dev Client에 **어떻게 붙는지**를 한곳에 정리한다.  
> **대상**: WiFi·USB·ADB 개념이 헷갈릴 때.  
> **관련**: 스택·빌드 정본은 [`dev-client-setup-context.md`](./dev-client-setup-context.md).  
> **성격**: 갱신형(사실이 바뀌면 이 문서를 고친다).

---

## 0. 한 줄 요약

| 하고 싶은 일 | 쓰는 것 | 폰에 넣는 주소 |
|-------------|---------|----------------|
| USB 케이블로 JS 디버깅 | `adb reverse` + Metro | `http://127.0.0.1:8081` |
| 같은 WiFi로 JS 디버깅 | Metro만 (같은 LAN) | `http://<PC의 LAN IP>:8081` |
| USB 없이 **adb 자체**를 무선으로 | WiFi ADB (`tcpip 5555`) | (Metro 주소와 **별개**. 아래 §3) |

**가장 중요한 구분**:  
「**Metro에 붙는 길**」(JS 번들, 포트 **8081**)과  
「**adb가 기기를 조종하는 길**」(설치·로그·reverse, 무선일 때 포트 **5555**)은 **다른 것**이다.

---

## 1. 이 앱에서 필요한 전제

- **Expo Go 불가** — `react-native-audio-api`, Skia, Rive 등 → **dev client** APK가 기기에 설치되어 있어야 함.
- 개발 서버: `npm start` (= `expo start --dev-client`)
- 네이티브 변경·의존성 추가 시에만 리빌드: `npm run android` (= `expo run:android`)
- Metro만 다시 붙이는 것(JS 수정, WiFi 변경, reverse) → **리빌드 불필요**

Development servers 화면이 뜨면: APK는 떠 있고, **아직 Metro URL을 못 받은 상태**다. 여기서 주소를 고르거나 입력하면 된다.

---

## 2. 세 가지 연결 방식 (무엇을 언제)

### A. USB + `adb reverse` (일상 디버깅에 추천)

**언제**: WiFi가 바뀌었을 때, 게스트망·회사망처럼 PC·폰이 같은 LAN이 아닐 때, IP를 매번 맞추기 싫을 때.

**원리**: 폰의 `127.0.0.1:8081` 요청을 USB로 PC의 Metro(8081)로 넘겨 준다.

```powershell
# PATH에 adb가 없을 때 (Windows 흔한 경우)
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
```

성공 시 보통 `8081`만 출력된다.

| 단계 | 할 일 |
|------|--------|
| 1 | USB로 폰 연결, USB 디버깅 허용 |
| 2 | `adb devices` → `device`로 보이는지 |
| 3 | Metro: `npm start` |
| 4 | `adb reverse tcp:8081 tcp:8081` |
| 5 | 폰에서 앱 → Development servers → **Enter URL** → `http://127.0.0.1:8081` |

**알아둘 것**

- USB를 뽑거나 PC를 재시작하면 reverse가 **풀릴 수 있음** → 다시 실행.
- Metro 터미널의 `a`(Open on Android)는 딥링크로 `http://192.168.x.x:8081`을 열 수 있다. USB만 쓸 때는 **127.0.0.1**이 맞다.
- `adb`가 인식되지 않으면 PATH 문제이지, USB 고장과는 별개일 때가 많다.

---

### B. 같은 WiFi (LAN)로 Metro 연결

**언제**: 케이블 없이, PC와 폰이 **같은 WiFi**에 있을 때.

**원리**: 폰이 네트워크로 PC의 IP:8081에 직접 접속한다.

| 단계 | 할 일 |
|------|--------|
| 1 | PC·폰 같은 WiFi (게스트망 분리면 실패하기 쉬움) |
| 2 | `npm start` → 터미널에 `http://192.168.x.x:8081` 확인 |
| 3 | 폰 Development servers에 그 URL 입력 (또는 QR) |
| 4 | Windows 방화벽이 8081을 막으면 허용 |

**알아둘 것**

- WiFi·장소를 바꾸면 **PC IP가 바뀐다**. 예전에 쓰던 `192.168.0.247` 같은 값은 **그 네트워크에서만** 유효.
- 입력 주소는 **PC IP**이지, 폰 IP가 아니다.

---

### C. WiFi ADB (`tcpip 5555`) — “무선으로 adb”

**언제**: USB 없이 `adb install` / `adb logcat` / `adb reverse` 등을 하고 싶을 때.

**원리**: adb 제어 채널을 USB에서 WiFi(포트 5555)로 바꾼다. **Metro URL을 자동으로 채워 주지 않는다.**

예전에 해본 흐름(기억용):

```text
# 1) USB로 폰 연결 후
adb devices                       # device 확인

# 2) (개발 빌드가 아직 없을 때만) 실기기에 설치
npx expo run:android

# 3) 폰 IP 확인 → WiFi ADB로 전환
adb -s <시리얼> shell ip route     # src 뒤가 "폰 IP"
adb -s <시리얼> tcpip 5555
adb connect <폰IP>:5555
adb devices                       # <폰IP>:5555 device 확인

# 4) USB 뽑기 → Metro
npm start
# 폰에서 앱 실행 → Metro 연결은 별도로 (아래)
```

**여기서 자주 헷갈리는 점**

| 항목 | WiFi ADB | Metro (JS) |
|------|----------|------------|
| 포트 | **5555** | **8081** |
| 주소에 쓰는 IP | **폰 IP** (`adb connect`) | **PC IP** (LAN) 또는 `127.0.0.1`(reverse) |
| 목적 | PC가 폰을 adb로 조종 | 폰이 JS 번들을 받음 |

WiFi ADB만 켠 뒤에도, 앱의 Development servers에는 여전히:

- 같은 LAN이면 `http://<PC_IP>:8081`, 또는  
- (무선 adb가 연결된 상태에서) `adb reverse tcp:8081 tcp:8081` 후 `http://127.0.0.1:8081`  

처럼 **Metro용 주소**를 따로 맞춰야 한다.

---

## 3. 입력 주소 치트시트

| 상황 | Development servers에 입력 |
|------|---------------------------|
| USB + reverse 완료 | `http://127.0.0.1:8081` |
| 같은 WiFi, reverse 없음 | `http://<PC의 현재 LAN IP>:8081` |
| 터널 (`expo start --tunnel`) | Expo가 안내하는 터널 URL (**추정**: 느릴 수 있음) |

잘못된 예:

- USB인데 예전 WiFi의 `http://192.168.0.247:8081`만 고집 → 네트워크가 바뀌었으면 실패하기 쉬움.
- WiFi ADB용 `<폰IP>:5555`를 Metro URL칸에 넣음 → **안 됨** (포트·역할이 다름).

---

## 4. 증상 → 점검

| 증상 | 먼저 볼 것 |
|------|------------|
| `adb`가 인식되지 않음 | PATH. Windows: `%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe` |
| Development servers만 뜸 | Metro 미연결. URL 입력 또는 QR |
| `Opening ... 192.168.x.x` 하는데 화면 안 바뀜 | 그 IP에 폰이 도달 가능한지. USB면 reverse + `127.0.0.1` |
| `Error [ERR_STREAM_PREMATURE_CLOSE]` | Metro/로그 파이프가 끊긴 경고인 경우가 많음. **빌드 실패와 동일시하지 말 것**. 앱·번들이 되면 무시 가능 (**관례**) |
| `Android Bundled ...ms` 로그 | Metro↔폰 JS 연결은 한 번이라도 성공한 신호 |
| WiFi만 바꿨는데 예전처럼 안 됨 | PC IP 재확인. 또는 USB+reverse로 우회 |

---

## 5. 리빌드가 필요한가?

| 변경 | 리빌드? |
|------|---------|
| JS/TS만, Metro 재연결, WiFi/USB 방식 변경 | **아니오** |
| `package.json` 네이티브 의존성, 플러그인, Kotlin/Java, `.riv` 등 | **예** (`npm run android`) |

---

## 6. 학습 메모 — 이전에 부족했던 지식

대화에서 드러난 혼동을 정리한 것이다.

1. **「USB 디버깅」≠「USB로 Metro」**  
   USB 디버깅 ON은 adb 사용 허가. Metro까지 가려면 reverse 또는 LAN URL이 더 필요하다.

2. **예전에 기억한 긴 절차(§2-C)는 WiFi ADB 전환**이다.  
   「케이블 없이 adb」가 목적. 「가장 쉬운 일상 JS 디버깅」과는 목표가 다르다.

3. **USB + reverse가 더 단순한 이유**  
   같은 WiFi·PC IP·방화벽·IP 변경을 거의 안 따진다. reverse 한 번 + `127.0.0.1:8081`.

4. **Metro가 찍는 IP**  
   터미널의 `192.168.x.x`는 **그 순간 PC LAN 주소**다. 환경이 바뀌면 숫자가 바뀐다.

5. **`a` 키**  
   adb로 딥링크를 연다. 열기 ≠ Metro에 올바른 주소로 붙기. USB만 쓸 때는 앱에서 URL을 직접 넣는 편이 안전하다.

---

## 7. 추천 루틴 (실무)

**기본 (책상 + USB)**

1. USB 연결  
2. `npm start`  
3. `adb reverse tcp:8081 tcp:8081`  
4. 앱 → `http://127.0.0.1:8081`

**케이블 없이 같은 WiFi**

1. `npm start`에서 PC IP 확인  
2. 앱에 `http://<PC_IP>:8081`

**무선 adb까지 필요할 때만** §2-C.

---

## 8. 단정 금지 / 미검증

| 표시 | 내용 |
|------|------|
| **관례** | `ERR_STREAM_PREMATURE_CLOSE`는 Windows/Expo에서 설치·런치 직후 스트림 종료로 자주 보이며, BUILD SUCCESS + Bundled가 있으면 치명으로 보지 않는 경우가 많다. |
| **미검증** | 모든 라우터/게스트망에서 LAN Metro가 되는지는 환경마다 다름. |
| **추정** | `expo start --tunnel`은 방화벽·이종망에서 우회에 쓰이나 지연이 클 수 있음. |
| **없음이 아닌 주의** | `adb reverse`는 세션/재연결 후 다시 걸어야 할 수 있다. |

---

## 9. 관련 문서

- [`dev-client-setup-context.md`](./dev-client-setup-context.md) — SDK, Metro/Babel, 왜 dev-client인지  
- [`README.md`](./README.md) — docs 지도  
- 루트 `package.json` scripts: `start`, `android`
