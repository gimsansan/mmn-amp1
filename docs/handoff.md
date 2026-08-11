# 인계문 로그 — rn-hear-1 / mnn_1

> **대상**: 새 채팅 AI. 사용자는 맥락을 이미 앎.  
> **방식**: 「인계문 작성해」 시 **덮어쓰지 말고 최신 블록을 맨 위에 추가**. 각 블록 제목: `## 인계 — YYYY-MM-DD HH:mm`.  
> `impl-log`에 한 줄. Ask에서는 본문만 올리지 말 것.  
> **날짜별 사본은 만들지 않는다**(2026-08-07 변경 — 100% 중복이었음. 과거 조회는 git 이력). 규칙: `.cursor/rules/android-dev-client.mdc`

---

## 인계 — 2026-08-11 17:23

새 채팅 AI용. 최신: `docs/handoff.md` 상단.

### 지금 상태 (병합 §4-7 완료)
- 브랜치 `merge/harmonitune`. 제품=HarmoniTune · 코드 호스트=mnn_1.
- 정본: `docs/merge-plan-harmonitune.md`(§4 순서), `docs/merge-host-decision.md`(§4.1 저장·§3.2 HH 원본 위치 `d:\harmonic_hear`). 규칙: `.cursor/rules/android-dev-client.mdc`.
- §4-1~§4-6 → **§4-7(홈·통계·설정 이식) 완료**. 다음 = §4-8(`app.json` 리브랜딩·리빌드) → §4-9(설계 문서 3트랙).

### 한 일 (§4-7) — 사용자 결정 3개 반영
- 결정: **IA=하단 탭 확장**(홈·연습·통계·설정) · **테마=mnn 디자인 유지**(§2-6) · **결과 화면=기존 인라인 `SummaryCard` 유지**(HH result 라우트 신설 안 함).
- HH 원본 실측 결과 **그대로 이식 불가**: HH 통계/결과는 `TrainingStorage.thresholdCents`(역치) 기반 → mnn `sessionStore`엔 역치 없음. 「최고 역치·최소 차이·평가」는 §2-1(순화)과 정면 충돌 → **재작성**.
- `app-tabs.tsx`: 통계·설정 트리거 추가. 전용 PNG 없어 `sf`(iOS)/`md`(Android Material) 시스템 심볼 사용.
- `SessionHistoryScreen.tsx`: 「연습 기록」→「연습 통계」 승격(§2-3 발동: 3종 완성). 상단 `AggregateCard`(연습 횟수·푼 문항·평균 정답률·트랙별 횟수 + 「참고용·점수/진단 아님」) + `computeAggregate` 신설.
- `src/app/stats.tsx`·`src/app/settings.tsx` 신설. 설정=앱 정보/버전(`expo-constants`)·의료기기 아님 고지·연습 기록 전체 삭제(Alert→`clearSavedSessions`).
- `explore.tsx`: 기록 카드·`history` 트랙 제거(훈련 3카드만). `index.tsx`: 홈 카피 3트랙+통계 탭 반영.
- 결과: `npx tsc` 0 · 린트 0 · `npm test` **114 통과**. **리빌드 불필요**(순수 TSX·`expo-symbols` 이미 설치).

### 안 한 일 / 다음
- **실기기 미확인**: 통계/설정 탭 표시, 탭 아이콘(sf/md) 렌더, 데이터 삭제 흐름, §4-5 저장 흐름.
- **의도적 미이식**: HH 설정의 기준음 프리셋·진동 토글·온보딩 replay — mnn에 설정 저장소·훈련 배선이 없어 가짜 컨트롤 방지로 뺌. 필요 시 별도 저장소+훈련 배선 선행. §2-5=mnn `ListeningCheckScreen` 유지.
- §4-8: `app.json` 이름·slug·패키지·아이콘 → HarmoniTune. **이때 dev client 리빌드 필요** + 온보딩 중복 최종 정리.
- §4-9: 설계 문서 §3·§6 3트랙 반영, HH 시작값 50/200 불일치 정정.

### 단정 금지
- `추정`: 심볼명 `chart.bar`/`gearshape`/`bar_chart`/`settings`가 기기에서 의도대로 그려질지 — 타입 통과, 실측 안 함.
- `추정`: HH result 라우트를 안 만든 것이 최종이라는 보장 없음(3종 UI 통합 재검토 가능).
- `주의`: 홈/explore는 PNG 탭 아이콘, 통계/설정은 시스템 심볼 → 안드로이드에서 아이콘 톤이 섞여 보일 수 있음(실측 필요).

### 인계 규칙
- **추가+시각** · 새 창: `@docs/handoff.md` + 「인계 이어서」.

---

## 인계 — 2026-08-11 17:03

새 채팅 AI용. 최신: `docs/handoff.md` 상단.

### 지금 상태 (병합 §4-5 완료)
- 브랜치 `merge/harmonitune`. 제품=HarmoniTune · 코드 호스트=mnn_1.
- 정본: `docs/merge-plan-harmonitune.md`(§4 순서), `docs/merge-host-decision.md`(§4.1 저장). 규칙: `.cursor/rules/android-dev-client.mdc`.
- §4-1~§4-4(로직 이식·`cents.ts` 통합·화면 라우팅) → **§4-5(저장 스키마 확장) 완료**.

### 한 일 (§4-5)
- 요약 타입 단일 출처 승격 → `src/training/pitch2afc/pitchSummary.ts` 신설(`PitchCompareSummary`). 화면=생산, 저장소=소비.
- `sessionStore.ts` — `SessionTrack`에 `'pitch2'` 추가 · `SavedPitch2SessionRecord` · `isValidRecord` pitch2 분기(cent 3필드 `number|null` 검증) · `appendPitch2SessionSummary`. **v2 키 신설 없음**(기존 `training.sessionHistory.v1` 유지, §2-2 정본).
- `PitchCompareScreen.tsx` — 로컬 `PitchSummary`/`EndReason` 제거→공용 타입, 세션 종료 시 `savedRef`로 1건 저장(중복 방지)·요약에 저장 결과 문구(freq/am 동일).
- `SessionHistoryScreen.tsx` — 유니온 확장으로 깨진 좁히기를 `trackView()` 헬퍼로 분리(freq/am/pitch2 3분기, 인지 복잡도↓).
- 테스트 — `sessionStore.test.ts`에 pitch2 5건(3트랙 동시·저장/조회·null 허용·손상 폐기 2).
- 결과: `npx tsc` 0 · 린트 0 · `npm test` **114 통과**(109+5). **리빌드 불필요**(순수 TS/JS).

### 안 한 일 / 다음
- **실기기 미확인**: 세션 종료→저장→`SessionHistoryScreen` 표시 흐름(제목 「높낮이 비교」·음높이 차이 표시).
- §4-6: 연습 탭 = 카드 3개 재구성(음고 2 / 떨림 1). 기록 화면 상위 이동은 3종 완성 후(§2-3).
- §2 나머지: 온보딩 중복(§2-5)·테마 택1(§2-6) — 홈/통계/설정 상위 이식(§4-7) 때.

### 단정 금지
- `미검증`: 실기기 저장 흐름·A→B 청취·세션 길이/피로.
- `추정`: `pitchSummary.ts`가 최종 위치라는 보장 없음(3종 UI 통합 시 재검토 가능).
- `주의`: `sessionStore` `newId`의 `Math.random` sonar 경고는 **기존 코드**·미변경. `PitchCompareEndReason`은 null 없지만 저장소 검증·`endReasonLabel`은 null 허용(상위호환).

### 인계 규칙
- **추가+시각** · 새 창: `@docs/handoff.md` + 「인계 이어서」.

---

## 인계 — 2026-08-11 16:51

새 채팅 AI용. 최신: `docs/handoff.md` 상단.

### 지금 상태 (병합 §4-4 완료)
- 브랜치 `merge/harmonitune`. 제품=HarmoniTune · 코드 호스트=mnn_1.
- 정본: `docs/merge-plan-harmonitune.md`, `docs/merge-host-decision.md`(§4.1 저장). 규칙: `.cursor/rules/android-dev-client.mdc`.
- §4-2·§4-3(로직 3종 이식 + `cents.ts` 통합) → **§4-4(화면 라우팅) 완료**.

### 한 일 (§4-4)
- §2-1 결정 = **(a) 훈련 모드 + 웰니스 프레이밍**(사용자 선택). 역치·「평가」 문구 안 씀.
- `pitch2afc/pitchCompareTrial.ts` 신설 — A(기준)→B(목표) 두 톤 재생(`pureTone` 재사용, 중단 폴링). 게인 0.15(청취 확인과 동일, 트랙 `AUDIO.PEAK_GAIN_WAVE` 0.4 미사용).
- `pitch2afc/PitchCompareScreen.tsx` 신설 — `SessionManager` 훈련 모드, 2택(「더 낮아요/더 높아요」), phase idle→playing→choose→feedback→summary. 요약은 `SummaryCard`(음높이 차이·가장 쉬움/어려움, 점수·역치 아님). 전환 4 / 시행 40(pitch2afc `ASSESSMENT` 8/30은 평가용이라 미사용).
- `src/app/explore.tsx` — 「높낮이 비교」 카드(맨 위) + 청취 확인 게이트(음고 트랙 기준음 440Hz) 배선.
- 결과: `npx tsc --noEmit` 0 · 린트 0 · `npm test` 109 통과(로직 변경 없음). **리빌드 불필요**(순수 JS/TSX·핫리로드).

### 안 한 일 / 다음
- **실기기 청취 미확인**(A→B·2택 체감).
- §4-5: 저장 — `SessionTrack`에 `pitch2` 값 추가 + 테스트(`PitchCompareScreen`은 지금 기록 안 함).
- §2 나머지: 온보딩 중복·테마 택1 — 홈/통계 상위 이식 때.

### 단정 금지
- `미검증`: 실기기 A→B 청취·세션 길이/피로.
- `추정`: 톤 1.0s·간격 0.5s(트랙 `AUDIO` 값)·게인 0.15 적정성 실측 안 함. pitch2afc 화면이 trainingFlow의 '다시 듣기' 로직은 아직 안 씀(FreqSessionScreen과 동일하게 자동 재생만).

### 인계 규칙
- **추가+시각** · 새 창: `@docs/handoff.md` + 「인계 이어서」.

---

## 인계 — 2026-08-11 16:31

새 채팅 AI용. 최신: `docs/handoff.md` 상단.

### 지금 상태 (병합 진행 중)
- 브랜치 `merge/harmonitune`에서 작업. 제품=HarmoniTune · 코드 호스트=mnn_1.
- 정본 문서: `docs/merge-plan-harmonitune.md`(계획 §), `docs/merge-host-decision.md`(§4.1 저장 방침). 규칙: `.cursor/rules/android-dev-client.mdc`.

### 한 일 (§4-2·§4-3 완료)
- HH 음고 2AFC 로직 3종 이식 → `src/training/pitch2afc/{StaircaseEngine,SessionManager,trainingFlow}.ts` + `__tests__/*.test.ts`.
- 상수는 mnn UI 테마와 분리(§2-4) → `src/training/pitch2afc/constants.ts` 신설(`STAIRCASE/AUDIO/ASSESSMENT`만 HH `theme.ts`에서 이식).
- pitchUtils 흡수(§4-3) → `src/audio/cents.ts`에 `centsToFreq`(기존 `hzFromCents` 별칭·수식 동일) + `clampFreq` 추가. 오디오→트레이닝 역참조 피하려 `clampFreq` 한도는 인자로, 호출부(StaircaseEngine)가 `AUDIO` 한도 전달.
- 결과: `npm test` 전체 **109 통과**(pitch2afc 86 + 기존 sessionStore 23), 린트 0. 리빌드 불필요(순수 TS).

### 안 한 일 / 다음
- §4-4: 「높낮이 비교」 세션 화면을 mnn 라우팅에 붙이고 **실기기 청취 확인**.
- HH `@harmonitune/sessions` → mnn `sessionStore` 마이그레이션 코드 없음(로직만 이식). 저장은 v2 키 신설 없이 기존 `sessionStore`의 `track` 값 확장(§2-2).
- §2 미결정: 역치·「평가」 카피(권고 a), 온보딩 중복, 테마 택1 — UI 이식 전에 정해야 카피 안 섞임(§2-1은 실제 충돌).

### 단정 금지
- `미검증`: 3트랙 합쳤을 때 세션 길이·이탈·피로, 실기기 청취.
- `추정`: `pitch2afc/constants.ts` 분리가 최종 위치라는 보장 없음(3종 완성 후 재검토 가능).

### 인계 규칙
- **추가+시각** · 새 창: `@docs/handoff.md` + 「인계 이어서」.

---

## 인계 — 2026-08-06 17:01

새 채팅 AI용. 최신: `docs/handoff.md` 상단.

### 프로젝트
- `d:\mnn_1` · rn-hear-1 · Android · Expo Go 불가 / **dev-client**
- Expo 57 / RN 0.86 / `react-native-audio-api` ^0.13.2
- 규칙: `.cursor/rules/android-dev-client.mdc` · 설계: `docs/amp-mdt-training-design.md` · 로그: `docs/impl-log.md`

### 제품 합의 (확실)
- 웰니스·훈련 · 효과 카피 금지(**미검증**)
- **②**·**①** 에뮬 청취·세션 종료·요약 min/max 확인
- 「기기에 기록했어요」 **에뮬 문구 수동 확인함**(사용자)
- §4.4 **임시 DOI + 전문가 미검토** · **DOI 검수 보류**(외부 대기 · 피드백 오면 수정 검토)
- **자극 스펙 임시값 유지**(유지≠확정 · 자격상 임의 확정 안 함) · 전환 목표 **4**
- **세션 영속 MVP** · **이력 목록 UI 반영** · 커밋 `ec53d8f` 푸시됨
- **연습 기록 UI 방향**(16:37): 목업 전체 비채택. **일부**: 다색·그래프/게이지 소수. **미적용**: score 카피·전환 카드 중복·난이도 축 시각화
- 숨김 파일럿 설정(길게 누르기 등)=**최후 수단·미구현**(지금은 상수 유지)
- UI 순화 · 요약: 전환 평균 + 가장 쉬움/어려움(**≠점수·역치**)
- 테마: `theme.ts` 흑·백·회색 위주 → **다음: 액센트 다색 일부**(합의)
- 인계문: **추가+시각** · 새 창: `@docs/handoff.md` + 「인계 이어서」
- ① 3AFC: 정답 1 · 오답 2 · `chosenIndex === oddIndex`

### 한 일 (이번·직전)
| 내용 | 경로/비고 |
|------|-----------|
| UI 방향 합의 문서화 | `impl-log` 16:37 · 설계 §8 · **이번 인계에 반영** |
| 이력 UI·문서 커밋·푸시 | `ec53d8f` → `origin/two_feat` |
| 저장 문구 에뮬 확인 | 사용자 수동 확인 |
| 이력 목록 UI(이전) | `SessionHistoryScreen.tsx` · `explore.tsx` |
| 영속 MVP·DOI(이전) | `sessionStore` · 보류 `e95ed2a` |

### 안 한 일
- 이력 UI 다색·게이지/그래프 **구현**(합의만)
- 클라우드 · 페이징
- 자극 스펙 **확정** · DOI **전문가 검수**
- 숨김 파일럿 설정 UI

### 세션 (코드 · 임시 유지)
- 전환 4 / 시행 40 / 수동 · 키 `training.sessionHistory.v1` · 최대 50
- 공통: n=3 · 0.5s · ISI 0.35s · gain 0.15 · ramp 0.03s
- ② Δ 10~150 ±10 시작 150 · ① depth 0~-40 · 요약≠역치
- 영속·이력: `sessionStore.ts` · `SessionHistoryScreen.tsx` · `goSummary`

### 핵심 경로
- ① `AmSessionScreen` 계열 · ② `FreqSessionScreen` 계열
- 영속·이력: `sessionStore` · `SessionHistoryScreen` · `explore`
- 테마: `src/constants/theme.ts`

### 다음 (권장)
1. (선택) `theme.ts` 액센트 일부 + 이력 게이지/그래프 1~2개(과하지 않게)
2. (후순위) 자극 확정 · DOI 검수 · 숨김 파일럿 설정

### 단정 금지
효과 미검증 · 임시값≠확정 · 평균·min/max≠역치 · 저장≠진단 · 색·게이지 구체 스펙 미정 · 시각화≠점수

---

## 인계 — 2026-08-06 17:01

새 채팅 AI용. 최신: `docs/handoff.md` 상단.

### 프로젝트
- `d:\mnn_1` · rn-hear-1 · Android · Expo Go 불가 / **dev-client**
- Expo 57 / RN 0.86 / `react-native-audio-api` ^0.13.2
- 규칙: `.cursor/rules/android-dev-client.mdc` · 설계: `docs/amp-mdt-training-design.md` · 로그: `docs/impl-log.md`

### 제품 합의 (확실)
- 웰니스·훈련 · 효과 카피 금지(**미검증**)
- **②**·**①** 에뮬 청취·세션 종료·요약 min/max 확인
- 「기기에 기록했어요」 **에뮬 문구 수동 확인함**(사용자)
- §4.4 **임시 DOI + 전문가 미검토** · **DOI 검수 보류**(외부 대기 · 피드백 오면 수정 검토)
- **자극 스펙 임시값 유지**(유지≠확정 · 자격상 임의 확정 안 함) · 전환 목표 **4**
- **세션 영속 MVP** · **이력 목록 UI 반영** · 커밋 `ec53d8f` 푸시됨
- **연습 기록 UI 방향**(16:37): 목업 전체 비채택. **일부**: 다색·그래프/게이지 소수. **미적용**: score 카피·전환 카드 중복·난이도 축 시각화
- 숨김 파일럿 설정(길게 누르기 등)=**최후 수단·미구현**(지금은 상수 유지)
- UI 순화 · 요약: 전환 평균 + 가장 쉬움/어려움(**≠점수·역치**)
- 테마: `theme.ts` 흑·백·회색 위주 → **다음: 액센트 다색 일부**(합의)
- 인계문: **추가+시각** · 새 창: `@docs/handoff.md` + 「인계 이어서」
- ① 3AFC: 정답 1 · 오답 2 · `chosenIndex === oddIndex`

### 한 일 (이번·직전)
| 내용 | 경로/비고 |
|------|-----------|
| UI 방향 합의 문서화 | `impl-log` 16:37 · 설계 §8 · **이번 인계에 반영** |
| 이력 UI·문서 커밋·푸시 | `ec53d8f` → `origin/two_feat` |
| 저장 문구 에뮬 확인 | 사용자 수동 확인 |
| 이력 목록 UI(이전) | `SessionHistoryScreen.tsx` · `explore.tsx` |
| 영속 MVP·DOI(이전) | `sessionStore` · 보류 `e95ed2a` |

### 안 한 일
- 이력 UI 다색·게이지/그래프 **구현**(합의만)
- 클라우드 · 페이징
- 자극 스펙 **확정** · DOI **전문가 검수**
- 숨김 파일럿 설정 UI

### 세션 (코드 · 임시 유지)
- 전환 4 / 시행 40 / 수동 · 키 `training.sessionHistory.v1` · 최대 50
- 공통: n=3 · 0.5s · ISI 0.35s · gain 0.15 · ramp 0.03s
- ② Δ 10~150 ±10 시작 150 · ① depth 0~-40 · 요약≠역치
- 영속·이력: `sessionStore.ts` · `SessionHistoryScreen.tsx` · `goSummary`

### 핵심 경로
- ① `AmSessionScreen` 계열 · ② `FreqSessionScreen` 계열
- 영속·이력: `sessionStore` · `SessionHistoryScreen` · `explore`
- 테마: `src/constants/theme.ts`

### 다음 (권장)
1. (선택) `theme.ts` 액센트 일부 + 이력 게이지/그래프 1~2개(과하지 않게)
2. (후순위) 자극 확정 · DOI 검수 · 숨김 파일럿 설정

### 단정 금지
효과 미검증 · 임시값≠확정 · 평균·min/max≠역치 · 저장≠진단 · 색·게이지 구체 스펙 미정 · 시각화≠점수

## 인계 — 2026-08-06 16:19

새 채팅 AI용. 최신: `docs/handoff.md` 상단.

### 프로젝트
- `d:\mnn_1` · rn-hear-1 · Android · Expo Go 불가 / **dev-client**
- Expo 57 / RN 0.86 / `react-native-audio-api` ^0.13.2
- 규칙: `.cursor/rules/android-dev-client.mdc` · 설계: `docs/amp-mdt-training-design.md` · 로그: `docs/impl-log.md`

### 제품 합의 (확실)
- 웰니스·훈련 · 효과 카피 금지(**미검증**)
- **②**·**①** 에뮬 청취·세션 종료·요약 min/max 확인
- §4.4 **임시 DOI + 전문가 미검토**(문서만 · 효과 증명 아님) · **DOI 검수 보류**(외부 전문가 대기)
- **자극 스펙 임시값 유지**(15:15 결정 · 유지≠확정) · 전환 목표 **4**
- **세션 영속 MVP**(요약만 AsyncStorage · ①② 합쳐 최대 50 · 최신 앞)
- **이력 목록 UI 반영**(연습 탭 「연습 기록」 · FlatList · 배치·글자 크기 조정)
- UI 순화 완료 · 요약: 전환 평균 + **가장 쉬움/어려움**(점수·역치 아님)
- 테마: `theme.ts` **흑·백·회색** 위주(색 개편 아직 없음)
- 인계문: **추가+시각** · `## 인계 — YYYY-MM-DD HH:mm`
- 매 시행(① 3AFC): **정답(떨림) 1 · 오답 선택지 2** · 채점=`chosenIndex === oddIndex`
- 새 창: `@docs/handoff.md` 또는 「인계 이어서」→ 상단 블록

### 한 일 (이번·직전)
| 내용 | 경로/비고 |
|------|-----------|
| 이력 목록 UI | `SessionHistoryScreen.tsx` · `explore.tsx` 「연습 기록」 |
| 카드 배치·타이포 | 제목\|날짜 · 연습/정답/전환 3열 · 라벨·값 행 · 제목 28 |
| TS 유니온 좁히기 | `record.track` 분기 안 `summary` · `tsc` 통과 |
| 세션 영속 MVP(이전) | `sessionStore.ts` · 「기기에 기록했어요」 · `ecfca5c` |
| DOI(이전) | 검수 **보류** · §4.4 · `e95ed2a` |
| 자극 스펙 | **유지**(숫자 미조정) |

### 안 한 일
- 「기기에 기록했어요」 **에뮬 문구 수동 확인**(코드 경로는 있음 · 목록 노출은 사용자 확인)
- 클라우드 동기화 · 페이지/idx 페이징(50건 FlatList로 충분 합의)
- 앱 색상 개편
- 자극 스펙 **확정**(임상·전문가)
- DOI **전문가 검수**(보류)

### 세션 (코드 · 임시 유지)
- 전환 4 또는 시행 40 / 수동
- 종료 시 요약 → AsyncStorage(`training.sessionHistory.v1`) · ①② 합쳐 최대 50 · 오래된 것부터 삭제
- 공통: n=3 · 0.5s · ISI 0.35s · gain 0.15 · ramp 0.03s
- ② Δ 10~150 ±10 시작 150 · 기준 440 Hz
- ① carrier 1000 · fm 8 Hz · depth 0~-40 시작 0 · 스텝 6→(전환2후)2
- 요약: 최근 전환 평균 + history easiest/hardest · **≠역치·점수**
- 스펙 상수: `pureTone.ts` · `freqAfcTrial.ts` · `freqStaircase.ts` · `freqSession.ts` · `amTone.ts` · `amStaircase.ts`
- 영속·이력: `sessionStore.ts` · `SessionHistoryScreen.tsx` · `Freq`/`Am` `goSummary`

### 핵심 경로
- ①: `amTone.ts` · `amAfcTrial.ts` · `amStaircase.ts` · `amSession.ts` · `AmSessionScreen.tsx`
- ②: `freqSession.ts` · `FreqSessionScreen.tsx` (+ 순음·AFC·계단)
- 영속·이력: `sessionStore.ts` · `SessionHistoryScreen.tsx` · `explore.tsx`
- 테마: `src/constants/theme.ts`
- 설계 §4.4·§5~6: `docs/amp-mdt-training-design.md`

### 다음 (권장)
1. 에뮬: ①·② 종료 → 「기기에 기록했어요」 + 연습 기록 목록 재확인
2. (선택) 테마 색상
3. (후순위) 자극 스펙 확정 · DOI 전문가 검수

### 단정 금지
효과 미검증 · 임시값(유지≠확정) · 전환평균·min/max≠역치 · 반전4≠최적 · DOI 전문가 미검토 · 저장≠진단 · fm 8 Hz≠스텝 단위 · 저장 문구 에뮬 **미검증** · 레이아웃 만족도 주관

---

## 인계 — 2026-08-06 15:32

새 채팅 AI용. 최신: `docs/handoff.md` 상단.

### 프로젝트
- `d:\mnn_1` · rn-hear-1 · Android · Expo Go 불가 / **dev-client**
- Expo 57 / RN 0.86 / `react-native-audio-api` ^0.13.2
- 규칙: `.cursor/rules/android-dev-client.mdc` · 설계: `docs/amp-mdt-training-design.md` · 로그: `docs/impl-log.md`

### 제품 합의 (확실)
- 웰니스·훈련 · 효과 카피 금지(**미검증**)
- **②**·**①** 에뮬 청취·세션 종료·요약 min/max 확인
- §4.4 **임시 DOI + 전문가 미검토**(문서만 · 효과 증명 아님) · **DOI 검수 보류**(외부 전문가 대기)
- **자극 스펙 임시값 유지**(15:15 결정 · 유지≠확정) · 전환 목표 **4**
- **세션 영속 MVP 코드 반영**(요약만 AsyncStorage · ①② 합쳐 최대 50 · 이력 UI 없음)
- UI 순화 완료 · 요약: 전환 평균 + **가장 쉬움/어려움**(점수·역치 아님)
- 인계문: **추가+시각** · `## 인계 — YYYY-MM-DD HH:mm`
- 매 시행(① 3AFC): **정답(떨림) 1 · 오답 선택지 2** · 채점=`chosenIndex === oddIndex`
- 새 창: `@docs/handoff.md` 또는 「인계 이어서」→ 상단 블록

### 한 일 (이번·직전)
| 내용 | 경로/비고 |
|------|-----------|
| 세션 영속 MVP | `sessionStore.ts` · 요약 저장 · 「기기에 기록했어요」 · `ecfca5c` |
| DOI | 검수 **보류** · §4.4 외부 전문가 대기 표기 · `e95ed2a` |
| 문서 커밋 | handoff·impl-log·설계 · `e95ed2a`(필수 요청 반영) |
| 자극 스펙 | **유지**(숫자 미조정) |
| ② min/max(이전) | 에뮬: 연습15·정답13·전환4 · 약125 · 쉬움150·어려움110 |
| ① 요약(이전) | 예: 연습18·정답15·전환4 · 떨림약-17.5 · 쉬움0.0·어려움-22.0 |
| min/max 커밋 | `e378763` |

### 안 한 일
- 영속 **에뮬 수동 확인**(종료→저장 문구)
- 이력 목록 UI · 클라우드 동기화
- 자극 스펙 **확정**(임상·전문가)
- DOI **전문가 검수**(보류)

### 세션 (코드 · 임시 유지)
- 전환 4 또는 시행 40 / 수동
- 종료 시 요약 → AsyncStorage(`training.sessionHistory.v1`) · ①② 합쳐 최대 50 · 오래된 것부터 삭제 · 1건≈0.3KB
- 공통: n=3 · 0.5s · ISI 0.35s · gain 0.15 · ramp 0.03s
- ② Δ 10~150 ±10 시작 150 · 기준 440 Hz
- ① carrier 1000 · fm 8 Hz · depth 0~-40 시작 0 · 스텝 6→(전환2후)2
- 요약: 최근 전환 평균 + history easiest/hardest · **≠역치·점수**
- 스펙 상수: `pureTone.ts` · `freqAfcTrial.ts` · `freqStaircase.ts` · `freqSession.ts` · `amTone.ts` · `amStaircase.ts`
- 영속: `sessionStore.ts` · `FreqSessionScreen`/`AmSessionScreen` `goSummary`

### 핵심 경로
- ①: `amTone.ts` · `amAfcTrial.ts` · `amStaircase.ts` · `amSession.ts` · `AmSessionScreen.tsx`
- ②: `freqSession.ts` · `FreqSessionScreen.tsx` (+ 순음·AFC·계단)
- 영속: `sessionStore.ts`
- 설계 §4.4·§5~6: `docs/amp-mdt-training-design.md`

### 다음 (권장)
1. 에뮬: ①·② 종료 → 「기기에 기록했어요」 확인
2. (선택) 이력 목록 UI
3. (후순위) 자극 스펙 확정 · DOI 전문가 검수

### 단정 금지
효과 미검증 · 임시값(유지≠확정) · 전환평균·min/max≠역치 · 반전4≠최적 · DOI 전문가 미검토 · 저장≠진단 · fm 8 Hz≠스텝 단위 · 영속 에뮬 확인 **미검증**

---

## 인계 — 2026-08-06 15:15

새 채팅 AI용. 최신: `docs/handoff.md` 상단.

### 프로젝트
- `d:\mnn_1` · rn-hear-1 · Android · Expo Go 불가 / **dev-client**
- Expo 57 / RN 0.86 / `react-native-audio-api` ^0.13.2
- 규칙: `.cursor/rules/android-dev-client.mdc` · 설계: `docs/amp-mdt-training-design.md` · 로그: `docs/impl-log.md`

### 제품 합의 (확실)
- 웰니스·훈련 · 효과 카피 금지(**미검증**) · 영속 **이후**
- **②**·**①** 에뮬 청취·세션 종료·요약 min/max 확인
- §4.4 **임시 DOI + 전문가 미검토**(문서만 · 효과 증명 아님)
- **자극 스펙 임시값 유지**(사용자 결정 2026-08-06 15:15 · 코드 변경 없음) · 전환 목표 **4**
- UI 순화 완료 · 「총 기회」비추천 · 요약: 전환 평균 + **가장 쉬움/어려움**(점수·역치 아님)
- 인계문: **추가+시각** · `## 인계 — YYYY-MM-DD HH:mm`
- 매 시행(① 3AFC): **정답(떨림) 1 · 오답 선택지 2** · 채점=`chosenIndex === oddIndex`
- 새 창: `@docs/handoff.md` 또는 「인계 이어서」→ 상단 블록(규칙에 자동열기 문구는 없음)

### 한 일 (이번·직전)
| 내용 | 경로/비고 |
|------|-----------|
| ② 요약 min/max 재확인 | 에뮬: 연습15·정답13·전환4 · 약125 · 쉬움150·어려움110 |
| 자극 스펙 | **유지** — 숫자 조정 안 함(임시 유지 확정) |
| ① 요약(이전) | 예: 연습18·정답15·전환4 · 떨림약-17.5 · 쉬움0.0·어려움-22.0 |
| min/max 커밋 | `e378763` |
| 이전 커밋 | `b4a345b` 훈련+UI · `1d47980` DOI·handoff · `c7ae65b` 청취준비 로그 |

### 안 한 일
- 자극 스펙 **확정**(임상·전문가) · 세션 영속 · DOI 전문가 검수
- 문서(`handoff`/`impl-log`) 커밋 — 사용자 요청 시

### 세션 (코드 · 임시 유지)
- 전환 4 또는 시행 40 / 수동 · 메모리만
- 공통: n=3 · 0.5s · ISI 0.35s · gain 0.15 · ramp 0.03s
- ② Δ 10~150 ±10 시작 150 · 기준 440 Hz
- ① carrier 1000 · fm 8 Hz · depth 0~-40 시작 0 · 스텝 6→(전환2후)2
- 요약: 최근 전환 평균 + history easiest/hardest · **≠역치·점수**
- 스펙 상수: `pureTone.ts` · `freqAfcTrial.ts` · `freqStaircase.ts` · `freqSession.ts` · `amTone.ts` · `amStaircase.ts`

### 핵심 경로
- ①: `amTone.ts` · `amAfcTrial.ts` · `amStaircase.ts` · `amSession.ts` · `AmSessionScreen.tsx`
- ②: `freqSession.ts` · `FreqSessionScreen.tsx` (+ 기존 순음·AFC·계단)
- 설계 §4.4·§5~6: `docs/amp-mdt-training-design.md`

### 다음 (권장)
1. 영속(세션 저장) — 후순위
2. DOI 전문가 검수 — 후순위
3. 문서(`handoff`/`impl-log`) 커밋 — 사용자 요청 시

### 단정 금지
효과 미검증 · 임시값(유지≠확정) · 전환평균·min/max≠역치 · 반전4≠최적 · DOI 전문가 미검토 · fm 8 Hz≠스텝 단위(변조 속도)

---

## 인계 — 2026-08-06 14:22

새 채팅 AI용. 최신: `docs/handoff.md` 상단.

### 프로젝트
- `d:\mnn_1` · rn-hear-1 · Android · Expo Go 불가 / **dev-client**
- Expo 57 / RN 0.86 / `react-native-audio-api` ^0.13.2
- 규칙: `.cursor/rules/android-dev-client.mdc` · 설계: `docs/amp-mdt-training-design.md` · 로그: `docs/impl-log.md`

### 제품 합의 (확실)
- 웰니스·훈련 · 효과 카피 금지(**미검증**) · 영속 **이후**
- **②** 파일럿 청취 완료 · **①** 에뮬 청취·세션 종료·요약 min/max 확인
- §4.4 **임시 DOI + 전문가 미검토**(문서만 · 효과 증명 아님) · 자극 스펙 **임시 유지** · 전환 목표 **4**
- UI 순화 완료 · 「총 기회」비추천 · 요약: 전환 평균 + **가장 쉬움/어려움**(점수·역치 아님)
- 인계문: **추가+시각** · `## 인계 — YYYY-MM-DD HH:mm`
- 매 시행(① 3AFC): **정답(떨림) 1 · 오답 선택지 2** · 채점=`chosenIndex === oddIndex`

### 한 일 (이번·직전)
| 내용 | 경로/비고 |
|------|-----------|
| ① 요약 수동 확인 | 예: 연습18·정답15·전환4 · 떨림약-17.5 · 쉬움0.0·어려움-22.0 |
| 채점·요약 교차검증 | `amAfcTrial`·`summarizeAmSession` — 오답→정답 버그 없음(코드) |
| §4.4 DOI 의미 정리 | 임시 문헌 표 · 사용자 안내용 효과 주장 방지 |
| min/max **커밋** | `e378763` — 이전 인계의「커밋됨」혼동 정정: 코드만 있던 상태→이제 커밋됨 |
| 이전 커밋 | `b4a345b` 훈련+UI · `1d47980` DOI·handoff · `c7ae65b` 청취준비 로그 |

### 안 한 일
- 자극 스펙 확정 · 세션 영속 · DOI 전문가 검수
- ② 요약 min/max reload 재확인(선택) · `impl-log` 최신 항목·handoff 문서 자체는 **미커밋**일 수 있음

### 세션 (코드)
- 전환 4 또는 시행 40 / 수동 · 메모리만
- ② Δ 10~150 ±10 시작 150 · ① depth 0~-40 시작 0 스텝 6→(전환2후)2
- 요약: 최근 전환 평균 + history easiest/hardest · **≠역치·점수**

### 핵심 경로
- ①: `amTone.ts` · `amAfcTrial.ts` · `amStaircase.ts` · `amSession.ts` · `AmSessionScreen.tsx`
- ②: `freqSession.ts` · `FreqSessionScreen.tsx` (+ 기존 순음·AFC·계단)
- 설계 §4.4: `docs/amp-mdt-training-design.md`

### 다음 (권장)
1. 자극 스펙 피드백(유지/조정)
2. ② min/max 요약 한 번 더 확인(선택)
3. 영속·DOI 전문가 검수(후순위) · 문서(`handoff`/`impl-log`) 커밋은 사용자 요청 시

### 단정 금지
효과 미검증 · 임시값 · 전환평균·min/max≠역치 · 반전4≠최적 · DOI 전문가 미검토 · 체감「틀린 것 같은데 맞춤」≠채점 버그(추정·지각)

---

## 인계 — 2026-08-06 13:27

### 프로젝트
- `d:\mnn_1` · rn-hear-1 · Android · Expo Go 불가 / **dev-client**
- Expo 57 / RN 0.86 / `react-native-audio-api` ^0.13.2
- 규칙: `.cursor/rules/android-dev-client.mdc` · 설계: `docs/amp-mdt-training-design.md` · 로그: `docs/impl-log.md`

### 제품 합의 (확실)
- 웰니스·훈련 · 효과 카피 금지(**미검증**) · 영속 **이후**
- **②** 파일럿 청취 완료 · **①** 에뮬 청취·세션 종료 확인(전환4)
- §4.4 **임시 DOI + 전문가 미검토** 반영됨 · 자극 스펙 **임시 유지** · 반전(전환) 목표 **4**
- UI: `cent`/`Δ`/`반전` → 쉬운 말 · 「총 기회」**비추천** · 「전환」유지
- 요약: 전환 평균 + **이번 연습 가장 쉬움/어려움**(점수·역치 아님)
- 인계문: **추가+시각** · `## 인계 — YYYY-MM-DD HH:mm`

### 한 일
| 내용 | 경로/비고 |
|------|-----------|
| ① 에뮬 청취 | 사용자 세션 예: 14·전환4·약-5.5 / 22·전환4·약-9.5 |
| UI 순화 | `Freq`·`AmSessionScreen`·`explore`·`index`·`endReasonLabel` |
| §4.4 임시 DOI | `amp-mdt-training-design.md` (Levitt·Amitay·Galvin·Chatterjee 등) |
| 요약 min/max | `easiest*`/`hardest*` in `freqSession`·`amSession` + UI |
| 커밋(two_feat) | `b4a345b` 훈련+UI · `1d47980` DOI·handoff · `c7ae65b` 청취준비 로그 — **min/max는 커밋 후 변경**일 수 있음 |

### 안 한 일
- 자극 스펙 확정 · 세션 영속 · DOI 전문가 검수 · 요약 min/max **reload 재확인**(코드는 반영)
- Metro 중단됨 → `npm start` 재기동 필요할 수 있음

### 세션 (코드)
- 전환=방향 바뀜 **4** 또는 시행 **40** / 수동 · 메모리만
- ② Δ 10~150 ±10 시작 150 · ① depth 0~-40 시작 0 스텝 6→(전환2후)2
- 요약: 최근 전환 평균 + history easiest/hardest · **≠역치·점수**

### 에뮬
- 무음 → **Cold Boot** · JS는 Metro reload

### 다음 (권장)
1. 요약「가장 쉬움/어려움」reload 확인(①·②) · 필요 시 커밋  
2. 자극 스펙 유지/조정(사용자 피드백)  
3. 영속·DOI 전문가 검수(후순위)

### 단정 금지
효과 미검증 · 임시값 추정 · 전환평균·min/max≠역치 · 반전4=최적 보장 없음 · DOI 전문가 미검토

---

## 인계 — 2026-08-06 12:59

### 프로젝트
- `d:\mnn_1` · rn-hear-1 · Android 우선 · Expo Go 불가 / **dev-client**
- Expo 57 / RN 0.86 / React 19 / `react-native-audio-api` ^0.13.2
- 규칙: `.cursor/rules/android-dev-client.mdc`만 · 설계: `docs/amp-mdt-training-design.md` · 로그: `docs/impl-log.md`

### 제품 합의 (확실)
- **웰니스·훈련** (진단/스크리닝 아님) · 효과 카피 금지(**미검증**) · 영속 **이후**
- **②** MVP + 에뮬 파일럿 청취 완료 · **①** 코드 MVP 있음(청취 미완)
- DOI = 임시+전문가 미검토(**§4.4 미반영**) · 자극 스펙 임시 유지 · **반전 목표 4**(세션 김)
- UI `cent`/`Δ`/`반전` 순화 필요 · 「총 기회」**비추천**
- 인계문: `handoff.md`·날짜본 **추가+시각**(덮어쓰기 금지). 제목 `## 인계 — YYYY-MM-DD HH:mm`

### 한 일
| 내용 | 경로 |
|------|------|
| ② 전 경로 | `pureTone`·`freqAfcTrial`·`freqStaircase`·`freqSession`·`FreqSessionScreen` |
| ① AM MVP | `amTone`~`AmSessionScreen` · `explore` 트랙 선택 |
| 반전 6→4 | `DEFAULT_TARGET_REVERSALS=4` (②·① 공유) |
| 인계문 규칙 | 출력=저장 · **추가+시각** · Ask 본문만 금지 |

### 안 한 일
- ① 에뮬/기기 청취 · §4.4 DOI 표 · UI 순화 · 자극 확정 · 세션 영속

### 세션 (코드)
- 반전=**방향 전환** **4**회 또는 시행 **40** / 수동 · 요약 평균≠역치 · 메모리만
- Δ 10~150 · ±10 · 시작 150 · n/ISI/dur/gain/ramp 임시 `3`/`0.35s`/`0.5s`/`0.15`/`30ms`

### 에뮬
- 무음 → **Cold Boot** 후 소리 · JS 변경은 Metro reload(리빌드 보통 불필요)

### 다음 (권장)
1. **① 떨림 찾기 청취**  
2. **UI 용어 순화**  
3. **§4.4 임시 DOI**  

### 단정 금지
효과 미검증 · 임시값 추정 · 반전평균≠역치 · 반전4=최적 보장 없음 · AudioContext 순음/AM 분리(`주의`)

---

## 인계 — 2026-08-06 12:58

### 프로젝트
- 경로: `d:\mnn_1` (앱명 rn-hear-1, 청능 웰니스·훈련, Android 우선, Expo Go 불가 / **dev-client**)
- 스택: Expo SDK 57 / RN 0.86 / React 19 / `react-native-audio-api` ^0.13.2
- always 규칙: `.cursor/rules/android-dev-client.mdc`만 (`AGENTS.md`·`.cursorrules` 없음)
- 큰 그림: `docs/amp-mdt-training-design.md` · 로그: `docs/impl-log.md`

### 제품 합의 (확실)
- 병원식 **진단/스크리닝 아님** → **웰니스·훈련**
- **② 주파수 변별** (cent 10~150, ±10, 2-down-1-up, n-AFC “다른 음”, HarmoniTune **숫자만** 재사용) — MVP·에뮬 파일럿 청취 완료
- **① AM/포락선** = CI 중심 **후순위**였으나 **코드 MVP 착수 완료**(에뮬/기기 청취는 미완)
- 엔진: `react-native-audio-api`. **SoundPool 배제**
- 훈련 UI: 정적·경량. **난이도를 시각에 연동 금지**
- 효과: **미검증** → 카피 금지
- **세션 영속**: MVP **필수 아님** → **이후**
- DOI: **임시 목록 + 전문가 미검토**로 문서에 두는 방향 합의(§4.4 아직 미반영)
- 자극 스펙: n/ISI/duration/gain/ramp 등은 **당분간 임시 유지**. 세션 길이만 피드백 반영(반전 4)

### 사용자 이해 수준 (참고)
- 2-down-1-up·반전(=방향 전환)·내부 참고 Δ 정도는 이해함
- 「반전→총 기회」순화는 **비추천으로 합의에 가까움**(의미 왜곡)
- UI에 `cent`·`Δ`·`반전` 등 **쉬운 카피 필요** 공감(아직 미반영)

### 기록 원칙 (확실)
- 로그/설계: **근거·결정·결과** + **단정 금지**(없으면 `없음`)
- 인계문: `handoff.md`·날짜본은 **추가+시각**(덮어쓰기 금지). Ask에서는 본문만 금지

### 한 일
| 내용 | 경로 |
|------|------|
| ② 순음~세션·UI | `pureTone.ts`, `cents.ts`, `freqAfcTrial.ts`, `freqStaircase.ts`, `freqSession.ts`, `FreqSessionScreen.tsx` |
| ① AM MVP 코드 | `amTone.ts`, `amAfcTrial.ts`, `amStaircase.ts`, `amSession.ts`, `AmSessionScreen.tsx` |
| 연습 트랙 선택 | `src/app/explore.tsx` (다른 음 / 떨림), 홈 `index.tsx` |
| 반전 목표 6→4 | `freqSession.ts` `DEFAULT_TARGET_REVERSALS=4` (②·① 공유) |
| 인계문 자동저장·추가 규칙 | `.cursor/rules/android-dev-client.mdc` |
| 설계·로그 | `docs/amp-mdt-training-design.md`, `docs/impl-log.md` |

### 안 한 일 (중요)
- ① **에뮬/기기 청취** 미실행
- §4.4 **임시 DOI 표** 미반영(합의만)
- UI 용어 순화(`cent`/`Δ`/`반전`/`포락선` 등) **미반영**
- 자극 스펙 **제품 확정 아님**(길이 피드백만 반전 4)
- **세션 영속** — 이후
- README 웰니스 카피 후속 가능

### 세션 종료 (코드)
- **반전** = 난이도 **방향 전환**(연속 2정→down, 1오→up, 방향이 바뀔 때만 +1). **4회 → 자동 종료**
- 또는 시행 **40** / 수동
- 요약: 최근 반전 **4**개 평균(②=Δ cent, ①=깊이 dB) — **진단 역치 아님** · 메모리만
- 전부 정답만 하면 반전≈0 → **시행 40**으로 종료. Δ는 ~28시행에 하한 10 가능

### 현 시점 자극·세션 숫자

| 항목 | 상태 | 값 / 비고 |
|------|------|-----------|
| 엔진·과제·cent·A4/±10/10~150 | 확정 | — |
| n / ISI / duration / gain / ramp | **임시** | `3` / `0.35s` / `0.5s` / `0.15` / `30ms` |
| 시작 Δ | **임시** | `150` cent |
| 종료 반전 | **파일럿** | `4` (청취: 세션 김) |
| 최대 시행 | **임시** | `40` |
| 요약 평균 | **임시** | 최근 반전 `4` · **역치 아님** |

### 기기·에뮬 메모
- ② 에뮬: UI「듣는 중→고르세요」는 되는데 **무음**이던 적 있음 → **Cold Boot 후 소리 남**(에뮬 오디오). 앱 경로 자체는 정상으로 봄
- ② 파일럿: 세션 **길다** → 반전 4. 그 외(클릭·ISI 등) 큰 불만 메모 없음. 요약 예: 평균 Δ **133**(반올림 가능, 유효)
- JS만 바꾸면 **리빌드 불필요**(Metro reload). `npm run android -c` 비추천 → 필요 시 `npm run android -- -c` 또는 `expo start -c`

### 다음 작업 (권장 순)
세션 영속은 **이후**. 사용자 선택:
1. **①「떨림 찾기」에뮬 청취** (소리·클릭·길이)
2. **UI 용어 순화** (`cent`/`Δ`/`반전`/`포락선`/`dB` 등 — 「총 기회」는 비추천)
3. **§4.4 임시 DOI + 전문가 미검토** (문서만)

### 비고
- 탭: 홈 / 연습. Δ·난이도 시각 연동 금지
- AudioContext 순음/AM **분리 2개** — 장기 공유 검토 가능(`주의`)
- 홈 AnimatedIcon 제거는 ②-5 필수 아님

### 핵심 문서
- `@docs/amp-mdt-training-design.md` · `@docs/impl-log.md` · `@docs/handoff.md`
- `@docs/dev-client-setup-context.md` · `@.cursor/rules/android-dev-client.mdc`

### 단정 금지
- 효과 **미검증** · CI/비CI **관례/가설** · 임시값 **추정**
- HarmoniTune≠임상 · 반전 평균≠역치 · 반전4=최적 길이 **보장 없음**
