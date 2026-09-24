import {useEffect, useState, type FormEvent} from 'react';
import Link from './Link';
import PublicLayout from './PublicLayout';
import {AdmissionsSteps, FAQ} from './Institutional';
import {useTitle} from './portal';

const initial = {
  courses: [
    {slug:'farmacia',name:'Farmácia',image:'/banner1.jpeg',description:'Formação para promover o uso seguro e responsável dos medicamentos.'},
    {slug:'fisioterapia',name:'Fisioterapia',image:'/banner2.jpeg',description:'Conhecimento para apoiar a reabilitação e a qualidade de vida.'},
    {slug:'estomatologia',name:'Estomatologia / Medicina Dentária',image:'/banner3.jpeg',description:'Prepare-se para cuidar da saúde oral com competência.'},
  ],
  campaigns:[], events:[], news:[], sections:[],
  settings:{institutionName:'Instituto Técnico Privado de Saúde Paraíso do Saber',logo:'/logo_paraiso_do_saber.jpeg',phone1:'+244 930 133 850',phone2:'+244 953 955 368',whatsapp:'244930133850',address:'Bairro Paraíso, depois da Pracinha Nova, em frente à Casa do Partido do MPLA.'},
};
const asset=(url:string)=>/^https?:\/\//.test(url)||url.startsWith('/')?url:'/'+url;
const Arrow=()=> <span aria-hidden="true">↗</span>;

export default function Home(){
  useTitle("Formação que transforma vidas");
  const [data,setData]=useState<any>(initial);
  const [slide,setSlide]=useState(0);
  const [paused,setPaused]=useState(false);
  const [query,setQuery]=useState('');
  const [status,setStatus]=useState<'idle'|'sending'|'sent'|'error'>('idle');
  useEffect(()=>{const controller=new AbortController();fetch('/api/public/home',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error();return r.json()}).then(d=>setData({...initial,...d,settings:{...initial.settings,...d.settings}})).catch(()=>{});return()=>controller.abort()},[]);
  const settings=data.settings;
  const whatsapp=`https://wa.me/${String(settings.whatsapp).replace(/\D/g,'')}`;
  const section=(key:string)=>data.sections.find((s:any)=>s.key===key);
  const visible=(key:string)=>section(key)?.enabled!==false;
  const slides=data.campaigns.length?data.campaigns:[
    {title:section('hero')?.title||'O seu futuro começa aqui.',subtitle:section('hero')?.description||'Transforme a sua vocação numa carreira na saúde.',image:'/banner1.jpeg',buttonText:'Quero fazer parte',url:'#interesse'},
    {title:'Aprender hoje. Cuidar amanhã.',subtitle:'Conheça os cursos de Farmácia, Fisioterapia e Estomatologia.',image:'/banner2.jpeg',buttonText:'Conheça os cursos',url:'#cursos'},
    {title:'Dê o próximo passo.',subtitle:'A sua formação começa com uma conversa. Fale com a nossa equipa.',image:'/banner3.jpeg',buttonText:'Tenho interesse',url:'#interesse'},
  ];
  const active=slides[slide%slides.length];
  useEffect(()=>{if(paused||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const timer=setInterval(()=>setSlide(n=>(n+1)%slides.length),6500);return()=>clearInterval(timer)},[paused,slides.length]);
  const courses=data.courses.filter((c:any)=>`${c.name} ${c.area||''}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();const form=event.currentTarget;setStatus('sending');
    try{const response=await fetch('/api/public/leads',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});if(!response.ok)throw new Error();setStatus('sent');form.reset()}catch{setStatus('error')}
  }
return <PublicLayout settings={settings} onSearch={setQuery} searchValue={query}>
          {visible('hero')&&<section className="ps-banner" aria-label="Destaques do Instituto" aria-roledescription="carrossel">
            <img key={active.image} className="ps-banner-photo" src={asset(active.image||'/banner1.jpeg')} alt="Formação na área da saúde"/>
            <div className="ps-banner-shade"/><div className="ps-badge-banner" aria-label="Inscrições abertas"><small>INSCRIÇÕES</small><strong>ABERTAS</strong><small>SAIBA MAIS</small></div><span className="ps-banner-corner" aria-hidden="true">INSTITUTO TÉCNICO PRIVADO DE SAÚDE</span>
            <div className="ps-banner-copy"><span className="ps-kicker">CONHECIMENTO QUE TRANSFORMA VIDAS</span><h1>{active.title}</h1><p>{active.subtitle||active.description}</p><a className="ps-button ps-yellow" href={active.url||'#interesse'}>{active.buttonText||'Saiba mais'}<Arrow/></a><span className="ps-banner-signature">PARAÍSO DO SABER <span>EDUCAÇÃO • SAÚDE • FUTURO</span></span></div>
            <div className="ps-slider-controls"><button aria-label="Destaque anterior" onClick={()=>setSlide(n=>(n+slides.length-1)%slides.length)}>‹</button><div>{slides.map((_:any,i:number)=><button key={i} className={i===slide%slides.length?'selected':''} aria-label={`Mostrar destaque ${i+1}`} aria-pressed={i===slide%slides.length} onClick={()=>setSlide(i)}/>)}</div><button aria-label="Próximo destaque" onClick={()=>setSlide(n=>(n+1)%slides.length)}>›</button><button className="ps-pause" aria-label={paused?'Reproduzir destaques':'Pausar destaques'} onClick={()=>setPaused(!paused)}>{paused?'▶':'Ⅱ'}</button></div>
          </section>}
          {visible('courses')&&<>
            <nav className="ps-course-tabs" aria-label="Cursos disponíveis">{data.courses.slice(0,3).map((c:any)=><Link key={c.slug} href={`/cursos/${c.slug}`}><span className="ps-course-icon" aria-hidden="true">✚</span>{c.name}<Arrow/></Link>)}</nav>
            <div className="ps-home-strip"><div><b aria-hidden="true">✚</b><span><strong>Formação em saúde</strong><small>Conhecimento para cuidar.</small></span></div><div><b aria-hidden="true">↗</b><span><strong>O seu próximo passo</strong><small>Orientação para a sua escolha.</small></span></div><div><b aria-hidden="true">◎</b><span><strong>Perto de si</strong><small>Conheça o nosso Instituto.</small></span></div></div><section className="ps-block ps-courses" id="cursos"><div className="ps-section-heading"><div><span className="ps-eyebrow">ESCOLHA O SEU CAMINHO</span><h2>{section('courses')?.title||'Encontre o seu curso'}</h2></div><Link href="/cursos">Todos os cursos <Arrow/></Link></div>
              {query&&<p className="ps-search-result">Resultados para “{query}” <button onClick={()=>setQuery('')}>Limpar pesquisa</button></p>}
              <div className="ps-course-grid">{courses.map((c:any,i:number)=><Link className="ps-course-card" key={c.slug} href={`/cursos/${c.slug}`}><img src={asset(c.image||'/banner1.jpeg')} alt={c.name} loading="lazy"/><div className="ps-card-gradient"/><span className="ps-card-tag">FORMAÇÃO EM SAÚDE</span><div className="ps-course-name"><small>0{i+1} / PARAÍSO DO SABER</small><h3>{c.name}</h3><span>Conhecer o curso <Arrow/></span></div></Link>)}</div>{!courses.length&&<p className="ps-empty">Nenhum curso encontrado. Tente outro nome.</p>}
            </section>
          </>}
          {visible('enrollment')&&<section className="ps-promos" id="matriculas">
            <a href="/matriculas" className="ps-promo ps-promo-yellow"><small>O PRÓXIMO PASSO É SEU</small><h2>{section('enrollment')?.title||'Inscrições e matrículas abertas'}</h2><span>Fale com a nossa equipa <Arrow/></span><b aria-hidden="true">✳</b></a>
            <a href="/instituto" className="ps-promo ps-promo-blue"><small>ENSINO COM PROPÓSITO</small><h2>Mais do que ensinar.<br/>Preparar para cuidar.</h2><span>Conheça o Instituto <Arrow/></span><b aria-hidden="true">+</b></a>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="ps-promo ps-promo-photo"><img src="/banner3.jpeg" alt="" loading="lazy"/><div/><small>ESTAMOS PERTO DE SI</small><h2>O seu futuro merece uma conversa.</h2><span>Fale connosco <Arrow/></span></a>
          </section>}
          {visible('about')&&<section id="instituto" className="ps-about ps-block"><div className="ps-about-visual"><img src="/banner2.jpeg" alt="Cuidados de saúde e formação profissional" loading="lazy"/><span><strong>Aprender.<br/>Crescer.<br/>Cuidar.</strong><small>PARAÍSO DO SABER</small></span></div><div><span className="ps-eyebrow">UM LUGAR PARA CONSTRUIR O FUTURO</span><h2>{section('about')?.title||'Conheça o Paraíso do Saber'}</h2><p>{section('about')?.description||'Somos uma instituição dedicada à formação de profissionais de saúde competentes, humanos e preparados para fazer a diferença na sua comunidade.'}</p><p>Acreditamos que uma educação de qualidade abre caminhos e transforma vidas.</p><a className="ps-button ps-blue" href="/contactos">Venha conhecer-nos <Arrow/></a></div></section>}
          {visible('video')&&<section className="ps-video ps-block"><div className="ps-section-heading"><div><span className="ps-eyebrow">VEJA DE PERTO</span><h2>{section('video')?.title||'A vida no Instituto'}</h2></div><Link href="/galeria">Visitar a galeria <Arrow/></Link></div><video controls preload="none" poster="/banner3.jpeg"><source src="/publicidade2.mp4" type="video/mp4"/>O seu navegador não suporta vídeo.</video></section>}
          {visible('news')&&data.news.length>0&&<section className="ps-block"><div className="ps-section-heading"><div><span className="ps-eyebrow">FIQUE POR DENTRO</span><h2>{section('news')?.title||'Notícias do Instituto'}</h2></div><Link href="/noticias">Todas as notícias <Arrow/></Link></div><div className="ps-news-grid">{data.news.map((n:any)=><Link href={`/noticias/${n.slug}`} className="ps-news-card" key={n.id}><img src={asset(n.image||'/banner1.jpeg')} alt="" loading="lazy"/><small>{n.category}</small><h3>{n.title}</h3><p>{n.summary}</p><span>Ler notícia <Arrow/></span></Link>)}</div></section>}
          {visible('events')&&data.events.length>0&&<section className="ps-block"><div className="ps-section-heading"><h2>{section('events')?.title||'Próximos eventos'}</h2><Link href="/eventos">Ver agenda <Arrow/></Link></div><div className="ps-events">{data.events.map((e:any)=><Link key={e.id} href={`/eventos/${e.slug}`}><time>{new Date(e.startsAt).toLocaleDateString('pt-AO',{day:'2-digit',month:'short'})}</time><div><h3>{e.title}</h3><p>{e.location||'Instituto Paraíso do Saber'}</p></div><Arrow/></Link>)}</div></section>}
          <section id="interesse" className="ps-enroll ps-block"><div><span className="ps-eyebrow">COMECE UMA NOVA HISTÓRIA</span><h2>O seu lugar na saúde começa aqui.</h2><p>Deixe o seu contacto. A nossa equipa ajuda-o a conhecer os cursos e a dar o próximo passo.</p><a href={whatsapp} target="_blank" rel="noreferrer">Prefere conversar pelo WhatsApp? <Arrow/></a></div><form onSubmit={submit}><label>Nome completo<input name="name" required autoComplete="name" placeholder="Como se chama?"/></label><label>Telefone / WhatsApp<input name="phone" required type="tel" autoComplete="tel" placeholder="+244"/></label><label>E-mail<input name="email" type="email" autoComplete="email" placeholder="voce@email.com"/></label><label>Curso de interesse<select name="course" defaultValue=""><option value="">Selecione um curso</option>{data.courses.map((c:any)=><option key={c.slug}>{c.name}</option>)}</select></label><label>Município<input name="municipality" autoComplete="address-level2" placeholder="Onde vive?"/></label><label className="ps-full">Observações<textarea name="notes" rows={2} placeholder="Como podemos ajudar?"/></label><button className="ps-button ps-yellow" disabled={status==='sending'}>{status==='sending'?'A enviar…':'Quero receber informações'}<Arrow/></button><p className="ps-form-status" role="status">{status==='sent'?'Recebido! A nossa equipa entrará em contacto consigo.':status==='error'?'Não foi possível enviar. Tente novamente ou contacte-nos pelo WhatsApp.':''}</p></form></section>
<AdmissionsSteps/><FAQ/></PublicLayout>
}
