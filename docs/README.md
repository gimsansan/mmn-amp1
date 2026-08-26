# 문서 안내 (docs 지도)

> **이 파일의 역할**: 어떤 문서가 무엇을 담는지, **무엇을 어디에 적어야 하는지**, 목적별로 **어떤 순서로 읽으면 되는지**를 알려준다.
> 내용 자체는 담지 않는다(그러면 또 중복이 된다). **여기는 지도이지 목적지가 아니다.**

---

## 1. 분류 규칙 — 두 축으로 나눈다

### 축 A. 성격: **갱신형** vs **누적형**

| 성격 | 규칙 | 해당 문서 |
|------|------|-----------|
| **갱신형** (현재 상태를 서술) | 사실이 바뀌면 **그 자리를 고친다**. 과거 서술을 남기지 않는다 | 설계, 셋업, 백로그 |
| **누적형** (그때의 기록) | **위에 새로 추가**한다(최신이 위). **과거 블록은 절대 수정하지 않는다** | impl-log, 수정 리뷰, 인계문 |

> 이 구분이 핵심입니다. 「지금 어떤 상태인가」를 누적형에서 찾으면 옛 정보를 보게 되고, 「그때 왜 그렇게 했나」를 갱신형에서 찾으면 이미 지워져 있습니다.

### 축 B. 내용: **무엇을 담나**

| 카테고리 | 질문 | 문서 |
|---------|------|------|
| **① 설계·기준** | 무엇을 왜 만드는가 | `amp-mdt-training-design.md`, `training-stats-recommendation.md` |
| **② 환경·실행** | 어떻게 빌드·실행하는가 | `dev-client-setup-context.md`, `dev-client-connection-guide.md`, `cursor-rules-2-vs-3.md` |
| **⑥ 읽기·질문** | 코드를 어떻게 물어보나 | `ask-file-behavior.md`(범용), `ask-app-behavior.md`(이 앱), `ask-token-budge-universal.md`(비용·범용), `ask-token-budget.md`(비용·이 앱), `analysis/`(7축을 이 앱에 **적용한 결과**) |
| **③ 할 일·상태** | 무엇이 문제이고 지금 어디까지 왔나 | `improvement-backlog.md` (+ `-easy`) |
| **④ 기록** | 무엇을 했나 / 어떻게 고쳤나 | `impl-log_2.md`(정본), `impl-log_1.md`·`impl-log.md`(과거), `fix-reviews.md` |
| **⑤ 인계** | 새로 오는 사람에게 넘길 맥락 | `handoff4.md`(정본) — `handoff.md`~`handoff3.md`는 과거 |
| **⑦ 학습 노트** | 이 코드가 왜 이렇게 생겼나(기초 개념) | `testing-guide.md`, `as-const-리터럴타입-노트.md`, `animated-value-초기화-노트.md`, `ref-vs-state-노트.md` |

---

## 2. 문서별 역할과 정본

**정본(single source of truth)** = 그 사실을 **고칠 때 반드시 여기를 고쳐야 하는** 곳. 나머지는 **링크만** 건다.

| 문서 | 성격 | 담는 것 | **이것의 정본** |
|------|------|---------|----------------|
| `amp-mdt-training-design.md` | 갱신 | 훈련·자극 설계, 근거 문헌, 제품 방침 | **왜 이런 과제·절차인가**, 자극 스펙의 의미 |
| `training-stats-recommendation.md` | 갱신 | 탭별 기록 **수집·표시** 추천(봉투·kind 필터). 코드 미적용 | **기록을 어떻게 넣고 꺼내 보여주는가** |
| `ask-file-behavior.md` | 갱신 | React 등 **범용** 질문 요령(역할 먼저, `[화면] --동작-->`) | **스택 무관하게 어떻게 물어보나** |
| `ask-app-behavior.md` | 갱신 | 위 요령의 **이 앱** 예(탭·Store·차트 경로) | **이 저장소 파일을 어떻게 물어보나** |
| `ask-token-budge-universal.md` | 갱신 | 스택 무관 **범용** 비용 절약(탐색 계단, 상황별 처방, 세션 운영) | **어떤 저장소에서도 같은 답을 더 싸게** |
| `ask-token-budget.md` | 갱신 | 위의 **이 앱** 실측(2026-08-26 세션 숫자, `docs/` 파일 크기) | **이 저장소에서 실제로 무엇이 비쌌나** |
| `analysis/` (7개 + README) | 갱신 | `analaysys/`의 7축 질문 요령을 이 앱 주요 파일에 **적용한 결과**(화면·데이터·상태·에러·타입·성능·테스트) | **이 앱이 각 축에서 실제로 어떻게 생겼나** |
| `merge-host-decision.md` | 갱신 | HarmoniTune×mnn 병합 시 **호스트 선택** 개념·저장·기록 방침 | **어느 저장소를 살리는가**(제품 이름과 별개) |
| `merge-plan-harmonitune.md` | 갱신 | HarmoniTune×mnn 병합 **절차·이식 매핑·순서** | **무엇을 어디로 옮기나**(저장 방침은 host-decision §4.1 링크) |
| `dev-client-setup-context.md` | 갱신 | 스택·빌드·Metro/Babel·경량화 방침 | **어떻게 돌리는가**(스택·빌드) |
| `dev-client-connection-guide.md` | 갱신 | USB/WiFi/ADB·Metro URL·실기기 연결 | **실기기에 어떻게 붙는가** |
| `improvement-backlog.md` | 갱신 | 개선 후보 P0~P3 + 맨 위 **진행 현황 표** | **무엇이 문제인가 · 지금 상태가 어떤가** |
| `improvement-backlog-easy.md` | 갱신 | 위 문서를 비유로 푼 것 | 없음(설명 전용 — **상태·근거를 여기서 관리하지 않음**) |
| `impl-log_2.md` | 누적 | 날짜별 작업 1건 = 표 1개(근거·결정·결과·확인·단정 금지). **현재 정본** | **무엇을 언제 했나** |
| `impl-log_1.md` | 누적 | 위와 같음. **과거**(2026-08-26 12:45까지). 새 항목 금지 | 과거 작업 기록 |
| `impl-log.md` | 누적 | 위와 같음. **과거**(2026-08-19 01:04까지). 새 항목 금지 | 과거 작업 기록 |
| `fix-reviews.md` | 누적 | 수정 전후 코드·대안 검토·평가·검증 | **어떻게 고쳤나 · 왜 그 방법인가** |
| `handoff4.md` | 누적 | 새 채팅 AI용 인계 블록(시각 포함). **현재 정본** | **지금 넘길 맥락** |
| `handoff.md` · `handoff2.md` · `handoff3.md` | 누적 | 위와 같음. **과거분**(꽉 차서 넘긴 것). 새 블록 금지 | 과거 인계 기록 |
| `testing-guide.md` | 갱신 | `__tests__`가 무엇이고 **무엇을 못 잡나**, jest 설정 | **테스트를 어디까지 믿는가** |
| `as-const-리터럴타입-노트.md` | 갱신 | `as const`가 만드는 리터럴 타입, `useTheme` 반환을 넓힌 이유 | **왜 색 타입이 `string`인가** |
| `animated-value-초기화-노트.md` | 갱신 | `useRef(new Animated.Value()).current`를 버리고 지연 초기화 `useState`로 간 이유 | **애니메이션 값을 어떻게 만드나** |
| `ref-vs-state-노트.md` | 갱신 | 렌더에서 ref를 읽으면 생기는 버그, ref+state 짝 패턴 | **ref냐 state냐** |

> `impl-log_2.md`와 `fix-reviews.md`의 관계: **impl-log가 정본(짧게), fix-reviews가 부록(상세).**
> 코드를 바꿨으면 **impl-log_2는 반드시** 쓰고, 설명할 게 많을 때만 fix-reviews에 상세를 더한다.
> **`impl-log.md`·`impl-log_1.md`에는 넣지 않음.**

---

## 3. 「이건 어디에 적지?」 결정표

| 적을 내용 | 어디에 | 다른 곳에는 |
|-----------|--------|------------|
| 새로 발견한 문제 | **백로그**에 항목 추가 | — |
| 그 문제를 고쳤음 | **백로그** 진행 현황 표 + 항목에 ✅ 배지 | impl-log에 날짜 항목 1개 |
| 어떻게 고쳤는지 상세(전후 코드·대안) | **fix-reviews** 맨 위에 블록 추가 | 백로그·impl-log에서는 **링크만** |
| 예전 추정이 틀렸음이 드러남 | **백로그의 그 항목을 정정**(취소선 + 실측) | 리뷰에 측정 근거 |
| 설계·과제 방식을 바꾸기로 합의 | **설계 문서** 갱신 | impl-log에 한 줄 |
| 통계 수집·표시 방식을 바꾸기로 함 | **`training-stats-recommendation.md`** | 자극 설계 문서에 통계 UX를 섞지 않음 |
| 코드를 어떻게 물어볼지 | **`ask-file-behavior.md`**(범용) · **`ask-app-behavior.md`**(이 앱) | 인계·설계에 질문 복붙을 흩뿌리지 않음 |
| 요청·탐색이 토큰을 너무 먹음 | **`ask-token-budge-universal.md`**(방법) · **`ask-token-budget.md`**(이 앱 실측) | 앱 런타임 성능은 `analysis/ask-performance.md`(다른 문제) |
| 빌드·실행 방법이 바뀜 | **셋업 문서** 갱신 | impl-log에 한 줄 |
| 자극 스펙 숫자 | **코드 상수가 정본** + 설계 문서에 의미 | 문서에 숫자를 복사해 두지 말 것 |
| 기초 개념을 몰라 막혔던 것(왜 이 문법·이 훅인가) | **학습 노트**(⑦) 새 파일 또는 기존 노트에 절 추가 | impl-log에 한 줄. **여러 파일에서 반복될 때만** 만들 것 — 한 곳뿐이면 코드 주석 |
| 새 채팅으로 넘길 맥락 | **handoff** 맨 위 블록(이번 세션 변경+다음만) | 인계 저장만으로 impl-log에 한 줄 **넣지 않음**. 앱 상태는 백로그 |

**중복 금지 원칙**

1. **상태는 한 곳에서만** — 진행 현황은 백로그 맨 위 표에만. 인계에 앱 상태 승계를 복붙하지 않는다.
2. **숫자는 코드가 정본** — 설계 문서에 스펙 숫자를 복사하지 말 것. 의미 + 코드 경로만.
3. **누적형은 고치지 않는다** — 옛 impl-log·리뷰·인계 블록이 지금과 달라졌으면, 고치지 말고 **새 블록에서 정정**한다.
4. **인계 ≠ impl-log 영수증** — 인계는 `handoff4.md`만. impl-log는 구현·설계 변경 때.
5. **인계 파일 번호는 「이어붙임」이지 「사본」이 아니다** — 사용자 규칙: 한 파일의 **분량이 많아져 읽기 불편해지면** 다음 번호로 넘기고, 옛 파일 맨 위에 「과거·새 블록 금지」를 박는다(줄 수 기준은 없다). 내용을 복사하지 않으므로 폐지된 `handoff-YYYY-MM-DD.md` **날짜별 사본**(2026-08-07)과는 다르다.

---

## 4. 목적별 읽는 순서

### 처음 오는 사람 (약 10분)

1. 루트 [`README.md`](../README.md) — 앱이 뭔지, 어떻게 띄우는지
2. [`improvement-backlog.md`](./improvement-backlog.md) **§0 앱 현재 상태** — 화면·트랙·기록 구조 한 표
3. [`improvement-backlog-easy.md`](./improvement-backlog-easy.md) **§0** — 비유로 감 잡기(선택)
4. [`amp-mdt-training-design.md`](./amp-mdt-training-design.md) — 왜 이런 훈련인지

### 「지금 뭘 하면 되지?」

1. [`improvement-backlog.md`](./improvement-backlog.md) **맨 위 진행 현황 표** ← 여기만 보면 됨
2. 같은 문서 **§5 권장 순서**
3. 고를 항목의 본문(근거·제안·확인 방법)

### 「이건 왜 이렇게 고쳐졌지?」

1. [`impl-log_2.md`](./impl-log_2.md)(정본) → 없으면 [`impl-log_1.md`](./impl-log_1.md) → [`impl-log.md`](./impl-log.md) 순으로 **날짜로** 찾기 → 근거·결정·단정 금지
2. 더 알고 싶으면 [`fix-reviews.md`](./fix-reviews.md)에서 **같은 항목 ID**(P0-1 등) 블록

### 「이 파일 동작을 빨리 파악하려면?」

1. [`ask-file-behavior.md`](./ask-file-behavior.md) — 범용. [`ask-app-behavior.md`](./ask-app-behavior.md) — 이 앱 예
2. 그다음 코드·설계·impl-log

### 「이 코드 왜 이래?」

1. 코드 주석(자극 스펙 상수에는 근거가 주석으로 붙어 있음)
2. [`amp-mdt-training-design.md`](./amp-mdt-training-design.md) 해당 절
3. [`impl-log_2.md`](./impl-log_2.md) → 없으면 [`impl-log_1.md`](./impl-log_1.md) → [`impl-log.md`](./impl-log.md) 날짜 역순으로 훑기

### 새 채팅 AI에게 넘길 때

1. [`handoff4.md`](./handoff4.md) **맨 위 블록**(이번 세션 변경) ← 인계 정본
2. [`improvement-backlog.md`](./improvement-backlog.md) **진행 현황 표·§0**(앱 전체 상태)

### 비개발자에게 설명할 때

[`improvement-backlog-easy.md`](./improvement-backlog-easy.md) 하나면 됩니다. 「청음 연습실」 비유로 전체가 이어집니다.

---

## 5. 문서 신뢰도 읽는 법

이 저장소는 `.cursor/rules/android-dev-client.mdc` 규칙에 따라 **확실한 것과 확실하지 않은 것을 나눠 적습니다.** 문서를 읽을 때 아래 표시를 먼저 보세요.

| 표시 | 뜻 |
|------|-----|
| `관례` | 분야에서 흔히 쓰는 방식이라는 것뿐, 이 앱에서 검증된 게 아님 |
| `가설` · `추정` | 근거가 약한 판단. 뒤집힐 수 있음 |
| `미검증` | 실제로 돌려보지 않았음 |
| `주의` | 성능·부작용 우려 |
| **단정 금지** 칸/절 | 그 문서에서 **믿으면 안 되는 것**을 모아둔 곳. **여기부터 읽어도 좋음** |
| **누적형** 문서(impl-log·fix-reviews·handoff) | **그때의 기록**. 지금과 다를 수 있고 그래도 고치지 않는다. 「지금 어떤가」는 백로그에서 볼 것 |

특히 이 앱은 **웰니스·훈련**이고 진단·검사가 아닙니다. 요약 수치(전환 평균·가장 쉬움/어려움)는 **역치도 점수도 진단 결과도 아닙니다.** 문서 어디서든 이 선은 지켜집니다.

---

## 6. 현재 파일 목록

```
docs/
├─ README.md                       ← 지금 이 파일(지도)
├─ amp-mdt-training-design.md      ① 설계·기준        [갱신형]
├─ training-stats-recommendation.md ① 설계(통계 수집·표시) [갱신형] 코드 미적용
├─ ask-file-behavior.md            ⑥ 읽기·질문(범용)   [갱신형]
├─ ask-app-behavior.md             ⑥ 읽기·질문(이 앱)  [갱신형]
├─ ask-token-budge-universal.md    ⑥ 읽기·질문(비용·범용) [갱신형]
├─ ask-token-budget.md            ⑥ 읽기·질문(비용·이 앱) [갱신형]
├─ merge-host-decision.md          ① 설계(병합 호스트) [갱신형]
├─ merge-plan-harmonitune.md       ① 설계(병합 절차)   [갱신형]
├─ dev-client-setup-context.md     ② 환경·실행        [갱신형]
├─ cursor-rules-2-vs-3.md          ② 환경(규칙 비교)  [갱신형]
├─ improvement-backlog.md          ③ 할 일 + 진행 현황 [갱신형] ★상태 정본
├─ improvement-backlog-easy.md     ③ 위의 쉬운 말 버전 [갱신형]
├─ impl-log_2.md                   ④ 무엇을 했나       [누적형] ★작업 정본
├─ impl-log_1.md                   ④ 무엇을 했나       [누적형] 과거(08-26 12:45까지)
├─ impl-log.md                     ④ 무엇을 했나       [누적형] 과거(08-19 01:04까지)
├─ fix-reviews.md                  ④ 어떻게 고쳤나     [누적형]
├─ handoff4.md                     ⑤ 인계(최신이 위)   [누적형] ★인계 정본
├─ handoff.md / handoff2 / handoff3 ⑤ 인계 과거분      [누적형] 새 블록 금지
├─ testing-guide.md               ⑦ 학습 노트(테스트) [갱신형]
├─ as-const-리터럴타입-노트.md      ⑦ 학습 노트(타입)   [갱신형]
├─ animated-value-초기화-노트.md    ⑦ 학습 노트(훅)     [갱신형]
└─ ref-vs-state-노트.md            ⑦ 학습 노트(훅)     [갱신형]
```

> **⑦ 학습 노트란**: 코드 주석 한 줄로는 안 풀리고, **여러 파일에서 반복되며**,
> 모르면 다음에 또 되돌리게 되는 개념만 모은다. 한 곳에서만 나오는 이유는
> 그 자리 주석에 적는다. 노트끼리는 서로 링크로 이어져 있다.

> **파일을 새로 만들기 전에**: 위 목록 중 들어갈 곳이 정말 없는지 먼저 보세요. 항목마다 파일을 만들면 `docs/`가 금방 못 쓰게 됩니다.
>
> **실제로 있었던 일 (둘 다 2026-08-07 정리)**
> - `fix-p0-1-review.md`·`fix-p0-2-review.md`를 항목별로 만들었다가 → `fix-reviews.md` 하나로 합침
> - `handoff-YYYY-MM-DD.md` 날짜 사본을 만들던 규칙 → **폐지**(`handoff.md`와 100% 중복이었음. 과거 조회는 git 이력)
