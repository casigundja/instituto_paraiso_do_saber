import {useEffect,useState,type ReactNode} from 'react';
import Link from './Link';
import {asset,defaults,usePortal} from './portal';
const Arrow=()=> <span aria-hidden="true">↗</span>;
export default function PublicLayout({children,settings:provided,onSearch,searchValue}:{children:ReactNode,settings?:any,onSearch?:(value:string)=>void,searchValue?:string}){
const portal=usePortal(!provided);
const settings=provided||portal.settings||defaults;
const [menu,setMenu]=useState(false);
const [localQuery,setLocalQuery]=useState('');
const query=searchValue??localQuery;
const setQuery=(value:string)=>{setLocalQuery(value);onSearch?.(value)};
const whatsapp='https://wa.me/'+String(settings.whatsapp).replace(/\D/g,'');
useEffect(()=>{
 if(!menu)return;
 const previous=document.activeElement as HTMLElement|null;
 const overflow=document.body.style.overflow;
 document.body.style.overflow='hidden';
 const items=()=>Array.from(document.querySelectorAll<HTMLElement>('.ps-sidebar.is-open a,.ps-sidebar.is-open input,.ps-sidebar.is-open button')).filter(el=>el.getClientRects().length>0);
 items()[0]?.focus();
 const handler=(e:KeyboardEvent)=>{
  if(e.key==='Escape')setMenu(false);
  if(e.key==='Tab'){
   const elements=items(),first=elements[0],last=elements[elements.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
  }
 };
 window.addEventListener('keydown',handler);
 return()=>{window.removeEventListener('keydown',handler);document.body.style.overflow=overflow;previous?.focus()};
},[menu]);
const nav=[['Início','/'],['O Instituto','/instituto'],['Cursos','/cursos'],['Eventos','/eventos'],['Notícias','/noticias'],['Contactos','/contactos']];
  return <div className="ps-portal">
    <a className="ps-skip" href="#conteudo">Saltar para o conteúdo</a>
    <header className="ps-mobile-header"><a href="/" className="ps-mobile-brand"><img src={asset(settings.logo)} alt=""/><strong>PARAÍSO DO SABER<small>INSTITUTO TÉCNICO DE SAÚDE</small></strong></a><button aria-label={menu?'Fechar menu':'Abrir menu'} aria-expanded={menu} aria-controls="portal-sidebar" onClick={()=>setMenu(!menu)}>{menu?'✕':'☰'}</button></header>
    <div className="ps-layout">
      <div className="ps-main">
        <header className="ps-desktop-header">
          <nav className="ps-topnav" aria-label="Menu principal">{nav.map(([label,url])=><a key={label} href={url}>{label}</a>)}<Link href="/galeria">Galeria</Link></nav><div className="ps-institution-line"><span>INSTITUTO TÉCNICO PRIVADO DE SAÚDE</span><a href="/matriculas">Admissões e matrículas <Arrow/></a></div>
          <nav className="ps-subnav" aria-label="Áreas de formação"><a href="/matriculas">INSCRIÇÕES ABERTAS</a><span>•</span><a href="/cursos">FORMAÇÃO EM SAÚDE</a><span>•</span><a href="/instituto">CONHEÇA O INSTITUTO</a></nav>
        </header>

<main id="conteudo">{children}</main>
        <footer className="ps-footer" id="contactos"><div><h3>ACESSO RÁPIDO</h3><a href="/matriculas">Inscrições e matrículas</a><Link href="/cursos">Nossos cursos</Link><a href="/instituto">O Instituto</a><Link href="/galeria">Galeria</Link></div><div><h3>LOCALIZAÇÃO E CONTACTOS</h3><p>{settings.address}</p><a href={`tel:${settings.phone1.replace(/\s/g,'')}`}>{settings.phone1}</a><a href={`tel:${settings.phone2.replace(/\s/g,'')}`}>{settings.phone2}</a>{settings.email&&<a href={`mailto:${settings.email}`}>{settings.email}</a>}</div><div><h3>INSTITUCIONAL</h3><Link href="/noticias">Notícias</Link><Link href="/eventos">Eventos</Link><Link href="/admin">Área administrativa</Link><a href={whatsapp} target="_blank" rel="noreferrer">Atendimento pelo WhatsApp</a></div><div className="ps-footer-bottom"><span>© {new Date().getFullYear()} Instituto Paraíso do Saber.</span><span>Formação que transforma vidas.</span></div></footer>
      </div>
      {menu&&<button className="ps-menu-overlay" aria-label="Fechar menu" onClick={()=>setMenu(false)}/>}
      <aside id="portal-sidebar" className={`ps-sidebar ${menu?'is-open':''}`}><div className="ps-sidebar-inner">
        <a className="ps-sidebar-brand" href="/"><img src={asset(settings.logo)} alt="Logotipo do Instituto Paraíso do Saber"/><strong>PARAÍSO<br/>DO SABER</strong><span>INSTITUTO TÉCNICO<br/>PRIVADO DE SAÚDE</span></a>
        <form className="ps-search" role="search" onSubmit={e=>{e.preventDefault();setMenu(false);onSearch?document.getElementById('cursos')?.scrollIntoView({behavior:'smooth'}):window.location.assign('/cursos?q='+encodeURIComponent(query))}}><input aria-label="Pesquisar cursos" placeholder="Pesquisar cursos" value={query} onChange={e=>setQuery(e.target.value)}/><button aria-label="Pesquisar" type="submit"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></svg></button></form>
        <a className="ps-button ps-yellow" href="/matriculas" onClick={()=>setMenu(false)}>INSCREVA-SE <Arrow/></a><a className="ps-button ps-blue" href={whatsapp} target="_blank" rel="noreferrer">FALE CONNOSCO <Arrow/></a>
        <div className="ps-sidebar-rule"/>
        <div className="ps-sidebar-links">{[['Nossos cursos','/cursos'],['O Instituto','/instituto'],['Galeria','/galeria'],['Notícias','/noticias'],['Agenda de eventos','/eventos']].map(([label,url])=><a key={label} href={url} onClick={()=>setMenu(false)}>{label}<Arrow/></a>)}</div>
        <div className="ps-sidebar-rule"/><Link className="ps-admin-link" href="/admin"><span aria-hidden="true">▦</span> Área administrativa</Link>
        <div className="ps-sidebar-contact"><small>PRECISA DE AJUDA?</small><a href={`tel:${settings.phone1.replace(/\s/g,'')}`}>{settings.phone1}</a><a href={`tel:${settings.phone2.replace(/\s/g,'')}`}>{settings.phone2}</a><p>A sua próxima conquista<br/>começa com uma conversa.</p></div>
        <div className="ps-sidebar-seal"><span aria-hidden="true">✚</span><p>EDUCAR PARA<br/><strong>CUIDAR.</strong></p></div>
      </div></aside>
    </div><a className="ps-whatsapp" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Conversar no WhatsApp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.1-4.4A8.5 8.5 0 1 1 20 11.5Z"/><path d="M8 7.5c-2 3 3.5 8.5 6.5 6.5l1-1.5-2-1-1 1c-1.5-.5-2.5-1.5-3-3l1-1-1-2Z"/></svg></a>
  </div>
}
