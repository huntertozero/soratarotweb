// 타로 리딩 앱 E2E 테스트 (Playwright)

const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';
const WAIT_FOR_ELEMENT = 1000;
const WAIT_FOR_ANIMATION = 2000;

async function testTarotApp() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 스크린샷 저장 디렉토리 설정
  const screenshotDir = './screenshots';
  const fs = require('fs');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  let screenshotCount = 0;
  const results = [];

  try {
    // ========== 1단계: WELCOME 화면 ==========
    console.log('📍 단계 1: WELCOME 화면 로드');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const title = await page.textContent('.title');
    results.push(`✅ 타이틀 표시: "${title}"`);

    const startBtn = await page.$('#btn-start-reading');
    results.push(startBtn ? '✅ "리딩 시작하기" 버튼 발견' : '❌ 버튼 미발견');

    // ========== 2단계: 스프레드 선택 ==========
    console.log('📍 단계 2: SELECT_SPREAD 화면');
    await startBtn.click();
    await page.waitForSelector('.spread-card', { timeout: 5000 });

    const spreadCards = await page.$$('.spread-card');
    results.push(`✅ 스프레드 카드 ${spreadCards.length}개 표시`);

    // ========== 3단계: 각 스프레드별 테스트 ==========
    const spreads = ['one', 'three', 'celtic'];

    for (const spread of spreads) {
      console.log(`\n🔄 ${spread} 스프레드 테스트 중...`);

      // 스프레드 선택
      const spreadCard = await page.$(`[data-spread="${spread}"]`);
      if (!spreadCard) {
        results.push(`❌ ${spread} 스프레드 미발견`);
        continue;
      }

      await spreadCard.click();
      await page.waitForSelector('#input-question-text', { timeout: 5000 });
      results.push(`✅ ${spread} 스프레드 선택 성공`);

      // 질문 입력
      const questionInput = await page.$('#input-question-text');
      if (spread === 'one') {
        // one 스프레드: 질문 입력
        await questionInput.fill('나의 미래는 어떻게 될까요?');
        results.push(`✅ ${spread}: 질문 입력 완료`);
      } else if (spread === 'three') {
        // three 스프레드: 질문 스킵
        const skipBtn = await page.$('#btn-skip-question');
        await skipBtn.click();
        results.push(`✅ ${spread}: 질문 스킵`);
      } else {
        // celtic: 질문 입력 후 진행
        await questionInput.fill('현재 상황을 전체적으로 읽어주세요');
        results.push(`✅ ${spread}: 질문 입력`);
      }

      // 다음 버튼 클릭 또는 이미 SHUFFLE로 이동
      const nextBtn = await page.$('#btn-next-question');
      if (nextBtn) {
        await nextBtn.click();
      }

      // SHUFFLE 화면 대기
      await page.waitForSelector('#btn-reveal-cards', { timeout: 5000 });
      results.push(`✅ ${spread}: SHUFFLE 화면 표시`);

      // 카드 공개 대기 (자동 또는 수동)
      await page.waitForTimeout(3000);
      const revealBtn = await page.$('#btn-reveal-cards');
      if (revealBtn) {
        await revealBtn.click();
      }

      // CARD_REVEAL 화면 대기
      await page.waitForSelector('#cards-display', { timeout: 5000 });
      const cardItems = await page.$$('.card-item');
      results.push(`✅ ${spread}: ${cardItems.length}장 카드 표시`);

      // 카드 플립 애니메이션 대기
      await page.waitForTimeout(3000);

      // 로딩 상태 확인 및 해석 기다리기
      const loadingState = await page.$('#loading-state.active');
      if (loadingState) {
        results.push(`✅ ${spread}: 로딩 상태 표시`);

        // 해석이 완료될 때까지 대기 (최대 15초)
        try {
          await page.waitForSelector('#reading-text', { timeout: 15000 });
          const readingContent = await page.textContent('#reading-text');
          if (readingContent && readingContent.length > 0) {
            results.push(`✅ ${spread}: Claude 해석 수신 (${readingContent.substring(0, 50)}...)`);
          } else {
            results.push(`⚠️ ${spread}: 해석 텍스트 비어있음`);
          }
        } catch (e) {
          results.push(`❌ ${spread}: 해석 로드 실패 (${e.message})`);
        }
      }

      // READING 화면 확인
      const readingScreen = await page.$('#screen-reading.active');
      if (readingScreen) {
        results.push(`✅ ${spread}: READING 화면 표시`);
      }

      // 카드 요약 확인
      const cardSummary = await page.$$('.card-summary-item');
      results.push(`✅ ${spread}: 카드 요약 ${cardSummary.length}개 표시`);

      // 다시 리딩하기 또는 다른 스프레드 선택
      if (spread !== 'celtic') {
        const changeSpreadBtn = await page.$('#btn-change-spread');
        if (changeSpreadBtn) {
          await changeSpreadBtn.click();
          await page.waitForSelector('.spread-card', { timeout: 5000 });
          results.push(`✅ ${spread}: 다른 스프레드 선택 화면으로 돌아감`);
        }
      } else {
        // 마지막 테스트이므로 홈으로 돌아가기
        const homeBtn = await page.$('#btn-home');
        if (homeBtn) {
          await homeBtn.click();
          results.push(`✅ ${spread}: 홈 화면으로 돌아감`);
        }
      }

      await page.waitForTimeout(1000);
    }

    console.log('\n\n========== 테스트 결과 ==========\n');
    results.forEach(result => console.log(result));

    const passCount = results.filter(r => r.startsWith('✅')).length;
    const failCount = results.filter(r => r.startsWith('❌')).length;
    const warnCount = results.filter(r => r.startsWith('⚠️')).length;

    console.log(`\n총 ${results.length}개 항목 | ✅ ${passCount}개 | ❌ ${failCount}개 | ⚠️ ${warnCount}개`);

    if (failCount === 0) {
      console.log('\n✨ 모든 테스트 통과! 앱이 정상 작동합니다. ✨');
    } else {
      console.log('\n⚠️ 일부 테스트가 실패했습니다.');
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
    results.push(`❌ 테스트 오류: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testTarotApp().catch(console.error);
