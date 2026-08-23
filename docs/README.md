# 문서 안내 (docs 지도)

> **이 파일의 역할**: 어떤 문서가 무엇을 담는지, 목적별로 **어떤 순서로 읽으면 되는지**를 알려준다.
> 2026-08-24 공개 정리 후 **설명·가이드·설계**만 남김. 뺀 목록은 [`공개저장소-제거목록.md`](./공개저장소-제거목록.md).

---

## 분류

| 카테고리 | 문서 |
|---------|------|
| **① 설계** | `amp-mdt-training-design.md`, `training-stats-recommendation.md`, `merge-host-decision.md`, `merge-plan-harmonitune.md` |
| **② 가이드·셋업** | `dev-client-setup-context.md`, `dev-client-connection-guide.md`, `splash-icon-교체-가이드.md`, `testing-guide.md` |
| **④ 기록** | `공개저장소-제거목록.md` |

---

## 문서별 역할

| 문서 | 담는 것 |
|------|---------|
| `amp-mdt-training-design.md` | 왜 이런 과제·절차인가, 자극 스펙의 의미 |
| `training-stats-recommendation.md` | 기록을 어떻게 넣고 꺼내 보여주는가 |
| `merge-host-decision.md` | 병합 시 어느 저장소를 살리는가 |
| `merge-plan-harmonitune.md` | 병합 절차·이식 매핑 |
| `dev-client-setup-context.md` | 스택·빌드·경량화 |
| `dev-client-connection-guide.md` | 실기기 연결 |
| `splash-icon-교체-가이드.md` | 스플래시·아이콘 교체 |
| `testing-guide.md` | 테스트 범위·jest |
| `공개저장소-제거목록.md` | 공개 정리로 뺀 내부 문서 |

**숫자는 코드가 정본**이다. 설계 문서에는 의미와 코드 경로만 둔다.

---

## 읽는 순서

1. 루트 [`README.md`](../README.md) — 앱이 뭔지, 어떻게 띄우는지
2. [`amp-mdt-training-design.md`](./amp-mdt-training-design.md) — 왜 이런 훈련인지
3. [`dev-client-setup-context.md`](./dev-client-setup-context.md) — 어떻게 돌리는지
4. 필요하면 연결 가이드 · 테스트 가이드 · 통계 설계

---

## 파일 목록

```
docs/
├─ README.md                         ← 지금 이 파일
├─ amp-mdt-training-design.md        ① 설계
├─ training-stats-recommendation.md  ① 설계(통계)
├─ merge-host-decision.md            ① 설계(병합 호스트)
├─ merge-plan-harmonitune.md         ① 설계(병합 절차)
├─ dev-client-setup-context.md       ② 셋업
├─ dev-client-connection-guide.md    ② 실기기 연결
├─ splash-icon-교체-가이드.md         ② 아이콘
├─ testing-guide.md                  ② 테스트
└─ 공개저장소-제거목록.md              ④ 공개 정리 목록
```
