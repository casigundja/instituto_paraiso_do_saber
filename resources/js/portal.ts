import {useEffect,useState} from 'react';
export const defaults={institutionName:'Instituto Técnico Privado de Saúde Paraíso do Saber',logo:'/logo_paraiso_do_saber.jpeg',phone1:'+244 930 133 850',phone2:'+244 953 955 368',whatsapp:'244930133850',address:'Bairro Paraíso, depois da Pracinha Nova, em frente à Casa do Partido do MPLA.'};
export const asset=(url:string)=>/^https?:\/\//.test(url)||url.startsWith('/')?url:'/'+url;
let portalPromise:Promise<any>|undefined;
export function usePortal(enabled=true){
 const [data,setData]=useState<any>({settings:defaults,courses:[],sections:[]});
 useEffect(()=>{if(!enabled)return;let live=true;portalPromise??=fetch('/api/public/home').then(r=>{if(!r.ok)throw new Error();return r.json()}).catch(()=>{portalPromise=undefined;return {settings:defaults,courses:[],sections:[]}});portalPromise.then(d=>{if(live)setData({...d,settings:{...defaults,...d.settings}})});return()=>{live=false}},[enabled]);
 return data;
}
export function useTitle(title:string){useEffect(()=>{document.title=title+' | Instituto Paraíso do Saber'},[title])}
export const paths={courses:'cursos',events:'eventos',news:'noticias',media:'galeria'};
export const dateLabel=(value:string)=>value?new Date(value).toLocaleDateString('pt-AO',{day:'numeric',month:'long',year:'numeric'}):'';
