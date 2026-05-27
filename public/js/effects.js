// 카드 스파크 효과 / 플립 Flash / 오라클 수정구슬 로딩 UI

(function () {
  // ========== 스파크 파티클 설정 ==========
  const SPARK_COUNT = 28;        // 카드 클릭 시 생성할 스파크 수
  const MAX_SPARKS = 200;        // DOM 누적 방지 상한선
  const SPARK_COLORS = [
    '#f59e0b',  // gold
    '#f59e0b',  // gold (비중 높임)
    '#9333ea',  // arcane purple
    '#4a90d9',  // celestial blue
    '#e8d5b7',  // starlight
  ];
  let activeSparkCount = 0;

  // ========== 카드 스파크 효과 ==========

  function triggerCardSpark(cardElement) {
    const rect = cardElement.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < SPARK_COUNT; i++) {
      if (activeSparkCount >= MAX_SPARKS) break;

      const spark = document.createElement('div');
      spark.className = 'card-spark';

      const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
      const size = 3 + Math.random() * 4;  // 3~7px
      spark.style.cssText = `
        left:${cx}px;
        top:${cy}px;
        width:${size}px;
        height:${size}px;
        background:${color};
        box-shadow: 0 0 ${size * 2}px ${color};
      `;
      document.body.appendChild(spark);
      activeSparkCount++;

      // 랜덤 발사 각도 (전방향 + 상단 집중으로 폭죽 느낌)
      const angle = (Math.PI * 2 * i / SPARK_COUNT) + (Math.random() - 0.5) * 0.5;
      const speed = 3 + Math.random() * 7;
      let vx = Math.cos(angle) * speed;
      let vy = Math.sin(angle) * speed - 1; // 약간 위쪽으로 편향
      let x = cx, y = cy;
      let opacity = 1;

      const animate = () => {
        vy += 0.22;    // 중력 가속
        vx *= 0.97;    // 공기 저항
        x += vx;
        y += vy;
        opacity -= 0.033;

        spark.style.transform = `translate(${x - cx}px, ${y - cy}px)`;
        spark.style.opacity = opacity;

        if (opacity > 0) {
          requestAnimationFrame(animate);
        } else {
          spark.remove();
          activeSparkCount--;
        }
      };
      requestAnimationFrame(animate);
    }
  }

  // ========== 선택된 카드 지속 파티클 ==========

  function startSelectedCardParticles(cardElement) {
    // 이미 실행 중이면 중복 방지
    if (cardElement.dataset.particleInterval) return;

    const intervalId = setInterval(() => {
      if (!document.body.contains(cardElement)) {
        clearInterval(intervalId);
        return;
      }

      // 1~2개 소형 파티클 생성
      const count = Math.random() > 0.5 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        if (activeSparkCount >= MAX_SPARKS) break;

        const rect = cardElement.getBoundingClientRect();
        // 카드 테두리 근방 랜덤 위치
        const edgeX = rect.left + Math.random() * rect.width;
        const edgeY = rect.top + Math.random() * rect.height;

        const spark = document.createElement('div');
        spark.className = 'card-spark';
        const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
        const size = 2 + Math.random() * 2;
        spark.style.cssText = `
          left:${edgeX}px;
          top:${edgeY}px;
          width:${size}px;
          height:${size}px;
          background:${color};
          box-shadow: 0 0 ${size * 3}px ${color};
        `;
        document.body.appendChild(spark);
        activeSparkCount++;

        // 위로 흘러올라가며 사라지는 효과
        let x = edgeX, y = edgeY;
        let vx = (Math.random() - 0.5) * 1.2;
        let vy = -(0.5 + Math.random() * 1.5);
        let opacity = 0.8;

        const animate = () => {
          x += vx;
          y += vy;
          opacity -= 0.025;
          spark.style.left = x + 'px';
          spark.style.top = y + 'px';
          spark.style.opacity = opacity;

          if (opacity > 0) {
            requestAnimationFrame(animate);
          } else {
            spark.remove();
            activeSparkCount--;
          }
        };
        requestAnimationFrame(animate);
      }
    }, 180);

    cardElement.dataset.particleInterval = intervalId;
  }

  function stopSelectedCardParticles(cardElement) {
    const id = cardElement.dataset.particleInterval;
    if (id) {
      clearInterval(parseInt(id));
      delete cardElement.dataset.particleInterval;
    }
  }

  // ========== 카드 플립 Flash 효과 ==========

  function triggerFlipFlash(intensity = 0.6) {
    // prefers-reduced-motion 시 스킵
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const flash = document.createElement('div');
    flash.style.cssText = `
      position:fixed;
      inset:0;
      background: radial-gradient(ellipse at center,
        rgba(255,255,255,${intensity}) 0%,
        rgba(200,180,255,${intensity * 0.4}) 30%,
        rgba(255,255,255,0) 70%);
      pointer-events:none;
      z-index:998;
      animation: flashFade 0.65s ease-out forwards;
    `;
    document.body.appendChild(flash);
    flash.addEventListener('animationend', () => flash.remove());
  }

  // ========== 오라클 수정구슬 로딩 UI ==========

  const RUNE_SYMBOLS = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', '★', '✦', '◈', '⊕'];
  const ORBIT_SPEEDS = [0.7, -0.5, 0.9, -0.6, 0.4, -0.8, 0.6, -0.45];

  let oracleCanvas = null;
  let oracleCtx = null;
  let oracleRafId = null;
  let oracleTime = 0;
  let isOracleActive = false;

  function initOracleSphere() {
    oracleCanvas = document.querySelector('.oracle-canvas');
    if (!oracleCanvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // CSS: 200×200px, 실제 픽셀: dpr 반영
    oracleCanvas.width = 200 * dpr;
    oracleCanvas.height = 200 * dpr;
    oracleCtx = oracleCanvas.getContext('2d');
    oracleCtx.scale(dpr, dpr);
  }

  function startOracleAnimation() {
    if (!oracleCanvas) initOracleSphere();
    if (!oracleCanvas || !oracleCtx) return;
    if (isOracleActive) return;

    isOracleActive = true;
    oracleTime = 0;
    drawOracleFrame();
  }

  function stopOracleAnimation() {
    isOracleActive = false;
    if (oracleRafId) {
      cancelAnimationFrame(oracleRafId);
      oracleRafId = null;
    }
    // 캔버스 초기화
    if (oracleCtx) {
      oracleCtx.clearRect(0, 0, 200, 200);
    }
  }

  function drawOracleFrame() {
    if (!isOracleActive) return;

    oracleTime += 0.025;
    const ctx = oracleCtx;
    const cx = 100, cy = 100, r = 55;

    // 배경 클리어
    ctx.clearRect(0, 0, 200, 200);

    // ---- 1. 외부 글로우 (구체 주변 발광) ----
    const glowPulse = 0.25 + 0.08 * Math.sin(oracleTime * 1.5);
    const glow = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 2.2);
    glow.addColorStop(0, `rgba(147, 51, 234, ${glowPulse})`);
    glow.addColorStop(0.5, `rgba(74, 144, 217, ${glowPulse * 0.4})`);
    glow.addColorStop(1, 'rgba(147, 51, 234, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // ---- 2. 구체 본체 (입체감 있는 radial gradient) ----
    // 하이라이트 위치: 좌상단 (실제 수정구슬처럼)
    const highlightX = cx - r * 0.32;
    const highlightY = cy - r * 0.32;
    const body = ctx.createRadialGradient(highlightX, highlightY, r * 0.05, cx, cy, r);
    body.addColorStop(0, 'rgba(210, 180, 255, 0.95)');   // 밝은 하이라이트
    body.addColorStop(0.25, 'rgba(147, 51, 234, 0.9)');  // 밝은 보라
    body.addColorStop(0.6, 'rgba(88, 28, 135, 0.92)');   // 진한 보라
    body.addColorStop(1, 'rgba(20, 5, 45, 0.97)');       // 거의 검정 테두리
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // ---- 3. 구체 내부 움직이는 안개 효과 ----
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
    ctx.clip();  // 구체 경계 안으로 클리핑

    for (let i = 0; i < 3; i++) {
      const fogAngle = oracleTime * (0.3 + i * 0.15) + (Math.PI * 2 * i / 3);
      const fogX = cx + Math.cos(fogAngle) * r * 0.3;
      const fogY = cy + Math.sin(fogAngle) * r * 0.2;
      const fogR = r * (0.5 + i * 0.1);
      const fogAlpha = 0.06 + 0.04 * Math.sin(oracleTime * 2 + i);

      const fog = ctx.createRadialGradient(fogX, fogY, 0, fogX, fogY, fogR);
      fog.addColorStop(0, `rgba(180, 140, 255, ${fogAlpha})`);
      fog.addColorStop(1, 'rgba(180, 140, 255, 0)');

      ctx.fillStyle = fog;
      ctx.beginPath();
      ctx.arc(fogX, fogY, fogR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ---- 4. 룬 기호 궤도 공전 ----
    RUNE_SYMBOLS.forEach((sym, i) => {
      const orbitAngle = oracleTime * ORBIT_SPEEDS[i] + (Math.PI * 2 * i / RUNE_SYMBOLS.length);

      // 타원 궤도: X축이 더 넓음, Y축은 좁음 (3D 원근 효과)
      const orbitRx = r * 1.55;
      const orbitRy = r * 0.45;

      const px = cx + orbitRx * Math.cos(orbitAngle);
      const py = cy + orbitRy * Math.sin(orbitAngle);

      // sin(orbitAngle)이 클수록 "앞쪽" → 더 크고 밝게
      const depth = (Math.sin(orbitAngle) + 1) / 2;  // 0~1

      // 구체 뒤에 있는 룬은 숨기기 (depth가 낮고 중심에 가까우면)
      const distFromCenter = Math.abs(px - cx);
      if (depth < 0.15 && distFromCenter < r * 0.8) return;

      ctx.save();
      ctx.globalAlpha = 0.2 + depth * 0.8;

      const fontSize = Math.floor(10 + depth * 8);
      ctx.font = `${fontSize}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 색상: gold 계열, 앞쪽일수록 밝게
      const brightness = 50 + depth * 40;
      ctx.fillStyle = `hsl(42, 100%, ${brightness}%)`;

      // 앞쪽 룬에는 glow 효과
      if (depth > 0.6) {
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 6 + depth * 6;
      }

      ctx.fillText(sym, px, py);
      ctx.restore();
    });

    // ---- 5. 구체 표면 하이라이트 반짝임 ----
    const shimmerAlpha = 0.15 + 0.12 * Math.sin(oracleTime * 3.5);
    const shimmer = ctx.createRadialGradient(
      highlightX, highlightY, 0,
      highlightX, highlightY, r * 0.45
    );
    shimmer.addColorStop(0, `rgba(255, 255, 255, ${shimmerAlpha})`);
    shimmer.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shimmer;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    oracleRafId = requestAnimationFrame(drawOracleFrame);
  }

  // ========== 전역 노출 ==========

  window.Effects = {
    triggerCardSpark,
    startSelectedCardParticles,
    stopSelectedCardParticles,
    triggerFlipFlash,
    startOracleAnimation,
    stopOracleAnimation,
  };

  // DOM 준비 후 오라클 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOracleSphere);
  } else {
    initOracleSphere();
  }
})();
