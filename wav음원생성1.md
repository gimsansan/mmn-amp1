# wav 음원 생성 1 — 대화 전문 (이어지는 문서)

> **성격**: `wav음원생성.md`의 **이어지는 대화**. 그 문서 ㉘ 다음이다.
> **편집 없이 전문 보존**(사용자 지시 2026-08-28, 이 문서에도 이어 적용).
> 요약·정리본이 아니다. 판단의 근거와 도중에 틀린 부분까지 그대로 남긴다.
> **날짜**: 2026-08-29 · **브랜치**: `new-content`
>
> `주의`: 앞 문서가 996줄이 되어 사용자가 **새 파일로 떼라고 지시**했다(2026-08-29).
> 내용은 이어지므로 앞 문서를 먼저 읽어야 한다. 번호는 ①부터 새로 시작한다.
>
> **현재 상태의 정본은 코드다** — `src/training/inst/`, `src/audio/instrument*.ts`.
> 「지금 어떤가」를 이 파일에서 찾지 말 것.

---

## 목차

- [확인된 것 · 뒤집힌 것](#확인된-것--뒤집힌-것)
- [① 사용자 — 런타임 MIDI 재생 분석을 붙여넣고 "교차검증하고 inst.tsx 적용을 궁리해라"](#-사용자--런타임-midi-재생-분석을-붙여넣고-교차검증하고-insttsx-적용을-궁리해라)
- [② 답변 — 그 글은 이 앱이 안 가진 문제를 푼다](#-답변--그-글은-이-앱이-안-가진-문제를-푼다)
- [③ 사용자 — 새 파일에 넣으라는 지시](#-사용자--새-파일에-넣으라는-지시)
- [④ 답변 — 파일 생성 보고](#-답변--파일-생성-보고)
- [⑤ 사용자 — B안은 내가 녹음 파일을 줘야 하나](#-사용자--b안은-내가-녹음-파일을-줘야-하나)
- [⑥ 답변 — 아니다, 그리고 A/B가 뒤집혀 있었다](#-답변--아니다-그리고-ab가-뒤집혀-있었다)
- [⑦ 사용자 — CC0 단음 샘플이 더 낫지 않나](#-사용자--cc0-단음-샘플이-더-낫지-않나)
- [⑧ 답변 — 맞다, 내가 낮게 걸었다](#-답변--맞다-내가-낮게-걸었다)
- [⑨ 사용자 — 조건이 맞으면 그것으로 진행하라](#-사용자--조건이-맞으면-그것으로-진행하라)
- [⑩ 답변 — 진행 결과](#-답변--진행-결과)
- [아직 안 정해진 것](#아직-안-정해진-것)

---

# 확인된 것 · 뒤집힌 것

> 대화 뒤에 확정된 사항만 여기 모은다. 아래 ①~④ 전문은 손대지 않는다.

## 1. FluidR3_GM 라이선스 — **MIT로 확인됨** (앞 문서 미결 ㉔·㉘ 해소)

[sources.debian.org의 `fluid-soundfont` 3.1-6 copyright](https://sources.debian.org/copyright/license/fluid-soundfont/3.1-6/)을 직접 열었다.

```
License: MIT
Copyright: Frank Wen (2000-2002, 2008), Toby Smithe (2008)
```

- `주의`: 읽은 것은 **데비안의 copyright 페이지**지 타르볼 안에 동봉된 원문 파일이 아니다.
  받고 나서 동봉본으로 한 번 더 확인해야 한다. (앞 문서 ㉘에서 가짜 인용이 한 번 나왔던 자리다.)
- 따라서 **㉘의 결론이 맞았음이 확인됐다** — 고지만 붙이면 렌더한 wav도 상업 배포 가능.

## 2. 붙여넣은 글의 크레딧 예시는 **틀렸다**

> `This application uses the "FluidR3_GM.sf2" SoundFont by Frank Wen, licensed under the **Creative Commons Attribution 3.0 License**.`

FluidR3_GM은 CC-BY 3.0이 **아니다**. 이 문안을 그대로 쓰면 없는 라이선스를 표기하게 된다.
쓸 문안은 앞 문서 ㉗에 붙어 있는 **MIT 전문**이다.

## 3. 추천된 라이브러리 셋 — 존재하지만 **이 앱에선 못 쓴다** (2026-08-29 npm 조회)

| 패키지 | 최신 | 갱신 | peer |
|---|---|---|---|
| `react-native-midi-playback` | 0.1.4 | 2022 | `react-native: *` |
| `react-native-piano-sampler` | 0.3.2 | 2022 | `react-native: *` |
| `react-native-soundfont` | 0.0.9 | 2022 | `react-native: >=0.60 <1.0` + `react-native-sound` |
| `react-native-soundfonts` | — | — | **npm에 없다 (404)** |

이 앱은 **RN 0.86 · React 19.2 · 신아키텍처**다. 셋 다 구 브리지 시절 모듈이라 안 붙는다.

## 4. sf3에는 조건이 하나 더 있다

FluidSynth가 sf3를 읽으려면 **libsndfile(Vorbis) 포함으로 빌드된 바이너리**여야 한다.
"공식 지원"만 보고 아무 바이너리나 집으면 로드에서 막힌다.
([FluidSynth #140](https://github.com/FluidSynth/fluidsynth/issues/140) · [SoundFont Loading](https://deepwiki.com/FluidSynth/fluidsynth/3.1-soundfont-loading))

또 "sf3면 10~20MB"는 낙관적이다. 그 수치는 **모노 판** 기준에 가깝고 스테레오 판은 30MB대다.

## 5. 런타임 sf2 합성은 **채택하지 않는다** (권고, 사용자 확정 아직 없음)

필요한 소리는 **고정 16개**(악기 4 × 음 4)고 사용자가 연주하지 않는다.
16개 고정 wav를 트는 데 신디사이저 엔진을 앱에 넣을 이유가 없다.
앞 문서 ⑳의 **오프라인 렌더 → wav** 결정이 그대로 유효하다. 근거 표는 ② 전문 참조.

## 6. 도구 현황 갱신 — 앞 문서의 「전부 없음」은 낡았다

| | 2026-08-28 | **2026-08-29** |
|---|---|---|
| `fluidsynth` | 없음 | 없음 |
| `ffmpeg` | 없음 | **있음** (winget, 8.0.1) |
| `sox` | 없음 | 없음 (ffmpeg로 대체 가능) |

## 7. 저장소 구조에서 확인된 것

- `git ls-files android` → **0개.** `android/`·`ios/`가 저장소에 없다(Expo CNG).
  네이티브 C++를 넣으려면 prebuild 산출물을 커밋하거나 config plugin을 새로 짜야 한다.
- `react-native-audio-api`는 `amTone.ts`(소리 크기 탭)가 계속 쓴다.
  그래서 악기 wav 재생은 **`expo-audio`** 쪽으로 몰아야 두 엔진의 역할이 갈린다.

## 8. 앞 문서의 「경로 A / B」 라벨이 저희끼리 어긋나 있다 (2026-08-29 발견)

정본은 **앞 문서 ④의 표**다:

| | 경로 |
|---|---|
| **A** | 지금 합성음 유지 → 나중에 **바로 실물 녹음** (중간 단계 없음) |
| **B** | **사운드폰트 wav를 임시본으로** → 나중에 실물 녹음 (권고된 쪽) |

그런데 앞 문서 **끝의 미결 표**는 *"사운드폰트 임시본을 거칠 것인가, 바로 실물 녹음으로 갈 것인가"* 라고
**순서를 거꾸로** 적어 놔서 A=임시본처럼 읽힌다. 이 문서 ②도 그걸 그대로 받아 **뒤집힌 채로 썼다.**

**앞으로 A/B 글자 대신 「합성음 유지」·「사운드폰트 임시본」이라고 쓴다.** 글자는 또 헷갈린다.

## 9. 교체 지점 — `inst.tsx`는 손댈 게 없다

```
inst.tsx → InstSessionScreen → instPlay.ts → instrumentTone.ts (지금: 하모닉 합성)
```

갈아 끼울 곳은 `instPlay.ts` 하나다. `instrumentTone.ts:25-27` 주석이 이미 그렇게 예고해 놨다.

**다만 `instPlay.ts` 하나만 바뀌는 건 아니다.** RN `require()`는 정적이라 16개 요구 테이블을
손으로 적어야 하고, `noteHz`(`523.25`)는 파일 키로 못 쓴다. `INST_NOTES_HZ`를
`{ id: "c5", hz: 523.25 }` 꼴로 바꿔야 하고 `instSession.ts`와 그 테스트도 같이 손봐야 한다.

## 10. 음원 출처 확정 — **Iowa 실물 샘플** (2026-08-29, 사용자 승인 ⑨)

사운드폰트 경로(합성음 유지 / 사운드폰트 임시본 **둘 다**)는 **폐기됐다.**
CC0·퍼블릭 도메인 실물 샘플이 셋 중 제일 낫다는 것이 ⑧에서 확인됐다:

- 합의된 종착지(「실물 녹음 wav」)를 **바로** 충족 — 임시본 단계가 없어진다
- 이용 제한이 없어 **크레딧 화면이 필요 없다** (앞 문서 ㉘의 걸림돌 소멸)
- 무향실 녹음이라 **잔향이 0** — 리버브 관리 문제 자체가 사라진다
- FluidSynth 설치·141MB 다운로드·MIDI 생성이 **통째로 불필요**

근거는 `docs/licenses/iowa-mis.txt`에 남겼다.

## 11. 크기 기준을 「앞 300ms」에서 「가장 큰 300ms」로 바꿨다

앞 문서 ⑳이 정한 「앞 300ms RMS 정렬」은 **실물 녹음에서 무너진다** — 바이올린은
활이라 어택이 느려 소리가 뒤에서 커지고, 앞을 기준 삼으면 몸통이 다른 악기의 세 배가
된다(측정값 RMS 0.30 대 0.10). 크기가 단서가 되므로 기준을 바꿨다. 자세한 것은 ⑩.

---

# ① 사용자 — 런타임 MIDI 재생 분석을 붙여넣고 "교차검증하고 inst.tsx 적용을 궁리해라"

> `주의`: 아래는 **사용자가 외부에서 받아 붙여넣은 글**이다(앞 문서 ㉗과 같은 성격).
> 사용자 본인의 판단이 아니고, **틀린 내용이 섞여 있다**(② 참조). 인용해 쓰지 말 것.
> 맨 끝 한 줄만이 사용자 본인의 지시다.

````
FluidR3_GM은 컴퓨터에서 미디(MIDI) 음악을 실제 악기 소리처럼 재생해주는 고품질 무료 사운드폰트(SoundFont, .sf2) 파일입니다.

## 핵심 요약

- 역할: 가짜 전자음(딩동거리는 미디 소리)을 피아노, 드럼, 바이올린 등 실제 악기 소리로 바꾸어 줍니다.
- 용량: 약 141MB로, 기본 내장 사운드보다 음질이 훨씬 뛰어납니다.
- 용도: 고전 PC 게임(고전 DOS 게임 등), 미디 재생 프로그램, 음악 작곡 프로그램(DAW)에서 사용합니다.

## 주요 다운로드 경로

1. [Musical Artifacts](https://musical-artifacts.com/artifacts/738) (가장 대중적인 다운로드 페이지)
2. [PianoBooster GitHub](https://github.com/pianobooster/fluid-soundfont/releases) (오픈소스 프로젝트 저장소)

이 사운드폰트를 어디에 적용하고 싶으신가요?

- 고전 게임(도스박스) 적용 방법 알려줘
- 뮤즈스코어(MuseScore) 적용 방법 알려줘
- 윈도우 기본 미디로 설정하는 방법 알려줘



FluidR3_GM 사운드폰트는 상업용 앱에 무료로 포함하여 배포하고 사용할 수 있습니다. 다만 오픈소스 라이선스에 따른 출처 표기 의무를 지켜야 합니다. [1, 2, 3]

## 라이선스 조건 요약

- 허용 범위: 상업적 이용 가능, 앱 내 복제 및 배포 가능, 사운드 변형 및 수정 가능.
- 의무 사항 (저작자 표시): 앱의 설정, 오픈소스 고지, 또는 크레딧 화면에 원작자와 라이선스 명칭을 반드시 명시해야 합니다. [1, 3]

## 적용 시 크레딧 표기 예시

앱 내 오픈소스 라이선스 고지란에 다음과 같이 기재하시면 됩니다.

```text
This application uses the "FluidR3_GM.sf2" SoundFont by Frank Wen, 
licensed under the Creative Commons Attribution 3.0 License.
(또는 배포처에 따라 MIT License 명시)
```

## 상업용 앱 개발 시 주의점

1. 용량 최적화: `FluidR3_GM.sf2`는 약 141MB로 모바일 앱 패키지에 그대로 넣기엔 무거울 수 있습니다. 필요한 악기만 추출하거나 `.sf3`(보리스/Ogg 압축 포맷)로 압축하여 용량을 줄이는 것을 권장합니다. [4, 5]
2. 합법적 샘플 확인: 사운드폰트 내부 일부 샘플의 원저작권 분쟁을 완벽하게 회피하고 싶다면, 완전한 상업용 무료 변형판인 `GeneralUser GS`나 오픈소스 신디사이저 표준인 [FluidSynth 공식 문서](https://www.fluidsynth.org/wiki/GettingStarted/)의 라이선스 가이드를 참고하시는 것이 안전합니다. [2, 6]

어떤 개발 환경(예: Flutter, React Native, Unity, iOS/Android 네이티브 등)에서 미디 재생 기능을 구현 중이신가요? 알려주시면 연동하기 좋은 오픈소스 라이브러리를 추천해 드릴 수 있습니다.

  

[1] [https://creativecommons.org](https://creativecommons.org/licenses/by/3.0/deed.ko)

[2] [https://www.fluidsynth.org](https://www.fluidsynth.org/wiki/GettingStarted/)

[3] [https://m.blog.naver.com](https://m.blog.naver.com/lawyeryky/220088732783)

[4] [https://musical-artifacts.com](https://musical-artifacts.com/artifacts/738)

[5] [https://musescore.org](https://musescore.org/en/node/248741)

[6] [https://www.reddit.com](https://www.reddit.com/r/midi/comments/1soc74e/which_free_sf2s_do_you_actually_recommend_for/)

\


==React Native(리액트 네이티브)== 앱에 FluidR3_GM 사운드폰트(.sf2)를 연동하려는 경우, 크로스 플랫폼(iOS/Android) 미디 합성(Synthesizer) 환경을 직접 구성해야 합니다.

React Native 생태계에는 사운드폰트 파일을 다이렉트로 완벽하게 구동하는 통합 라이브러리가 적기 때문에, iOS와 Android의 네이티브 기능을 활용하거나 C++ 기반 오픈소스를 브릿지로 연결하는 것이 일반적입니다.

## 1. 플랫폼별 구현 전략

- iOS (가장 쉬움): iOS는 운영체제 자체에 사운드폰트 재생 엔진이 내장되어 있습니다. 네이티브 프레임워크인 AVFoundation의 `AVMIDIPlayer`나 `AUSampler`를 사용하면 `FluidR3_GM.sf2` 파일을 아주 쉽게 로드하고 미디를 연동할 수 있습니다. [1, 2]
- Android (까다로움): Android의 기본 `MediaPlayer`는 외부 `.sf2` 사운드폰트 지정을 지원하지 않습니다. 따라서 안드로이드에서는 C++ 기반의 오픈소스 신디사이저인 [FluidSynth](https://www.fluidsynth.org/) 또는 FluidLite 라이브러리를 JNI(Java Native Interface) 형태로 앱에 심어서 연동해야 합니다. [1, 3, 4, 5]

---

## 2. 추천하는 접근 방식 & 오픈소스

개발 기간과 앱의 요구사항에 따라 3가지 경로 중 하나를 선택할 수 있습니다.

## 방법 A. 기존 리액트 네이티브 브릿지 활용 (빠른 프로토타이핑)

깃허브의 오픈소스 브릿지 라이브러리를 포크(Fork)하거나 참고하여 네이티브 코드를 연결합니다.

- [react-native-midi-playback](https://github.com/clef-musical-assistant/react-native-midi-playback): iOS에서는 외부 `.sf2` 로드를 완벽히 지원하지만 안드로이드는 기본 피아노음만 지원하므로, 안드로이드 파트만 FluidSynth 네이티브 코드를 심어 개조할 때 좋은 레퍼런스가 됩니다. [1]
- [react-native-piano-sampler](https://npms.io/search?q=fluidsynth): 안드로이드에서 FluidSynth를 통해 sf2를 읽고, iOS에서는 AudioKit을 쓰는 구조의 오래된 라이브러리입니다. 최신 RN 버전과 호환을 위해 네이티브 코드 수정이 필요할 수 있습니다. [6]

## 방법 B. 네이티브 모듈 직접 구현 (상업용 앱에 가장 추천)

앱의 안정성과 최신 React Native 버전과의 호환성을 위해 Turbo Modules나 기존 Native Modules 방식을 통해 양대 플랫폼의 핵심 기능을 각각 호출하는 구조를 직접 만드는 것이 좋습니다.

1. iOS: `AVMIDIPlayer`를 호출하는 Swift/Objective-C 브릿지 코드를 작성하고 프로젝트 `Assets`에 사운드폰트를 넣습니다.
2. Android: 안드로이드 `cpp` 폴더를 만들고 [FluidSynth 공식 소스코드](https://github.com/FluidSynth/fluidsynth)를 컴파일하여 포함한 뒤, Kotlin/Java JNI를 통해 미디 노트를 재생하도록 연결합니다. [1, 4, 7]

## 방법 C. 웹오디오 기반 우회 (Expo/Web 환경 타겟팅)

만약 앱 내에서 아주 무거운 141MB짜리 `.sf2` 파일을 그대로 배포하는 것이 부담스럽다면, 사운드폰트를 악기별/노트별 오디오 파일(mp3/wav)로 쪼갠 뒤 재생하는 방식을 씁니다. `react-native-soundfont` 같은 라이브러리가 이 방식을 차용합니다. [8, 9]

---

## 3. 상업용 앱 개발 시 핵심 체크리스트

- 앱 용량 경량화 (.sf3 변환): React Native로 빌드한 앱에 `FluidR3_GM.sf2`(141MB)를 그대로 넣으면 앱 다운로드 용량이 지나치게 커집니다. 오디오 샘플이 Vorbis 형식으로 압축된 `.sf3` 확장자로 변환하면 음질 저하를 최소화하면서 용량을 10~20MB 수준으로 대폭 줄일 수 있습니다. (FluidSynth는 .sf3 포맷을 공식 지원합니다). [3, 5]
- 네이티브 오디오 스레드 관리: 미디 재생은 CPU 연산을 많이 사용하므로, 자바스크립트(JS) 스레드가 아닌 네이티브 백그라운드 스레드에서 안정적으로 오디오가 합성되도록 아키텍처를 설계해야 버벅임(Latency)이 없습니다. [3]

구현하시려는 기능이 "저장된 미디(.mid) 파일을 재생"하는 것인가요, 아니면 유저가 화면을 터치할 때마다 "실시간으로 음을 연주(Note On/Off)"하는 기능인가요? 목적에 따라 구현 난이도가 달라지므로 알려주시면 더 알맞은 네이티브 API 구조를 설명해 드릴게요.

  

[1] [https://github.com](https://github.com/clef-musical-assistant/react-native-midi-playback)

[2] [https://pub.dev](https://pub.dev/packages/flutter_midi_pro)

[3] [https://www.fluidsynth.org](https://www.fluidsynth.org/)

[4] [https://medium.com](https://medium.com/@robsonsmartins/developing-a-midi-synthesizer-app-for-android-using-kotlin-and-c-4b8c038b3de4)

[5] [https://github.com](https://github.com/EasyRPG/Player/issues/1322)

[6] [https://npms.io](https://npms.io/search?q=fluidsynth)

[7] [https://github.com](https://github.com/FluidSynth/fluidsynth)

[8] [https://github.com](https://github.com/ShavaShav/react-native-soundfont)

[9] [https://github.com](https://github.com/ShavaShav/react-native-soundfonts)


저장된 미디(.mid) 파일을 재생하는 목적이라면, React Native에서 네이티브 브릿지를 연결할 때 난이도가 훨씬 낮아지고 구현이 직관적입니다. 실시간 연주(Note On/Off)처럼 마이크로초 단위의 반응 속도를 정밀하게 제어하지 않아도 되기 때문입니다.

플랫폼별로 가장 추천하는 핵심 네이티브 구현 API와 구조는 다음과 같습니다.

---

## 1. iOS 구현 방식 (`AVMIDIPlayer`)

iOS는 운영체제 자체에 사운드폰트 기반의 미디 파일 재생기인 `AVMIDIPlayer`가 내장되어 있어 별도의 오디오 라이브러리 조립이 필요 없습니다.

- 동작 원리: 앱 내에 저장된 `.mid` 파일 경로와 `FluidR3_GM.sf2` 파일 경로를 `AVMIDIPlayer`에 넘겨주기만 하면 iOS 사운드 엔진이 알아서 고품질로 합성하여 재생합니다.
- 핵심 네이티브(Swift) 코드 흐름:
    
    ```swift
    import AVFoundation
    
    var midiPlayer: AVMIDIPlayer?
    
    func playMIDI(midiUrl: URL, soundfontUrl: URL) {
        do {
            // 미디 파일과 사운드폰트 경로를 연결하여 플레이어 초기화
            midiPlayer = try AVMIDIPlayer(contentsOf: midiUrl, soundBankURL: soundfontUrl)
            midiPlayer?.prepareToPlay()
            midiPlayer?.play(nil) // 재생 시작
        } catch {
            print("Error playing MIDI: \(error)")
        }
    }
    ```
    
- 장점: 코드가 매우 짧고 안정적이며, 볼륨 조절 및 일시정지(`pause`), 재생 속도 조절(`rate`) 기능도 기본 제공됩니다.

---

## 2. Android 구현 방식 (`FluidSynth` + 오디오 트랙)

안드로이드는 내장 미디 재생기(`MediaPlayer`)가 외부 `.sf2` 사운드폰트를 지원하지 않기 때문에, C++ 기반의 오픈소스 신디사이저 엔진인 FluidSynth를 사용해야 합니다.

- 동작 원리: FluidSynth C++ 라이브러리를 안드로이드 JNI(Java Native Interface)를 통해 연결합니다. FluidSynth에 미디 파일과 사운드폰트를 로드하면, 이 엔진이 실시간으로 디지털 오디오 스트림(PCM 데이터)을 계산해 냅니다. 이 데이터를 안드로이드의 `AudioTrack`이나 `AAudio`를 통해 스피커로 출력하는 구조입니다.
- 개발을 쉽게 만들어주는 추천 레퍼런스:
    
    - 안드로이드에서 FluidSynth를 연동할 때는 처음부터 C++ 코드를 직접 짜기보다, 이미 잘 빌드되어 있는 오픈소스인 fluidsynth-android 라이브러리나 공식 FluidSynth 안드로이드 빌드 가이드를 프로젝트의 네이티브 모듈(Kotlin/Java)에 포함시키는 것이 좋습니다.
    
- 핵심 로직 흐름 (네이티브 단):
    
    1. `fluid_settings_t` 및 `fluid_synth_t` 객체 생성
    2. `fluid_synth_sfload()` 함수로 `FluidR3_GM.sf2` 로드
    3. `fluid_player_t` 객체를 생성해 `.mid` 파일 로드 후 `fluid_player_play()` 호출
    4. 재생되는 오디오 신호를 네이티브 스레드에서 안드로이드 출력 장치로 전달
    

---

## 3. React Native 브릿지 설계 팁

두 플랫폼의 네이티브 코드가 준비되었다면, React Native(JavaScript/TypeScript) 쪽으로는 아주 단순한 인터페이스만 노출하면 됩니다.

```typescript
// React Native에서 호출할 Native Module 가상 인터페이스
import { NativeModules } from 'react-native';
const { MidiPlayerModule } = NativeModules;

// 사용 예시
async function startMusic() {
  // 1. 앱 내 저장된 미디 파일명과 사운드폰트 파일명을 네이티브에 전달
  await MidiPlayerModule.initialize('bgm_01.mid', 'FluidR3_GM.sf2');
  
  // 2. 재생
  MidiPlayerModule.play();
}

function stopMusic() {
  MidiPlayerModule.stop();
}
```

## 💡 실무 개발 시 유의사항

- 파일 경로 관리: 사운드폰트와 미디 파일은 앱 패키지 내의 `Assets`(Android) 및 `Bundle Resources`(iOS)에 안전하게 포함되어 있어야 네이티브 코드에서 파일 경로(URL)로 올바르게 접근할 수 있습니다.
- 메모리 해제: 미디 재생이 끝났거나 화면을 벗어날 때는 반드시 네이티브 단에서 플레이어 객체를 파괴(`destroy` 또는 `nil` 대입)해 주어야 사운드폰트(141MB)가 차지하고 있던 메모리가 정상적으로 환수됩니다.

만약 네이티브 브릿지 코드를 직접 작성하는 것이 다소 부담스러우시다면, 현재 프로젝트가 Expo 환경인지 아니면 일반 React Native CLI 환경인지 알려주세요! 개발 환경에 맞춰 네이티브 코드를 추가하는 구체적인 세팅 방향을 제안해 드릴 수 있습니다.교차검증하고 이 앱의현재 @src/app/inst.tsx  에 적용에 궁리해줘
````

---

# ② 답변 — 그 글은 이 앱이 안 가진 문제를 푼다

> `정정`(2026-08-29, 이 답변 뒤 대화에서 발견 — 「확인된 것」 8 참조): 이 답변 **맨 끝의 「경로 A / B」 설명이 뒤집혀 있다.**
> 앞 문서 ④의 표가 정본이며 **A = 합성음 유지 후 바로 실물 녹음 · B = 사운드폰트 임시본 경유**다.
> 본문은 전문 보존 원칙에 따라 손대지 않는다. 읽을 때 라벨을 뒤집어 읽을 것.

확인 끝났습니다. 결론부터 말하면 **붙여넣은 글은 이 앱이 안 가진 문제를 풀고 있습니다.**

---

## 1. 교차검증 — 사실관계

### 맞는 것

| 주장 | 판정 |
|---|---|
| iOS `AVMIDIPlayer(contentsOf:soundBankURL:)`로 sf2 재생 | **맞다.** OS 내장 API고 코드 흐름도 정확 |
| Android `MediaPlayer`는 외부 `.sf2` 지정 불가 → FluidSynth JNI | **맞다.** 안드로이드 내장 신디(Sonivox)는 파형이 고정 |
| FluidR3_GM ≈ 141MB | **맞다** |
| sf3는 Vorbis 압축이라 용량이 크게 준다 | **맞다** |

### 틀린 것

**① 라이선스가 CC-BY 3.0이라는 크레딧 예시 — 틀렸다.** 데비안 `fluid-soundfont` copyright을 직접 열어 확인했다: **License: MIT**, 저작권자 **Frank Wen (2000–2002, 2008)**, Toby Smithe (2008). 붙여넣은 글의 크레딧 문안을 그대로 쓰면 **없는 라이선스를 표기하게 된다.**

> 이건 `wav음원생성.md`의 미결 항목(㉔·㉘ 「사운드폰트 라이선스 원문 확인 — 아직 안 읽었다」)을 해소한다.
> `주의`: 내가 읽은 건 [sources.debian.org의 copyright 페이지](https://sources.debian.org/copyright/license/fluid-soundfont/3.1-6/)지 타르볼 안의 원문 파일은 아니다. 받고 나서 동봉된 파일로 한 번 더 확인해야 한다.

**② `react-native-soundfonts`(복수형) — npm에 없다.** 404.

**③ sf3 "10~20MB" — 낙관적이다.** 그 수치는 모노 판(FluidR3Mono) 기준에 가깝다. 스테레오 판은 30MB대다.

**④ 빠진 조건.** FluidSynth가 sf3를 읽으려면 **libsndfile(Vorbis) 포함으로 빌드된 바이너리**여야 한다. 안 그러면 로드 자체가 실패한다 ([FluidSynth #140](https://github.com/FluidSynth/fluidsynth/issues/140), [SoundFont Loading](https://deepwiki.com/FluidSynth/fluidsynth/3.1-soundfont-loading)). "FluidSynth는 sf3를 공식 지원한다"만 보고 아무 바이너리나 집으면 여기서 막힌다.

### 확인해 보니 못 쓰는 것 — 추천된 라이브러리 셋

셋 다 npm에 **존재는 한다.** 그런데:

| 패키지 | 최종 갱신 | peer |
|---|---|---|
| `react-native-midi-playback` | 0.1.4 · 2022 | `react-native: *` (구 아키텍처) |
| `react-native-piano-sampler` | 0.3.2 · 2022 | `react-native: *` |
| `react-native-soundfont` | 0.0.9 · 2022 | `react-native: >=0.60 <1.0`, **`react-native-sound`** 의존 |

이 앱은 **RN 0.86 · React 19.2 · 신아키텍처**다. 셋 다 브리지 시절 모듈이라 포크해서 다시 쓰는 수준이 아니면 안 붙는다. `react-native-sound`도 오래전에 관리가 끊겼다.

### 글이 마지막에 물은 질문의 답

"Expo냐 RN CLI냐" — **Expo CNG**다. 그리고 `git ls-files android` → **0개**. `android/`·`ios/`가 저장소에 없다. FluidSynth C++를 넣으려면 prebuild 산출물을 커밋하거나 config plugin을 새로 짜야 한다. **작은 일이 아니다.**

---

## 2. 그런데 — 이 앱엔 애초에 필요 없다

붙여넣은 글은 *"임의의 `.mid`를 앱에서 재생한다"* 를 푼다. 이 탭의 문제는 그게 아니다.

`src/app/inst.tsx`부터 소리까지의 실제 경로:

```
inst.tsx → InstSessionScreen → instPlay.ts → instrumentTone.ts (지금: 하모닉 합성)
```

그리고 필요한 소리는 **고정 16개**다 — 악기 4개 × 음 4개(`INST_NOTES_HZ = G4·A4·C5·E5`). 사용자가 연주하지 않는다. 세션이 그중 12개를 골라 틀 뿐이다.

**16개 고정 wav를 트는 데 141MB짜리 신디사이저 엔진을 앱에 넣을 이유가 없다.** 게다가 `wav음원생성.md` ⑳에서 이미 정한 길이 그것 — **오프라인 렌더 → wav**다.

| | 런타임 합성 (붙여넣은 글) | 오프라인 렌더 (기 결정) |
|---|---|---|
| 앱 용량 | +30~141MB | **+수 MB** |
| 네이티브 코드 | JNI/C++ + config plugin | **없음** |
| 신아키텍처 | 직접 작성해야 | **무관** |
| 16개 길이 일치 | 런타임 변수 | **렌더 시 고정** |
| 리버브 오염 | 실행마다 관리 | **렌더 때 한 번 끄면 끝** |

런타임 쪽이 이기는 유일한 경우는 **음역이 넓어져 파일 수가 감당 안 될 때**다. 지금은 16개다.

---

## 3. 그래서 `inst.tsx`에 뭘 하나

`inst.tsx`는 **손댈 게 없다.** 6줄짜리 라우트고, 갈아 끼울 지점은 `instPlay.ts` 하나다 — 코드 주석이 이미 그렇게 예고해 놨다(`instrumentTone.ts:25-27`, "실물 wav가 생기면 `expo-audio` 재생(`ling6Play.ts` 모양)으로 갈아타면 되고, 훈련 쪽은 손대지 않아도 된다"). 설계가 이미 이 교체를 기다리고 있다.

**작업 순서:**

1. **도구** — FluidSynth는 GitHub 릴리스 zip(관리자 불필요). `ffmpeg`는 **이제 있다** (winget으로 들어와 있다 — 문서의 "전부 없음" 기록은 낡았다). `sox`는 여전히 없지만 ffmpeg로 대체 가능.
2. **사운드폰트** — 데비안 아카이브에서 받고 `copyright`를 `docs/licenses/FluidR3_GM.txt`로 같이 커밋.
3. `scripts/gen-inst-wav.mjs` — SMF 16개 생성 + `fluidsynth -F` (리버브·코러스 off). 선례: `scripts/prep-ling6-wav.mjs`가 RIFF를 의존성 없이 손으로 쓴다.
4. `scripts/prep-inst-wav.mjs` — 모노 · 1.6초 · RMS 정렬 → `assets/inst/`.
5. `instPlay.ts` 교체 — `ling6Play.ts`를 본떠 `expo-audio`로. **`react-native-audio-api`는 쓰지 않는다**: 그쪽은 `amTone.ts`(소리 크기 탭)가 계속 쓰므로, 파일 재생은 `expo-audio`로 몰아야 두 엔진의 역할이 갈린다.

**여기서 하나 걸린다 — 미리 알고 가는 게 낫다.** RN의 `require()`는 정적이라 16개 요구 테이블을 손으로 적어야 하고, 파일을 찾으려면 `noteHz`(`523.25`)를 키로 못 쓴다. 노트 이름(`c5`)이 필요하다. 즉 `INST_NOTES_HZ`를 `{ id: "c5", hz: 523.25 }` 꼴로 바꾸고 `instSession.ts`와 그 테스트를 같이 손봐야 한다. 큰일은 아니지만 **`instPlay.ts` 하나만 바뀌는 건 아니다.**

**라이선스는 이제 안 막힌다.** MIT로 확인됐으니 렌더한 wav를 스토어에 올려도 고지만 붙이면 된다. 다만 이 앱엔 **크레딧 화면이 없고 탭은 6개라 더 못 늘린다**(㉘). 배포본을 실물 녹음으로 갈아 끼우는 기존 계획대로면 그 화면 자체가 필요 없다.

---

**막힌 것은 여전히 하나** — 경로 A(사운드폰트 임시본을 거친다) / B(바로 실물 녹음)의 미결(④). 3~5번은 A를 골라야 의미가 있다. 어느 쪽인지만 정해 주면 `gen-inst-wav.mjs`부터 짜겠다.

이 답변도 `wav음원생성.md`에 이어 붙일까?

---

# ③ 사용자 — 새 파일에 넣으라는 지시

```
새로운 md 파일에 넣어줘 "wav음원생성1"
```

---

# ④ 답변 — 파일 생성 보고

`wav음원생성1.md`를 새로 만들었다. 앞 문서(`wav음원생성.md`, 996줄)는 **손대지 않았다.**

| 담은 것 | |
|---|---|
| 확인된 것 · 뒤집힌 것 | 이 대화에서 확정된 8가지 (라이선스 MIT 확인, 도구 현황 갱신 등) |
| ① | 사용자 — 붙여넣은 외부 글 + 지시 (전문) |
| ② | 답변 — 교차검증과 적용 궁리 (전문) |
| ③ | 사용자 — 새 파일 지시 |
| ④ | 이 보고 |

`주의`: 앞 문서의 **㉔·㉘ 미결(라이선스 원문 확인)은 이 문서에서 해소**됐다. 앞 문서 끝의 미결 표는 그대로 두었다 — 전문 보존 원칙 때문이다. **미결 현황은 아래 표가 최신이다.**

# ⑤ 사용자 — B안은 내가 녹음 파일을 줘야 하나

```
이전 답변 중 b안을 하려면 실물 녹음 파일을 내가 제공해야 가능한거지?
```

---

# ⑥ 답변 — 아니다, 그리고 A/B가 뒤집혀 있었다

**아니요 — 그리고 제가 A/B를 뒤집어 적은 게 원인입니다.**

앞 문서 ④의 표가 정본이고, 거기 기준으로는:

| | 경로 | 지금 필요한 것 |
|---|---|---|
| **A** | 합성음 유지 → 나중에 **바로 실물 녹음** | 없음 (합성음 그대로 둠) |
| **B** | **사운드폰트 wav를 임시본으로** → 나중에 실물 녹음 | 없음 (제가 렌더) |

제 지난 답변 끝에 *"경로 A(사운드폰트 임시본) / B(바로 실물 녹음)"* 이라고 썼는데 **거꾸로**입니다. 원인은 찾았습니다 — 앞 문서 **끝의 미결 표**가 ④의 표와 순서를 반대로 적어 놨고, 제가 그걸 그대로 받았습니다. 문서 자체가 저희끼리 어긋나 있었습니다.

## 그래서 답

**원문 기준 B(사운드폰트 임시본)라면 — 제공하실 게 없습니다.** 제가 데비안에서 FluidR3_GM 받고, MIDI 16개 만들어 렌더하면 끝입니다. 오히려 **B가 "지금 아무것도 안 주셔도 되는" 쪽**입니다.

**"바로 실물 녹음"(원문 A)을 뜻하신 거라면 — 맞습니다.** 소리는 제가 못 만듭니다. 스크립트·재생 코드는 미리 짜 둘 수 있지만 파일이 없으면 탭이 소리를 안 냅니다.

## 다만 "실물 녹음"이 꼭 직접 녹음은 아닙니다

셋 중 아무거나 됩니다:

1. **직접 녹음** — 가장 안전(라이선스 무관). 단 **바이올린·플루트 연주자**가 필요합니다. 피아노·기타는 몰라도 이 둘이 B의 진짜 장벽입니다.
2. **CC0 단음 샘플** — VSCO 2 CE, Freesound의 CC0 필터. 실제 연주를 녹음한 것이고 표기 의무도 없습니다(앞 문서 ㉔ 표).
3. 유료 샘플 라이브러리 — 「샘플 재배포 금지」 조항에 걸릴 수 있어 오히려 까다롭습니다.

**어느 쪽이든 조건은 같습니다**: G4·A4·C5·E5 **정확히 그 네 음** × 악기 4개 = 16개. 그리고 출처가 섞이면 문제가 하나 생깁니다 — 악기마다 녹음한 방이 다르면 **잔향이 달라져서**, 사용자가 음색이 아니라 울림으로 고를 수 있습니다. FluidSynth 렌더에서 리버브를 반드시 끄기로 한 것과 똑같은 이유(⑳)고, 사운드폰트 한 출처에서 뽑는 이점이 정확히 그거였습니다.

## 권고는 그대로 B(사운드폰트 임시본)

제공하실 게 없고, 교체 지점(`instPlay.ts` + 노트 키)을 지금 한 번 만들어 두면 나중 실물 녹음은 **파일 16개 덮어쓰기**로 끝납니다. 그리고 아직 안 끝난 「음색이 구분되는가」 실기기 검증을, 합성음이 아니라 제대로 된 샘플로 할 수 있습니다.

---

문서(`wav음원생성1.md`)에는 정정을 반영했습니다 — ② 본문은 전문 보존이라 그대로 두고 머리에 `정정` 주의를 달았고, 「확인된 것 8」에 라벨 혼선 경위를 적었습니다. **앞으로 A/B 글자 대신 「합성음 유지」·「사운드폰트 임시본」으로 부르겠습니다.** 앞 문서(`wav음원생성.md`)의 어긋난 미결 표는 손대지 않았습니다 — 고칠까요?

---

# ⑦ 사용자 — CC0 단음 샘플이 더 낫지 않나

```
CC0 단음 샘플도 문제될 것이 없고 권고할만한 것이 아닌가?
```

---

# ⑧ 답변 — 맞다, 내가 낮게 걸었다

맞습니다. 제가 낮게 걸었습니다 — **CC0/퍼블릭 도메인 실물 샘플이 사운드폰트 임시본보다 낫습니다.** 확인해 보니 네 악기가 다 있는 단일 출처가 실제로 있습니다.

## 확인한 것 — University of Iowa Electronic Music Studios

[Musical Instrument Samples](https://theremin.music.uiowa.edu/MIS.html) 데이터베이스:

| 필요한 것 | Iowa | 비고 |
|---|---|---|
| 피아노 | **있음** | 스테레오, 작은 교습실 녹음 (**유일하게 무향실이 아님**) |
| 기타 | **있음** | |
| 바이올린 | **있음** | arco/pizz, 비브라토 유무 나뉨 |
| 플루트 | **있음** | |

- **무향실(anechoic chamber) 녹음** · 모노 · 16bit · 44.1kHz · AIFF
- 이용 조건 원문: *"these recordings have been freely available on this website and may be downloaded and used for any projects, **without restrictions**"*

## 왜 이쪽이 나은가

| | 사운드폰트 임시본 | **Iowa 실물 샘플** |
|---|---|---|
| 합의된 종착지 | 임시본 → 나중에 또 교체 | **바로 「실물 녹음」 충족. 교체 단계가 없어진다** |
| 고지 의무 | MIT → **크레딧 화면 필요** (지금 없고 탭 6개라 못 늘림) | **없음** |
| 잔향 | 렌더 때 리버브 끄기로 관리 | **무향실 = 0.** 이 탭의 첫 규칙에 정확히 맞음 |
| 선행 작업 | FluidSynth 설치 + 141MB 다운로드 + MIDI 생성 스크립트 | **없음.** ffmpeg는 이미 있다 |
| 음질 | 루프·압축된 샘플 | 원본 녹음 |

특히 **크레딧 화면 문제가 통째로 사라지는 게 큽니다.** 앞 문서 ㉘에서 "MIT 고지를 붙이려면 화면을 새로 만들어야 하는데 탭이 6개라 못 늘린다"가 걸림돌이었는데, 이 경로는 그 문제를 안 만듭니다.

## 남은 확인 셋 (다운로드 전에 목록만 봐도 됩니다)

1. **G4·A4·C5·E5 네 음이 네 악기 모두에 실제로 있는가.** Iowa는 반음 전체를 담지만 파일 묶음 방식이 악기마다 달라서 봐야 합니다.
2. **피아노만 방 녹음이라는 점.** 넷 중 하나만 울림이 다르면 "음색이 아니라 울림으로 고르기"가 됩니다. 모노 다운믹스 + 꼬리 정리로 잡히는지 들어 봐야 합니다. — **이게 제일 큰 리스크입니다.**
3. **기타·바이올린의 주법 선택.** 바이올린 비브라토 유무, 기타 연주 방식이 뭔지. 넷을 같은 세기(dynamic)로 통일해야 합니다.

이용 조건이 정식 CC0 라이선스 문서가 아니라 **페이지에 적힌 문장**이라는 점도 짚어 둡니다. 실질적으로는 같지만, 받을 때 그 페이지를 `docs/licenses/`에 함께 저장해 두는 게 낫습니다.

---

**다음 한 걸음**: Iowa 쪽 파일 목록을 열어 위 1·3번을 확인하겠습니다 — 다운로드 없이 목록만 보면 됩니다. 여기서 16개가 다 나오면 **사운드폰트 경로(A/B 논쟁)는 통째로 없어집니다.** 진행할까요?

문서에도 이 경로를 「합성음 유지 / 사운드폰트 임시본」과 나란히 세 번째로 넣어 두겠습니다 — 같이 반영할까요?

---

# ⑨ 사용자 — 조건이 맞으면 그것으로 진행하라

```
네 남은 확인 셋이 조건을 충족한다면 그래서 제일 나은 선택이라고 판단 된다면 그것으로 진행해줘 . 그리고 문서에도 이번의 너의 답변도 기록은 잊지마.
```

---

# ⑩ 답변 — 진행 결과

확인 셋을 통과해서 **Iowa 실물 샘플로 갈아 끼웠다.** 합성음은 걷어냈다.

## 확인 셋 결과

**① 네 음이 네 악기에 다 있는가 — 통과.**

| 악기 | 원본 | 담긴 음 |
|---|---|---|
| 피아노 | `Piano.mf.{G4,A4,C5,E5}.aiff` | 음별 파일 |
| 기타 | `Guitar.mf.sul_E.E4B4` / `C5B5` (mono) | 1번 줄, 3·5·8·12프렛 |
| 바이올린 | `Violin.arco.mf.sulD.D4A4` / `sulA.C5C6` | 이웃한 두 줄 |
| 플루트 | `Flute.vib.mf.B3B4` / `C5B5` | |

**② 피아노만 방 녹음 — 통과(조건부).** 모노로 내리고 1.6초에서 자르면 교습실 잔향은 피아노 자신의 감쇠에 묻힌다. 다만 **이건 귀로 확인해야 최종 판정**이다 — 실기기 청취에 그대로 남긴다.

**③ 주법·세기 — 정했다.** 넷 다 `mf`. 바이올린은 활(arco). 플루트는 **비브라토 있는 쪽**을 골랐다 — 바이올린(활)에 비브라토가 있는데 플루트만 없으면 「떨리면 바이올린」이 되어 음색이 아니라 떨림으로 고를 수 있다.

## 만든 것

```
scripts/inst-sources.mjs    출처표 — URL·고른 이유·음 배정
scripts/fetch-inst-src.mjs  원본 10개 → .inst-src/ (83MB, 커밋 안 함)
scripts/prep-inst-wav.mjs   16개 → assets/inst/ (모노 44.1kHz 1.6초)
docs/licenses/iowa-mis.txt  이용 허락 문장·녹음 조건·원본 목록
```

**분절은 순서로 세지 않는다.** 피아노만 음별 파일이고 나머지 셋은 한 파일에 반음계가 여러 음 들어 있는데, 무음 판정이 흔들리면(감쇠가 문턱을 스치면) 한 음이 둘로 쪼개져 순서가 밀린다. 그래서 무음으로 토막 낸 뒤 **자기상관으로 기음을 재서** 목표 음을 찾는다. 못 찾으면 **에러로 멈춘다** — 틀린 음이 `assets/`에 들어가는 게 제일 나쁘다.

`주의`: 자기상관에서 한 번 틀렸다. 「최댓값의 90%를 처음 넘는 지연」을 쓰면 상관 곡선이 완만해서 최소 지연(1200Hz 언저리)에 붙는다. **봉우리(국소 최댓값) 중에서 골라야** 한다.

## 크기 기준을 바꿨다

앞 문서 ⑳은 「앞 300ms RMS 정렬」이라고 정해 뒀는데, 실물 녹음에서는 그게 무너졌다 — 바이올린은 활이라 어택이 느려서 소리가 뒤에서 커진다. 앞을 기준 삼으니 몸통 RMS가 0.30까지 올라가 다른 악기의 세 배가 됐다. **크기로 고를 수 있게 되는 것**이라 기준을 **「가장 큰 300ms 구간」**으로 바꿨다. 16개 전부 0.100으로 맞았고 포락선 성격(피아노·기타 감쇠 / 바이올린·플루트 지속)은 그대로다.

## 코드에서 바뀐 곳

| | |
|---|---|
| `src/training/inst/instSounds.ts` | **새로 만듦.** 음원 16개 `require` 표 + 기음 목록 |
| `src/training/inst/instPlay.ts` | 합성 → `expo-audio` 재생(`ling6Play.ts`와 같은 모양) |
| `src/training/inst/instSession.ts` | `trial.noteHz`(숫자) → `trial.note`(`"g4"` 같은 id) |
| `src/training/inst/instruments.ts` | `spectrum`·`envelope` 제거 — 이 표는 이제 화면에 보이는 것만 안다 |
| `src/audio/instrumentTone.ts` · `instrumentSpectra.ts` (+ 테스트) | **지웠다.** 합성 경로가 없어졌다 |
| `.gitignore` | `/.inst-src` |

`inst.tsx`와 `InstSessionScreen`은 **손대지 않았다.** 예고대로 교체는 `instPlay.ts` 아래에서 끝났다.

## 검증

- `npx tsc --noEmit` — 통과
- `npx jest src/training/inst src/audio` — 2 suites / 21 tests 통과
- 전체 `npx jest` — 28/29 통과. 실패한 `WrsSessionScreen.test.tsx`는 **이 작업과 무관한 기존 실패**다(`react-native-audio-api` 네이티브 모듈 없음). HEAD로 되돌려 같은 실패를 확인했다.
- 16개 파일: 전부 1.6초 · 최대 300ms RMS 0.100 · 피크 0.21~0.59(클리핑 없음)

## 아직 안 한 것

**실기기 청취.** 넷이 실제로 구별되는지, 피아노만 울리지 않는지는 귀로만 판정된다. 그게 이 탭의 원래 미결(4부 다음작업 1번)이고, 이제 합성음이 아니라 실물 소리로 그 판정을 할 수 있다.


---

# 아직 안 정해진 것

> 이 문서 ⑩ 시점 기준. 앞 문서 끝의 표와 이 문서의 이전 표를 모두 대체한다.

| 미결 | 어디서 나왔나 |
|---|---|
| **실기기 청취 검증** — 넷이 실제로 구별되는가, **피아노만 울리지 않는가**. 이제 합성음이 아니라 실물 소리로 판정할 수 있다 | 앞 문서 4부 다음작업 1번 · 이 문서 ⑩ |
| **배포 전 체크리스트** — `assets/ling6/`·`assets/9_sent/`의 출처 정리. **`assets/inst/`는 끝났다**(`docs/licenses/iowa-mis.txt`) | 앞 ㉔ 끝 |
| 이 내용을 `answer_1.md`에 합칠 것인가 | 앞 ④ 끝 |

| ~~미결~~ 해소됨 | 결과 |
|---|---|
| ~~경로 A / B~~ | **둘 다 폐기.** Iowa 실물 샘플로 감 (⑧·⑨·⑩) |
| ~~생성 방식 (MIDI 파일 렌더)~~ | **불필요해짐.** 렌더할 게 없다 |
| ~~런타임 sf2 합성~~ | **비채택 확정** |
| ~~`INST_NOTES_HZ` 구조 변경~~ | **했다.** `trial.note`(id)로 바뀜 (⑩) |
| ~~사운드폰트 라이선스 원문 확인~~ | MIT 확인. 다만 **이제 안 쓴다** |
| ~~크레딧·라이선스 화면~~ | **필요 없어졌다.** Iowa는 표기 의무가 없다 |
| ~~음 목록 ① / ② / ③~~ | **②로 확정** (앞 문서 「결정된 것」) |
| ~~`gen-inst-wav.mjs`·`prep-inst-wav.mjs` 작성~~ | **했다.** `fetch-inst-src.mjs` + `prep-inst-wav.mjs` (⑩) |
