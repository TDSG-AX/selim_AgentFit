# 멀티에이전트 시스템 핵심 개념

## 1. 구성 요소 정의

### 오케스트레이터 (Orchestrator)
- 전체 목표를 받아 서브태스크로 분해하는 중앙 에이전트
- 각 서브에이전트에게 작업을 배정하고 결과를 통합
- 실패한 서브태스크만 선택적으로 재실행 가능
- 코드 또는 AI 자체가 오케스트레이터 역할 수행 가능

### 서브에이전트 (Subagent)
- 오케스트레이터로부터 단일 서브태스크를 받아 실행하는 전문 에이전트
- 서로의 존재를 모름 — 독립적으로 실행
- 자체 도구(파일 읽기, 웹 검색, 코드 실행 등) 보유 가능
- 결과는 오케스트레이터에게만 반환

### 서브태스크 (Subtask)
- 오케스트레이터가 분해한 개별 실행 단위
- 명확한 입력·출력·완료 기준 필요
- 의존성이 없는 서브태스크는 병렬 실행 가능

---

## 2. 에이전트 메모리 없음 원칙

멀티에이전트 시스템의 가장 중요한 특성:

> **에이전트 간 공유 메모리 없음 — 매 호출마다 컨텍스트를 명시적으로 전달해야 함**

```
잘못된 방식:
에이전트 A 실행 → 에이전트 B가 A의 결과를 "알고 있다고 가정" ❌

올바른 방식:
에이전트 A 실행 → 결과 저장 → 에이전트 B 호출 시 A의 결과를 프롬프트에 포함 ✅
```

### 컨텍스트 전달 방법
| 방법 | 적합 상황 | 예시 |
|------|----------|------|
| 프롬프트 직접 포함 | 짧은 결과 (수백 토큰 이내) | 요약문, 점수, 키워드 |
| 파일 경유 | 긴 결과, 구조화 데이터 | JSON, 마크다운 보고서 |
| 공유 메모리 파일 | 반복 참조 데이터 | MEMORY.md, context.json |
| 데이터베이스 | 대규모 상태 관리 | 프로덕션 파이프라인 |

---

## 3. 실행 패턴

### 순차 실행 (Sequential)
```
오케스트레이터 → A → B → C → 결과 통합
```
- A의 출력이 B의 입력으로 필요할 때
- 오류 전파 위험 있음 (A 실패 시 전체 중단)

### 병렬 실행 (Parallel)
```
              ┌→ A ──┐
오케스트레이터 ─┼→ B ──┼→ 결과 통합
              └→ C ──┘
```
- 서브태스크 간 의존성 없을 때
- 전체 실행 시간 = 가장 오래 걸리는 서브태스크 시간
- Promise.all / 비동기 병렬 실행으로 구현

### 혼합 실행 (Mixed)
```
              ┌→ A1 ─┐         ┌→ C ──┐
오케스트레이터 ─┤       ├→ B ────┤       ├→ 최종 통합
              └→ A2 ─┘         └→ D ──┘
```
- 실제 프로젝트에서 가장 흔한 패턴
- DAG(방향 비순환 그래프) 구조로 의존성 관리

---

## 4. 에이전트 역할 유형

| 역할 | 설명 | 전형적 도구 |
|------|------|------------|
| 리서처 (Researcher) | 정보 수집, 웹 검색, 문서 분석 | 웹 검색, 파일 읽기 |
| 분석가 (Analyst) | 데이터 처리, 패턴 발견, 평가 | 코드 실행, 계산 |
| 작성자 (Writer) | 콘텐츠 생성, 보고서 작성 | 파일 쓰기 |
| 검증자 (Verifier) | 품질 검사, 테스트 실행 | 테스트 도구, 비교 |
| 통합자 (Integrator) | 오케스트레이터 역할, 결과 병합 | 모든 도구 |

---

## 5. 클로드 에이전트 SDK 핵심

```python
# 기본 멀티에이전트 호출 패턴 (Python)
import anthropic

client = anthropic.Anthropic()

def run_subagent(task: str, context: str) -> str:
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=f"당신은 전문 {role} 에이전트입니다. 주어진 태스크만 수행하세요.",
        messages=[{
            "role": "user",
            "content": f"컨텍스트:\n{context}\n\n태스크:\n{task}"
        }]
    )
    return response.content[0].text

# 병렬 실행
import asyncio

async def run_parallel(tasks: list[dict]) -> list[str]:
    results = await asyncio.gather(*[
        asyncio.to_thread(run_subagent, t["task"], t["context"])
        for t in tasks
    ])
    return results
```

---

## 참고 자료
- [Anthropic 멀티에이전트 가이드](https://docs.anthropic.com/en/docs/build-with-claude/agents)
- [Claude Agent SDK](https://docs.anthropic.com/en/docs/agents-and-tools/agent-sdk)
