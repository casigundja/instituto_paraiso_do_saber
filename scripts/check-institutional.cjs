const {chromium}=require('@playwright/test');
const fs=require('fs');
(async()=>{
 fs.mkdirSync('artifacts/institutional',{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const pages=['/','/cursos','/cursos/farmacia','/cursos/fisioterapia','/cursos/estomatologia','/instituto','/matriculas','/contactos','/noticias','/eventos','/galeria','/admin'];
 for(const url of pages){
  const response=await page.goto('http://127.0.0.1:8000'+url,{waitUntil:'networkidle'});
  if(response.status()!==200)throw new Error(url+' HTTP '+response.status());
  await page.locator('h1').first().waitFor();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(overflow)throw new Error('Desktop overflow: '+url);
  await page.screenshot({path:'artifacts/institutional/'+(url==='/'?'home':url.slice(1).replaceAll('/','-'))+'-desktop.png',fullPage:true});
 }
 await page.goto('http://127.0.0.1:8000/cursos/farmacia',{waitUntil:'networkidle'});
 await page.getByRole('tab',{name:'A formação',exact:true}).click();
 await page.getByRole('heading',{name:'Informações da formação'}).waitFor();
 await page.getByRole('tab',{name:'Como ingressar',exact:true}).click();
 await page.getByRole('link',{name:'Tenho interesse neste curso'}).click();
 await page.waitForURL('**/matriculas?curso=**');
 await page.waitForLoadState('networkidle');
 if(await page.locator('select[name="course"]').inputValue()!=='Farmácia')throw new Error('Curso não seleccionado na matrícula');
 await page.route('**/api/public/leads',route=>route.fulfill({status:201,contentType:'application/json',body:'{"status":"NEW"}'}));
 await page.getByLabel('Nome completo *',{exact:true}).fill('Teste de interface');
 await page.getByLabel('Telefone / WhatsApp *',{exact:true}).fill('+244900000000');
 await page.getByRole('button',{name:'Solicitar informações'}).click();
 await page.getByRole('status').filter({hasText:'Pedido recebido'}).waitFor();
 await page.goto('http://127.0.0.1:8000/galeria',{waitUntil:'networkidle'});
 await page.locator('.in-gallery-card').first().click();
 await page.locator('dialog[open]').waitFor();
 await page.keyboard.press('Escape');
 if(await page.locator('dialog[open]').count())throw new Error('Galeria não fechou');
 await page.getByRole('button',{name:'Vídeos',exact:true}).click();
 if(await page.locator('.in-video-grid video').count()!==5)throw new Error('Vídeos ausentes');
 await page.goto('http://127.0.0.1:8000/cursos?q=farm',{waitUntil:'networkidle'});
 if(await page.locator('.in-catalogue-card').count()!==1)throw new Error('Pesquisa por URL falhou');
 await page.getByRole('textbox',{name:'Pesquisar nossos cursos'}).fill('curso inexistente');
 await page.getByRole('heading',{name:'Não encontrámos resultados'}).waitFor();
 await page.getByRole('button',{name:'Limpar filtros'}).click();
 if(await page.locator('.in-catalogue-card').count()!==3)throw new Error('Limpar filtro falhou');
 await page.goto('http://127.0.0.1:8000/cursos/nao-existe',{waitUntil:'networkidle'});
 await page.getByRole('heading',{name:'Esta página não está disponível.'}).waitFor();
 for(const width of [390,768,320]){
  await page.setViewportSize({width,height:844});
  for(const url of ['/','/cursos','/cursos/farmacia','/instituto','/matriculas','/contactos','/noticias','/eventos','/galeria','/admin']){
   await page.goto('http://127.0.0.1:8000'+url,{waitUntil:'networkidle'});
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('Overflow '+width+': '+url);
   if(width===390)await page.screenshot({path:'artifacts/institutional/'+(url==='/'?'home':url.slice(1).replaceAll('/','-'))+'-mobile.png',fullPage:true});
  }
 }
 await page.goto('http://127.0.0.1:8000/instituto',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Abrir menu',exact:true}).click();
 await page.locator('.ps-sidebar.is-open').waitFor();
 await page.keyboard.press('Escape');
 if(await page.locator('.ps-sidebar.is-open').count())throw new Error('Escape não fechou menu');
 // Validate populated editorial detail layouts without adding fictitious content to the database.
 await page.setViewportSize({width:1440,height:1000});
 for(const type of ['news','events']){
  const route=type==='news'?'noticias':'eventos';
  await page.route('**/api/public/'+type+'/preview',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({id:'preview',slug:'preview',title:'Apresentação institucional',summary:'Pré-visualização do conteúdo editorial.',description:'Encontro de apresentação do Instituto.',content:'Conteúdo de verificação visual.\n\nEste conteúdo existe apenas no teste do navegador.',category:'Institucional',startsAt:'2026-10-01T10:00:00',publishAt:'2026-09-23T10:00:00',location:'Instituto Paraíso do Saber',image:'/banner2.jpeg'})}));
  await page.goto('http://127.0.0.1:8000/'+route+'/preview',{waitUntil:'networkidle'});
  await page.getByRole('heading',{name:'Apresentação institucional',exact:true}).waitFor();
  await page.screenshot({path:'artifacts/institutional/'+route+'-detail-preview.png',fullPage:true});
 }
 if(errors.length)throw new Error(errors.join('\n'));
 await browser.close();
 console.log('OK: 12 páginas desktop; layouts em 320/390/768px; fichas de curso e abas; matrícula com curso pré-seleccionado; formulário simulado; galeria e vídeos; pesquisa; conteúdo inexistente; menu móvel; notícias/eventos simulados; sem erros JavaScript.');
})().catch(e=>{console.error(e);process.exit(1)});
