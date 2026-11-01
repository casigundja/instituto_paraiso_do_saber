import {useState,type FormEvent} from 'react';
import PublicLayout from './PublicLayout';
import {PageBanner,CallToAction} from './Listing';
import {usePortal,useTitle} from './portal';
import Link from './Link';

export function AdmissionsSteps({compact=false}:{compact?:boolean}){return <section className={`in-steps ${compact?'is-compact':''}`}>{!compact&&<div className="ps-section-heading"><div><span className="ps-eyebrow">DA ESCOLHA AO PRIMEIRO PASSO</span><h2>Como começar a sua formação</h2></div><Link href="/matriculas">Saiba mais ↗</Link></div>}<div className="in-steps-grid">{[['01','Escolha o seu curso','Explore as formações e encontre a área com que mais se identifica.'],['02','Fale com a secretaria','Confirme os requisitos, as turmas, os horários e a documentação necessária.'],['03','Prepare a sua matrícula','Receba as orientações da equipa para organizar a sua candidatura.']].map(([n,title,text])=><article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>}
export function FAQ(){return <section className="in-faq"><div><span className="ps-eyebrow">RESPOSTAS PARA O SEU PRÓXIMO PASSO</span><h2>Perguntas frequentes</h2><p>Tem outra dúvida? A nossa equipa pode ajudar.</p><Link href="/contactos">Fale connosco ↗</Link></div><div>{[
 ['Quais são os cursos disponíveis?','O Instituto disponibiliza formações em Enfermagem, Análises Clínicas, Farmácia, Fisioterapia e Estomatologia / Medicina Dentária. Consulte a página de cursos para conhecer a oferta atualmente publicada.'],
 ['Como posso solicitar informações sobre a matrícula?','Preencha o formulário de interesse com o seu nome, telefone e curso pretendido. Também pode contactar diretamente a secretaria por telefone ou WhatsApp.'],
 ['Quais são os requisitos, os horários e o valor da formação?','Estas informações devem ser confirmadas junto da secretaria para o curso e a turma que pretende frequentar. A equipa poderá indicar a documentação e as condições atualizadas.'],
 ['O envio do formulário confirma a minha matrícula?','Não. O formulário regista um pedido de informação. A matrícula é formalizada junto da secretaria, após a confirmação dos requisitos e dos procedimentos aplicáveis.'],
 ['Onde fica o Instituto?','No Bairro Paraíso, depois da Pracinha Nova, em frente à Casa do Partido do MPLA. Contacte a equipa para obter orientações para a visita.'],
 ].map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>}
export function ContactForm({course='',message=false}:{course?:string,message?:boolean}){
 const data=usePortal();
 const [status,setStatus]=useState<'idle'|'sending'|'sent'|'error'>('idle');
 const [error,setError]=useState('');
 const [sentLead,setSentLead]=useState<any>(null);

 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  const form=e.currentTarget;
  setStatus('sending');
  setError('');
  try{
    const payload = Object.fromEntries(new FormData(form));
    const response=await fetch('/api/public/leads',{
      method:'POST',
      headers:{'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify(payload)
    });
    if(!response.ok){
      const result=await response.json().catch(()=>({}));
      throw new Error(result.message||'Não foi possível enviar. Tente novamente.');
    }
    const resultData = await response.json();
    setSentLead(resultData);
    setStatus('sent');
    form.reset();
  }catch(err:any){
    setStatus('error');
    setError(err.message || 'Não foi possível enviar o pedido. Verifique os dados e tente novamente ou contacte a secretaria.');
  }
 }

 return <form className="in-contact-form" onSubmit={submit}>
  <div className="in-form-heading">
    <span className="ps-eyebrow">VAMOS CONHECER-NOS</span>
    <h2>{message?'Envie a sua mensagem':'Manifeste o seu interesse'}</h2>
    <p>Os campos assinalados com * são obrigatórios.</p>
  </div>

  {status==='sent' ? (
    <div className="in-form-success-container" role="status">
      <div className="modal-sms-notification in-form-sms-card">
        <p>
          <strong>Estimado(a) {sentLead?.name || 'Candidato(a)'},</strong>
        </p>
        <p>
          {sentLead?.course ? (
            <>O seu interesse no curso de <strong>{sentLead.course}</strong> foi registado com sucesso.</>
          ) : (
            <>O seu pedido de informações foi registado com sucesso.</>
          )}
        </p>
        <p>
          A secretaria entrará em contacto consigo muito em breve através do número indicado, com todas as orientações sobre vagas, horários e formalização da sua matrícula.
        </p>
      </div>
      <p className="in-form-success-note">
        ✓ O seu pedido foi registado.
      </p>
      <button type="button" className="ps-button ps-yellow in-form-resubmit" onClick={()=>{ setStatus('idle'); setSentLead(null); }}>
        Submeter novo pedido ↗
      </button>
    </div>
  ) : (
    <>
      <label>Nome completo *<input name="name" required maxLength={255} autoComplete="name" placeholder="O seu nome"/></label>
      <label>Telefone / Telemóvel (WhatsApp) *<input name="phone" required type="tel" maxLength={60} autoComplete="tel" placeholder="+244"/></label>
      <label>Correio eletrónico (E-mail)<input name="email" type="email" autoComplete="email" placeholder="nome@email.com"/></label>
      <label>Curso de interesse<select name="course" defaultValue={course} key={data.courses.length}><option value="">Selecione um curso</option>{data.courses.map((c:any)=><option key={c.slug} value={c.name}>{c.name}</option>)}</select></label>
      <label>Município / Localidade<input name="municipality" maxLength={255} autoComplete="address-level2" placeholder="Onde reside?"/></label>
      <label className="in-full">{message?'Mensagem':'Como podemos ajudar?'}<textarea name="notes" rows={4} maxLength={10000} placeholder="Escreva aqui as suas dúvidas ou informações adicionais."/></label>
      <p className="in-form-help">Utilizaremos estes dados para responder ao seu pedido. O envio deste formulário não formaliza uma matrícula.</p>
      <button className="ps-button ps-blue" disabled={status==='sending'}>{status==='sending'?'A enviar…':message?'Enviar mensagem':'Solicitar informações'} <span>↗</span></button>
      {status==='error' && <p role="status" className="in-form-feedback is-error">{error}</p>}
    </>
  )}
 </form>
}
export default function Institutional({page}:{page:'instituto'|'matriculas'|'contactos'}){
 const data=usePortal();const s=data.settings;const whatsapp='https://wa.me/'+String(s.whatsapp).replace(/\D/g,'');useTitle(page==='instituto'?'O Instituto':page==='matriculas'?'Admissões e matrículas':'Contactos');
 const [selectedVideo, setSelectedVideo] = useState('/publicidade1.mp4');
 const instituteVideos = [
   { id: 1, title: 'Apresentação Institucional', subtitle: 'Visão geral do campus e estrutura pedagógica', duration: '1:06', file: '/publicidade1.mp4', poster: '/media/video_poster.jpg' },
   { id: 2, title: 'Corpo Docente e Ensino', subtitle: 'Preparação prática e acompanhamento dos estudantes', duration: '0:54', file: '/publicidade2.mp4', poster: '/media/video_poster.jpg' },
   { id: 3, title: 'Visita Guiada às Instalações', subtitle: 'Corredores, salas de aula e laboratórios de saúde', duration: '0:43', file: '/publicidade3.mp4', poster: '/media/video3_poster.jpg' },
   { id: 4, title: 'Comunidade Estudantil', subtitle: 'Rotina académica, rigor técnico e humanização', duration: '0:48', file: '/publicidade4.mp4', poster: '/media/video_poster.jpg' },
   { id: 5, title: 'Receção e Vida no Instituto', subtitle: 'Atendimento próximo e acolhimento em Luanda', duration: '0:39', file: '/publicidade5.mp4', poster: '/media/video_poster.jpg' },
 ];
 const activeVideoObj = instituteVideos.find(v => v.file === selectedVideo) || instituteVideos[0];
 return <PublicLayout>{page==='instituto'?<>
 <PageBanner eyebrow="Conheça o Instituto" title="Educar para cuidar. Formar para a vida." description="Conhecimento, responsabilidade e atenção às pessoas. Conheça o Instituto Técnico Privado de Saúde Paraíso do Saber." image="/banner2.jpeg"><Link className="ps-button ps-yellow" href="/cursos">Explore as nossas formações ↗</Link></PageBanner>
 <section className="in-about-story"><div><span className="ps-eyebrow">A NOSSA IDENTIDADE</span><h2>O conhecimento abre caminhos.<br/>O cuidado dá-lhes sentido.</h2><p className="in-lead">O Paraíso do Saber é uma instituição dedicada à formação na área da saúde.</p><p>A nossa apresentação institucional parte de uma convicção: aprender é preparar-se para contribuir. Valorizamos o conhecimento, a responsabilidade e o respeito pelas pessoas no percurso de formação.</p><p>Conheça a oferta de cursos e converse com a nossa equipa para compreender as possibilidades de formação e os próximos passos.</p></div><figure><img src="/banner3.jpeg" alt="Imagem de apresentação da formação na saúde"/><figcaption>Instituto Paraíso do Saber · Formação na área da saúde</figcaption></figure></section>
 <section className="in-values"><div className="ps-section-heading"><div><span className="ps-eyebrow">O QUE NOS ORIENTA</span><h2>Uma formação com propósito.</h2></div></div><div className="in-values-grid">{[['01','Conhecimento','Aprender, compreender e desenvolver uma base de conhecimentos na área da saúde.'],['02','Responsabilidade','Valorizar uma postura atenta, consciente e comprometida com a formação.'],['03','Humanização','Reconhecer a importância do respeito e do cuidado na relação com as pessoas.']].map(([n,title,text])=><article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
 <section className="in-cinema-showcase">
   <div className="in-cinema-stage">
     <div className="in-cinema-video-box">
       <span className="in-cinema-live-tag">
         <i aria-hidden="true" /> VÍDEO {String(activeVideoObj.id).padStart(2, '0')} · HD
       </span>
       <video
         key={selectedVideo}
         controls
         preload="metadata"
         poster={activeVideoObj.poster}
         className="in-cinema-video"
       >
         <source src={selectedVideo} type="video/mp4" />
         O seu navegador não suporta a reprodução deste vídeo.
       </video>
     </div>
   </div>

   <div className="in-cinema-content">
     <div className="in-cinema-header">
       <span className="in-cinema-eyebrow">CONHEÇA-NOS MELHOR</span>
       <h2>Uma apresentação.<br/>Muitas possibilidades.</h2>
       <p>
         Veja os nossos materiais institucionais e conheça a proposta do Paraíso do Saber.
         Selecione abaixo o vídeo que deseja assistir:
       </p>
     </div>

     <div className="in-cinema-playlist" role="list" aria-label="Lista de vídeos institucionais">
       {instituteVideos.map((v) => {
         const isActive = selectedVideo === v.file;
         return (
           <button
             key={v.id}
             type="button"
             className={`in-cinema-track ${isActive ? 'is-active' : ''}`}
             onClick={() => setSelectedVideo(v.file)}
           >
             <span className="in-cinema-track-num">{String(v.id).padStart(2, '0')}</span>
             <div className="in-cinema-track-text">
               <strong>{v.title}</strong>
               <small>{v.subtitle}</small>
             </div>
             <span className="in-cinema-track-action">
               {isActive ? 'A reproduzir' : `▶ ${v.duration}`}
             </span>
           </button>
         );
       })}
     </div>

     <div className="in-cinema-footer">
       <Link href="/galeria" className="ps-button ps-yellow">
         Ver toda a galeria <span aria-hidden="true">↗</span>
       </Link>
       <Link href="/matriculas" className="in-cinema-secondary-btn">
         Quero fazer parte <span aria-hidden="true">↗</span>
       </Link>
     </div>
   </div>
 </section><AdmissionsSteps/><CallToAction/>
 </>:page==='matriculas'?<>
 <PageBanner eyebrow="Admissões e matrículas" title="O próximo capítulo começa consigo." description="Dê o primeiro passo para a sua formação na saúde. A nossa equipa acompanha-o na escolha do curso e no esclarecimento das condições de acesso." image="/banner1.jpeg"><a href="#candidatura" className="ps-button ps-yellow">Quero receber informações ↗</a></PageBanner><AdmissionsSteps/>
 <section className="in-admissions-layout" id="candidatura"><div className="in-admissions-intro"><span className="ps-eyebrow">PREPARE A SUA ESCOLHA</span><h2>Vamos construir o seu próximo passo.</h2><p>Preencha o formulário e indique o curso que pretende conhecer. A secretaria poderá esclarecer:</p><ul><li>Requisitos de acesso e documentação.</li><li>Disponibilidade de turmas e horários.</li><li>Duração, organização e condições da formação.</li><li>Procedimentos para formalizar a matrícula.</li></ul><div className="in-note"><strong>Prefere falar diretamente?</strong><p>{s.phone1}<br/>{s.phone2}</p><a href={whatsapp} target="_blank" rel="noreferrer">Conversar pelo WhatsApp ↗</a></div></div><ContactForm course={new URLSearchParams(location.search).get('curso')||''}/></section><FAQ/>
 </>:<>
 <PageBanner eyebrow="Contactos e localização" title="Perto de si. Prontos para ajudar." description="Precisa de informações sobre cursos, matrículas ou sobre o Instituto? Entre em contacto com a nossa equipa." image="/banner-campus-galerias.jpg"/>
 <section className="in-contact-options"><a href={'tel:'+s.phone1.replace(/\s/g,'')}><span aria-hidden="true">↗</span><small>FALE COM A SECRETARIA</small><h2>Telefone</h2><p>{s.phone1}<br/>{s.phone2}</p></a><a href={whatsapp} target="_blank" rel="noreferrer"><span aria-hidden="true">↗</span><small>UMA CONVERSA MAIS PRÓXIMA</small><h2>WhatsApp</h2><p>Envie a sua mensagem e fale<br/>com a nossa equipa.</p></a>{s.email&&<a href={'mailto:'+s.email}><span aria-hidden="true">↗</span><small>CORREIO ELETRÓNICO</small><h2>E-mail</h2><p>{s.email}<br/><span style={{fontSize:'12px',opacity:0.8}}>Secretaria e informações</span></p></a>}<a href="#localizacao"><span aria-hidden="true">↗</span><small>VENHA CONHECER-NOS</small><h2>Visite o Instituto</h2><p>Bairro Paraíso<br/>Consulte as indicações abaixo.</p></a></section>
 <section className="in-contact-layout"><ContactForm message/><div className="in-location" id="localizacao"><span className="ps-eyebrow">COMO NOS ENCONTRAR</span><h2>O seu caminho até ao Paraíso do Saber.</h2><div className="in-location-art" aria-hidden="true"><div className="in-map-street one"/><div className="in-map-street two"/><div className="in-map-street three"/><span>✚</span><b>PARAÍSO DO SABER</b></div><h3>Localização e Redes Oficiais</h3><p>{s.address}</p>{(s.facebook||s.instagram)&&<div style={{marginTop:'12px',marginBottom:'14px',display:'flex',gap:'10px',flexWrap:'wrap'}}>{s.facebook&&<a href={s.facebook} target="_blank" rel="noreferrer" className="ps-button ps-outline" style={{padding:'6px 14px',fontSize:'13px'}}>Facebook Oficial ↗</a>}{s.instagram&&<a href={s.instagram} target="_blank" rel="noreferrer" className="ps-button ps-outline" style={{padding:'6px 14px',fontSize:'13px'}}>Instagram Oficial ↗</a>}</div>}<div className="in-note"><strong>Planeie a sua visita.</strong><p>Confirme o horário de atendimento e peça orientações à secretaria antes de se deslocar.</p></div><a className="ps-button ps-blue" href={whatsapp+'?text='+encodeURIComponent('Olá! Gostaria de orientações para visitar o Instituto Paraíso do Saber.')} target="_blank" rel="noreferrer">Pedir indicações ↗</a></div></section><FAQ/>
 </>}</PublicLayout>
}

