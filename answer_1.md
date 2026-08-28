# 악기 소리 탭 — 전부 (대화 전문 + 작업 기록)

> **이 파일 하나에 악기 소리 탭 관련 내용을 전부 담는다.** 다른 문서에 나눠 넣지 않는다.
> (사용자 결정 2026-08-28: 「이전에 inst 관련한 내용은 다른 데 넣을 필요 없이 한 군데 파일에 담으려고 한다」)
> **성격**: 누적형. 새 세션은 **맨 위에 추가**한다. 과거 블록은 수정하지 않는다.
> **현재 상태의 정본은 코드다** — `src/training/inst/`, `src/audio/instrument*.ts`.
> 「지금 어떤가」를 이 파일에서 찾지 말 것.
> **브랜치**: `new-content`

---

## 목차

- [2026-08-28 (오후) · 실기기 1차 검증](#2026-08-28-오후--실기기-1차-검증)
- [1부. 터미널 대화 전문 (2026-08-28)](#1부-터미널-대화-전문-2026-08-28)
- [2부. 작업 기록 — 악기 소리 탭 신설](#2부-작업-기록--악기-소리-탭-신설-2026-08-28)
- [3부. 터미널 출력 전문](#3부-터미널-출력-전문-2026-08-28)
- [4부. 남은 판단 · 다음 작업](#4부-남은-판단--다음-작업)
- [5부. 새 창 작업 지시 — 악기별 약점 날짜 추적](#5부-새-창-작업-지시--악기별-약점-날짜-추적)

---

# 2026-08-28 (오후) · 실기기 1차 검증

> **성격**: 누적 블록. 새 세션은 **이 위에** 쌓는다.
> **기기**: `RF8MC0XZYLK` (SC-01M) · 앱 `com.rnhear.app` · 브랜치 `new-content`
> **한 줄**: 오디오 파이프와 6탭 레이아웃은 통과. **음색이 구분되는지는 아직 미검증.**
>
> **낱말 주의**: 이 파일에서 「갈린다」가 두 뜻으로 섞여 쓰였다 —
> **「구별되어 들린다」**(2부 240줄)와 **「갈래가 나뉜다」**(1부 113줄).
> 이 블록부터는 앞의 뜻을 **「구분된다」**로만 쓴다. 판정표를 반대로 읽지 말 것.

## 결론부터 — 첫 기록 2/12는 「소리가 안 난 상태」의 기록이었다

기기에 08/28 14:27자 기록이 1건(**2/12 · 약 17%**) 있었다. 4지선다 기댓값 3/12보다 낮다.
원인은 음색이 아니라 **기기 미디어 볼륨이 0**이었던 것이다.

```
$ adb shell cmd media_session volume --stream 3 --get
[V] volume is 0 in range [0..15]

$ adb shell settings get system volume_music_speaker
0
```

악기별로도 **피아노 0/3 · 기타 1/3 · 바이올린 0/3 · 플루트 1/3**으로 고르게 무너져 있었다.
음색이 안 구분되는 경우는 보통 피아노↔기타처럼 **한 쌍**이 무너진다. 전부 고르게 무너진 이 모양
자체가 무음의 흔적이다.

`함정`: **결과를 해석하기 전에 기기 볼륨부터 확인할 것.**
앱은 기기 볼륨을 바꾸지 않는다(`docs/listening-check-volume-by-tab.md` 공통 표).
소리 점검 화면이 바로 이걸 잡으라고 있는 것인데, 건너뛰면 멀쩡한 하모닉 표를 고치게 된다.

## 조치

| 무엇 | 결과 |
|---|---|
| 미디어 볼륨 | 0 → **8** (`cmd media_session volume --stream 3 --set 8`) |
| 소리 점검(A4 순음) | 재생 확인. `dumpsys audio`에 앱 AAudio 스트림 `state:started`, `muted player piids:` 비어 있음. **사용자 청취 확인됨** |
| 2/12 기록 | **삭제**(사용자 지시 2026-08-28). 통계 탭 「악기 소리 기록 지우기」 → 「기록 없음」 확인 |

`주의`: 「기록 지우기」는 `clearInstRecords`가 저장소 키를 통째로 지운다.
**한 건만 골라 지울 수 없다.** 좋은 기록이 섞여 있으면 그것도 같이 날아간다.

## 이번에 해소된 미검증 항목 (2부 「단정 금지」)

- **6탭 하단바 레이아웃** — 실기기에서 잘림·줄바꿈 없음. **통과**
- **오디오 파이프** — `PeriodicWave` + 포락선 경로가 실기기에서 실제로 돈다.
  로그에 오디오 에러·예외 없음

## 덤으로 확인된 동작 (설계대로임 — 버그 아님)

- 중간에 「끝내기」로 나간 세션은 **저장되지 않고, 요약 화면도 거치지 않고** 시작 화면으로 나간다.
  (끝내기 전후로 기록 건수가 그대로인 것으로 확인.
  `instResultCopy`의 「12개를 다 고르지 않아 기록에는 안 남겼어요」 문구는 이 경로에선 안 보인다)
- 다 맞히지 못했는데 「이번엔 ~ 소리가 가장 아쉬웠어요」가 안 뜰 때가 있다 —
  미스 1위가 동률이면 `instWeakestCopy`가 `null`을 준다.
- 세션 재생 중에는 「끝내기」가 눌리지 않는다. 「끝내기」에는 확인 대화상자가 한 겹 더 있다.

## 아직 미검증 — 여기서 이어서 하면 된다

**「네 악기가 실제로 구분되어 들리는가」는 여전히 미확인이다.** 이 탭의 마지막 관문이다.

재개 절차:

1. 볼륨 확인 — `adb shell cmd media_session volume --stream 3 --get`
   (**0이면 그날 결과는 아무것도 못 믿는다**)
2. 악기 소리 탭 → 「시작」 → 12문항. 가능하면 이어폰
3. 요약 화면의 악기별 표(피아노 x/3 · 기타 x/3 · 바이올린 x/3 · 플루트 x/3)를 그대로 적을 것

판정:

| 점수 | 해석 | 손댈 곳 |
|---|---|---|
| 3/12 근처 | 음색이 안 구분된다 | `instruments.ts` 하모닉 표 전반 |
| 특정 쌍만 무너짐 | 그 쌍이 너무 닮았다 (**피아노↔기타**가 1순위 후보) | 해당 악기의 `harmonics`·어택 |
| 9/12 이상 | 설계가 먹혔다 | 없음. 다음 작업으로 |

이 검증과 5부(악기별 약점 날짜 추적)는 **서로 막지 않는다.** 손대는 파일이 겹치지 않는다.

---

# 1부. 터미널 대화 전문 (2026-08-28)

## ① 사용자 — 악기 소리 식별 훈련 추천

```
@src\  악기 소리 식별 훈련** (PPT slide5·9) — 가장 자연스러움
- 피아노·기타·현악기·관악기 음색/음정 변별. 지금의 순음·링6와 **같은 "듣고 고르기" 틀**을
  그대로 재사용.
- 리듬 패턴 기억, 화음 변별, 환경음도 같은 계열.
- 새로 필요한 건 **악기 음원(wav)** 뿐. 오디오 파이프(`expo-audio`)·세션 구조 재활용 가능.
  **가장 부담 적음.**
이것 추천함 간
```

## ② 답변 — 구조를 먼저 읽고, 갈리는 지점 두 개를 물음

코드베이스를 훑어 확인한 것:

- 「듣고 고르기」 틀이 이미 셋 있다 — 링 6 · 단어 듣기 · 문장 듣기.
- 새 탭을 붙이는 연결 지점이 명확하다:
  `app-tabs.tsx` → `src/app/inst.tsx` → 세션 화면 + 전용 store + `statsFeed`의 `kind` 추가.
- **`assets/`에 악기 wav가 하나도 없다.** 사용자 메모의 「새로 필요한 건 악기 음원(wav)뿐」이
  실제로 유일한 장애물이었다.

그래서 두 가지를 물었다.

### 확인 질문 1 · 음원

| 선택지 | 설명 |
|---|---|
| **합성음으로 먼저 (추천)** ← **선택됨** | `react-native-audio-api`로 하모닉 스택 + 악기별 온셋/디케이 포락선을 합성. 파일 없이 지금 바로 동작하고 `나중계획안.md` §2(복합음 자극)와 맞물린다. wav로 교체 가능하게 설계 |
| wav 음원 넣을 것 | 모듈·화면·저장소·테스트를 다 만들고 `assets/inst/piano.wav` 자리를 비워 둠. 파일 넣기 전까지 Metro 번들이 깨지므로 탭 연결은 보류 |
| 둘 다 | 합성음 기본 + wav 있으면 wav 쓰는 소스 전환 구조. 작업량 가장 큼 |

### 확인 질문 2 · 보기 칸 표시 (악기 그림 에셋도 없음)

| 선택지 | 설명 |
|---|---|
| **글자 + 시스템 아이콘 (추천)** ← **선택됨** | 「피아노」「기타」 등 한글 이름 + Icon 컴포넌트. 에셋 없이 동작하고 나중에 그림을 넣으면 링 6처럼 Image로 바꿀 수 있다 |
| 글자만 | 큰 글씨 버튼 4개. 가장 단순하고 저시력 사용자에게 읽기 쉬움 |
| 그림 에셋 넣을 것 | `assets/inst/piano.webp` 자리를 비워 두고 사용자가 그림을 넣기를 기다림 |

**→ 사용자 선택: 「합성음으로 먼저」 + 「글자 + 시스템 아이콘」**

## ③ 답변 — 구현 완료 보고

> 악기 소리 식별 훈련 탭을 붙였습니다. 새 파일 9개 + 기존 파일 5개 수정.
>
> `PeriodicWave` 지원 여부도 확인했습니다(`나중계획안.md` §2 미결 항목 — **지원됩니다**).
> 오실레이터 스택 대신 이걸 씁니다.
>
> 소리 설계에서 신경 쓴 것은 전부 「크기·길이·높이로 못 고르게」입니다. (표는 2부에 있음)
>
> **실기기 확인은 못 했습니다** — adb가 PATH에 없어 에뮬레이터·기기를 못 잡았습니다.
> 음색이 실제로 구분되는지는 직접 들어 보셔야 합니다.
>
> 남겨 둔 것 두 가지: ① 악기별 약점 추적(저장소에는 percent만 남김) ② 탭이 6개가 된 것.

## ④ 사용자 — 문서화 지시

```
너의 답변 @docs\ 에 inst_tab md 파일을 생성해서 기록해놔
```

## ⑤ 답변 — `docs/inst_tab.md` 생성 (당시엔 갱신형)

`listening-check-volume-by-tab.md`와 같은 **갱신형 · ① 설계·기준** 형식으로 11절 작성.
`docs/README.md` 색인 네 곳(§1 축B, §2 역할 표, §3 결정표, §6 트리)에도 등록.

## ⑥ 사용자 — 문서 넘김 규칙 질문

```
문서도 용량이 커지면 다른 새 문서로 넘어가고 있지? 간
```

## ⑦ 답변 — 네, 다만 누적형만. 기준은 「느낌」

`docs/README.md` §3에 사용자 규칙으로 박혀 있음:

> 인계 파일 번호는 「이어붙임」이지 「사본」이 아니다 — 한 파일의 **분량이 많아져 읽기
> 불편해지면** 다음 번호로 넘기고, 옛 파일 맨 위에 「과거·새 블록 금지」를 박는다
> (**줄 수 기준은 없다**).

측정한 실제 상태:

| 계열 | 과거분 | 현재 정본 |
|---|---|---|
| `impl-log` | `impl-log.md` 135KB → `impl-log_1.md` 129KB | **`impl-log_2.md` 43KB** |
| `handoff` | `handoff.md` 81KB → `handoff2` 25KB → `handoff3` 26KB | **`handoff4.md` 44KB** |

짚은 것 두 가지:

1. **넘김 기준이 들쭉날쭉하다.** 135KB에서 넘긴 적도, 25KB에서 넘긴 적도 있다.
   `handoff2`·`handoff3`는 분량이 아니라 **날짜·방침 변경** 때문에 넘어간 것으로 보인다.
2. **갱신형 문서는 넘기면 안 된다.** `improvement-backlog.md`는 갱신형이라 커지면
   넘기는 게 아니라 **끝난 항목을 지우는** 게 맞다. 번호를 붙이면 「지금 상태」의 정본이
   둘로 쪼개져 규칙이 깨진다.

## ⑧ 사용자 — 누적형 전환 + 터미널 출력 기록 지시

```
@docs/inst_tab.md  누적형으로 수정해. 그리고 현재 터미널 출력 내용도 거기에 기록해봐
```

## ⑨ 답변 — 누적형으로 재작성 + 출력 6개 기록

머리말을 `impl-log_2.md`·`handoff4.md` 형태로 맞추고, 구조를
`## 기록 형식` → `## 로그` → `### 2026-08-28 — 악기 소리 탭 신설`로 바꿈.
`npx tsc` / `npx jest`(새 테스트·전체) / `npx expo lint` / `adb devices` / `git status` 출력 기록.
README 색인도 `① 설계·기준` → `④ 기록`, `갱신` → `누적`으로 재분류.

**이때 짚은 것**: 누적형이 되면서 이 탭의 「현재 상태」 정본이 사라진다.
나중에 하모닉 값을 바꾸면 2026-08-28 블록은 옛 값을 그대로 들고 있게 된다
(누적형이라 고치면 안 되므로). 그래서 머리말에 「현재 상태의 정본은 코드다」를 굵게 박음.

## ⑩ 사용자 — 다음 작업 질문

```
다음 작업은 무엇? 간
@src/app/inst.tsx  탭을 함에 있어  다음 작업은 무엇? 간
```

## ⑪ 답변 — 실기기 청취. 그리고 **이전 판단을 정정함**

`improvement-backlog.md`(README가 지정한 상태 정본)와
`dev-client-connection-guide.md`를 확인한 결과:

**adb는 설치돼 있고 PATH에만 없었다.** 가이드 §A에 이 경우 쓰는 전체 경로가 이미 적혀 있었다.

```
$ "/c/Users/User/AppData/Local/Android/Sdk/platform-tools/adb.exe" devices -l
List of devices attached
RF8MC0XZYLK            device product:SC-01M model:SC_01M device:SC-01M transport_id:2
```

즉 **기기가 붙어 있었다.** 앞서 「실기기 확인 못 함」으로 적은 것은 **너무 일찍 멈춘 판단**이었다.

들을 때 확인할 4가지 (설계에서 막은 단서와 1:1 대응):

| 확인 | 통과 기준 | 실패하면 손볼 곳 |
|---|---|---|
| 넷이 구분되나 | 눈 감고도 4종이 갈린다. 특히 **피아노 vs 기타** | `instruments.ts` 하모닉 표 |
| 크기가 같나 | 어느 하나가 유독 크거나 작게 안 들린다 | `envelopeRmsScale` 상한 2.5 |
| 높이가 안 걸리나 | 음이 매번 바뀌는 게 거슬리지 않고, 높이로 찍게 되지 않는다 | `INST_NOTES_HZ` 4개 범위 |
| 깨지지 않나 | 지직거림·클릭음 없음 | `DEFAULT_GAIN` 0.15 |

## ⑫ 사용자 — 설계 지적 (중요)

```
단순히 재생음 듣고 맞추는 거야? 일별 기록은 없고, 요약화면에서 내가 보고
무엇이 점수가 낮은지, 높은지 판단하도록 하게 만든 거임?
```

## ⑬ 답변 — 둘 다 맞음. 내 판단이 약했던 부분을 인정

**1. 난이도는 고정이다.** 12문항 내내 같은 조건. 적응형(계단식)이 아니다.

| 계열 | 트랙 | 방식 |
|---|---|---|
| 적응형 | 높낮이 비교 · 다른 음 찾기 · 떨림 | `*Staircase.ts` — 맞히면 어려워지고 틀리면 쉬워짐 |
| **고정** | 링 6 · 단어 듣기 · 문장 듣기 · **악기 소리** | 정해진 문항을 한 바퀴 |

**2. 일별 기록은 없다. 지적 그대로다.**

| | 세션 요약 화면 | 저장 | 통계 탭 |
|---|---|---|---|
| 전체 정답 수 | 「12개 중 9개」 | ✅ | 비율 추세 그래프 |
| **악기별 정답 수** | 「피아노 3/3」 표 | ❌ **버려짐** | ❌ 없음 |
| 가장 아쉬운 악기 | 「이번엔 피아노 소리가 가장 아쉬웠어요」 | ❌ | ❌ |

**링 6에는 이미 그 기능이 있다** (코드로 확인):

- `ling6Store` — **날짜별 1건**으로 음소 6개 정오답을 통째로 저장
- `ling6WeaknessSnapshot` — 최근 **7건**에서 음소별 미스를 세고, **4회 이상**이면 강조
- `Ling6WeaknessBars` — 통계 탭에 음소별 막대. 아쉬운 것만 색이 다름

**인정한 것**: 문서에 「저장소 검증 코드가 배로 늘어서 뺐다」고 적었는데, 그건 **구현 비용**
얘기지 **사용자 가치** 얘기가 아니었다. 게다가 링 6 구조를 그대로 베끼는 것이라 새로 발명할
것도 없어서, 비용 논거 자체가 말한 것만큼 세지 않았다.
「어느 악기를 못 듣는가」는 이 탭에서 제일 쓸모 있는 정보인데 그게 매 세션 버려진다.

## ⑭ 사용자 — 대화 저장 여부 질문

```
터미널에서 우리 대화 다 md에 저장하고 있어?  그대로 담아도 된다.  간
```

## ⑮ 답변 — 아니요, 저장하고 있지 않았음

루트 `answer.md`(48KB)가 그 자리였다 — 「대화에서 오간 질문·답변의 보관용」.
그동안 여기에 안 넣고 있었다.

## ⑯ 사용자 — 한 파일로 통합 지시

```
루트 answer_1 에 기록해 터미널 내용 통으로
이전에 inst관련한 내용은 다른데 넣을 필요없이 한 군데  파일에 담을려고 한다.
```

**→ 이 파일(`answer_1.md`)이 그 한 군데다.** `docs/inst_tab.md`는 여기로 병합하고 지웠다.

---

# 2부. 작업 기록 — 악기 소리 탭 신설 (2026-08-28)

| 항목 | 내용 |
|------|------|
| 근거·결정 | 링 6은 검출(**들렸나**), 문장 듣기는 이해. 그 사이의 **음색 식별**(무엇이었나)이 없었다 |
| 근거·결정 | 음원은 **「합성음으로 먼저」** 선택. `assets/`에 악기 wav가 0개 |
| 근거·결정 | 보기 칸은 **「글자 + 아이콘」** 선택. 악기 그림 에셋도 0개 |
| 근거·결정 | `PeriodicWave` 지원 여부를 `node_modules` 타입에서 확인 → **지원함**. 오실레이터 1개로 처리 |
| 변경 요약 | 하단 6번째 탭 신설. 악기음 한 음을 듣고 피아노·기타·바이올린·플루트 중 고르는 12문항 세션 |
| 변경 요약 | 오디오 계층과 훈련 계층을 나눠, wav 교체 시 `instPlay.ts`만 갈게 함 |
| 결과 | 성공(코드 기준). **실기기 청취는 못 함** |
| 확인 | `tsc` 통과 · 새 테스트 34개 통과 · `expo lint` 에러 0. 출력 전문은 3부 |
| 단정 금지 | `미검증` — **네 악기가 실제로 구분되어 들리는지 확인 못 했다.** 사람이 들어 봐야 안다 |
| 단정 금지 | `추정` — 하모닉·포락선 숫자는 문헌의 악기군 경향을 눈대중으로 옮긴 것. 실측 아님 |
| 단정 금지 | `추정` — 클리핑이 안 난다는 것도 계산상 그렇다는 것뿐. 실측 파형을 본 적 없다 |
| 단정 금지 | `주의` — 등청감 보정이 안 들어가 있다. C4와 A4는 체감 크기가 다를 수 있다 |
| 단정 금지 | `미검증` — 탭이 6개가 된 뒤의 하단 바 레이아웃을 실기기에서 못 봤다 |

## 왜 합성음인가

| 선택지 | 판단 |
|--------|------|
| 실물 악기 wav | `assets/`에 악기 음원이 0개. 파일이 생길 때까지 탭 자체가 못 뜬다 |
| **합성음** ← | 파일 없이 지금 돈다. 크기·길이·높이를 **코드로 정확히 맞출 수 있다** |

`나중계획안.md` §2(복합음 자극)가 말하던 「순음뿐이라 생태학적 타당성이 낮다」에
**처음으로 복합음을 쓰는 트랙**이기도 하다.

신호 경로:

```
OscillatorNode(PeriodicWave: 악기 스펙트럼)
        ↓
GainNode(포락선: 어택·디케이·서스테인·릴리스)
        ↓
destination
```

`주의`: `createPeriodicWave`의 **정규화를 반드시 꺼야 한다**(`disableNormalization: true`).
켜면 피크가 1로 눌려 아래 등파워 설계가 깨진다 — 즉 **크기가 단서가 된다.**

## 단서 차단 — 이 작업의 핵심

식별 과제의 제일 쉬운 실패는 **음색이 아닌 것으로 정답을 고를 수 있게 되는 것**이다.

| 새어 나갈 단서 | 왜 문제인가 | 어떻게 막았나 |
|---|---|---|
| **크기**(스펙트럼) | 하모닉 10개인 바이올린이 5개인 플루트보다 그냥 크게 들린다 | `equalPowerHarmonics` — Σaᵢ²를 1로. 피크가 아니라 **파워**를 맞춘다 |
| **크기**(포락선) | 금방 잦아드는 피아노·기타는 같은 피크라도 총 에너지가 적다 | `envelopeRmsScale` — 포락선 RMS를 1로. 상한 2.5에서 자른다 |
| **길이** | 길이가 다르면 듣지 않고 길이만으로 고를 수 있다 | `INSTRUMENT_NOTE_SEC = 1.6` 넷 다 고정 |
| **높이** | 한 악기가 늘 같은 높이면 음색이 아니라 높이를 외운다 | 시행마다 C4·E4·G4·A4를 굴린다. 한 악기의 세 시행은 서로 다른 음 |
| **순서** | 같은 악기가 연달아 나오면 그 구간이 거저 풀린다 | `orderWithoutRuns` — 남은 개수가 가장 많은 것 중 직전과 다른 것 |

> `orderWithoutRuns`가 「다시 섞기」가 아닌 이유: 재시도는 언제 끝날지 알 수 없다.
> 개수가 고른 묶음에서는 「최대 잔량 중 직전과 다른 것」이 막다른 길에 빠지지 않는다.

게인은 순음 트랙과 같은 `DEFAULT_GAIN`(0.15)을 그대로 썼다.

## 악기 4종

건반 · 퉁기는 줄 · 활 켜는 줄 · 부는 관을 하나씩. **같은 계열을 둘 넣지 않는다** —
음색 차이가 너무 작으면 「듣고 고르기」가 아니라 찍기가 된다.

| id | 이름 | 화면의 한 줄 | 하모닉 | 어택 | 성격 |
|----|------|-------------|--------|------|------|
| `piano` | 피아노 | 두드리는 건반 | 8개, 완만한 감쇠 | 6 ms | 때림. 서스테인 거의 없음 |
| `guitar` | 기타 | 퉁기는 줄 | 8개, 2차 약하고 3차 살아 있음 | 4 ms | 퉁김. 속 빈 느낌 |
| `violin` | 바이올린 | 활로 켜는 줄 | 10개, 상부가 오래 남음 | 90 ms | 활. 길게 버팀 |
| `flute` | 플루트 | 입으로 부는 관 | 5개, 거의 순음 | 70 ms | 넷 중 유일한 「맑고 단순한」 쪽 = 기준점 |

`주의`: 온셋(어택)은 여기서 **음색 단서를 만드는 축**이지 난이도 축이 아니다.

## 세션 규칙

| 항목 | 값 | 왜 |
|------|-----|-----|
| 시행 수 | 12 (악기당 3회) | 링 6(8)보다 길고 문장 듣기(18)보다 짧다 |
| 무음 시행 | **없음** | 링 6은 검출이라 무음이 필요. 여기는 식별이라 무음은 답할 수 없는 문항이 된다 |
| 첫 소리 앞 뜸 | 700 ms | 시작 직후 소리가 바로 나면 들을 준비를 할 새가 없다. 다른 탭과 같은 값 |
| 보기 칸 위치 | **고정**(2×2) | 매번 자리가 바뀌면 고령 사용자가 위치를 못 익힌다 |
| 피드백 「중지」 | **없음** | 답한 문항을 되돌리면 답이 한 번 더 쌓여 12개를 다 해도 13개가 되고 기록이 버려진다 |

기록: 키 `training.instSessions.v1`, 형식 `{ trialCount, correctCount, percent }`, 상한 50건,
**12개를 다 채운 세션만** 저장. 형식을 단어·문장 듣기와 똑같이 맞춰 `PercentTrend`를 재사용한다.
**악기별 정답 수는 저장하지 않고 요약 화면에서만 보여 준다** — 4부의 지적 대상.

## 아이콘 4종을 직접 그린 이유

보기 칸에서 **글자를 읽기 전에** 어느 악기인지 짚을 수 있어야 한다.
가로 사각 + 검은 건반 / 몸통 원 + 목 / 줄을 가로지르는 활 / 구멍 뚫린 가로 관.
기타와 바이올린이 둘 다 「줄」이라 제일 헷갈려서,
**바이올린은 몸통을 안 그리고 활 하나로 못 박았다.**

## 파일 지도

```
src/audio/
├─ instrumentSpectra.ts     하모닉 표·포락선 계산. ★오디오 노드를 import 하지 않는다
└─ instrumentTone.ts        PeriodicWave + 포락선 GainNode 재생

src/training/inst/
├─ instruments.ts           악기 4종 표(라벨·아이콘·스펙트럼·포락선)
├─ instSession.ts           시행 생성·채점·요약 문구
├─ instPlay.ts              재생 창구(뜸·중지)
├─ instStore.ts             AsyncStorage 저장소
├─ InstSessionScreen.tsx    화면
└─ InstProgressPanel.tsx    통계 본문

src/app/inst.tsx            라우트
```

**`instrumentSpectra.ts`가 노드를 import 하지 않는 것은 의도다.** 순수 계산만 있어서
테스트가 `react-native-audio-api`(네이티브 모듈)를 끌고 오지 않는다 — 끌고 오면 그 자리에서
스위트가 통째로 넘어진다(실제로 `WrsSessionScreen.test.tsx`가 그렇게 넘어져 있다).

**실물 wav로 갈아탈 때 손대는 곳은 `instPlay.ts` 하나다.**

### 기존 파일에서 고친 곳

| 파일 | 무엇 |
|------|------|
| `src/components/app-tabs.tsx` | 6번째 탭 추가 |
| `src/components/ui/icon.tsx` | `pianoKeys` · `guitar` · `violin` · `flute` 4종 |
| `src/training/statsFeed.ts` | `inst` kind·저장소 연결 |
| `src/training/StatsScreen.tsx` | 아이콘·패널 연결 |
| `src/training/__tests__/statsFeed.test.ts` | 픽스처에 `inst: []` |
| `나중계획안.md` | §2 미결(`PeriodicWave` 지원 여부) 해소 표시 |

---

# 3부. 터미널 출력 전문 (2026-08-28)

**타입 검사** — 출력 없음이 통과다.

```
$ npx tsc --noEmit -p tsconfig.json
(출력 없음 — 통과)
```

**새 테스트만**

```
$ npx jest src/audio/__tests__/instrumentSpectra.test.ts src/training/inst
PASS Android src/audio/__tests__/instrumentSpectra.test.ts
PASS Android src/training/inst/__tests__/instSession.test.ts
PASS Android src/training/inst/__tests__/instStore.test.ts

Test Suites: 3 passed, 3 total
Tests:       34 passed, 34 total
Snapshots:   0 total
Time:        4.659 s
```

**전체 테스트** — 스위트 1개가 실패하지만 **이 작업과 무관하다**.

```
$ npx jest
    AudioApiError: Failed to install react-native-audio-api: The native module could not be found.

    > 1 | import { AudioContext, GainNode, OscillatorNode } from 'react-native-audio-api';
      at Object.require (src/audio/pureTone.ts:1:1)
      at Object.require (src/training/ListeningCheckScreen.tsx:5:1)
      at Object.require (src/training/wrs/WrsSessionScreen.tsx:32:1)
      at Object.require (src/training/wrs/__tests__/WrsSessionScreen.test.tsx:9:1)

Test Suites: 1 failed, 29 passed, 30 total
Tests:       270 passed, 270 total
Snapshots:   0 total
Time:        17.917 s
```

> **무관하다는 근거**: `git stash -u`로 이 작업을 통째로 걷어낸 상태에서
> `npx jest src/training/wrs/__tests__/WrsSessionScreen.test.tsx`를 돌려도 같은 에러로 실패했다.
> 원인은 `pureTone.ts` → `react-native-audio-api` 네이티브 모듈이 테스트 환경에 없는 것이다.

**린트** — 에러 0. 경고 3개는 `instStore.test.ts`의 `import/first`로,
`jest.mock`이 import보다 앞서야 해서 나는 것이다. 저장소 테스트마다 이미 있는 관례다.

```
$ npx expo lint
D:\mnn_1\src\training\inst\__tests__\instStore.test.ts
  27:1  warning  Import in body of module; reorder to top  import/first
  29:1  warning  Import in body of module; reorder to top  import/first
  35:1  warning  Import in body of module; reorder to top  import/first

✖ 23 problems (0 errors, 23 warnings)
  0 errors and 22 warnings potentially fixable with the `--fix` option.
```

**실기기 — 1차 시도 (PATH에 없어 실패)**

```
$ adb devices
(adb not on PATH)
```

**실기기 — 2차 시도 (전체 경로. 기기 붙어 있었음)**

```
$ "/c/Users/User/AppData/Local/Android/Sdk/platform-tools/adb.exe" devices -l
List of devices attached
RF8MC0XZYLK            device product:SC-01M model:SC_01M device:SC-01M transport_id:2
```

> 1차의 `(adb not on PATH)`만 보고 「실기기 확인 못 함」으로 결론 낸 것은 **너무 일찍 멈춘 판단**이었다.
> `dev-client-connection-guide.md` §A에 이 경우 쓰는 전체 경로가 이미 적혀 있었다.

**변경 파일**

```
$ git status --short
 M docs/README.md
 M src/components/app-tabs.tsx
 M src/components/ui/icon.tsx
 M src/training/StatsScreen.tsx
 M src/training/__tests__/statsFeed.test.ts
 M src/training/statsFeed.ts
 M 나중계획안.md
?? src/app/inst.tsx
?? src/audio/__tests__/
?? src/audio/instrumentSpectra.ts
?? src/audio/instrumentTone.ts
?? src/training/inst/
```

---

# 4부. 남은 판단 · 다음 작업

## 사용자가 지적한 설계 공백 (2026-08-28, 대화 ⑫)

> 단순히 재생음 듣고 맞추는 거야? 일별 기록은 없고, 요약화면에서 내가 보고
> 무엇이 점수가 낮은지, 높은지 판단하도록 하게 만든 거임?

**둘 다 맞다.** 난이도 고정이고, 악기별 정오답은 세션 요약 화면을 벗어나면 사라진다.
따라서 「요즘 계속 기타를 못 맞히네」는 알 수 없다.

### 제안 — 링 6 구조를 그대로 옮긴다

- `instStore`에 **악기별 정오답**을 같이 저장 (지금은 `percent`만)
- `instWeaknessSnapshot` — 최근 N건에서 악기별 미스 집계, 기준 넘으면 강조
- `InstProgressPanel`에 **악기별 막대** 추가 (`Ling6WeaknessBars`와 같은 모양)

**정할 것**: 링 6는 **하루 1건 덮어쓰기**(같은 날 여러 번 해도 마지막 것만)인데,
악기 소리는 지금 **세션마다 누적**이다. 일별로 맞추는 쪽을 권한다 —
하루에 여러 번 하면 가로축이 세션 횟수로 늘어나 추세가 안 읽힌다(링 6 주석에 그 이유가 있다).

## 다음 작업 순서

| | 무엇 | 왜 |
|---|------|-----|
| 1 | **실기기 청취** | 「네 악기가 구분되어 들리는가」가 미검증. 이게 안 되면 나머지는 의미가 없다. 기기 `RF8MC0XZYLK` 연결 확인됨 |
| 2 | 악기별 약점 날짜 추적 | 위 §제안. 이 탭에서 제일 쓸모 있는 정보인데 지금 매 세션 버려진다 |
| 3 | 등청감 보정 | `나중계획안.md` §1. 이 탭도 같이 영향을 받는다 |
| 4 | 실물 녹음 wav 교체 | `instPlay.ts` 하나만 갈아 끼우면 된다 |
| 5 | 소음 속 듣기(SNR) | `나중계획안.md` §4. 다만 말소리 트랙이 먼저다 |

1과 2는 서로 막지 않는다 — 소리가 구분되는지와 별개 작업이라 순서를 바꿔도 된다.

## 다음 사람이 뒤집을 수 있는 판단

- **탭이 6개가 됐다.** 라벨이 짧아 들어가지만 더 늘리면 줄바꿈되거나 잘린다.
  새 종목을 또 붙일 때는 탭을 늘리지 말고 **종목 묶음 화면**을 먼저 생각할 것
  (`app-tabs.tsx` 주석에도 같은 말을 박아 뒀다).
- **`나중계획안.md` §2 미결을 해소했다.** `PeriodicWave`·`ConvolverNode` 둘 다 지원한다.
  §2를 착수할 때 `instrumentTone.ts`를 먼저 볼 것.
- **난이도가 고정이다.** 난이도 축을 넣으려면 소음 섞기(SNR)나 어택 시간 단축이 후보인데,
  그건 `나중계획안.md` §4 얘기라 이번에 안 건드렸다.

---

# 5부. 새 창 작업 지시 — 악기별 약점 날짜 추적

> **이 절만 읽어도 작업이 되게 쓴다.** 새 채팅에 이 파일을 붙이고 「5부 해줘」라고 하면 된다.
> **작성**: 2026-08-28. 4부 「다음 작업 2번」의 실행 명세.

## 결정된 것 (묻지 말 것)

| 항목 | 결정 | 근거 |
|---|---|---|
| 기록 단위 | **하루 1건 덮어쓰기** | 사용자 결정 2026-08-28. 링 6와 같은 방식 |
| 왜 일별인가 | 하루에 여러 번 연습해도 가로축이 세션 횟수로 안 늘어난다 | `ling6Store.ts` `upsertLing6DailyRecord` 주석과 같은 이유 |
| 베낄 원본 | 링 6 3종 세트 | 이미 검증된 구조다. 새로 발명하지 말 것 |

## 베낄 원본

| 원본 | 무엇을 | 새로 만들 것 |
|---|---|---|
| `src/training/ling6/ling6Store.ts` | `localDateKey` · `upsertLing6DailyRecord` · 날짜 키 검증 · `MAX_LING6_DAYS` 상한 | `instStore`에 일별 upsert |
| `src/training/ling6/ling6Session.ts` | `ling6WeaknessSnapshot`(창 7건 · 미스 4회 이상 강조) · `ling6WeaknessCopy` | `instWeaknessSnapshot` |
| `src/training/ling6/Ling6ProgressPanel.tsx` | `Ling6WeaknessBars` 막대 | `InstProgressPanel`에 악기별 막대 |

## 손댈 파일

1. `src/training/inst/instStore.ts` — 레코드에 `dateKey` · `byInstrument` 추가, `appendInstSummary` → 일별 upsert
2. `src/training/inst/instSession.ts` — `instWeaknessSnapshot` 추가(`collectInstrumentResults`는 이미 있음)
3. `src/training/inst/InstSessionScreen.tsx` — `finishSession`의 저장 호출부 교체
4. `src/training/inst/InstProgressPanel.tsx` — 악기별 막대 추가
5. `src/training/inst/__tests__/instStore.test.ts` — 일별 덮어쓰기 테스트 추가
6. `src/training/inst/__tests__/instSession.test.ts` — 약점 스냅샷 테스트 추가

## 함정 셋 (이거 모르면 밟는다)

**① 기존 기록이 조용히 사라진다.**
`instStore`의 `isValidRecord`는 형식이 안 맞는 행을 **에러 없이 버린다**(`readAllRaw`의 `filter`).
`byInstrument`·`dateKey`를 **필수로** 추가하면 이미 저장된 v1 기록이 통계에서 전부 없어진다.
→ 스키마를 2로 올리고, **옛 행은 두 필드가 없어도 통과**시킬 것.
비율 추세에는 계속 쓰고, 약점 집계에서만 뺀다.

**② 비율 추세를 깨지 말 것.**
`InstProgressPanel`은 `PercentTrend` + `canShowWrsTrend`/`chronologicalWrs`를 쓰는데,
이건 `savedAt` + `summary{trialCount, correctCount, percent}` 모양을 그대로 요구한다.
→ **기존 세 필드를 유지한 채 `dateKey`·`byInstrument`를 더하기만** 할 것.
링 6처럼 summary 모양을 통째로 바꾸면 추세 그림을 새로 만들어야 한다. 그럴 이유가 없다.

**③ 저장 조건은 그대로 12문항.**
`finishSession`은 `summary.trialCount !== INST_TRIAL_COUNT`면 저장하지 않는다.
일별 upsert로 바꿔도 **이 조건은 유지**할 것 — 중간에 끝낸 세션이 그날의 온전한 기록을 덮으면 안 된다.

## 확인

- `npx tsc --noEmit -p tsconfig.json`
- `npx jest src/training/inst`
- `npx expo lint` (에러 0. `import/first` 경고는 기존 관례라 무시)
- 새 테스트에 **같은 날 두 번 저장하면 1건만 남는지**를 반드시 넣을 것

## 하지 말 것

- 난이도 축(적응형·SNR) 건드리기 — 별개 작업이다
- 실기기 청취 결과를 기다리기 — 서로 막지 않는다
- `docs/` 아래에 새 문서 만들기 — **이 탭 기록은 이 파일 하나에 모은다**(1부 ⑯)
- 이 파일의 1~4부 수정하기 — 누적형이다. 결과는 **맨 위에 새 블록**으로 추가

## 붙여넣기용 프롬프트

```
@answer_1.md 5부의 「악기별 약점 날짜 추적」을 구현해줘.
결정된 것·함정 셋·하지 말 것을 그대로 지킬 것.
끝나면 결과를 이 파일 맨 위에 새 블록으로 추가해줘.
```
