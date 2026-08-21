# 데이터 흐름 지도 — `src/training/**` + `src/audio/**`

> **축**: 데이터 흐름(2번 축). 질문 요령은 [`ask-data-flow.md`](./ask-data-flow.md).
> **화면 축은 여기 없다** — 화면 전환은 [`ask-file-be.md`](./ask-file-be.md) 축으로 따로 한 번 더 돌려야 한다.
> **표기**: `{ }` 데이터 지점, `[ ]` 화면.
> **작성**: 2026-08-21, 브랜치 `feat_wrs_voice_guide`. 코드가 바뀌면 이 문서는 낡는다.

## 0. 대상 목록과 읽음 상태

고정 목록 **77개**(`src/training/**` 74 + `src/audio/**` 3). 읽음 77 / **안 읽음 0**.

다음 18개는 **겉면만** 읽었다(내보낸 함수 목록 + 머리 주석). 데이터 종류 판정에는 충분하지만 내부 분기까지는 보지 않았다:

`am/{amSession,amStaircase,amAfcTrial}` · `freq/{freqSession,freqStaircase,freqAfcTrial}` ·
`pitch2afc/{SessionManager,StaircaseEngine,trainingFlow,constants,pitchCompareTrial}` ·
`ling6/{ling6Session,ling6Synth}` · `wrs/{wrsBingo,wrsDistractors,wrsHangul,wrsWords,twoCharSession}`

테스트 22개는 import 대상만 확인했다.

---

## 1. 원본(진짜 출처) — 담아둠 4곳, 전부 기기 AsyncStorage

| 저장 키 | 파일 | 무엇을 | 상한 · 규칙 |
| --- | --- | --- | --- |
| `training.sessionHistory.v1` | `sessionStore.ts` | freq·am·pitch2 **세 트랙 공용** 요약 | 트랙별 50, `practice`는 **아예 저장 안 함** |
| `training.wrsSessions.v1` | `wrs/wrsStore.ts` | 한 글자 25문항 요약 | 50, 25개 완주 아니면 `throw` |
| `training.twoCharSessions.v1` | `wrs/twoCharStore.ts` | 두 글자 12문항 요약 | 50, 12개 완주 아니면 `throw` |
| `training.ling6Daily.v1` | `ling6/ling6Store.ts` | **날짜 1건** 음소맵 | 50일, 같은 날짜는 치환(upsert) |

네 저장소 모두 같은 골격이다. 모듈 전역 `tail` 프로미스 큐(`enqueue`)로 읽기·쓰기를 직렬화해
read-modify-write 겹침에 의한 유실을 막는다(같은 JS 런타임 안에서만 유효 — 프로세스·기기 간 잠금이 아님).

메모리에만 있는 원본이 하나 더 있다: `pitch2afc/SessionManager` 인스턴스.
화면 ref가 들고 있고 저장되지 않는다. 종료 시 `endSession()` 결과만 요약으로 빠져나간다.

---

## 2. 쓰기 경로 (보냄)

```
[한 글자]   outcomesRef --summarizeWrs--> {요약} --appendWrsSummary--> {wrsSessions.v1}
[두 글자]   outcomesRef --summarizeTwoChar--> {요약} --appendTwoCharSummary--> {twoCharSessions.v1}
[링 6]      outcomesRef --collectPhonemeResults--> {음소맵} --upsertLing6DailyRecord--> {ling6Daily.v1}
[떨림]      AmSessionState --summarizeAmSession--> {요약} --appendAmSessionSummary('measure')--> {sessionHistory.v1}
[다른 음]   FreqSessionState --summarizeSession--> {요약} --appendFreqSessionSummary('measure')--> {sessionHistory.v1}
[높낮이]    SessionManager.endSession() --summarize--> {요약} --appendPitch2SessionSummary('measure')--> {sessionHistory.v1}
[단어 빙고] {요약} --> 화면 카드만. 저장소 없음(통계 kind 없음)
```

- **언제 나가나**: 전부 세션 종료 한 지점뿐(마지막 문항 다음, 또는 「끝내기」·「중지」 확인). 문항마다 쓰는 경로는 없다.
- **중복 전송 차단 2겹**: 화면 `savedRef.current` + 저장소 `enqueue` 큐.
- **안 보내는 경우**: 한 글자 ≠25 · 두 글자 ≠12 · 링 6 음소 6개 미완이면 저장을 건너뛰고 안내 문구만.
  am·freq·pitch2는 `runModeRef.current === "practice"`(귀풀기)면 요약만 만들고 저장하지 않는다.
- **보낸 뒤 갱신**: 링 6만 `refreshHistory()`로 자기 화면 목록을 다시 읽는다.
  나머지는 갱신 없음 — 통계 화면이 포커스마다 다시 읽는 구조라 캐시 무효화 개념이 없다.
- **실패 시**: 되돌림 없음. `saveNote`만 바뀐다("기록에 남기지 못했어요" / "기록 저장에 실패했어요").

---

## 3. 읽기 경로 (가져옴)

```
{4개 저장소} --Promise.all--> {StatsFeed} --kind별 선택--> [연습 기록]
```

- `statsFeed.loadStatsFeed()`가 유일한 통계 읽기 창구. 저장 키 통합이 아니라 **읽는 API만 봉투로 투영**한 것.
- 네 읽기 각각 `.catch(() => [])` — 한 저장소가 깨져도 나머지 종목은 보인다(그 종목만 빈 목록).
- `sessions`는 여기서 `isCountedInStats`로 `practice`를 제외한다. `mode`가 없는 구기록은 **측정으로 간주해 포함**.
- 트리거: `StatsScreen`의 `useFocusEffect(reload)` — 진입/재포커스마다 통째로 다시 읽는다.
  칩(kind) 전환은 재요청 없이 이미 읽은 feed를 자른다.
- 삭제도 같은 창구: `clearStatsKind(kind)` → 종목별 clear(음고·떨림은 한 키를 나눠 쓰므로
  `deleteSavedSessionsByTrack`) → 성공 시 `reload()`.

세션 안에서 저장소를 읽는 곳이 둘 있다.

```
{twoCharSessions.v1} --rows.length--> nextTwoCharListIndex --> [두 글자] 시작 목록 회전
{ling6Daily.v1} --peekPreviousDayPassCount / peekHighFreqBaseline--> [링 6] 요약 비교 문구
```

두 글자는 **읽기가 시작 트리거 안에 있다**. `listTwoCharRecords()`가 실패하면 연습 자체가 시작되지 않고
"연습을 시작하지 못했어요"만 뜬다.

---

## 4. 로딩 · 실패 · 빈 값

| 지점 | 로딩 | 실패 | 빈 값 |
| --- | --- | --- | --- |
| `loadStatsFeed` | `StatsScreen`이 `loading=true`로 시작 | catch → "기록을 불러오지 못했어요" + `EMPTY_STATS_FEED` | 각 저장소 `[]` → 패널이 `records.length === 0`이면 `null` 렌더 |
| `readAllRaw` (4곳 공통) | — | JSON parse 실패·배열 아님 → `[]` | 키 없음/빈 문자열 → `[]` |
| 레코드 검증 | — | 형태 안 맞는 1건은 **조용히 버림**(다음 쓰기 때 저장소에서도 사라짐) | — |
| 추이 그래프 | — | — | 점 2개 미만이면 그래프 자체를 안 그림(`canShowWrsTrend`, `SessionTrendPanel`) |
| `hasKoreanVoice` | `checking`으로 카드 잠금 | 조회 throw → **`true`**(연습 통과) | 목록이 빈 배열이면 0·250·500 ms 재시도, 끝까지 비면 `true` |
| `speakWrsWord` | `phase="playing"` | reject → "단어를 읽지 못했어요" 뒤 `choose`로 진행 | — |

`hasKoreanVoice`는 **캐시하지 않는다** — 사용자가 설정에서 음성을 깔고 돌아와 다시 확인할 수 있어야 하므로.

---

## 5. 데이터가 소리로 나가는 쪽 (출력 싱크)

```
{정적 단어 목록} --speakWrsWord--> {expo-speech ko-KR}
{cent/dB 파라미터} --playPureTone / playAmTone / playLing6Target--> {react-native-audio-api}
```

`pureTone.ts`·`amTone.ts`·`ling6Synth.ts`는 모듈 전역에 `AudioContext`와 진행 중 노드를 들고 있다.
저장소가 아니라 **중단용 재생 핸들 보관**이다.

정적 출처(코드 상수): `wrsWords.ts` 200단어, `twoCharLists.ts` 3장×12, `ling6/sounds.ts` 6음소 + `require()` PNG.

---

## 6. 파일별 종류

**3. 담아둠** — `sessionStore.ts`, `wrs/wrsStore.ts`, `wrs/twoCharStore.ts`, `ling6/ling6Store.ts`, `pitch2afc/SessionManager.ts`(메모리)

**1. 가져옴** — `statsFeed.ts`(4저장소 읽기 창구), `wrs/wrsTts.ts`의 `hasKoreanVoice`

**4. 바꿈(계산)** — `wrs/{wrsSession,twoCharSession,wrsBingo,wrsDistractors,wrsHangul,wrsTrend}`,
`ling6/ling6Session.ts`, `am/{amSession,amStaircase,amAfcTrial}`, `freq/{freqSession,freqStaircase,freqAfcTrial}`,
`pitch2afc/{StaircaseEngine,trainingFlow,pitchSummary,constants}`, `sessionMode.ts`, `audio/cents.ts`, `confirmEndSession.ts`

**출력(위 4종 밖)** — `audio/{pureTone,amTone}`, `ling6/ling6Synth.ts`, `wrs/wrsTts.ts`의 `speakWrsWord`, `pitch2afc/pitchCompareTrial.ts`

**정적 데이터** — `wrs/wrsWords.ts`, `wrs/twoCharLists.ts`, `ling6/sounds.ts`

**데이터를 만들고/보내는 화면**(축의 끝점) — `wrs/{WrsSessionScreen,WrsTwoCharScreen,WrsBingoScreen,WrsTabScreen,WrsVoiceGuideScreen}`,
`ling6/Ling6SessionScreen.tsx`, `am/{AmSessionScreen,AmTabScreen}`, `freq/FreqSessionScreen.tsx`,
`pitch2afc/PitchCompareScreen.tsx`, `pta/PtaSessionScreen.tsx`, `StatsScreen.tsx`, `ListeningCheckScreen.tsx`

**받은 값만 그리는 표시부**(데이터 경로 없음) — `SummaryCard`, `TrendChart`, `SessionTrendPanel`,
`SessionProgressBar`, `SessionModeToggle`, `ling6/Ling6ProgressPanel`, `wrs/WrsProgressPanel`

**테스트 22개** — 데이터 경로 없음. 저장소 4종은 `AsyncStorage` 모킹으로 검증한다.

---

## 7. 원본이 흐려지는 지점

1. **세션 진행 중 값의 원본은 `useState`가 아니라 ref다.**
   `outcomesRef` / `trialsRef`가 원본이고 `outcomeCount`·`trials` state는 표시용 복사본이다.
   요약은 항상 ref에서 만든다 — 이걸 모르고 state를 읽으면 한 문항 뒤처진 값을 본다.
2. **같은 `WrsSessionSummary` 타입을 두 저장소가 각각 보관한다**(`wrsStore` / `twoCharStore`).
   구분은 저장 키와 `kind`(wrs1/wrs2)뿐이라, 요약 객체만 들고는 어느 연습 것인지 알 수 없다.
3. **`mode` 필드는 실질적으로 항상 `'measure'`다.**
   `practice`는 저장 호출 자체를 건너뛰므로 저장소에 남지 않는다.
   `mode`가 `undefined`인 구기록은 측정으로 간주해 통계에 포함된다 — 통계 개수가 기대와 다르면 여기부터 본다.
