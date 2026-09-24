import {createRoot} from 'react-dom/client';
import {useEffect,useState} from 'react';
import Home from './Home';
import Admin from './Admin';
import {Listing, Detail} from './Listing';
import Institutional from './Institutional';
import PasswordRecovery from './PasswordRecovery';
const [page, slug] = window.location.pathname.split('/').filter(Boolean);
const types = {cursos:'courses',eventos:'events',noticias:'news',galeria:'media'} as const;
const type=types[page as keyof typeof types];
function Portal(){
 const [theme,setTheme]=useState(()=>localStorage.getItem('ps_theme')==='dark'?'dark':'light');
 useEffect(()=>{document.body.classList.toggle('theme-dark',theme==='dark');localStorage.setItem('ps_theme',theme)},[theme]);
 const content=page==='admin'?<Admin/>:page==='recuperar-senha'?<PasswordRecovery/>:page==='redefinir-senha'?<PasswordRecovery reset/>:['instituto','matriculas','contactos'].includes(page)?<Institutional page={page as 'instituto'|'matriculas'|'contactos'}/>:type?(slug&&type!=='media'?<Detail type={type} slug={decodeURIComponent(slug)}/>:<Listing type={type}/>):<Home/>;
 return <>{content}<button className="theme-toggle" onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label={theme==='dark'?'Activar modo claro':'Activar modo escuro'} title={theme==='dark'?'Modo claro':'Modo escuro'}><span aria-hidden="true">{theme==='dark'?'☀':'☾'}</span>{theme==='dark'?'Modo claro':'Modo escuro'}</button></>;
}
createRoot(document.getElementById('app')!).render(<Portal/>);
