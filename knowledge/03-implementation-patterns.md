# 멀티에이전트 구현 패턴 카탈로그

## 패턴 1: 오케스트레이터–서브에이전트 (기본)

### 구조
```
[오케스트레이터]
    ├── 태스크 분해
    ├── 서브에이전트 A 호출 → 결과 수집
    ├── 서브에이전트 B 호출 → 결과 수집
    └── 결과 통합 → 최종 출력
```

### 언제 사용
- 역할이 명확히 구분되는 3개 이상 전문 태스크
- 각 역할에 다른 시스템 프롬프트가 효과적인 경우

### 구현 예
```python
def orchestrate(goal: str) -> str:
    # 1. 태스크 분해
    tasks = decompose(goal)  # ["리서치", "분석", "작성"]

    # 2. 병렬 실행
    results = {}
    results["research"] = run_agent("리서처", tasks["research"], context="")
    results["analysis"] = run_agent("분석가", tasks["analysis"], context=results["research"])
    results["writing"]  = run_agent("작성자",  tasks["writing"],  context=str(results))

    return results["writing"]
```

---

## 패턴 2: 병렬 맵–리듀스

### 구조
```
[오케스트레이터]
    ├── 입력 청크 분할 [A, B, C, D, E]
    │       ↓ 병렬 실행
    ├── 에이전트(A) + 에이전트(B) + 에이전트(C) + ...
    │       ↓ 결과 수집
    └── 리듀서 → 결과 통합
```

### 언제 사용
- 동일한 작업을 대규모 데이터에 반복 적용
- 문서 100개 요약, 50개 언어 번역, 데이터 배치 처리

### 구현 예
```python
import asyncio

async def map_reduce(items: list, task_template: str) -> str:
    # Map: 병렬 처리
    async def process(item):
        return await run_agent_async(task_template.format(item=item))

    mapped = await asyncio.gather(*[process(item) for item in items])

    # Reduce: 결과 통합
    combined = "\n\n".join(mapped)
    return run_agent("통합자", f"다음 결과들을 통합하세요:\n{combined}")
```

---

## 패턴 3: 체크포인트–재시도

### 구조
```
[오케스트레이터]
    ├── Step 1 실행 → 체크포인트 저장 ✓
    ├── Step 2 실행 → 실패 ✗
    │       ↓ 재시도 (Step 1 결과 재사용)
    ├── Step 2 재실행 → 체크포인트 저장 ✓
    └── Step 3 실행 → 완료
```

### 언제 사용
- 장시간 실행 파이프라인
- API 오류 빈도 높은 환경
- 부분 완료 상태 보존 필요

### 구현 예
```python
import json, os

def run_with_checkpoint(steps: list, checkpoint_file="checkpoint.json"):
    # 기존 체크포인트 로드
    done = {}
    if os.path.exists(checkpoint_file):
        done = json.load(open(checkpoint_file))

    results = dict(done)
    for step in steps:
        if step["id"] in done:
            print(f"스킵 (캐시됨): {step['id']}")
            continue

        result = run_agent(step["agent"], step["task"], context=str(results))
        results[step["id"]] = result

        # 체크포인트 저장
        json.dump(results, open(checkpoint_file, "w"))

    return results
```

---

## 패턴 4: 검증 루프 (Verifier Loop)

### 구조
```
[오케스트레이터]
    ├── 생성 에이전트 → 초안
    ├── 검증 에이전트 → 피드백 (통과/수정 필요)
    │       ↓ 수정 필요 시
    ├── 생성 에이전트 → 재작성 (피드백 반영)
    ├── 검증 에이전트 → 통과 ✓
    └── 최종 출력
```

### 언제 사용
- 높은 품질 기준이 요구되는 콘텐츠
- 코드 생성 + 테스트 자동화
- 최대 반복 횟수 설정 필수 (무한 루프 방지)

### 구현 예
```python
def generate_with_verification(task: str, max_iterations=3) -> str:
    draft = run_agent("생성자", task)

    for i in range(max_iterations):
        feedback = run_agent("검증자",
            f"다음 결과물을 검증하세요. 기준 미달 시 구체적 수정 사항을 제시하세요.\n\n{draft}")

        if "통과" in feedback or "PASS" in feedback.upper():
            return draft

        draft = run_agent("생성자",
            f"원래 태스크: {task}\n\n피드백을 반영하여 수정하세요:\n{feedback}\n\n현재 버전:\n{draft}")

    return draft  # 최대 반복 후 현재 버전 반환
```

---

## 패턴 5: Git Worktree 병렬 개발

### 구조
```
main 브랜치
    ├── git worktree add ../agent-research feat/research
    ├── git worktree add ../agent-analysis feat/analysis
    └── git worktree add ../agent-writer   feat/writer

[병렬 실행]
agent-research/ ← 에이전트 A (독립 작업)
agent-analysis/ ← 에이전트 B (독립 작업)
agent-writer/   ← 에이전트 C (독립 작업)

[통합]
PR feat/research → main
PR feat/analysis → main
PR feat/writer   → main
```

### 언제 사용
- Claude Code 등 파일 시스템 에이전트 병렬 실행
- 에이전트가 서로 다른 파일을 수정하는 코드 작업
- 브랜치 전략이 필요한 대규모 개발 자동화

### 워크트리 명령어
```bash
# 워크트리 생성
git worktree add ../agent-a feat/task-a
git worktree add ../agent-b feat/task-b

# 각 워크트리에서 Claude Code 실행
cd ../agent-a && claude "feat/task-a 작업 수행"
cd ../agent-b && claude "feat/task-b 작업 수행"

# 작업 완료 후 정리
git worktree remove ../agent-a
git worktree remove ../agent-b

# PR 생성 후 main 병합
git merge feat/task-a feat/task-b
```

---

## 패턴 6: 다중 레이어 오케스트레이션

### 구조
```
[최상위 오케스트레이터]
    ├── [중간 오케스트레이터 A]
    │       ├── 서브에이전트 A1
    │       └── 서브에이전트 A2
    └── [중간 오케스트레이터 B]
            ├── 서브에이전트 B1
            └── 서브에이전트 B2
```

### 언제 사용
- 매우 복잡한 대규모 프로젝트
- 영역별 독립적인 오케스트레이션 필요
- 주의: 복잡도 급증, 2레이어 이상은 신중하게

---

## 패턴 선택 가이드

| 상황 | 권장 패턴 |
|------|----------|
| 역할이 3개, 일부 순차 의존 | 오케스트레이터–서브에이전트 |
| 동일 작업 × 대량 데이터 | 병렬 맵–리듀스 |
| 장시간·고비용 파이프라인 | 체크포인트–재시도 |
| 높은 품질 기준 콘텐츠 | 검증 루프 |
| 파일 시스템 병렬 코드 작업 | Git Worktree |
| 거대 프로젝트 도메인 분리 | 다중 레이어 (신중하게) |
