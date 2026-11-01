import {useEffect,useState,useRef,type ReactNode,type FormEvent} from 'react';
import PublicLayout from './PublicLayout';
import Link from './Link';
import {asset,paths,dateLabel,useTitle,usePortal} from './portal';
import {AdmissionsSteps,FAQ} from './Institutional';

export function InterestModal({course, onClose}:{course:string, onClose:()=>void}){
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [lead, setLead] = useState<any>(null);

  async function submit(e: FormEvent<HTMLFormElement>){
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData);
    try {
      const res = await fetch('/api/public/leads', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify(payload),
      });
      if(!res.ok){
        const err = await res.json().catch(()=>({}));
        throw new Error(err.message || 'Não foi possível enviar os dados.');
      }
      const data = await res.json();
      setLead(data);
      setStatus('sent');
      form.reset();
    } catch(err:any){
      setStatus('error');
      setErrorMsg(err.message || 'Erro ao submeter os dados. Verifique a sua ligação à Internet e tente novamente.');
    }
  }

  useEffect(()=>{
    const onKey = (e: KeyboardEvent)=>{ if(e.key==='Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={`Inscrição no curso de ${course}`}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Fechar formulário">✕</button>

        {status==='sent' ? (
          <div className="modal-success-box">
            <div className="modal-success-icon" aria-hidden="true">✓</div>
            <h2>Registo Efetuado com Sucesso!</h2>
            <div className="modal-sms-notification">
              <p>
                <strong>Estimado(a) {lead?.name || 'Candidato(a)'},</strong>
              </p>
              <p>
                O seu interesse no curso de <strong>{course}</strong> foi registado com sucesso.
              </p>
              <p>
                A secretaria entrará em contacto consigo muito em breve através do número indicado, com todas as orientações sobre vagas, horários e formalização da sua matrícula.
              </p>
            </div>
            <p className="modal-success-hint">✓ O seu pedido foi registado.</p>
            <button type="button" className="modal-submit" onClick={onClose}>
              Concluir e Voltar ao Portal
            </button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <span className="modal-badge">REGISTO DE INTERESSE</span>
              <h2>Inscrição no Curso</h2>
              <div className="modal-course-pill">
                <span aria-hidden="true">✚</span> Curso: <strong>{course}</strong>
              </div>
              <p className="modal-desc">
                Preencha os seus dados de contacto para manifestar interesse neste curso. A secretaria do Instituto entrará em contacto para confirmar os requisitos e dar seguimento à sua matrícula.
              </p>
            </div>

            <form onSubmit={submit} className="modal-form">
              <input type="hidden" name="course" value={course} />

              <label className="modal-label">
                Nome Completo *
                <input
                  name="name"
                  required
                  maxLength={255}
                  placeholder="Ex: Manuel António Domingos"
                  className="modal-input"
                  autoComplete="name"
                />
              </label>

              <div className="modal-grid-2">
                <label className="modal-label">
                  Telefone / WhatsApp *
                  <input
                    name="phone"
                    required
                    type="tel"
                    maxLength={60}
                    placeholder="+244 9... ou 9..."
                    className="modal-input"
                    autoComplete="tel"
                  />
                </label>

                <label className="modal-label">
                  E-mail (opcional)
                  <input
                    name="email"
                    type="email"
                    maxLength={255}
                    placeholder="exemplo@email.com"
                    className="modal-input"
                    autoComplete="email"
                  />
                </label>
              </div>

              <div className="modal-grid-2">
                <label className="modal-label">
                  Município / Bairro (Luanda)
                  <input
                    name="municipality"
                    maxLength={255}
                    placeholder="Ex: Cacuaco, Bairro Paraíso"
                    className="modal-input"
                    autoComplete="address-level2"
                  />
                </label>

                <label className="modal-label">
                  Turno Pretendido
                  <select name="notes" className="modal-input" defaultValue="Turno da Manhã (07h00 - 12h30)">
                    <option value="Turno da Manhã (07h00 - 12h30)">Manhã (07h00 - 12h30)</option>
                    <option value="Turno da Tarde (12h45 - 18h00)">Tarde (12h45 - 18h00)</option>
                    <option value="Turno Pós-Laboral (18h00 - 21h30)">Pós-Laboral (18h00 - 21h30)</option>
                  </select>
                </label>
              </div>

              {errorMsg && (
                <div className="modal-error-alert" role="alert">
                  <span>⚠</span> {errorMsg}
                </div>
              )}

              <p className="modal-note-privacy">
                * Campos obrigatórios. Os seus dados são utilizados unicamente para contacto e acompanhamento do processo de matrícula.
              </p>

              <button type="submit" className="modal-submit" disabled={status==='sending'}>
                {status==='sending' ? 'A registar pedido…' : 'Manifestar Interesse no Curso ↗'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

type Kind='courses'|'events'|'news'|'media';
export function PageBanner({eyebrow,title,description,image='',children}:{eyebrow:string,title:string,description:string,image?:string,children?:ReactNode}){
 return <><nav className="in-breadcrumb" aria-label="Localização"><Link href="/">Início</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav><section className="in-banner">{image ? <img src={asset(image)} alt=""/> : null}<div className="in-banner-overlay"/><div className="in-banner-content"><span className="ps-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p>{children}</div><div className="in-banner-mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><rect x="1" y="9.5" width="22" height="5" rx="0.8"/><rect x="9.5" y="1" width="5" height="22" rx="0.8"/></svg></div><span className="in-banner-sign">PARAÍSO DO SABER · EDUCAÇÃO PARA A VIDA</span></section></>
}
export function CallToAction(){return <section className="in-cta"><div><span className="ps-eyebrow">ESTAMOS AQUI PARA AJUDAR</span><h2>Vamos conversar sobre o seu futuro?</h2><p>Conheça os cursos e esclareça as suas dúvidas com a nossa equipa.</p></div><Link className="ps-button ps-yellow" href="/matriculas">Quero saber mais <span>↗</span></Link></section>}
export function EmptyState({error=false,search=false,retry}:{error?:boolean,search?:boolean,retry?:()=>void}){return <div className="in-empty"><span className="in-empty-icon" aria-hidden="true">{error?'!':search?'⌕':'▤'}</span><h2>{error?'Não foi possível carregar o conteúdo':search?'Não encontrámos resultados':'Novidades a caminho'}</h2><p>{error?'Verifique a ligação e tente novamente.':search?'Experimente outro termo ou remova os filtros para ver mais conteúdos.':'Os conteúdos publicados pelo Instituto aparecerão aqui. Entretanto, conheça os nossos cursos ou fale com a secretaria.'}</p>{retry&&<button className="ps-button ps-blue" onClick={retry}>{error?'Tentar novamente':'Limpar filtros'} <span>↗</span></button>}{!error&&!search&&<Link href="/cursos" className="ps-button ps-blue">Conheça os cursos <span>↗</span></Link>}</div>}
const info={courses:{title:'Formação que transforma.',label:'Os nossos cursos',intro:'Encontre o seu caminho na área da saúde. Conheça as formações do Paraíso do Saber e dê o próximo passo.',image:'/banner1.jpeg'},events:{title:'Encontros que aproximam.',label:'Agenda do Instituto',intro:'Acompanhe os encontros, atividades e iniciativas que fazem parte da vida do Instituto.',image:'/banner3.jpeg'},news:{title:'O Instituto em notícia.',label:'Notícias e comunicados',intro:'Informação, conhecimento e novidades para a nossa comunidade educativa.',image:'/banner2.jpeg'},media:{title:'Conheça. Veja. Inspire-se.',label:'Galeria multimédia',intro:'Explore os materiais de apresentação do Paraíso do Saber, as nossas fotografias e os vídeos institucionais.',image:'/banner3.jpeg'}};
const materials=[{id:'institution-1',originalName:'Formação na área da saúde',url:'/banner1.jpeg',category:'Apresentação institucional',mimeType:'image/jpeg'},{id:'institution-2',originalName:'Conhecimento ao serviço do cuidado',url:'/banner2.jpeg',category:'Apresentação institucional',mimeType:'image/jpeg'},{id:'institution-3',originalName:'Aprender para transformar vidas',url:'/banner3.jpeg',category:'Apresentação institucional',mimeType:'image/jpeg'}];
export function Listing({type}:{type:Kind}){
 const defaultStep=type==='media'?12:9;
 const [rows,setRows]=useState<any[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(false),[q,setQ]=useState(new URLSearchParams(location.search).get('q')||''),[filter,setFilter]=useState('Todos'),[retry,setRetry]=useState(0),[limit,setLimit]=useState(defaultStep),[selected,setSelected]=useState<any>(null);
 const meta=info[type];useTitle(meta.label);
 useEffect(()=>{setLimit(type==='media'?12:9)},[type]);
 useEffect(()=>{const controller=new AbortController();setLoading(true);setError(false);fetch('/api/public/'+type,{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error();return r.json()}).then(setRows).catch(e=>{if(e.name!=='AbortError')setError(true)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});return()=>controller.abort()},[type,retry]);
 const all=type==='media'?[...rows,...materials]:rows;
 const mediaCategories=type==='media'?[...new Set(all.map((r:any)=>r.category).filter(Boolean))]:[];
 const categories=type==='media'?['Todos','Imagens','Vídeos',...mediaCategories]:['Todos',...new Set(all.map((r:any)=>r.area||r.category).filter(Boolean))];
 const filtered=all.filter((r:any)=>`${r.name||r.title||r.originalName} ${r.description||r.summary||''}`.toLocaleLowerCase().includes(q.toLocaleLowerCase())&&(filter==='Todos'||(type==='media'?(filter==='Imagens'?true:r.category===filter):(r.area||r.category)===filter)));
 const selectedIdx=selected?filtered.findIndex((r:any)=>r.id===selected.id):-1;
 useEffect(()=>{
   if(!selected)return;
   const onKey=(e:KeyboardEvent)=>{
     if(e.key==='Escape')setSelected(null);
     if(e.key==='ArrowLeft'&&filtered.length>1){
       const idx=filtered.findIndex((r:any)=>r.id===selected.id);
       setSelected(filtered[idx>0?idx-1:filtered.length-1]);
     }
     if(e.key==='ArrowRight'&&filtered.length>1){
       const idx=filtered.findIndex((r:any)=>r.id===selected.id);
       setSelected(filtered[idx<filtered.length-1?idx+1:0]);
     }
   };
   window.addEventListener('keydown',onKey);
   return()=>window.removeEventListener('keydown',onKey);
 },[selected,filtered]);
 const videoMeta = [
   { tag: 'CAMPUS & ESTRUTURA', desc: 'Conheça os corredores pedagógicos, pátio e instalações do Instituto.' },
   { tag: 'DOCENTES & FORMAÇÃO', desc: 'Acompanhamento pedagógico e preparação prática na área da saúde.' },
   { tag: 'LABORATÓRIOS & PRÁTICA', desc: 'Salas equipadas e recursos técnicos para o ensino profissional.' },
   { tag: 'VIDA ACADÉMICA', desc: 'O dia a dia dos nossos estudantes com rigor, ética e humanização.' },
   { tag: 'ACOLHIMENTO & SECRETARIA', desc: 'Atendimento próximo para orientar o seu percurso académico.' },
 ];
 const videos=Array.from({length:5},(_,i)=>({
   id: i + 1,
   url:`/publicidade${i+1}.mp4`,
   name:`Apresentação do Instituto ${String(i+1).padStart(2,'0')}`,
   tag: videoMeta[i].tag,
   desc: videoMeta[i].desc,
   poster: i === 2 ? '/media/video3_poster.jpg' : '/media/video_poster.jpg',
 })).filter(v=>`${v.name} ${v.tag} ${v.desc}`.toLowerCase().includes(q.toLowerCase()));
 const clear=()=>{setQ('');setFilter('Todos')};
 return <PublicLayout><PageBanner eyebrow={meta.label} title={meta.title} description={meta.intro} image={meta.image}><Link href="/matriculas" className="ps-button ps-yellow">{type==='courses'?'Encontre a sua formação':'Faça parte desta comunidade'} <span>↗</span></Link></PageBanner>
  <div className="in-section-intro"><div><span className="ps-eyebrow">PARAÍSO DO SABER</span><h2>{meta.label}</h2></div><p>{type==='courses'?'Cada escolha é o início de uma nova possibilidade. Explore as informações de cada curso.':type==='media'?'Imagens e vídeos de apresentação institucional.':'Consulte as últimas publicações e acompanhe o Instituto.'}</p></div>
  <div className="in-toolbar"><label className="in-search"><span aria-hidden="true">⌕</span><input aria-label={`Pesquisar ${meta.label.toLowerCase()}`} placeholder={type==='courses'?'Que curso procura?':'Pesquisar nesta página…'} value={q} onChange={e=>{setQ(e.target.value);setLimit(defaultStep)}}/>{q&&<button aria-label="Limpar pesquisa" onClick={()=>setQ('')}>×</button>}</label><div className="in-filters" aria-label="Filtrar conteúdos">{categories.map(c=><button key={c} aria-pressed={filter===c} onClick={()=>{setFilter(c);setLimit(defaultStep)}}>{c}</button>)}</div></div>
  {loading?<div className="in-skeleton-grid" role="status" aria-label="A carregar conteúdos">{[1,2,3].map(i=><div key={i}/>)}</div>:error?<EmptyState error retry={()=>setRetry(n=>n+1)}/>:<>
   {!(type==='media'&&filter==='Vídeos')&&<>
    <div className="in-gallery-results-bar">
      <div className="in-result-count"><strong>{filtered.length}</strong> {filtered.length===1?'registo disponível':'registos disponíveis'}{q&&` para “${q}”`}{filter!=='Todos'&&filter!=='Imagens'&&` em ${filter}`}</div>
      {type==='media'&&<span className="in-gallery-click-hint">🔍 Clique em qualquer fotografia para ampliar em ecrã inteiro</span>}
    </div>
    <div className={`in-catalogue ${type==='media'?'in-gallery':''}`}>
     {filtered.slice(0,limit).map((r:any,idx:number)=>type==='media'?(
       <button key={r.id} type="button" className="in-gallery-card" onClick={()=>setSelected(r)}>
         <div className="in-gallery-card-media">
           <span className="in-gallery-card-badge">{r.category||'Galeria do Instituto'}</span>
           <span className="in-gallery-card-index">#{String(idx+1).padStart(2,'0')}</span>
           <img src={asset(r.url)} alt={r.originalName} loading="lazy"/>
           <div className="in-gallery-card-overlay">
             <span>🔍 Ampliar fotografia ↗</span>
           </div>
         </div>
         <div className="in-gallery-card-body">
           <small>{r.category||'Galeria do Instituto'}</small>
           <h3>{r.originalName}</h3>
           <div className="in-gallery-card-footer">
             <span>Registo oficial • Paraíso do Saber</span>
             <b aria-hidden="true">↗</b>
           </div>
         </div>
       </button>
     ):<article key={r.id} className="in-catalogue-card"><Link href={`/${paths[type]}/${r.slug}`} className="in-catalogue-image"><img src={asset(r.image||meta.image)} alt={r.name||r.title} loading="lazy"/><span>{r.area||r.category||(type==='events'?'AGENDA':'FORMAÇÃO EM SAÚDE')}</span></Link><div className="in-card-body">{type==='events'&&<time>{dateLabel(r.startsAt)}</time>}{type==='news'&&r.publishAt&&<time>{dateLabel(r.publishAt)}</time>}<h3><Link href={`/${paths[type]}/${r.slug}`}>{r.name||r.title}</Link></h3><p>{r.description||r.summary}</p>{type==='courses'&&<div className="in-card-meta"><span>✚ Área da saúde</span><span>{r.modality||'Consulte as condições'}</span></div>}<Link className="in-card-link" href={`/${paths[type]}/${r.slug}`}>{type==='courses'?'Conheça esta formação':type==='events'?'Ver detalhes do evento':'Ler publicação'} <span>↗</span></Link></div></article>)}
    </div>{!filtered.length&&<EmptyState search={Boolean(q)||filter!=='Todos'} retry={q||filter!=='Todos'?clear:undefined}/>} {filtered.length>limit&&<button className="ps-button ps-blue in-load-more" onClick={()=>setLimit(n=>n+defaultStep)}>Mostrar mais conteúdos ({filtered.length-limit} restantes) ↓</button>}</>}
   {type==='media'&&(filter==='Todos'||filter==='Vídeos')&&(
     <section className="in-videos">
       <div className="ps-section-heading">
         <div>
           <span className="ps-eyebrow">O INSTITUTO EM MOVIMENTO • FORMATO REELS HD</span>
           <h2>Vídeos institucionais</h2>
         </div>
         <span className="in-videos-count">{videos.length} {videos.length === 1 ? 'vídeo disponível' : 'vídeos disponíveis'}</span>
       </div>
       <div className="in-video-grid">
         {videos.map((v) => (
           <article key={v.url} className="in-video-card">
             <div className="in-video-card-media">
               <span className="in-video-card-badge">REELS {String(v.id).padStart(2, '0')}</span>
               <video controls preload="metadata" poster={v.poster} className="in-video-card-player">
                 <source src={v.url} type="video/mp4" />
               </video>
             </div>
             <div className="in-video-card-body">
               <small className="in-video-card-tag">{v.tag}</small>
               <h3>{v.name}</h3>
               <p>{v.desc}</p>
               <div className="in-video-card-footer">
                 <span>▶ Apresentação oficial</span>
                 <b>HD 9:16</b>
               </div>
             </div>
           </article>
         ))}
       </div>
       {!videos.length&&filter==='Vídeos'&&<EmptyState search retry={clear}/>}
     </section>
   )}
  </>}
  {type==='courses'&&<><AdmissionsSteps/><FAQ/></>}<CallToAction/>
  {selected&&(
    <div className="event-lightbox-overlay" onClick={e=>{if(e.target===e.currentTarget)setSelected(null)}} role="dialog" aria-modal="true" aria-label="Visualizador de fotografia">
      <div className="event-lightbox-content">
        <div className="event-lightbox-header">
          <span className="event-lightbox-counter">
            {selectedIdx>=0?`Fotografia ${selectedIdx+1} de ${filtered.length}`:'Fotografia'} · {selected.category||'Galeria do Instituto'}
          </span>
          <button className="event-lightbox-close" onClick={()=>setSelected(null)} aria-label="Fechar imagem">✕ Fechar</button>
        </div>
        <div className="event-lightbox-main">
          {filtered.length>1&&(
            <button className="event-lightbox-nav prev" onClick={()=>setSelected(filtered[selectedIdx>0?selectedIdx-1:filtered.length-1])} aria-label="Fotografia anterior">‹</button>
          )}
          <div className="event-lightbox-image-wrap">
            <img src={asset(selected.url)} alt={selected.originalName} className="event-lightbox-img"/>
            <p className="event-lightbox-caption">{selected.originalName}</p>
          </div>
          {filtered.length>1&&(
            <button className="event-lightbox-nav next" onClick={()=>setSelected(filtered[selectedIdx<filtered.length-1?selectedIdx+1:0])} aria-label="Próxima fotografia">›</button>
          )}
        </div>
        {filtered.length>1&&(
          <div className="event-lightbox-thumbs">
            {filtered.map((item:any,idx:number)=>(
              <button key={item.id||idx} className={`event-lightbox-thumb ${item.id===selected.id?'active':''}`} onClick={()=>setSelected(item)} aria-label={`Ver ${item.originalName}`}>
                <img src={asset(item.url)} alt=""/>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )}
 </PublicLayout>
}
export function Detail({type,slug}:{type:'courses'|'events'|'news',slug:string}){
 const [item,setItem]=useState<any>(null),[state,setState]=useState('loading'),[retry,setRetry]=useState(0),[tab,setTab]=useState('overview'),[share,setShare]=useState('');
 const [interestOpen, setInterestOpen] = useState(false);
 const [viewerIndex, setViewerIndex] = useState<number | null>(null);
 const data=usePortal();useTitle(item?.name||item?.title||info[type].label);

 const getEventPhotos = (s: string) => {
   if (s === 'jornadas-cientificas-instituto-paraiso-do-saber') {
     return Array.from({length: 10}, (_, i) => ({
       src: `/media/events/jornadas-cientificas-${i + 1}.jpg`,
       title: `Jornadas Científicas — Registo ${i + 1}`,
     }));
   }
   if (s === 'inauguracao-da-quadra-desportiva-paraiso-do-saber') {
     return Array.from({length: 5}, (_, i) => ({
       src: `/media/events/inauguracao-quadra-${i + 1}.jpg`,
       title: `Inauguração da Quadra (Akwá, Kali e Zé Kalanga) — Foto ${i + 1}`,
     }));
   }
   if (s === 'feira-do-inventor-ciencia-tecnologia-artes-cacuaco') {
     return Array.from({length: 5}, (_, i) => ({
       src: `/media/events/feira-inventor-${i + 1}.jpg`,
       title: `Participação na Feira do Inventor — Registo ${i + 1}`,
     }));
   }
   if (s === 'campeonato-intercolegial-paraiso-do-saber') {
     return Array.from({length: 5}, (_, i) => ({
       src: `/media/events/campeonato-intercolegial-${i + 1}.jpg`,
       title: `Campeonato Intercolegial Paraíso do Saber — Foto ${i + 1}`,
     }));
   }
   if (s === '2-feira-de-saude-combate-doencas-diarreicas-agudas') {
     return [
       {
         src: `/media/events/feira-saude-1.jpg`,
         title: `2ª Feira de Saúde Comunitária: Combate às Doenças Diarreicas Agudas`,
       }
     ];
   }
   return [];
 };

 const eventPhotos = getEventPhotos(item?.slug || slug);

 useEffect(()=>{
   if(viewerIndex === null) return;
   const onKey = (e: KeyboardEvent) => {
     if(e.key === 'Escape') setViewerIndex(null);
     if(e.key === 'ArrowLeft') setViewerIndex(n => (n !== null && n > 0 ? n - 1 : eventPhotos.length - 1));
     if(e.key === 'ArrowRight') setViewerIndex(n => (n !== null && n < eventPhotos.length - 1 ? n + 1 : 0));
   };
   window.addEventListener('keydown', onKey);
   return () => window.removeEventListener('keydown', onKey);
 }, [viewerIndex, eventPhotos.length]);

 useEffect(()=>{const controller=new AbortController();setState('loading');fetch(`/api/public/${type}/${encodeURIComponent(slug)}`,{signal:controller.signal}).then(async r=>{if(r.status===404){setState('missing');return}if(!r.ok)throw new Error();setItem(await r.json());setState('ready')}).catch(e=>{if(e.name!=='AbortError')setState('error')});return()=>controller.abort()},[type,slug,retry]);
 const whatsapp='https://wa.me/'+String(data.settings.whatsapp).replace(/\D/g,'')+'?text='+encodeURIComponent(`Olá! Gostaria de informações sobre ${item?.name||item?.title||'o Instituto'}.`);
 const courseTabs=[['overview','Apresentação'],['formation','A formação'],['admission','Como ingressar']];
 async function copyLink(){try{await navigator.clipboard.writeText(location.href);setShare('Ligação copiada.')}catch{setShare('Copie o endereço na barra do navegador.')}}
 return <PublicLayout>{state==='loading'?<div className="in-detail-loading" role="status">A carregar informações…<div className="in-skeleton-grid"><div/><div/></div></div>:state==='error'?<EmptyState error retry={()=>setRetry(n=>n+1)}/>:state==='missing'?<div className="in-empty"><span className="ps-eyebrow">CONTEÚDO INDISPONÍVEL</span><h1>Esta página não está disponível.</h1><p>O conteúdo pode ter sido removido ou ainda não estar publicado.</p><Link className="ps-button ps-blue" href={'/'+paths[type]}>Voltar a {info[type].label.toLowerCase()} ↗</Link></div>:<>
  <PageBanner eyebrow={type==='courses'?'Formação na área da saúde':type==='events'?'Agenda do Instituto':item.category||'Notícias do Instituto'} title={item.name||item.title} description={item.description||item.summary||''} image={item.image||info[type].image}/>
  <nav className="in-detail-back"><Link href={'/'+paths[type]}>← {type==='courses'?'Todos os cursos':type==='events'?'Todos os eventos':'Todas as notícias'}</Link><button onClick={copyLink}>Partilhar esta página ↗</button><span role="status">{share}</span></nav>
  <div className="in-detail-layout"><article className="in-article">
   {type==='courses'?<><div className="in-tabs" role="tablist" aria-label="Informações do curso">{courseTabs.map(([key,label])=><button key={key} role="tab" id={'tab-'+key} aria-selected={tab===key} aria-controls="course-panel" onClick={()=>setTab(key)}>{label}</button>)}</div><div id="course-panel" role="tabpanel" aria-labelledby={'tab-'+tab}>
    {tab==='overview'&&<><span className="ps-eyebrow">CONHEÇA A SUA PRÓXIMA FORMAÇÃO</span><h2>Sobre o curso</h2><p className="in-lead">{item.description}</p><p>A formação na área da saúde exige conhecimento, responsabilidade e atenção às pessoas. No Paraíso do Saber, o seu percurso começa pela escolha informada do curso que pretende frequentar.</p>{item.objectives&&<section><h2>Objetivos da formação</h2><p>{item.objectives}</p></section>}{item.careerProfile&&<section><h2>Perfil profissional</h2><p>{item.careerProfile}</p></section>}<div className="in-note"><strong>Uma escolha com informação.</strong><p>Converse com a secretaria para conhecer o enquadramento da formação e esclarecer as suas dúvidas antes da matrícula.</p></div></>}
    {tab==='formation'&&<><span className="ps-eyebrow">ORGANIZE O SEU PERCURSO</span><h2>Informações da formação</h2><dl className="in-facts">{[['Duração',item.duration],['Modalidade',item.modality],['Horários',item.schedule],['Local',item.location]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||'Consulte a secretaria'}</dd></div>)}</dl>{item.curriculum?<section><h2>Plano curricular</h2><p>{item.curriculum}</p></section>:<div className="in-note"><strong>Quer conhecer o plano curricular?</strong><p>Solicite à secretaria as informações atualizadas sobre as disciplinas, a duração e a organização das turmas.</p><a href={whatsapp} target="_blank" rel="noreferrer">Solicitar informações ↗</a></div>}</>}
    {tab==='admission'&&<><span className="ps-eyebrow">O PRÓXIMO PASSO É SEU</span><h2>Como ingressar</h2><p>{item.requirements||'Os requisitos de acesso e a documentação necessária devem ser confirmados com a secretaria, de acordo com o curso e a turma pretendida.'}</p><AdmissionsSteps compact/><button type="button" className="ps-button ps-yellow" onClick={()=>setInterestOpen(true)}>Tenho interesse neste curso ↗</button></>}
   </div></>:<><div className="in-article-meta"><span>{type==='events'?dateLabel(item.startsAt):dateLabel(item.publishAt||item.createdAt)}</span>{item.author&&<span>Por {item.author}</span>}</div><h2>{type==='events'?'Sobre este encontro':'Informação para a nossa comunidade'}</h2><div className="in-lead" style={{whiteSpace:'pre-line'}}>{item.description||item.summary}</div>{item.content&&<div className="in-article-text">{item.content}</div>}{type==='events'&&<dl className="in-facts">{[['Data',dateLabel(item.startsAt)],['Horário',item.time],['Local',item.location],['Participação',item.speaker]].filter(([,v])=>v).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}{type==='events'&&eventPhotos.length>0&&<section className="event-gallery-section"><div className="event-gallery-header"><div><span className="ps-eyebrow" style={{display:'block',marginBottom:'4px'}}>MEMÓRIA FOTOGRÁFICA</span><h3 className="event-gallery-title">Galeria Oficial do Evento ({eventPhotos.length} {eventPhotos.length===1?'Registo':'Registos'})</h3></div><span className="event-gallery-hint">🔍 Clique em qualquer foto para ampliar</span></div><div className="event-gallery-grid">{eventPhotos.map((p,idx)=><div key={idx} className="event-gallery-card" onClick={()=>setViewerIndex(idx)} role="button" tabIndex={0} aria-label={`Ver foto ${idx + 1} ampliada`} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')setViewerIndex(idx);}}><img src={p.src} alt={p.title} style={{width:'100%',height:'145px',objectFit:'cover',display:'block'}} loading="lazy"/><div className="event-gallery-hover-overlay"><span>Foto {idx + 1} ↗</span></div></div>)}</div></section>}{item.video&&<video controls preload="none" className="in-article-video"><source src={asset(item.video)}/></video>}{item.registrationUrl&&<a className="ps-button ps-blue" href={item.registrationUrl} target="_blank" rel="noreferrer">{item.registrationUrl.includes('facebook')?'Ver publicação oficial no Facebook ↗':'Informações e inscrição ↗'}</a>}{item.tags&&<div className="in-tags">{item.tags.split(',').map((tag:string)=><span key={tag}>{tag.trim()}</span>)}</div>}</>}
  </article><aside className="in-detail-aside"><div className="in-admission-card"><span className="ps-eyebrow">PARAÍSO DO SABER</span><h2>{type==='courses'?'O seu futuro começa com uma escolha.':'Faça parte da nossa comunidade.'}</h2><p>A nossa equipa está disponível para o acompanhar e esclarecer as suas dúvidas.</p>{type==='courses'?<button type="button" className="ps-button ps-yellow" onClick={()=>setInterestOpen(true)}>Tenho interesse ↗</button>:<Link className="ps-button ps-yellow" href="/matriculas">Fale com a equipa ↗</Link>}<a href={whatsapp} target="_blank" rel="noreferrer" className="in-whatsapp-link">Conversar pelo WhatsApp ↗</a><hr/><small>CONTACTE A SECRETARIA</small><a href={'tel:'+data.settings.phone1.replace(/\s/g,'')}>{data.settings.phone1}</a></div><div className="in-aside-note"><span>✚</span><strong>Educação com propósito.</strong><p>Conhecimento, responsabilidade e cuidado com as pessoas.</p></div></aside></div>
  {type==='courses'&&<section className="in-related"><div className="ps-section-heading"><div><span className="ps-eyebrow">OUTROS CAMINHOS NA SAÚDE</span><h2>Explore outras formações</h2></div><Link href="/cursos">Ver todos ↗</Link></div><div className="in-related-grid">{data.courses.filter((c:any)=>c.slug!==slug).slice(0,2).map((c:any)=><Link href={'/cursos/'+c.slug} key={c.slug}><img src={asset(c.image||'/banner1.jpeg')} alt=""/><div><small>FORMAÇÃO EM SAÚDE</small><h3>{c.name}</h3><span>Conhecer o curso ↗</span></div></Link>)}</div></section>}<CallToAction/>
  {interestOpen && <InterestModal course={item?.name || 'Curso de Saúde'} onClose={()=>setInterestOpen(false)}/>}
  {viewerIndex !== null && (
    <div className="event-lightbox-overlay" onClick={e=>{if(e.target===e.currentTarget)setViewerIndex(null);}} role="dialog" aria-modal="true" aria-label="Visualizador de Fotos">
      <div className="event-lightbox-content">
        <div className="event-lightbox-header">
          <span className="event-lightbox-counter">Fotografia {viewerIndex + 1} de {eventPhotos.length}</span>
          <button className="event-lightbox-close" onClick={()=>setViewerIndex(null)} aria-label="Fechar visualizador">✕ Fechar</button>
        </div>
        <div className="event-lightbox-main">
          <button className="event-lightbox-nav prev" onClick={()=>setViewerIndex(n=>(n!==null&&n>0?n-1:eventPhotos.length-1))} aria-label="Foto anterior">‹</button>
          <div className="event-lightbox-image-wrap">
            <img src={eventPhotos[viewerIndex].src} alt={eventPhotos[viewerIndex].title} className="event-lightbox-img" />
            <p className="event-lightbox-caption">{eventPhotos[viewerIndex].title}</p>
          </div>
          <button className="event-lightbox-nav next" onClick={()=>setViewerIndex(n=>(n!==null&&n<eventPhotos.length-1?n+1:0))} aria-label="Próxima foto">›</button>
        </div>
        <div className="event-lightbox-thumbs">
          {eventPhotos.map((p,idx)=>(
            <button key={idx} className={`event-lightbox-thumb ${idx===viewerIndex?'active':''}`} onClick={()=>setViewerIndex(idx)} aria-label={`Ver foto ${idx+1}`}>
              <img src={p.src} alt="" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )}
 </>}</PublicLayout>
}
