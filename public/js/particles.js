// 동적 배경 파티클 시스템 (Canvas 기반)
// body::before 정적 별 효과를 대체하는 살아있는 파티클 배경

(function () {
  // ========== 설정 ==========
  const CONFIG = {
    // 성능 감지: 저사양이면 파티클 수 절반
    get PARTICLE_COUNT() {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const lowEnd = navigator.hardwareConcurrency <= 2;
      return (reducedMotion || lowEnd) ? 75 : 150;
    },
    MAX_SPEED: 0.6,          // 평시 최대 속도 (px/frame)
    BURST_SPEED: 12,         // 화면 전환 폭발 최대 속도
    BURST_DECAY: 0.025,      // 폭발 후 감속 계수 (lerp rate)
    MOUSE_RADIUS: 130,       // 마우스 반응 반경 (px)
    MOUSE_FORCE: 0.04,       // 마우스 끌림 강도
    TRAIL_ALPHA: 0.18,       // 잔상 효과 알파 (낮을수록 긴 잔상)
    AURORA_COUNT: 3,         // 오로라 blob 개수
  };

  // ========== 전역 상태 ==========
  let canvas, ctx;
  let W, H;                  // 캔버스 크기 (실제 픽셀)
  let dpr = 1;
  let particles = [];
  let auroraBlobs = [];
  let mouse = { x: -9999, y: -9999 };
  let rafId = null;
  let isBursting = false;    // 화면 전환 폭발 중 여부

  // ========== 파티클 생성 ==========

  function createParticle(forceRandom = true) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * CONFIG.MAX_SPEED * 0.5 + 0.05;
    return {
      x: forceRandom ? Math.random() * W : Math.random() * W,
      y: forceRandom ? Math.random() * H : Math.random() * H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      // 목표 속도 (폭발 후 복귀 대상)
      tvx: Math.cos(angle) * speed,
      tvy: Math.sin(angle) * speed,
      size: Math.random() * 1.5 + 0.3,
      opacity: Math.random(),
      opacityDelta: (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      // 색상: 흰색/연보라/연파랑 중 무작위
      color: ['255,255,255', '200,180,255', '180,210,255'][Math.floor(Math.random() * 3)],
    };
  }

  function createAuroraBlob(index) {
    const hues = [
      { r: 107, g: 33,  b: 168 },  // 보라 #6b21a8
      { r: 74,  g: 144, b: 217 },  // 파랑 #4a90d9
      { r: 147, g: 51,  b: 234 },  // 밝은 보라 #9333ea
    ];
    const c = hues[index % hues.length];
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.15 + Math.random() * 0.1;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: W * (0.3 + Math.random() * 0.2),  // 반지름 (화면 30~50%)
      alpha: 0.04 + Math.random() * 0.03,
      color: c,
      // 색상 펄싱 위한 시간 오프셋
      timeOffset: Math.random() * Math.PI * 2,
    };
  }

  // ========== 초기화 ==========

  function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    canvas.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      'z-index:0',
      'pointer-events:none',
    ].join(';');
    document.body.insertBefore(canvas, document.body.firstChild);

    ctx = canvas.getContext('2d');
    resize();

    // 파티클 초기 생성
    const count = CONFIG.PARTICLE_COUNT;
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(true));
    }

    // 오로라 blob 초기 생성
    for (let i = 0; i < CONFIG.AURORA_COUNT; i++) {
      auroraBlobs.push(createAuroraBlob(i));
    }

    // 이벤트 리스너
    window.addEventListener('resize', debounce(resize, 200));
    window.addEventListener('mousemove', onMouseMove);

    // 애니메이션 루프 시작
    rafId = requestAnimationFrame(loop);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth * dpr;
    H = window.innerHeight * dpr;
    canvas.width = W;
    canvas.height = H;
    // CSS 크기는 실제 화면 크기로 유지 (DPR 보정은 canvas.width/height로)
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }

  function onMouseMove(e) {
    mouse.x = e.clientX * dpr;
    mouse.y = e.clientY * dpr;
  }

  // ========== 애니메이션 루프 ==========

  let time = 0;

  function loop() {
    rafId = requestAnimationFrame(loop);
    time += 0.01;

    // 잔상 효과: clearRect 대신 반투명 fill로 이전 프레임 서서히 지우기
    ctx.fillStyle = `rgba(10, 10, 26, ${CONFIG.TRAIL_ALPHA})`;
    ctx.fillRect(0, 0, W, H);

    drawAurora();
    updateAndDrawParticles();
  }

  // ========== 오로라 레이어 ==========

  function drawAurora() {
    auroraBlobs.forEach((blob, i) => {
      // 이동
      blob.x += blob.vx;
      blob.y += blob.vy;

      // 화면 밖으로 나가면 반대편 재등장
      if (blob.x < -blob.r) blob.x = W + blob.r;
      if (blob.x > W + blob.r) blob.x = -blob.r;
      if (blob.y < -blob.r) blob.y = H + blob.r;
      if (blob.y > H + blob.r) blob.y = -blob.r;

      // 색상 펄싱: sin 파형으로 알파 변화
      const pulsedAlpha = blob.alpha * (0.6 + 0.4 * Math.sin(time * 0.7 + blob.timeOffset));

      const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
      grad.addColorStop(0, `rgba(${blob.color.r},${blob.color.g},${blob.color.b},${pulsedAlpha})`);
      grad.addColorStop(1, `rgba(${blob.color.r},${blob.color.g},${blob.color.b},0)`);

      ctx.save();
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ========== 별 파티클 업데이트 및 그리기 ==========

  function updateAndDrawParticles() {
    particles.forEach(p => {
      // 마우스 반응: 가까운 별은 마우스 쪽으로 끌림
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONFIG.MOUSE_RADIUS && dist > 0) {
        const force = (1 - dist / CONFIG.MOUSE_RADIUS) * CONFIG.MOUSE_FORCE;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // 폭발 중이면 목표 속도로 점진적 복귀 (lerp)
      if (isBursting) {
        p.vx = lerp(p.vx, p.tvx, CONFIG.BURST_DECAY);
        p.vy = lerp(p.vy, p.tvy, CONFIG.BURST_DECAY);

        // 복귀 완료 판정: 모든 파티클이 목표에 가까우면 isBursting 해제
        // (개별 파티클에서 확인하지 않고 별도 타이머로 관리 → triggerScreenTransition에서 처리)
      }

      // 속도 클리핑 (평시: MAX_SPEED, 폭발 중: BURST_SPEED)
      const maxSpd = isBursting ? CONFIG.BURST_SPEED : CONFIG.MAX_SPEED;
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > maxSpd) {
        p.vx = (p.vx / speed) * maxSpd;
        p.vy = (p.vy / speed) * maxSpd;
      }

      // 위치 이동
      p.x += p.vx;
      p.y += p.vy;

      // 화면 밖 나가면 반대편 재등장
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      if (p.y < -5) p.y = H + 5;
      if (p.y > H + 5) p.y = -5;

      // 반짝임 (opacity 펄싱)
      p.opacity += p.opacityDelta;
      if (p.opacity >= 1) { p.opacity = 1; p.opacityDelta = -Math.abs(p.opacityDelta); }
      if (p.opacity <= 0) { p.opacity = 0; p.opacityDelta = Math.abs(p.opacityDelta); }

      // 그리기
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = `rgb(${p.color})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ========== 화면 전환 폭발 효과 ==========

  function triggerScreenTransition(screenId) {
    // 파티클 전체에 랜덤 방향으로 강한 속도 부여
    particles.forEach(p => {
      const angle = Math.random() * Math.PI * 2;
      const burst = CONFIG.BURST_SPEED * (0.4 + Math.random() * 0.6);
      p.vx = Math.cos(angle) * burst;
      p.vy = Math.sin(angle) * burst;
    });

    isBursting = true;

    // 1.8초 후 폭발 해제 (lerp 복귀가 자연스럽게 완료되도록)
    clearTimeout(triggerScreenTransition._timer);
    triggerScreenTransition._timer = setTimeout(() => {
      isBursting = false;
    }, 1800);
  }

  // ========== 유틸리티 ==========

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ========== 전역 노출 ==========

  window.ParticleSystem = {
    triggerScreenTransition,
  };

  // DOM 준비 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
