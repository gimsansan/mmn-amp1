# 인계4

> **정본**: 이 파일. 최신 블록을 **맨 위**에 추가. `docs/handoff.md`·`handoff2.md`·`handoff3.md`에는 넣지 않음.

## 인계 — 2026-08-26 09:24

새 채팅 AI용. **화면 UI 크기 문서.**

### 한 일

- `docs/ui-sizes.md`: 글자 타입, Spacing/Radius, 버튼·카드·칩·보기 칸·그래프 높이. 14px 하한, 타깃 44~48, 본문 폭 560.
- 통계 문서 관련 링크. 코드 변경 없음.

### 핵심 경로

- `docs/ui-sizes.md` · `src/constants/theme.ts` · `src/components/themed-text.tsx` · `src/components/ui/`

### 단정 금지

- NativeTabs 크기는 OS. `sentClosed`는 탭에 없음. 리빌드 불필요.
