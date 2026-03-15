# AgentFit

> 내 작업에 멀티에이전트가 맞는지 평가하고, AI와 대화로 아키텍처를 컨설팅받는 도구

**GitHub Pages** → `[https://tdsg-ax.github.io/selim_AgentFit/](https://tdsg-ax.github.io/selim_AgentFit/)`

---

## 파일 구조

```
selim_AgentFit/
├── index.html   # 메인 평가 도구 (설문 + AI 컨설팅 + API 설정)
├── doc.html     # 멀티에이전트 방법론 가이드 (4섹션)
├── .nojekyll    # GitHub Pages Jekyll 처리 비활성화
└── README.md
```

## 기능

| 기능 | 설명 |
|------|------|
| 설문 평가 | 9개 기준으로 복잡도·병렬 가능성·오버헤드 점수 산출 |
| AI 컨설팅 | 설문 결과를 컨텍스트로 AI와 심층 대화 |
| 멀티 API | Claude / OpenAI / Gemini / Ollama / LM Studio / Custom |
| Docs | 핵심 개념 · 작동 흐름 · 의사결정 · Git Worktree 병렬 개발 |

## doc.html 섹션 구성

- `01` 핵심 개념 — 서브태스크 · 서브에이전트 · 오케스트레이터
- `02` 작동 흐름 — 멀티에이전트 파이프라인
- `03` 의사결정 — 단일 vs 멀티에이전트 비교표
- `04` Git 방법론 — Worktree 기반 병렬 개발 (SVG 타임라인 포함)

## 로컬 실행

별도 서버 없이 `index.html`을 브라우저에서 직접 열면 됩니다.

```bash
# 선택: 로컬 서버로 실행
npx serve .
# 또는
python -m http.server 3000
```

## API 설정

API Key는 브라우저 `localStorage`에만 저장되며 외부로 전송되지 않습니다.

| 제공자 | Key 필요 | 엔드포인트 |
|--------|---------|-----------|
| Claude | ✅ | anthropic.com |
| OpenAI | ✅ | platform.openai.com |
| Gemini | ✅ | aistudio.google.com |
| Ollama | ❌ | localhost:11434 (로컬만) |
| LM Studio | ❌ | localhost:1234 (로컬만) |
| Custom | 선택 | 직접 URL 입력 |

## GitHub Pages 배포

### 1. 저장소 Push 확인

```bash
git push origin main
```

### 2. GitHub Pages 활성화

1. GitHub 저장소 → **Settings** → **Pages**
2. **Source**: `Deploy from a branch`
3. **Branch**: `main` / `/ (root)`
4. **Save**

### 3. 배포 URL

```
https://tdsg-ax.github.io/selim_AgentFit/          # 평가 도구
https://tdsg-ax.github.io/selim_AgentFit/doc.html  # 방법론 가이드
```

> `.nojekyll` 파일이 루트에 있어 Jekyll 변환 없이 HTML을 그대로 서빙합니다.

---

## 버전 히스토리

| 버전 | 내용 |
|------|------|
| v0.3 | SVG git 타임라인, 코드블록 줄바꿈, 로고 TDSG·#3b6cf5, max-width 수정 |
| v0.2 | 파일 구조 단순화 (docs/ → doc.html 루트), GitHub Pages 설정 |
| v0.1 | 평가 도구 + AI 컨설팅 + 멀티 API + Docs |
