# AgentFit 🤖

> 내 작업에 멀티에이전트가 맞는지 평가하고, AI와 대화로 아키텍처를 컨설팅받는 도구

## 파일 구조

```
selim_AgentFit/
├── index.html   # 메인 평가 도구 (설문 + AI 컨설팅 + API 설정)
├── doc.html     # 멀티에이전트 방법론 가이드 (인포그래픽 스타일)
└── README.md
```

## 기능

- **설문 평가**: 9개 기준으로 복잡도·병렬 가능성·오버헤드 점수 산출
- **AI 컨설팅**: 설문 결과를 컨텍스트로 AI와 심층 대화
- **멀티 API 지원**: Claude / OpenAI / Gemini / Ollama / LM Studio / Custom
- **Docs**: 핵심 개념, 작동 흐름, 의사결정 가이드, Git Worktree 병렬 개발 방법론

## 실행

별도 서버 없이 `index.html`을 브라우저에서 직접 열면 됩니다.

```bash
# 로컬 서버로 실행 (선택)
npx serve .
# 또는
python -m http.server 3000
```

## API 설정

API Key는 브라우저 localStorage에만 저장되며 서버로 전송되지 않습니다.

| 제공자 | API Key 필요 | 비고 |
|--------|-------------|------|
| Claude | ✅ | anthropic.com |
| OpenAI | ✅ | platform.openai.com |
| Gemini | ✅ | aistudio.google.com |
| Ollama | ❌ | localhost:11434 (로컬만) |
| LM Studio | ❌ | localhost:1234 (로컬만) |
| Custom | 선택 | 직접 URL 입력 |

## 배포

```bash
git push -u origin main
# GitHub Settings → Pages → main branch 선택
```

## 버전 히스토리

- `v0.2` — 파일 구조 정리, doc.html 단일 문서화
- `v0.1` — 평가 도구 + AI 컨설팅 + 멀티 API + Docs
