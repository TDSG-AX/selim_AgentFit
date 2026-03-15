# AgentFit

> 내 작업에 멀티에이전트가 맞는지 평가하고, AI와 대화로 아키텍처를 컨설팅받는 도구

**데모** → [https://tdsg-ax.github.io/selim_AgentFit/](https://tdsg-ax.github.io/selim_AgentFit/)

---

## 파일 구조

```
selim_AgentFit/
├── index.html          # 메인 평가 도구 (설문 + AI 컨설팅 + API 설정)
├── doc.html            # 멀티에이전트 방법론 가이드 (4섹션)
├── server.js           # 로컬 프록시 서버 (Claude API 사용 시 필요)
├── knowledge/          # AI 컨설팅 지식베이스
│   ├── 01-fundamentals.md          # 핵심 개념·컨텍스트 전달·실행 패턴
│   ├── 02-decision-framework.md    # 도입 판단 기준·점수 해석·안티패턴
│   ├── 03-implementation-patterns.md  # 6가지 구현 패턴 + 코드 예제
│   └── 04-consulting-prompt.md     # 프롬프트 설계 원칙·로드맵
├── .nojekyll           # GitHub Pages Jekyll 처리 비활성화
└── README.md
```

## 기능

| 기능 | 설명 |
|------|------|
| 설문 평가 | 9개 기준으로 복잡도·병렬 가능성·오버헤드 점수 산출 |
| AI 컨설팅 | 설문 결과 + 지식베이스 기반 구조화 프롬프트로 심층 대화 |
| 멀티 API | Claude / OpenAI / Gemini / Ollama / LM Studio / Custom |
| Docs | 핵심 개념 · 작동 흐름 · 의사결정 · Git Worktree 병렬 개발 |

## AI 컨설팅 구조

설문 완료 후 AI 컨설팅 탭에서 대화를 시작하면, 매 호출마다 아래 내용이 시스템 프롬프트에 자동 주입됩니다.

```
설문 결과 (동적)          의사결정 기준 (고정)        구현 패턴 레퍼런스 (고정)
─────────────────         ──────────────────────      ──────────────────────────
복잡도 / 병렬 / 오버헤드  적합 조건 5가지 + 임계값    오케스트레이터 패턴
Yes / No 항목 목록        부적합 조건                 맵-리듀스
미응답 항목               점수 가중치 해석             체크포인트
종합 판단 결과            안티패턴                    검증 루프
                                                      Git Worktree
```

**컨설팅 진행 단계:**

| 턴 | 목적 | AI 행동 |
|----|------|---------|
| 1~2턴 | 프로젝트 파악 | 목적·규모·현재 방식·팀·기술스택 질문 |
| 3~4턴 | 심층 분석 | 병렬화 지점·의존성 구조·오버헤드 분석 |
| 5턴 | 최종 권고 | 단일/멀티 결정 + 아키텍처 다이어그램 + 구현 시작점 3단계 |

**어떤 AI를 써도 최소 컨설팅 수준이 보장되는 이유:**
프롬프트에 전문가 판단 로직이 내재화되어 있어 AI 자체 사전 학습 지식이 부족해도 구조화된 의사결정 기준을 그대로 따릅니다.
(단, 소형 로컬 모델 3B 이하는 긴 시스템 프롬프트를 무시할 수 있음)

### 지식베이스 `knowledge/`

컨설팅 프롬프트의 기반이 되는 참조 문서입니다. 업종별 케이스나 패턴이 추가되면 프롬프트에 반영합니다.

| 파일 | 내용 |
|------|------|
| `01-fundamentals.md` | 오케스트레이터·서브에이전트 정의, 메모리 없음 원칙, 컨텍스트 전달 |
| `02-decision-framework.md` | 도입 적합·부적합 조건, 점수 가중치, 사례별 판단표, 안티패턴 |
| `03-implementation-patterns.md` | 6가지 패턴 (코드 예제 포함) |
| `04-consulting-prompt.md` | v1→v2 프롬프트 비교, 단계별 질문 설계, v3 로드맵 |

## doc.html 섹션 구성

- `01` 핵심 개념 — 서브태스크 · 서브에이전트 · 오케스트레이터
- `02` 작동 흐름 — 멀티에이전트 파이프라인
- `03` 의사결정 — 단일 vs 멀티에이전트 비교표
- `04` Git 방법론 — Worktree 기반 병렬 개발 (SVG 타임라인 포함)

---

## 로컬 실행 가이드

### API 제공자별 실행 방법

| 제공자 | 실행 방법 | 비고 |
|--------|----------|------|
| Gemini | 파일 직접 열기 | CORS 허용 |
| OpenAI | 파일 직접 열기 | CORS 허용 |
| Ollama | 파일 직접 열기 | localhost API |
| LM Studio | 파일 직접 열기 | localhost API |
| **Claude** | **서버 실행 필수** | CORS 정책으로 브라우저 직접 호출 차단 |

---

### Gemini · OpenAI · Ollama · LM Studio 사용 시

별도 서버 없이 `index.html`을 브라우저에서 직접 열면 됩니다.

```bash
# 파일을 브라우저로 직접 열기
index.html 더블클릭
```

---

### Claude 사용 시 (프록시 서버 필요)

Claude API는 브라우저 보안 정책(CORS)으로 직접 호출이 차단됩니다.
동봉된 `server.js`가 브라우저와 Claude API 사이의 중계 역할을 합니다.

#### 사전 준비

[Node.js](https://nodejs.org) 설치 확인:

```bash
node -v   # v18 이상 권장
```

#### 실행

```bash
# 1. 저장소 폴더로 이동
cd selim_AgentFit

# 2. 서버 시작
node server.js
```

정상 실행 시 터미널에 다음과 같이 표시됩니다:

```
  AgentFit 로컬 서버 실행 중
  ───────────────────────────────
  평가 도구      →  http://localhost:3000
  방법론 가이드  →  http://localhost:3000/doc.html

  종료: Ctrl + C
```

#### 접속

브라우저에서 `http://localhost:3000` 을 직접 입력합니다.
(파일을 더블클릭해서 열면 프록시가 동작하지 않습니다.)

#### API Key 등록

1. 상단 **API 설정** 탭 클릭
2. 제공자 → **Claude** 선택
3. API Key 입력 후 **설정 저장**
4. Key는 브라우저 `localStorage`에만 저장되며 외부로 전송되지 않습니다

#### 종료

```bash
Ctrl + C
```

---

## API 제공자 설정

| 제공자 | Key 필요 | 엔드포인트 |
|--------|---------|-----------|
| Claude | ✅ | anthropic.com |
| OpenAI | ✅ | platform.openai.com |
| Gemini | ✅ | aistudio.google.com |
| Ollama | ❌ | localhost:11434 (로컬만) |
| LM Studio | ❌ | localhost:1234 (로컬만) |
| Custom | 선택 | 직접 URL 입력 |

---


## 버전 히스토리

| 버전 | 내용 |
|------|------|
| v0.5 | AI 컨설팅 지식베이스 구축, 구조화 프롬프트 v2, max_tokens 1500 |
| v0.4 | 로컬 프록시 서버 추가 (server.js), Claude CORS 우회 |
| v0.3 | SVG git 타임라인, 코드블록 줄바꿈, 로고 TDSG·#3b6cf5, max-width 수정 |
| v0.2 | 파일 구조 단순화 (docs/ → doc.html 루트), GitHub Pages 설정 |
| v0.1 | 평가 도구 + AI 컨설팅 + 멀티 API + Docs |
