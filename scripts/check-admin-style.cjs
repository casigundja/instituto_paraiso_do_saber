const {chromium}=require('@playwright/test');
const fs=require('fs');
(async()=>{
 const source=fs.readFileSync('.env','utf8');
 const read=key=>(source.match(new RegExp('^'+key+'=(.*)$','m'))?.[1]||'').trim().replace(/^"|"$/g,'');
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8000/admin',{waitUntil:'networkidle'});
 await page.getByPlaceholder('E-mail',{exact:true}).fill(read('ADMIN_EMAIL'));
 await page.getByPlaceholder('Palavra-passe',{exact:true}).fill(read('ADMIN_PASSWORD'));
 await page.getByRole('button',{name:'Entrar no painel'}).click();
 await page.locator('.admin-shell').waitFor();
 await page.waitForLoadState('networkidle');
 await page.screenshot({path:'artifacts/institutional/admin-dashboard-desktop.png',fullPage:true});
 const buttons=page.locator('.admin-side>button');
 for(let i=1;i<await buttons.count();i++){
  await buttons.nth(i).click();await page.waitForLoadState('networkidle');
  if(await page.locator('.notice').count()){const text=await page.locator('.notice').innerText();if(/permissão|possível|desconhecida/i.test(text))throw new Error('Erro ao abrir secção administrativa: '+text)}
 }
 await buttons.nth(1).click();await page.waitForLoadState('networkidle');
 await page.screenshot({path:'artifacts/institutional/admin-courses-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('Overflow admin');
 await page.screenshot({path:'artifacts/institutional/admin-courses-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Terminar sessão'}).click();
 await page.locator('.login').waitFor();
 if(errors.length)throw new Error(errors.join('\n'));
 await browser.close();console.log('OK: login, todas as secções administrativas, estilos desktop/mobile e saída. Nenhum registo alterado.');
})().catch(e=>{console.error(e);process.exit(1)});
