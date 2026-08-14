# 인계문 로그 — rn-hear-1 / mnn_1

> **대상**: 새 채팅 AI. 사용자는 맥락을 이미 앎.  
> **방식**: 「인계문 작성해」 시 **덮어쓰지 말고 최신 블록을 맨 위에 추가**. 각 블록 제목: `## 인계 — YYYY-MM-DD HH:mm`.  
> 본문: **이번 세션 변경 + 다음**만. 앱 전체 상태는 `docs/improvement-backlog.md`(진행 현황·§0). 복붙 금지.  
> 인계 저장만으로 `impl-log`에 한 줄 **넣지 않음**. 대화만이면 인계 생략. Ask에서는 본문만 올리지 말 것.  
> **날짜별 사본은 만들지 않는다**(2026-08-07). 규칙: `.cursor/rules/android-dev-client.mdc`

---

## 인계 — 2026-08-14 11:17

새 채팅 AI용. **이번 세션 = 백로그 상태 맞춤 + 통계 추이 배지 삭제 + 목록 측정 배지.** 리빌드 불필요(JS·문서).

### 합의
- 문서: 갱신형(백로그)은 그 자리를 고침. 누적형(impl-log·인계)은 위에만 추가.
- 추이 「개선/유지」 문구·빈 배지 **삭제**. 비교는 `처음→최근` / `최근 3회 평균→최근` 한 줄만.
- 집계·그래프=측정만 → **문제 아님**. 연습은 목록에 남음.
- 목록 배지: 연습→「연습」, 측정→「측정」. `mode` 없는 구버전=배지 없음.
- 다시 듣기: **세 트랙 화면 모두 없음**(pitch2 `trainingFlow` 로직만). UI를 로직으로 착각하지 말 것.

### 한 일
- `improvement-backlog.md` 진행 표 2026-08-14·§0·P1-1/P1-4/P2-4/P2-7/P2-8 배지. easy 옛 서술 정정. impl-log 인계용 한 줄 **안 넣음**(표 맞춤).
- `ScoreFraming` 배지 View 제거. `highlightTint`·`positiveTint` 삭제. `positive`는 통계 아이콘용 유지.
- `HistoryCard`: `sessionModeLabel`.

### 안 한 일
- 트랙 필터·건별 삭제·전체삭제 분리. P2-5(방금 차이 수치). 다시 듣기 UI. 커밋.

### 핵심 경로
- `docs/improvement-backlog.md` · `src/training/SessionHistoryScreen.tsx` · `src/constants/theme.ts` · `src/training/sessionMode.ts`

### 다음
- 실기기: 그래프 헤더 숫자 한 줄, 목록 「연습」/「측정」 배지.
- 커밋은 사용자 직접.

### 단정 금지
- `미검증`: 실기기 배지·그래프 헤더 레이아웃.
- `주의`: 빈 배지용 주황은 넣었다가 배지 삭제로 같이 제거됨.

---

## 인계 — 2026-08-13 17:04

새 채팅 AI용. 사용자는 맥락 앎 → 장문 금지. **이번 세션 = 기록 중복 축소. 앱 코드 변경 없음.**

### 한 일
- 인계 저장용 `impl-log` 한 줄 **폐지**. 대화만 인계 **생략**. 인계 본문에 앱 상태 복붙 **금지**(상태는 백로그).
- 설계 문서에서 계단식 **숫자 복사 제거**. 의미·코드 경로만. 정본=코드 상수.
- 반영: `.cursor/rules/android-dev-client.mdc`, `docs/handoff.md` 헤더, `docs/README.md`, `amp-mdt-training-design.md`. 작업 기록은 `impl-log` **16:49**(구현·규칙 변경이라 남김).
- 마무리 문구: 「마무리. 실질 변경 없으면 인계 생략」→ 판단만. 쓸 때는 「인계문 작성해」.

### 합의(문서 성격)
- 갱신/누적 이분법은 맞음. `merge-plan-harmonitune.md`는 병합 전 계획 → 앱과 숫자 어긋남(정본 아님).
- 백로그는 상태 정본이 맞으나 진행 표는 **2026-08-07**에 멈춤.

### 다음
- 백로그 진행 표를 쓸 거면 후속 갱신. 아니면 손대지 않아도 됨.
- 커밋은 사용자 직접.

### 단정 금지
- `주의`: 옛 인계 블록의 상태 복붙은 누적형이라 그대로 둠.
- **리빌드 불필요.**

---

## 인계 — 2026-08-13 16:40

새 채팅 AI용. 사용자는 맥락 앎 → 장문 금지. **이번 세션 = 설계 문서를 코드에 맞춤(계단식 통일 반영). 앱 코드 변경 없음.**

### 한 일
- `amp-mdt-training-design.md` §3.1·§4.2·§6·§6.1·§7·§8 갱신. freq=pitch2(시작 200·10~300·가변 50/20/10). am 하한 −30·스텝 6→4→2. 연습 4/측정 8. 옛 freq 10~150·±10·시작 150 **폐기**.
- 원인: 8/13 코드·인계·impl-log는 됐는데 **설계 문서만 누락**. 인계 깜빡 ≠ 문서 정본 어긋남(직접 원인은 설계 문서 미갱신).
- 합의: **숫자의 정본=코드 상수**(사실). 문서는 해설. 갱신형은 이 프로젝트 선택(`docs/README.md`).

### 앱 상태 (15:41 승계)
- 계단식 통일·토글·idle UI·모드별 보관 상한(측정 50·연습 30) 완료.
- 실기기 청취·계단식 값 검증 미완. 커밋은 사용자 직접.
- idle `TEXT_SCALE` 코드상 **1.2**.

### 핵심 경로
- `docs/amp-mdt-training-design.md` · 코드 정본: `freqStaircase.ts` · `amStaircase.ts` · `pitch2afc/constants.ts` · `sessionMode.ts`

### 단정 금지
- `미검증`: 통일 값은 설계 목적값, 실측 아님.
- `주의`: am −30은 바닥 반전 몰림 완화만.
- **리빌드 불필요**(문서만).

---

## 인계 — 2026-08-13 16:30

새 채팅 AI용. 사용자는 맥락 앎 → 장문 금지. **이번 세션 = 코드 변경 없음. Cursor 규칙(.mdc / AGENTS.md) 이해·합의만.** 앱 기능 상태는 15:41 인계 그대로.

### 합의 (규칙 구성)
- 강제 규칙 정본: `.cursor/rules/android-dev-client.mdc` (`alwaysApply: true`). YAML은 파일 1~4줄.
- `description` = 목록용 라벨. 「저사양 우선 컨텍스트」= 경량화 전제(별 주제 아님).
- **항상 적용이 맞음.** 내용(인계·Expo Go 금지·Android·경량화·impl-log)이 문서 작업에도 필요 → `globs`로 ts/tsx만 걸면 인계·문서 채팅에서 규칙이 빠짐.
- `AGENTS.md` / `.cursorrules` = **없음.** Cursor만이면 `.mdc` + `docs`로 충분.
- 다른 툴(Antigravity·Codex 등)용으로 `AGENTS.md`를 둘 수는 있음 → **경로만** 짧은 인덱스. 본문 복사 금지. **`.mdc`는 삭제하지 않음**(Cursor 강제 규칙).

### 앱 상태 (변경 없음, 15:41 승계)
- 계단식 통일·연습/측정 토글·idle UI·모드별 보관 상한(측정 50·연습 30) 완료.
- 실기기 청취·계단식 값 검증 미완. 커밋은 사용자 직접.
- idle `TEXT_SCALE` 코드상 **1.2**.

### 다음
- 기능 작업은 15:41 다음 항목. 규칙 파일은 지금 손대지 않아도 됨.

### 단정 금지
- `없음`(대화만). **리빌드 불필요.**

---

## 인계 — 2026-08-13 15:41

새 채팅 AI용. 사용자는 맥락 앎 → 장문 금지. **이번 세션 = 세션 보관 상한을 모드별 독립으로 분리(측정 50·연습 30).** 계단식 통일·토글·idle UI는 이전 인계대로 완료.

### 합의·한 일
- 기존: `MAX_SAVED_SESSIONS=50`, 모드 무관 `slice` → 연습을 자주 하면 오래된 **측정**이 밀려 삭제 → 그래프(측정만) 형상 흔들림.
- 결정: **독립 상한**. `MAX_MEASURE_SESSIONS=50` · `MAX_PRACTICE_SESSIONS=30`(합 최대 80, 총량 상한 없음). 한 모드 초과 시 그 모드 오래된 것만 버림. 타 모드 무간섭.
- `sessionStore.ts`: `capByMode` 신설(`isCountedInStats`로 갈라 각자 `slice` 후 원래 순서 유지). `appendRecord`가 사용.
- 테스트: 측정 50·연습 30 상한 + 연습 쏟아부어도 측정 50 유지. `jest sessionStore` **35 passed**, `tsc` **0 error**.
- 목록은 `FlatList` 전체 스크롤, **페이지네이션 없음**(80개면 충분 — 합의).
- CTA「연습 시작」vs idle 토글(연습/측정)은 단어 겹침 정도의 어색함. **버그 아님**, 이번 미수정.

### 안 한 일 / 다음
- 실기기 청취·계단식 값 검증 그대로 미완.
- 커밋은 사용자가 직접. 추천명: `feat(history): 세션 보관 상한을 모드별 독립으로 분리 (측정 50·연습 30)`
- idle `TEXT_SCALE`은 코드상 **1.2**(15:03 인계의 1.1과 어긋남 — 이후 사용자 조정).

### 핵심 경로
- `src/training/sessionStore.ts`, `__tests__/sessionStore.test.ts`

### 단정 금지
- `미검증`: 실기기 목록 80개 스크롤 체감. 계단식 값 실측 아님.
- `주의`: am 바닥 반전 몰림은 −30 완화만.
- **리빌드 불필요**(JS만).

---

## 인계 — 2026-08-13 15:03

새 채팅 AI용. 사용자는 맥락 앎 → 장문 금지. **11:29 계단식 통일+연습/측정 토글은 완료. 이번 세션 = idle UI 다듬기(토글 대비·간격·글자 배율).**

### 합의·한 일
- 토글 선택 강조: tint만으로는 구분 약함 → **선택 칸 `accent` 테두리**. 글자 밀림 방지: `segment`에 `borderWidth:1.5` + 기본 `transparent`, active만 `borderColor` 변경.
- 토글↔하단 Pill/문구 간격: 세 화면 토글에 `style={{ marginBottom: Spacing.six }}`(64). 사용자가 직접 넣은 값.
- idle("연습 선택"/"듣기 준비") **텍스트만 ×1.1**. 토글 글자·버튼 글자 포함. 진행/요약은 기본 크기.
  - 공용에 `textScale` prop(기본 1): `ActionButton`, `Pill`, `SessionModeToggle`. 화면에서만 1.1 전달 → 통계 화면 등 전역 영향 없음.
  - 적용: `ListeningCheckScreen`(항상 idle), Freq/Am idle 블록, Pitch `SessionHeader` idle + `SessionActions` idle. 상수 `TEXT_SCALE = 1.1`.

### 안 한 일 / 다음
- 실기기 청취·계단식 값 검증은 그대로 미완.
- 배율/간격이 크면 `TEXT_SCALE` 또는 `Spacing.six`만 조정.

### 핵심 경로
- `src/training/SessionModeToggle.tsx`, `sessionMode.ts`
- `src/components/ui/action-button.tsx`, `pill.tsx`
- `FreqSessionScreen.tsx`, `AmSessionScreen.tsx`, `pitch2afc/PitchCompareScreen.tsx`, `ListeningCheckScreen.tsx`

### 단정 금지
- `미검증`: 계단식 값(200·10~300·50/20/10·am −30) 실측 아님. idle ×1.1·간격 64는 체감값.
- `주의`: am 바닥 반전 몰림은 −30 완화만.
- **리빌드 불필요**(JS만).

---

## 인계 — 2026-08-13 11:29

새 채팅 AI용. 사용자는 맥락 앎 → 장문 금지. **11:10 인계의 "세 트랙 계단식 통일 + 연습/측정 토글" 구현 완료. 실기기 확인만 남음.**

### 이번 세션에 한 일 (구현 완료)
- **계단식 통일**: `freqStaircase.ts` 시작150→200·상한150→300·가변스텝 50/20/10(`STEP_SCHEDULE`·`stepForReversals`·`currentStep` 신설, `stepCents` 주면 고정=하위호환). `amStaircase.ts` 하한 −40→−30·3단계 스텝 6/4/2(`STEP_SCHEDULE_DB`). pitch2는 기준이라 변경 없음.
- **연습/측정**: `sessionStore.ts`에 `SessionMode`·레코드 `mode?` 선택필드·`append*(summary, mode)`·`isCountedInStats` 추가(mode 없으면 측정 간주). 통계/추세는 `rows.filter(isCountedInStats)`로 측정만, 목록엔 「연습」 배지. `peekLatestSession`도 측정 기준.
- **UI 신규**: `sessionMode.ts`(상수·헬퍼)+`SessionModeToggle.tsx`(연습/측정 세그먼트 토글) 신설. 세 화면(Freq/Am/PitchCompare) idle에 토글, 기본=연습. 세션 모드는 `runModeRef`로 고정 → 생성 시 `targetReversalsFor(mode)`(4/8), 저장 시 mode 전달.
- **테스트**: `__tests__/freqStaircase.test.ts`·`amStaircase.test.ts` 신규, `sessionStore.test.ts`에 mode 케이스 추가.

### 검증됨 / 안 된 것
- `npx jest src/training` **131 passed**, `tsc --noEmit` **0 error**.
- **실기기 UI·오디오 미확인**(코드/테스트/타입만). 확인은 `npm start` dev client. **리빌드 불필요**(네이티브 변경 없음).

### 다음 작업 (제안)
- 실기기에서 토글 위치·간격·터치 타깃 체감 조정.
- 파일럿 청취로 값(스텝·범위·am −30) 검증.
- Freq/Am 화면 인지복잡도 경고(사전 존재, 토글로 소폭↑) — 필요 시 컴포넌트 분해.

### 단정 금지
- `미검증`: 200·10~300·50/20/10·am −30·6→4→2 전부 설계 목적값, 실측 아님.
- `주의`: am 바닥 반전 몰림은 −30으로 완화만, 근본 해결 아님.
- `확인됨`: 인계에 있던 `LockedTrackChip` ReferenceError는 현재 코드에 없음(해소). "freqStaircase/amStaircase 기존 테스트"는 실제로 없었음 → 신규 작성.

---

## 인계 — 2026-08-13 11:10

새 채팅 AI용. 사용자는 맥락 앎 → 장문 금지. **새 창에서 바로 구현 시작 예정. 아래 합의대로 구현할 것. (직전 11:08 인계에 배경·근거 상세 있음 — 중복 최소화)**

### 지금 바로 할 일: 세 트랙 계단식 통일 구현

**공통 (연습/측정 모드)**
- 토글 2종: **연습**(반전 4회·통계 제외) / **측정**(반전 8회·통계 포함). 둘 다 기록은 남김.
- 스텝은 **가변 하나**로 두고 반전 횟수(4·8)로만 구분. 모드별로 스텝 정책 쪼개지 말 것.
- 엔진 2-down-1-up 유지.

**freq — `src/training/freqStaircase.ts` (로직 변경, 단순 상수 아님)**
- 시작 150→**200**, 범위 10~150→**10~300**, 스텝 고정10→**가변 50→20→10**(전환 반전 2·4).
- 현재 고정 스텝뿐 → pitch2식 가변 스텝 로직 **신규 이식** 필요.

**pitch2 — 변경 없음** (이미 시작200·10~300·가변50/20/10, 기준 역할).

**am — `src/training/amStaircase.ts` (dB, cent 통일 제외)**
- 하한 −40→**−30**, 스텝 6→2→**6→4→2**(전환 반전 2·4). 시작 0 dB 유지.
- `FINE_STEP_AFTER_REVERSALS` 2단계 → 3단계 스케줄 구조로 확장.

### 구현 전 반드시 먼저 읽을 것 (미확인)
- `sessionStore` + 통계/추세 화면 (`SessionHistoryScreen.tsx`, `SummaryCard.tsx`) — **연습/측정 구분 저장·통계 포함 여부 로직이 아직 미확인**. 여기 구조 보고 토글·통계분리 설계 확정할 것.
- `src/training/pitch2afc/PitchCompareScreen.tsx`(`TARGET_REVERSALS=4`), `src/training/freqSession.ts`(`DEFAULT_TARGET_REVERSALS=4`) — 4·8 분기 지점.

### 테스트
- `freqStaircase`·`amStaircase` 스텝/반전 관련 기존 테스트 있음(`__tests__`) → 가변 스텝·3단계·−30 반영해 **같이 수정** 필요.

### 단정 금지
- `파일럿`/`미검증`: 200·10~300·50/20/10·am −30·6→4→2 전부 설계 목적값, 실측 아님.
- `주의`: am 바닥 반전 몰림(역치 뭉개짐)은 −30으로 완화만, 근본 해결 아님.
- `미확인`: `LockedTrackChip` ReferenceError(`SessionHistoryScreen.tsx:556`) 잔존 여부.

---

## 인계 — 2026-08-13 11:08

새 채팅 AI용. 사용자는 맥락 앎 → 장문 금지. **전 구간 Ask 모드(코드 미변경). 이번 세션 = 세 트랙 계단식(staircase) 파라미터 통일 설계 합의. 다음 턴에 사용자가 "이대로 구현 요청" 예정.**

### 합의된 결정 (구현 대상)

**공통 (세션 구조)**
- 모드 2종 토글: **연습 / 측정**
  - 연습 = 반전 **4회** 종료, 기록은 남기되 **통계·추세 제외**
  - 측정 = 반전 **8회** 종료, 기록 + **통계 포함**
- 스텝 정책: 세 트랙 **가변**(초반 크게→후반 작게). 연습·측정용으로 쪼개지 말 것 → **가변 하나로 두고 반전 횟수(4·8)로만 구분**
- 엔진 2-down-1-up 유지

**freq (다른 음 찾기, 3AFC) — 값 변경**
- 시작 150→**200 cent**
- 범위 10~150 → **10~300** (상한 2배)
- 스텝 고정10 → **가변 50→20→10** (전환 반전 2·4)
- → pitch2와 완전 동일하게 통일

**pitch2 (높낮이 비교, 2AFC) — 기존 유지**
- 시작 200 / 범위 10~300 / 가변 50→20→10 (변경 없음)

**am (떨림, 3AFC) — dB라 cent 통일 대상 아님**
- 시작 0 dB 유지
- 하한 −40 → **−30 dB** (−40은 일반인도 감지 불가)
- 스텝 6→2 → **6→4→2** (전환 반전 2·4)
- 구조(2-down-1-up·가변·반전 4/8·통계 분리)는 동일 적용

### 핵심 경로 (구현 시 볼 파일)
- `src/training/freqStaircase.ts` — MIN/MAX/STEP·`DEFAULT_START_DELTA_CENTS`(가변 스텝 로직 신설 필요)
- `src/training/pitch2afc/constants.ts` — `STAIRCASE`(이미 가변, 참고 기준)
- `src/training/amStaircase.ts` — `MIN_DEPTH_DB`·`COARSE/FINE_STEP_DB`·`FINE_STEP_AFTER_REVERSALS`(3단계로 확장 필요)
- `src/training/freqSession.ts` — `DEFAULT_TARGET_REVERSALS=4`(연습/측정 4·8 분기 필요)
- `src/training/pitch2afc/PitchCompareScreen.tsx` — `TARGET_REVERSALS=4`
- `sessionStore`·통계 화면 — **연습/측정 구분 저장·통계 로직(미확인, 읽어야 함)**

### 다음 작업
- 사용자가 위 결정대로 **구현 요청 예정**. Agent에서 진행.
- freq는 현재 **고정 스텝** → pitch2식 가변 스텝 로직 신규 이식 필요(단순 상수 변경 아님).
- am 스텝 2단계→3단계 스케줄 구조 변경 필요.
- 연습/측정 토글 UI + 통계 포함 여부 분기 신설.

### 단정 금지
- `파일럿`/`미검증`: 시작 200·범위 10~300·스텝 50/20/10·am −30·6→4→2 — 전부 통일·설계 목적값, 실측 검증 아님.
- `주의`: am 바닥 반전 몰림(역치 뭉개짐)은 −30으로 **완화만**, 근본 해결 아님.
- `미확인`: 연습 4회 값이 실제 통계/저장에 어떻게 쓰이는지 `sessionStore`·통계 코드 **미열람** — 구현 전 확인 필요.
- `미확인`(직전 인계 인용): `SessionHistoryScreen.tsx:556` `LockedTrackChip` ReferenceError 잔존 여부 미확인.

---

## 인계 — 2026-08-13 09:56

새 채팅 AI용. 사용자는 맥락 앎 → 장문 금지. **코드 변경 없음(전 구간 Ask 모드). 이번 세션 = ① 트랙 간 볼륨/주파수 밸런스 질의응답 + ② 관례 검토 + ③ USB 실기기 디버깅 개념 설명.**

### 지금 상태
- 브랜치: `feat/single-tab-home` @ `9daa864`. working tree: `docs/handoff.md`·`docs/impl-log.md`만 M(이 인계 + 09:10 인계). 앱 코드 미변경.
- 실기기: 사용자가 USB로 연결 성공(`SC_01M`). `npx expo start --dev-client -c`(캐시 클리어)로 화면 뜸 → 폰에 `http://127.0.0.1:8081` 입력해 접속.

### 한 일 (설명만, 파일 변경 없음)
- **볼륨 밸런스**: 게인은 3트랙 모두 `0.15`(선형, dB 아님). 체감 차이는 **주파수 차이 + AM 피크** 때문 → 정상. 트랙 간 등청감(폰) 보정은 안 함 = 의도된 임시(백로그 「자극 스펙 임시값 유지」). 버그 아님.
- **주파수 배정**: 440 Hz = 다른 음 찾기·높낮이 비교(음고 2트랙, 기준음 공유) / 1000 Hz = 떨림 찾기. 밸런스용이 아니라 과제별 관례값. 코드 주석 「제품 확정 아님」.
- **관례 검토**: 2-down-1-up·440 A4·cent·1kHz AM 안전장치는 관례 OK. 벗어난 점 = 세 트랙 계단식 파라미터 제각각(freq 시작150/10~150/고정10·3AFC, pitch2 시작200/10~300/가변50·20·10·2AFC, am 0~−40dB/6→2), 종료 반전 `4`는 관례 6~8보다 짧음(세션 길이 피드백·`제품 확정 아님`).
- **USB 디버깅 개념**: adb(5037)로 기기 잡음 → Metro(8081) → `adb reverse tcp:8081 tcp:8081`(Expo 자동) 터널 → 폰 `127.0.0.1:8081`이 PC Metro에 도달. WiFi면 터널 없이 PC LAN IP:8081. adb PATH 미등록이라 PowerShell `adb` 직접 실행은 실패하지만 Expo는 자체 adb 사용.

### 안 한 일
- 앱 코드·설정 수정, 커밋, 자극 스펙 변경, `adb` PATH 등록.

### 발견/미해결
- `주의`·`미확인`: Metro 로그에 `[ReferenceError: Property 'LockedTrackChip' doesn't exist]` — `SessionHistoryScreen.tsx:556` (`chips={<LockedTrackChip .../>}`). `-c` 캐시 클리어로 화면은 떴지만, **코드에 정의/임포트가 실제로 있는지 미확인**. 남아 있으면 재발 가능 → 다음에 파일 확인 필요.

### 다음 작업
1. `LockedTrackChip` 참조 실재 여부 확인(정의·import 존재? 캐시만의 문제였나) — `SessionHistoryScreen.tsx` 정독.
2. (이월) 브랜치 rename `/` 제거, 실기기 통계 버튼 UX — 09:10 인계 그대로.

### 단정 금지
- `추정`: 게인 0.15·1kHz·8Hz·시작값·반전4는 전부 파일럿/관례 임시값(실측 근거 없음).
- `미확인`: `LockedTrackChip` 코드 실재 여부(위).
- `주의`: 자극 스펙은 백로그에서 **임시값 유지** 결정 → 지금 밸런스 손대면 현 결정과 어긋남.

### 인계 규칙
- **추가+시각** · 새 창: `@docs/handoff.md` + 「인계 이어서」.

---

## 인계 — 2026-08-13 09:10

새 채팅 AI용. 사용자는 맥락 앎 → 장문 금지. **코드 변경 없음. 이번 세션 = 원격 브랜치 가져오기 + GitHub Code 탭 깨짐 원인 확정.**

### 지금 상태
- 브랜치: `feat/single-tab-home` @ `9daa864` (`origin`과 동일, working tree clean).
- `merge/harmonitune`보다 커밋 3개 앞: `05f3a44` 인계·로그 → `2177938` one_tab_jicko → `9daa864` 통계 헤더 다색·탭면적.
- 앱 상태(이전 인계 유지): 탭 바 없음, 홈=`index` + 통계 스와프(`track:'stats'`). 헤더 stats 버튼 60×40·border 2·아이콘 28·다색 `chart`.

### 한 일 / 안 한 일
- 한 일: `git fetch --all --prune` 후 `feat/single-tab-home` 로컬 추적·체크아웃. GitHub Code 탭 `Unable to load page` 조사.
- 안 한 일: 앱 코드 수정·커밋·브랜치 이름 변경(rename)·실기기 확인.

### GitHub Code 탭 (확정)
- **원인**: 브랜치명 `/` (`feat/single-tab-home`, `merge/harmonitune`). Code URL이 브랜치 `feat` + 경로 `single-tab-home`으로 쪼개져 페이지 로드 실패.
- **아님**: 푸시 미완료·인덱싱 지연. API·트리·커밋 목록은 정상.
- `/` 없는 `two_feat`는 Code 탭 정상.
- 되는 주소: [commits %2F](https://github.com/gimsansan/mmn-amp1/commits/feat%2Fsingle-tab-home/) · [tree %2F](https://github.com/gimsansan/mmn-amp1/tree/feat%2Fsingle-tab-home)
- **합의**: `feat/…` 형식은 쓰지 않음. 다음부터 `feat-single-tab-home`처럼 `/` 없이.

### 다음 작업
1. (선택) 브랜치 rename `/` 제거 — 사용자 확인 후. 예: `feat-single-tab-home`.
2. 실기기: 통계 버튼 발견성·탭 면적·진입/뒤로/peek (01:52 인계와 동일).
3. 문제 없으면 커밋 여부 확인(현재 HEAD는 이미 푸시됨).

### 단정 금지
- `주의`: GitHub Code 탭 버그(슬래시 브랜치). 재푸시해도 안 고쳐짐.
- `미검증`: 실기기 통계 버튼 UX (이전과 동일).
- `추정`: default `main`(=init만)도 저장소 루트가 빈 화면처럼 보임 — Code 탭 에러와는 별개.

### 인계 규칙
- **추가+시각** · 새 창: `@docs/handoff.md` + 「인계 이어서」.

---

## 인계 — 2026-08-13 01:52

새 채팅 AI용. 사용자는 맥락 앎 → 장문 금지. **탭 2→1(단일 홈)은 이미 구현됨. 이번 세션 = 통계 헤더 버튼 발견성·탭 면적 다듬기.**

### 합의·현재 상태
- `_layout.tsx` = `Stack`(headerShown:false). 탭 바 없음. `index.tsx`의 `track`에 `'stats'` → `SessionHistoryScreen` 스와프.
- 통계 진입 2경로: 헤더 우측 **stats 버튼** + **peek 카드**(그래프 없음).
- 통계 아이콘: 전용 `StatsChartIcon` 시도 후 **철회** → `Icon` `chart`를 **막대별 fill**로(기준선 stroke=`color`, 막대=`Colors.light` accent/highlight/positive). `chart`만 다색 예외.
- 버튼 UI(사용자 손터치 포함): `statsButton` **60×40**, `borderWidth: 2`, `accentTint`+`accentBorder`, 아이콘 `size={28}`. 오른쪽 여백 유지·가로로 넓혀 탭 면적 확보.

### 핵심 경로
- `src/app/index.tsx` — Pressable `statsButton` ~236–251 · 스타일 ~364–371
- `src/components/ui/icon.tsx` — `name === 'chart'`
- `docs/impl-log.md` — 2026-08-13 통계 관련 항목

### 한 일 / 안 한 일
- 한 일: 다색 chart · 보더 · 버튼/아이콘 크기 조정 · 전용 SVG 삭제.
- 안 한 일: 커밋 · 실기기 검증 · `icon.tsx`의 미사용 단색 chart 정리(이미 다색으로 교체됨) · peek UX 추가 변경.

### 다음 작업
1. 실기기: 통계 버튼 발견성·탭 면적·대비(accentTint 위 다색)·진입/뒤로/peek.
2. 문제 없으면 커밋 여부는 사용자 확인 후.
3. (선택) 보더 `2` vs `1.5`·아이콘 `28`이 과하면 미세 조정.

### 단정 금지
- `미검증`: 실기기 가시성·탭 히트 체감 미확인.
- `주의`: `chart`만 다색 fill — 단색 선 아이콘 세트 규칙과 어긋남(의도적).
- `추정`: 리빌드 불필요(JS/SVG만) — 미실측이지만 네이티브 변경 없음.

### 인계 규칙
- **추가+시각** · 새 창: `@docs/handoff.md` + 「인계 이어서」.

---

## 인계 — 2026-08-12 23:25

새 채팅 AI용. 사용자는 맥락 앎 → 장문 금지. **이번 세션 = 하단 탭 2→1(단일면) 축소 설계 합의 완료, 구현은 아직 시작 안 함.** 사용자가 "제안대로 한 탭으로 수정" 지시 → 이 인계 직후 구현 예정.

### 합의된 설계 (구현 전)
- **탭 바 제거**, 「연습 선택」 화면(`src/app/index.tsx`)을 **유일한 홈**으로. 통계는 그 안에서 연다.
- **통계 진입 2경로 병행 권장**:
  - A. 「연습 선택」 헤더 **우측 상단 통계 아이콘**(`chart.bar` 계열).
  - B. 홈 상단 **peek 카드** — `최근 연습 · 트랙명 · 대표값(예: 약 40) [전체 보기 ›]` **1줄 요약**. (백로그 P2-8 빈 홈도 같이 채움)
- **그래프는 peek 카드에 없음** — A·B 둘 다 같은 `SessionHistoryScreen`(그래프 포함)로 이동. peek는 `Card` 1개 크기, `TrendChart`는 높이 커서 안 들어감.
- **덤**: 통계를 push/상태 스와프로 진입하면 매 진입 시 마운트 → `useEffect`(`SessionHistoryScreen.tsx:504`) 재실행 → **기존 "새로고침 눌러야 갱신" 문제 자동 해소**(현재 `NativeTabs`는 화면을 계속 살려둬서 자동 갱신 안 됨).

### 미결정 (사용자와 정할 것)
- **구현 방식 2택**:
  - A. `index.tsx`의 `Track` 유니온(`'picker'|'pitch2'|'freq'|'am'`)에 `'stats'` 추가 → 상태 스와프. 변경 최소, 단 **안드로이드 하드웨어 뒤로가기 직접 처리 필요**(백로그 P1-4와 동일).
  - B. `expo-router` **Stack**으로 통계 push. 전환 애니·헤더 뒤로가기 무료, 딥링크 가능. 단 `NativeTabs`→`Stack` 네비게이터 교체.
- 새로고침 버튼 유지 여부(자동 갱신되면 제거 가능하나, 실기기 확인 전엔 남겨두는 게 안전).

### 현재 코드 사실 (미변경)
- 탭: `src/components/app-tabs.tsx` = `NativeTabs`(unstable) 2트리거 `index`(연습)·`stats`(통계).
- `stats.tsx` → `SessionHistoryScreen`(그래프·집계·기록·**하단 새로고침+전체삭제 버튼**). `SessionHistoryScreen`에 `onBack` 미전달이라 "연습 목록" 버튼 안 뜸 → 새로고침이 행 전체 너비.
- `index.tsx` = 연습 picker(섹션 음고/떨림) + 듣기준비(`ListeningCheckScreen`) + 세션 화면 + 하단 앱 정보 카드. 이미 `track` 상태 머신이라 `'stats'` 추가가 쉬움.

### 다음 작업
1. 구현 방식 A/B 확정.
2. 헤더 아이콘 + peek 카드(요약 1줄) 추가, 통계 진입 배선.
3. `app-tabs.tsx`에서 탭 축소/제거. 탭 제거 시 발견성 위해 A·B 최소 하나 필수.
4. `tsc --noEmit` + 실기기: 진입=연습 · 통계 진입/뒤로 · 자동 갱신 여부 확인.

### 단정 금지
- `추정`: `NativeTabs` 제거는 **JS 라우팅 변경이라 dev client 리빌드 불필요**로 보이나, unstable-native-tabs 제거가 다른 네이티브 설정에 걸리는지 **미실측**.
- `주의`: 탭 없애면 통계 **발견성 하락** → 헤더 아이콘/peek 중 최소 하나 눈에 띄게.
- `미검증`: 위 전부 설계 단계 · 코드 미변경 · 실기기 미확인.

### 인계 규칙
- **추가+시각** · 새 창: `@docs/handoff.md` + 「인계 이어서」.

---

## 인계 — 2026-08-12 16:48

새 채팅 AI용. 사용자는 맥락 앎 → 설명 장문 금지. **이번 세션 = ①ScoreFraming 기준 변경(구현 완료) + ②하단 탭 4→2 축소(구현 완료)**. 둘 다 리빌드 불필요(TSX/라우팅만).

### 이번에 한 일 (구현 완료·커밋 안 함)
1. **ScoreFraming 비교 기준 B 채택** (`src/training/SessionHistoryScreen.tsx`):
   - 기준 = **최신 1개 뺀 직전 3회 평균 ↔ 최신**(`SCORE_BASELINE_WINDOW=3`). `recent < baseline`→`개선`, 아니면 `유지`.
   - **폴백(A)**: 평균용 점(최신 제외) < 3이면 `처음↔최근`. 부제: `최근 3회 평균 X → 최근 Y` / 폴백 `처음 X → 최근 Y`.
   - 동작: 총점 2·3=폴백, 4+=평균. `points[len-1]`→`.at(-1)`.
2. **하단 탭 4→2 (연습·통계)**:
   - `app-tabs.tsx`: 홈·설정 트리거 제거 → `index`(연습)·`stats`(통계). 진입 `/`=`index` 유지.
   - `src/app/index.tsx`: 홈 폐기, **구 explore(연습 picker) 이전** + `ScrollView`(flexGrow:1) 하단에 **앱 정보 카드**(이름·버전·의료기기 아님 고지, `marginTop:'auto'`).
   - `SessionHistoryScreen.tsx`: 하단에 **연습 기록 전체 삭제**(CardDivider+확인 Alert+`clearSavedSessions`→reload, 기록 없으면 disabled).
   - **삭제**: `src/app/explore.tsx`·`settings.tsx`. `app-tabs.web.tsx`: 연습(/)·통계(/stats)로 정합.

### 상태·검증
- `tsc --noEmit` **0**. 린트: 내 코드 경고 0. (`SessionHistoryScreen` L397 `.at` 경고는 **기존 `recent` 계산**, 미변경 — 건드리지 말 것.)
- `git`: 위 변경 **미커밋**. `home.png` 자산은 미사용이나 삭제 안 함.

### 다음 작업 (실기기 수동 확인 위주)
1. 실기기: **앱 진입=연습 탭 · 2탭만 노출 · 통계 하단 삭제 Alert · 앱 정보 하단 정렬 · 작은 화면 스크롤** 확인.
2. ScoreFraming: 점 2~3(폴백)·4+(평균)·평균보다 나쁨→`유지` 표시 확인.
3. 문제 없으면 커밋 여부는 사용자에게 확인 후.

### 단정 금지
- `미검증`: 2탭·삭제 Alert·앱 정보 렌더·스크롤 실기기 미확인. ScoreFraming 실데이터 뱃지 변화 빈도 미측정.
- `추정`: 창=3이 UX·통계적 최적이라는 보장 없음(단순 평균·가중치 없음).
- `주의`: 「개선/유지」는 §2-1 성적 프레이밍 **알면서 두는 예외** — `ScoreFraming` 한 곳에 모아 삭제 쉽게 유지. `NativeTabs`(unstable)라 트리거 미등록 라우트는 회피(그래서 `index`로 이전).

### 인계 규칙
- **추가+시각** · 새 창: `@docs/handoff.md` + 「인계 이어서」.

---

## 인계 — 2026-08-12 16:11

새 채팅 AI용. **다음 = `ScoreFraming` 비교 기준 재설계(미구현·설계만 합의 전)**. 사용자: 새 창에서 이어서.

### 목표
- 통계 추세 뱃지(`개선`/`유지`)가 **점이 많아져도** 초반 1점에 덜 흔들리게, 기준을 바꿀지 결정한다.
- 기능(그래프·저장·탭)은 유지. 이번 인계는 **뱃지 판정 로직·카피** 쪽.

### 합의·한 일 / 안 한 일
- **한 일(사용자)**: `ScoreFraming`에서 `↓` 화살표 삭제 → 문구는 `` `${deltaText} 개선` `` / `"유지"`. (`SessionHistoryScreen.tsx`)
- **안 한 일**: 평균 비교로 코드 변경 **없음**. 탭 UI 합치기(기능 유지·칸만 줄이기)는 **별 이슈**, 이번 인계 범위 밖(언급만 됨).
- 주석에 아직 「하강 화살표」 문구 잔존 → 손볼 때 같이 정리.

### 현재 동작 (코드 사실)
- 위치: `src/training/SessionHistoryScreen.tsx` → `ScoreFraming`.
- 점 ≥2일 때만 표시. **`first = points[0]`, `last = points[last]`** (직전 세션 아님).
- `improved = last < first` (작을수록 잘함) → 개선, 아니면 **전부 `유지`**(같음·나쁨 포함). `↑`/악화 상태 없음.
- 부제: `처음 X → 최근 Y`.
- 문서: `docs/impl-log.md` 단정 금지에 `추정`: 「유지」 문구·첫↔끝 단순 비교가 최종 보장 아님.

### 설계안 (다음에 고를 것 — 아직 미채택)
말한 「과거 평균과 비교」는 아래 **후보** 중 하나를 고르자는 뜻. (구현 전 사용자 결정 필요)

| 후보 | 판정 | 부제 카피 예 | 비고 |
|------|------|-------------|------|
| A 유지 | 처음↔최근 (현재) | `처음 → 최근` | 단순, 초반 1점 편향 |
| B 추천 후보 | **최근 제외 과거 평균**(또는 최근 N회 평균) ↔ 최신 | `평균 → 최근` / `최근 N회 평균 → 최근` | 점 많을수록 기준 안정 |
| C | 직전 1회 ↔ 최근 | `직전 → 최근` | 체감 가깝고 들쭉날쭉 |

공통 규칙 제안(확정 아님):
- 대표값 **작을수록 잘함** 유지 → `recent < baseline`이면 `개선`, 아니면 `유지`(악화 문구 신설 여부는 §2-1과 충돌 주의 — 기본은 유지).
- N 최소: 평균에 넣을 점이 부족하면(예: 2점뿐) **A로 폴백** 또는 뱃지 숨김 — 구현 시 결정.
- §2-1 예외: 「개선」은 성적 프레이밍. 기준 바꿔도 **ScoreFraming 한곳**만 수정. 삭제 쉽게 유지.

### 핵심 경로
- `src/training/SessionHistoryScreen.tsx` (`ScoreFraming`, `TrendGraphCard`)
- `src/training/TrendChart.tsx` (y값·점 순서 — 뱃지와 같은 `points`)
- `docs/impl-log.md` (기존 추정 기록)

### 다음 작업
1. 사용자에게 **A/B/C + N(예: 전체 과거 vs 최근 5)** 확정.
2. Agent: `ScoreFraming` 판정·부제·주석 수정. 테스트는 UI라 단위 테스트 없을 수 있음 — 수동 확인(점 2개 / 다수 / 평균보다 나쁨→유지).
3. `impl-log`에 근거·결정·단정 금지 갱신. **리빌드 불필요**(TSX만).

### 단정 금지
- `추정`: B(평균 기준)가 UX·통계적으로 더 낫다는 보장 없음. 윈도우·가중치 미정.
- `주의`: 「개선/유지」 자체는 §2-1 예외. 악화·↑ 추가 시 성적 UI로 더 기울 수 있음.
- `미검증`: 실데이터에서 처음↔최근 vs 평균↔최근이 뱃지를 얼마나 자주 바꾸는지.

### 인계 규칙
- **추가+시각** · 새 창: `@docs/handoff.md` + 「인계 이어서」.

---

## 인계 — 2026-08-12 02:25

새 채팅 AI용. 최신: `docs/handoff.md` 상단. **다음 작업 = 통계 탭 추이 그래프 구현**(설계 합의 끝, 코드만 남음).

### 지금 상태 (병합 §4 골격 완료)
- 브랜치 `merge/harmonitune`. 제품=HarmoniTune · 코드 호스트=mnn_1. 정본: `docs/merge-plan-harmonitune.md`(§4), `docs/merge-host-decision.md`, 설계 `docs/amp-mdt-training-design.md`. 규칙 `.cursor/rules/android-dev-client.mdc`.
- §4-1~§4-9 **모두 완료**. 이번 세션: §4-8(리브랜딩)·§4-9(설계 문서 3트랙·시작값 정정).
- **미커밋 4파일**: `app.json`·`package.json`·`docs/amp-mdt-training-design.md`·`docs/impl-log.md` (`git status` 확인). 커밋 안 함.

### 한 일 (이번 세션)
- 브랜치 정리: 옛 `three_feat` 삭제, `three_feat`의 미커밋(theme accent색·`SessionHistoryScreen` 색점/진행바) **폐기(1번)**, `origin/merge/harmonitune` 이어받음.
- §4-8: `app.json` `slug`/`scheme`→`harmonitune`, `package`/`bundleId`→`com.harmonitune.app`, **표시이름 `청능 애플리케이션` 한글 유지**(사용자 결정). `package.json` name→`harmonitune`. 온보딩 중복 없음(제거할 것 없음). 코드 문자열 3곳(`index`·`app-tabs.web`·`settings`)은 **미변경**. `tsc` 0·`npm test` 114.
- §4-9: 설계 문서 §3.1(3트랙 카드 매핑)·§6.1(높낮이 비교 pitch2 계단식·시작 200)·§8 추가. 시작값 **50→200 코드값 채택**.
- 실기기: WiFi ADB(`172.30.1.82:5555`)로 새 앱 `com.harmonitune.app` **빌드·설치·실행 확인**. 옛 `com.rnhear.app`와 **2개 공존**(폰에 둘 다). Metro 1개 방침.

### 다음 작업 = 통계 탭 추이 그래프 (설계 확정, 구현만)
현재 통계 탭(`src/training/SessionHistoryScreen.tsx`)은 **텍스트 요약 `AggregateCard`만**(그래프 없음). 여기에 추이 그래프 2종 추가:
- **그래프 A — 「들을 수 있는 최소 차이 추이」(cent)**: 높낮이 비교(pitch2) + 다른 음 찾기(freq). **둘 다 cent라 같은 축 가능하나, 과제 2택 vs 3택이라 직접 비교 아님 → 겹치지 말고 트랙 선택(필터/탭)으로 하나씩 표시**(사용자 결정).
- **그래프 B — 「떨림 추이」(dB, 라벨 dB 유지)**: 떨림 찾기(am) 별도.
- **데이터 이미 저장됨**(`src/training/sessionStore.ts`): freq=`meanReversalDeltaCents/easiest/hardest`, am=`*DepthDb`, pitch2=`meanReversalCents/easiest/hardest`. 그래프 y값=`meanReversal…`(=「들을 수 있는 최소 차이」). `null`(짧은 세션)은 제외 → **대표값 있는 세션 2회 이상일 때만** 그림.
- **y축 반전(위=잘함)** 채택. cent 작을수록/dB 더 낮을수록(음수) 잘함이므로 위로. 방향 라벨 예: "위로 갈수록 더 작은 차이/더 얕은 떨림까지".
- **「개선/점수」 라벨 유지**(사용자 결정 — §2-1과 알면서 두는 예외, 나중에 삭제 가능 → **문구·배지를 상수/단일 컴포넌트에 모아** 삭제 쉽게 할 것).
- **경량**: Skia 금지, RN `View` 기반 경량 라인/막대. (규칙: 훈련 입력 화면 최경량, 연출은 결과 화면 한정)

### 용어 순화 매핑 (통계·요약 UI에 적용)
- 시행→**문항** · cent→**음 높이 차이** · 변별 역치→**들을 수 있는 최소 차이** · 변별 역치 추이→**들을 수 있는 최소 차이 추이** · `cent · 최근`→**`음 높이 차이 · 최근`** · 방향 전환→**난이도 바뀐 횟수**
- "세션 2회 이상 쌓이면 변화를 그려 드립니다"→**"들을 수 있는 최소 차이가 나온 세션이 2회 이상이면 변화를 그려 드립니다"**
- `역치 산출까지 난이도 바뀐 횟수`의 **'역치'는 유지**(UI 공간 좁음 · 사용자 결정).

### 단정 금지
- `주의`: "개선/점수" 라벨·y축 반전(위=향상)은 §2-1(효과 미검증·성적 프레이밍 지양)과 **알면서 남기는 예외**. 삭제 쉽게 모아둘 것.
- `주의`: 딥링크가 `exp+rn-hear-1://`로 찍힘 — slug는 `harmonitune`인데 옛 값. `추정`: prebuild/`.expo` 캐시(미확인). 필요 시 `npx expo prebuild --clean` 후 재빌드.
- `주의`: package 바뀌어 옛 `com.rnhear.app` 로컬 기록(AsyncStorage)은 새 앱에 승계 안 됨.
- `미검증`: 3카드 묶음 세션 길이·피로, pitch2 상한 300·스텝, 실기기 청취 체감.
- 그래프는 순수 TSX → **리빌드 불필요**(핫리로드). app.json 추가 변경 시에만 리빌드.

### 인계 규칙
- **추가+시각** · 새 창: `@docs/handoff.md` + 「인계 이어서」.

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
