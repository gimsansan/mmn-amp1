# Cursor 규칙 2번 vs 3번 — 차이 · 적용 시점 · 방법

> 이 문서는 “컨텍스트를 어디에 둘까” 제안 중 **2번**과 **3번**만 깊게 설명합니다.  
> 이 프로젝트 현재 상태: **2번 적용 중** (`.cursor/rules/android-dev-client.mdc`).  
> 긴 참고 문서: [`dev-client-setup-context.md`](./dev-client-setup-context.md)

---

## 한눈에 비교

| 항목 | **2번** `.cursor/rules/*.mdc` | **3번-A** `AGENTS.md` | **3번-B** `.cursorrules` |
|------|------------------------------|------------------------|---------------------------|
| 위치 | `.cursor/rules/이름.mdc` | 프로젝트 루트 (또는 하위 폴더) | 프로젝트 루트 (단일 파일) |
| 형식 | Markdown + **YAML frontmatter** | 그냥 Markdown | 그냥 Markdown (레거시) |
| 적용 제어 | `alwaysApply` / `globs` / `description` / `@멘션` | 거의 항상·단순 적용 (중첩 시 폴더 범위) | 항상 비슷하게 읽힘, **스코프 없음** |
| Cursor 권장 | **신규·기본 선택** | 단순 대안 / 크로스툴 인덱스 | **신규 작성 비권장** (호환용) |
| 다른 AI 툴 | Cursor 전용에 가깝음 | Codex, Copilot 등도 읽는 경우가 많음 | Cursor 레거시 |
| 이 앱에 맞는 용도 | “매 세션 강제 규칙” (dev-client, 안드로이드, 경량화) | 짧은 인덱스·다른 Agent와 공유할 때 | 쓰지 않음 |

**한 줄:**  
- **2번** = Cursor에서 **언제·어디에** 규칙을 넣을지 세밀하게 조절.  
- **3번** = `AGENTS.md`(단순·이식성) 또는 `.cursorrules`(옛 방식). 새 프로젝트는 3번-B 대신 **2번 + (필요 시) AGENTS.md** 조합.

---

## 2번 — `.cursor/rules/*.mdc`

### 무엇인가

Cursor **Project Rules**의 공식 형식입니다.  
파일 확장자는 반드시 `.mdc`입니다. (`.cursor/rules/` 안의 일반 `.md`는 frontmatter가 없어 **규칙으로 무시**됩니다.)

이 프로젝트 예시:

```text
d:\mnn_1\.cursor\rules\android-dev-client.mdc
```

### frontmatter로 정하는 “언제 적용”

| 설정 | 동작 | 언제 쓰나 |
|------|------|-----------|
| `alwaysApply: true` | **모든** Agent 채팅에 포함 | 플랫폼·실행 모드처럼 매 작업에 필요한 것 (지금 이 앱) |
| `alwaysApply: false` + `globs: ...` | 해당 파일이 컨텍스트에 있을 때만 | `metro.config.js`, `src/app/**` 등 특정 영역만 |
| `alwaysApply: false` + `description`만 | Agent가 description을 보고 **관련될 때** 끌어옴 | “가끔만” 필요한 도메인 규칙 |
| `alwaysApply: false` + description/globs 없음 | 채팅에서 `@규칙이름` 할 때만 | 마이그레이션·릴리즈 체크리스트 등 |

공식 문서 기준 요약 (Cursor Rules):

| alwaysApply | description | globs | 결과 |
|-------------|-------------|-------|------|
| `true` | (무시) | (무시) | 항상 포함 |
| `false` | — | 있음 | 매칭 파일 있을 때 |
| `false` | 있음 | 없음 | Agent가 관련성 보고 선택 |
| `false` | 없음 | 없음 | `@` 수동만 |

### 적용 방법 (이 프로젝트 기준)

1. 폴더 확인: `.cursor/rules/`
2. `.mdc` 파일 생성 (이미 있음: `android-dev-client.mdc`)
3. frontmatter 예시:

```yaml
---
description: RN 청능 앱(rn-hear-1) — Android dev-client / 저사양 우선 컨텍스트
alwaysApply: true
---
```

4. 본문에는 **짧은 강제 규칙만** (§0·§2·§5·§7 요약).
5. 긴 설명은 넣지 말고 docs를 가리킴:

```markdown
상세: `docs/dev-client-setup-context.md`
필요 시 채팅에서 `@docs/dev-client-setup-context.md`
```

6. 확인: Cursor **Customize → Rules**에서 규칙이 보이는지, 또는 Agent가 안드로이드/dev-client를 전제로 답하는지 확인.

다른 생성 경로:

- 채팅에서 `/create-rule`
- **Customize → Rules → Add Rule**

### 2번을 쓰는 시점

- Cursor Agent가 **매 작업마다** 지켜야 할 제약이 있을 때  
  (예: Expo Go 금지, Android 우선, Bundle Mode, 리빌드 안내)
- 규칙을 **파일별로 나누고** 싶을 때  
  (예: `android-dev-client.mdc` + 나중에 `audio-pipeline.mdc`)
- 팀원이 전부 Cursor를 쓰고, git에 규칙을 넣고 싶을 때

### 2번을 쓰지 말아야 할 때

- 수백 줄 히스토리·체크리스트 전체 → 그건 `docs/`  
- “다른 IDE/CLI Agent와도 같은 문서를 공유”가 1순위 → 그 부분은 `AGENTS.md`도 검토

---

## 3번 — `AGENTS.md` 와 `.cursorrules`

3번은 **두 갈래**입니다. 성격이 다릅니다.

### 3번-A — `AGENTS.md`

#### 무엇인가

Cursor가 공식으로 지원하는 **단순 Agent 지시 파일**입니다.  
`.cursor/rules`의 **간단한 대안**으로 문서에 명시되어 있습니다.

- 위치: 보통 **프로젝트 루트** `AGENTS.md`
- 중첩 지원: `src/app/AGENTS.md`처럼 하위에도 둘 수 있음  
  → 그 폴더(및 하위) 작업 시 적용, 상위와 합쳐지며 **더 구체적 쪽이 우선**
- frontmatter **없음** → `alwaysApply` / `globs`로 “언제”를 세밀 제어 **불가**

#### 적용 방법

1. 루트에 `AGENTS.md` 생성
2. 짧은 Markdown만 작성 (인덱스·실행 방법·절대 규칙 요약)
3. 상세는 docs로 링크

예시 (인덱스용 — 아직 이 레포에 필수는 아님):

```markdown
# AGENTS

- Android / Expo **dev-client** (Expo Go 불가)
- 상세: docs/dev-client-setup-context.md
- Cursor 강제 규칙: .cursor/rules/android-dev-client.mdc
- 시작: npm install → npx expo run:android → npm start
```

#### 언제 쓰나

| 상황 | AGENTS.md |
|------|-----------|
| Cursor만 쓰고, 이미 `.mdc` alwaysApply가 있음 | **필수는 아님** (지금처럼 2번만으로 충분) |
| Codex / Copilot / 다른 Agent도 같은 레포를 씀 | **루트 인덱스**로 두면 이식성에 유리 |
| “규칙은 단순 한 파일로 충분하다” | `.mdc` 대신 또는 함께 짧은 지시만 |
| 폴더별 다른 지시가 필요 (중첩) | `frontend/AGENTS.md` 등 |

### 3번-B — `.cursorrules`

#### 무엇인가

**레거시** 단일 파일입니다. 루트에 하나 두고 예전에 쓰던 방식입니다.

- Cursor는 아직 **읽을 수 있음** (호환)
- `globs` / `alwaysApply` / 규칙 분할 **불가**
- 새 프로젝트·새 작성은 **비권장** → `.cursor/rules/*.mdc`로 이전

#### 적용 방법 (참고만)

1. 루트에 `.cursorrules` 작성 → 전체에 비슷한 지시가 들어감  
2. **이 프로젝트에서는 만들지 않는 것을 권장**

#### 언제 쓰나 / 쓰지 않나

| 상황 | 권장 |
|------|------|
| 새 프로젝트 | ❌ 쓰지 않음 |
| 옛 레포에만 남아 있음 | 내용을 `.mdc`로 옮긴 뒤 제거 검토 |
| “그냥 예전 습관” | ❌ 2번으로 |

---

## 2번 vs 3번 — 실무 의사결정

```text
Q1. Cursor에서 파일별로/항상/수동으로 규칙을 나눠야 하나?
  ├─ Yes → 2번 (.cursor/rules/*.mdc)  ★ 기본
  └─ No  → Q2

Q2. 다른 AI 툴도 같은 레포를 쓰거나, 루트에 “에이전트용 한 장”이 필요한가?
  ├─ Yes → 3번-A AGENTS.md (짧은 인덱스) + (선택) 2번
  └─ No  → 2번만으로 충분 (현재 rn-hear-1)

Q3. .cursorrules를 새로 만들까?
  └─ No → 레거시. 쓰지 않음
```

### 이 프로젝트(rn-hear-1) 권장 구성

| 레이어 | 파일 | 역할 |
|--------|------|------|
| 사람 + 상세 | `docs/dev-client-setup-context.md` | 스택·설정·히스토리 |
| AI 강제 (2번) | `.cursor/rules/android-dev-client.mdc` | alwaysApply 짧은 규칙 |
| (선택) 인덱스 (3번-A) | `AGENTS.md` | 다른 Agent/툴용 한 장 요약 |
| (비권장) | `.cursorrules` | 만들지 않음 |

**지금:** 2번 + docs 로 이미 “제안 2번” 완료.  
**나중에:** 팀이 Cursor 외 Agent도 쓰면 `AGENTS.md`만 짧게 추가하면 됨. 긴 본문을 복제하지 말 것.

---

## 적용 체크리스트

### 2번만 쓸 때 (현재)

- [x] `.cursor/rules/android-dev-client.mdc` 존재
- [x] `alwaysApply: true`
- [x] 본문은 짧게, 상세는 `docs/` 링크
- [ ] Agent에게 “Expo Go로 실행해”라고 했을 때 거절/정정하는지 한 번 확인

### 3번-A를 추가할 때

- [ ] 루트 `AGENTS.md`에 **5~20줄** 인덱스만
- [ ] `docs/`와 `.mdc`를 가리키기만 하고 내용 복붙하지 않기
- [ ] (선택) 하위 폴더 `AGENTS.md`는 영역이 갈라질 때만

### 3번-B

- [ ] 신규 작성하지 않음
- [ ] 있으면 `.mdc`로 이전 후 삭제 검토

---

## 자주 하는 실수

1. **docs 전체를 `.mdc`에 복붙** → 컨텍스트 낭비, 금방 낡음. 링크만.
2. **`.cursor/rules/foo.md`로 저장** → Cursor Project Rules로 **무시**됨. 반드시 `.mdc`.
3. **`alwaysApply: true`를 너무 많이** → 매 채팅이 무거워짐. 핵심만 always, 나머지는 globs/description.
4. **`AGENTS.md`와 `.mdc`에 서로 다른 지시** → Agent가 혼란. 한쪽을 소스, 다른 쪽은 인덱스.
5. **`.cursorrules`와 `.mdc` 동시 장문** → 중복·충돌. 레거시 제거.

---

## 참고

- Cursor 공식: [Rules](https://cursor.com/docs/rules.md) (`AGENTS.md` / Project Rules / frontmatter 표)
- 이 앱 상세 컨텍스트: [`dev-client-setup-context.md`](./dev-client-setup-context.md)
- 현재 always-apply 규칙: [`.cursor/rules/android-dev-client.mdc`](../.cursor/rules/android-dev-client.mdc)
