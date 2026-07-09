const { chromium } = require('@playwright/test');

// Read CPF from command line arguments or environment variables
function getCPF() {
  const args = process.argv.slice(2);
  const cpfArg = args.find(arg => arg.startsWith('--cpf='));
  if (cpfArg) {
    return cpfArg.split('=')[1].replace(/\D/g, '');
  }
  return process.env.CPF ? process.env.CPF.replace(/\D/g, '') : null;
}

(async () => {
  console.log('🚀 Iniciando simulação do robô de compras (Modo Teste)...');

  // Launch Chromium in non-headless mode with a delay of 1500ms between actions
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });

  // Setup context with Geolocation permissions and coordinates for São Paulo (Brazil)
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    permissions: ['geolocation'],
    geolocation: { latitude: -23.55052, longitude: -46.633308 }
  });

  const page = await context.newPage();

  try {
    console.log('🌐 Acessando a loja em http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Step 1: Click the first product card
    console.log('🛍️ Procurando produtos em destaque...');
    const productCard = page.locator('[id^="product-card-"]').first();
    await productCard.waitFor({ state: 'visible', timeout: 5000 });
    
    console.log('👉 Clicando no primeiro produto da loja...');
    await productCard.click();

    // Step 2: Wait for product page, select first available size, and click "COMPRAR AGORA"
    console.log('📄 Carregando página do produto...');
    const sizeBtn = page.locator('[id^="size-btn-"]').first();
    await sizeBtn.waitFor({ state: 'visible', timeout: 5000 });

    const sizeText = await sizeBtn.innerText();
    console.log(`👟 Selecionando tamanho disponível: ${sizeText}`);
    await sizeBtn.click();

    console.log('🛒 Clicando em "COMPRAR AGORA"...');
    const buyBtn = page.locator('#buy-now-btn');
    await buyBtn.click();

    // Step 3: Checkout page
    console.log('💳 Redirecionando para o checkout...');
    await page.waitForURL('**/checkout', { timeout: 8000 });

    // Step 4: Handle Geolocation Address Modal
    const modalCancelBtn = page.locator('#addr-modal-cancel-btn');
    try {
      await modalCancelBtn.waitFor({ state: 'visible', timeout: 4000 });
      console.log('📍 Modal de geolocalização detectado. Cancelando para inserir dados manuais do usuário...');
      await modalCancelBtn.click();
      await modalCancelBtn.waitFor({ state: 'hidden', timeout: 3000 });
    } catch (e) {
      console.log('ℹ️ Modal de geolocalização não exibido ou fechado automaticamente.');
    }

    // Step 5: Fill checkout form details (using the test buyer details from README)
    console.log('📝 Preenchendo dados de identificação do comprador (test user)...');
    
    const email = 'test_user_3525648998@testuser.com';
    const name = 'Carlos Silva';
    const phone = '92991234567';
    const cpf = getCPF() || '12345678909';
    
    await page.locator('#name').fill(name);
    await page.locator('#email').fill(email);
    await page.locator('#phone').fill(phone);
    await page.locator('#cpf').fill(cpf);
    console.log(`✍️ Dados do comprador preenchidos: ${name} (${email}) - CPF: ${cpf}`);

    // Fill Address details manually as requested by the user
    console.log('✍️ Inserindo endereço de teste fornecido...');
    await page.locator('#street').fill('passagem nacional');
    await page.locator('#number').fill('25');
    await page.locator('#neighborhood').fill('nossa senhora das graças');
    await page.locator('#city').fill('manaus');
    await page.locator('#state').fill('AM');
    await page.locator('#zip_code').fill('69053-420');

    // Step 6: Click "FINALIZAR PEDIDO"
    console.log('🎯 Finalizando pedido com Pix...');
    const finalizeBtn = page.locator('#finalize-checkout-btn');
    await finalizeBtn.click();

    // Step 7: Wait for PIX QR code screen
    console.log('⏳ Aguardando a geração do QR Code de pagamento Pix...');
    const qrCodeImg = page.locator('#pix-qr-code');
    const copyBtn = page.locator('#pix-copy-button');
    const errorDiv = page.locator('#checkout-error');
    
    try {
      await Promise.race([
        qrCodeImg.waitFor({ state: 'visible', timeout: 15000 }),
        copyBtn.waitFor({ state: 'visible', timeout: 15000 }),
        errorDiv.waitFor({ state: 'visible', timeout: 15000 })
      ]);

      if (await errorDiv.isVisible()) {
        const errorMsg = await errorDiv.innerText();
        throw new Error(`Erro na finalização: ${errorMsg}`);
      }

      console.log('🎉 SUCESSO! QR Code Pix gerado com sucesso para pagamento.');
      
      // Stay visible for 15 seconds so the user can look at the result
      await page.waitForTimeout(15000);
    } catch (e) {
      // Check if there are any on-screen validation errors (indicated by style or text color)
      const validationErrors = await page.evaluate(() => {
        const errorPList = Array.from(document.querySelectorAll('p'));
        return errorPList
          .filter(p => {
            const color = window.getComputedStyle(p).color;
            return color === 'rgb(255, 107, 107)' || color === 'rgba(255, 107, 107, 1)' || p.innerText.includes('obrigatório');
          })
          .map(p => p.innerText);
      });

      if (validationErrors.length > 0) {
        throw new Error(`Erros de validação do formulário na tela:\n- ${validationErrors.join('\n- ')}`);
      }

      if (await errorDiv.isVisible()) {
        const errorMsg = await errorDiv.innerText();
        let formattedMsg = errorMsg;
        if (errorMsg.includes('processing_error') || errorMsg.includes('invalid_users_involved')) {
          formattedMsg += '\n💡 [Dica] Isso ocorre devido a credenciais do Mercado Pago incompatíveis com os usuários de teste.';
        }
        throw new Error(`Erro retornado pela API: ${formattedMsg}`);
      }
      throw e;
    }

  } catch (error) {
    console.error('❌ Erro durante a simulação de compra:\n', error.message || error);
  } finally {
    console.log('🚪 Fechando navegador...');
    await browser.close();
    console.log('🏁 Simulação concluída.');
  }
})();
