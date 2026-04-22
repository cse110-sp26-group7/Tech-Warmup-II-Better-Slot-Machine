# Project Considerations

> Tech Warmup II — Better Slot Machine 프로젝트 의사결정 참고 문서
> 도메인 리서치(`domain_research.md`) 이후, 팀이 설계·요구사항을 도출할 때 참고할 노트

---

## 목차

1. [요구사항 (Reference)](#1-요구사항-reference)
2. [UX 패턴과 행동 심리학](#2-ux-패턴과-행동-심리학)
3. [법/규제 및 공정성](#3-법규제-및-공정성)
4. [책임 게이밍](#4-책임-게이밍-responsible-gambling)
5. [기술 스택 고려사항](#5-기술-스택-고려사항)
6. [프로젝트 권장 사항](#6-프로젝트-권장-사항)

---

## 1. 요구사항 (Reference)

> 이 섹션은 *일반적* 슬롯머신 SW의 레퍼런스 요구사항이다.
> 팀 프로젝트의 실제 요구사항은 스테이크홀더/페르소나 분석 후 별도 문서로 도출한다.

### Functional

- 베팅 조절 (+/-, max bet)
- 스핀 실행 (single / auto-spin)
- 릴 애니메이션 + 결과 표시
- 페이라인별 당첨 판정 및 하이라이트
- 페이테이블 조회 UI
- 잔액(credits) 관리
- 보너스/프리스핀 트리거 처리
- 게임 히스토리/통계

### Non-functional

- **공정성 (Fairness)** — 검증 가능한 RNG, seed 기록
- **성능** — 스핀 응답 < 100ms, 60fps 애니메이션
- **보안** — 클라이언트 조작 방지 (서버 결과 결정 권장)
- **접근성 (a11y)** — 키보드 조작, 스크린리더, 색각 이상 고려
- **반응형** — 데스크톱/모바일 레이아웃
- **국제화 (i18n)** — 통화, 언어
- **책임 게이밍** — 세션 타이머, 손실 한도, self-exclusion, reality check

---

## 2. UX 패턴과 행동 심리학

슬롯은 **의도적 심리 설계**가 강한 도메인이다. 프로젝트에서 윤리적 선택을 해야 함:

- **Near-miss effect** — "거의 맞을 뻔"한 릴 정지 → 도박 지속 유도 (윤리 논란)
- **Losses disguised as wins (LDW)** — 베팅보다 적게 따도 승리 연출
- **Anticipation build-up** — 마지막 릴이 느리게 멈춤
- **Variable-ratio reinforcement** — 스키너 박스와 동일 원리
- **Celebration scaling** — Small win / Big win / Mega win / Jackpot 연출 차별화

→ CSE 110 "Good Software" 기준에서 이걸 어떻게 다룰지가 팀 토론 포인트 (*ethics in SE*).

---

## 3. 법/규제 및 공정성

- **인증 표준:** GLI-11 (Gaming Laboratories International), WLA-SCS
- **주요 규제기관:** UKGC (영국), MGA (몰타), NGCB (네바다), AGCO (온타리오)
- **RNG 요건:** 암호학적 품질, seed 재현 불가, 통계 검증 (Chi-square, runs test 등)
- **RTP 공시 의무** — 여러 관할에서 요구
- **최소 연령** — 보통 18~21세
- **교육 프로젝트의 경우:** 실제 돈 배제, 시뮬레이션만, 페이크 크레딧 사용 → 규제 회피

---

## 4. 책임 게이밍 (Responsible Gambling)

프로젝트의 **차별화 요소**가 될 수 있는 부분:

- 세션 시간 경고 (Reality Check every 30min)
- 손실/입금 한도 (daily/weekly/monthly)
- Self-exclusion (단기/영구)
- RTP/확률 명확 공시
- 도움말 링크 (GamCare, BeGambleAware)
- "쿨다운" 스핀 간 지연 옵션

---

## 5. 기술 스택 고려사항

웹 기반 기준:

| 레이어          | 옵션                                                       |
| ------------ | -------------------------------------------------------- |
| **렌더링**      | HTML5 Canvas, **PixiJS**, Phaser, SVG/DOM                |
| **상태 관리**    | 순수 JS 클래스, Redux, Zustand                                |
| **애니메이션**    | GSAP, PixiJS tween                                       |
| **사운드**      | Web Audio API, Howler.js                                 |
| **RNG**      | `crypto.getRandomValues()` (브라우저), seedable PRNG for 테스트 |
| **백엔드 (선택)** | Node.js — 결과 서버 사이드 결정 (anti-cheat)                      |
| **테스팅**      | Jest/Vitest (math model), Playwright (E2E)               |

→ CSE 110 규모라면 **프론트엔드만으로 완결** (HTML/CSS/JS + 선택적 Canvas 라이브러리)도 충분.

---

## 6. 프로젝트 권장 사항

### 6.1 릴/룰 조합 선택지

| 옵션                         | 구성                                                 | 특징                            | 적합한 상황                          |
| -------------------------- | -------------------------------------------------- | ----------------------------- | ------------------------------- |
| **A. 클래식 3릴**              | 3릴 × 3줄, 5 paylines + Wild(+Multiplier)            | 실제 Vegas 스타일 재현. Free Spin 없음 | 팀 2~3명, 짧은 기간, 레트로 컨셉           |
| **B. 현대 5릴**               | 5릴 × 3줄, 10~20 paylines + Wild + Scatter→Free Spin | 현대 온라인 슬롯 표준. 피처 풍부           | **권장 기본값**. 팀 4~5명              |
| **C. 혼합 (3릴 + Free Spin)** | 3릴 + Scatter Free Spin                             | 교육적 가성비 좋으나 **시장 레퍼런스는 드묾**   | "도메인 리서치 기반 설계"를 강조하는 포트폴리오엔 불리 |
