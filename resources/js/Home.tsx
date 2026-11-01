import { useEffect, useState, type FormEvent } from 'react';
import Link from './Link';
import PublicLayout from './PublicLayout';
import { AdmissionsSteps, FAQ } from './Institutional';
import { useTitle } from './portal';

const initial = {
  courses: [
    { slug: 'enfermagem', name: 'Enfermagem', image: '/banner1.jpeg', description: 'Formação técnica e humanizada para prestar cuidados integrados de saúde e assistência ao paciente.' },
    { slug: 'analises-clinicas', name: 'Análises Clínicas', image: '/banner2.jpeg', description: 'Capacitação prática para a realização de exames laboratoriais e apoio fundamental ao diagnóstico clínico.' },
    { slug: 'farmacia', name: 'Farmácia', image: '/banner1.jpeg', description: 'Formação para promover o uso seguro e responsável dos medicamentos.' },
    { slug: 'fisioterapia', name: 'Fisioterapia', image: '/banner2.jpeg', description: 'Conhecimento para apoiar a reabilitação e a qualidade de vida.' },
    { slug: 'estomatologia', name: 'Estomatologia / Medicina Dentária', image: '/banner3.jpeg', description: 'Prepare-se para cuidar da saúde oral com competência.' },
  ],
  campaigns: [], events: [], news: [], sections: [],
  settings: { institutionName: 'Instituto Técnico Privado de Saúde Paraíso do Saber', logo: '/logo_transparent.png', phone1: '+244 930 133 850', phone2: '+244 953 955 368', whatsapp: '244930133850', address: 'Bairro Paraíso, depois da Pracinha Nova, em frente à Casa do Partido do MPLA.' },
};
const asset = (url: string) => /^https?:\/\//.test(url) || url.startsWith('/') ? url : '/' + url;
const Arrow = () => <span aria-hidden="true">↗</span>;

export default function Home() {
  useTitle("Formação que transforma vidas");
  const [data, setData] = useState<any>(initial);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('/publicidade3.mp4');
  const presentations = [
    { id: 1, title: 'Vídeo 01', file: '/publicidade1.mp4' },
    { id: 2, title: 'Vídeo 02', file: '/publicidade2.mp4' },
    { id: 3, title: 'Apresentação 03', file: '/publicidade3.mp4' },
    { id: 4, title: 'Vídeo 04', file: '/publicidade4.mp4' },
    { id: 5, title: 'Vídeo 05', file: '/publicidade5.mp4' },
  ];
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [sentLead, setSentLead] = useState<any>(null);
  useEffect(() => { const controller = new AbortController(); fetch('/api/public/home', { signal: controller.signal }).then(r => { if (!r.ok) throw new Error(); return r.json() }).then(d => setData({ ...initial, ...d, settings: { ...initial.settings, ...d.settings } })).catch(() => { }); return () => controller.abort() }, []);
  const settings = data.settings;
  const whatsapp = `https://wa.me/${String(settings.whatsapp).replace(/\D/g, '')}`;
  const section = (key: string) => data.sections.find((s: any) => s.key === key);
  const visible = (key: string) => section(key)?.enabled !== false;
  const slides = data.campaigns.length ? data.campaigns : [
    { title: section('hero')?.title || 'O seu futuro começa aqui.', subtitle: section('hero')?.description || 'Transforme a sua vocação numa carreira na saúde.', image: '/banner-campus-fachada.jpg', buttonText: 'Quero fazer parte', url: '#interesse' },
    { title: 'Aprender hoje. Cuidar amanhã.', subtitle: 'Conheça os cursos de Enfermagem, Análises Clínicas, Farmácia e muito mais.', image: '/banner-campus-atrio.jpg', buttonText: 'Conheça os cursos', url: '#cursos' },
    { title: 'Dê o próximo passo.', subtitle: 'A sua formação começa com uma conversa. Fale com a nossa equipa.', image: '/banner-campus-galerias.jpg', buttonText: 'Tenho interesse', url: '#interesse' },
  ];
  const active = slides[slide % slides.length];
  useEffect(() => { if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const timer = setInterval(() => setSlide(n => (n + 1) % slides.length), 6500); return () => clearInterval(timer) }, [paused, slides.length]);
  const courses = data.courses.filter((c: any) => `${c.name} ${c.area || ''}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; setStatus('sending');
    try {
      const payload = Object.fromEntries(new FormData(form));
      const response = await fetch('/api/public/leads', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error();
      const resData = await response.json();
      setSentLead(resData);
      setStatus('sent');
      form.reset();
    } catch { setStatus('error') }
  }
  return <PublicLayout settings={settings} onSearch={setQuery} searchValue={query}>
    {visible('hero') && <section className="ps-banner" aria-label="Destaques do Instituto" aria-roledescription="carrossel">
      {slides.map((s: any, i: number) => (
        <img
          key={s.image || i}
          className={`ps-banner-photo ${i === slide % slides.length ? 'is-active' : ''}`}
          src={asset(s.image || '/banner1.jpeg')}
          alt={s.title}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}
      <div className="ps-banner-shade" /><div className="ps-badge-banner" aria-label="Inscrições abertas"><small>INSCRIÇÕES</small><strong>ABERTAS</strong><small>SAIBA MAIS</small></div><span className="ps-banner-corner" aria-hidden="true">INSTITUTO TÉCNICO PRIVADO DE SAÚDE</span>
      <div className="ps-banner-copy"><span className="ps-kicker">CONHECIMENTO QUE TRANSFORMA VIDAS</span><h1>{active.title}</h1><p>{active.subtitle || active.description}</p><a className="ps-button ps-yellow" href={active.url || '#interesse'}>{active.buttonText || 'Saiba mais'}<Arrow /></a><span className="ps-banner-signature">PARAÍSO DO SABER <span>EDUCAÇÃO • SAÚDE • FUTURO</span></span></div>
      <div className="ps-slider-controls"><button aria-label="Destaque anterior" onClick={() => setSlide(n => (n + slides.length - 1) % slides.length)}>‹</button><div>{slides.map((_: any, i: number) => <button key={i} className={i === slide % slides.length ? 'selected' : ''} aria-label={`Mostrar destaque ${i + 1}`} aria-pressed={i === slide % slides.length} onClick={() => setSlide(i)} />)}</div><button aria-label="Próximo destaque" onClick={() => setSlide(n => (n + 1) % slides.length)}>›</button><button className="ps-pause" aria-label={paused ? 'Reproduzir destaques' : 'Pausar destaques'} onClick={() => setPaused(!paused)}>{paused ? '▶' : 'Ⅱ'}</button></div>
    </section>}
    {visible('courses') && <>
      <nav className="ps-course-tabs" aria-label="Cursos disponíveis">{data.courses.map((c: any) => {
        const isDental = c.slug === 'estomatologia' || c.name.includes('/');
        return (
          <Link key={c.slug} href={`/cursos/${c.slug}`}>
            <span className="ps-course-icon" aria-hidden="true">✚</span>
            <span className="ps-course-label">
              {isDental ? (
                <>
                  <span>Estomatologia</span>
                  <small className="ps-course-sub">Medicina Dentária</small>
                </>
              ) : (
                <span>{c.name}</span>
              )}
            </span>
            <Arrow />
          </Link>
        );
      })}</nav>
      <div className="ps-home-strip">
        <a href="#cursos" className="ps-home-strip-item">
          <div className="ps-strip-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <div className="ps-strip-text">
            <strong>Formação em saúde</strong>
            <small>Conhecimento para cuidar.</small>
          </div>
        </a>
        <a href="/matriculas" className="ps-home-strip-item">
          <div className="ps-strip-icon" aria-hidden="true">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </div>
          <div className="ps-strip-text">
            <strong>O seu próximo passo</strong>
            <small>Orientação para a sua escolha.</small>
          </div>
        </a>
        <a href="/instituto" className="ps-home-strip-item">
          <div className="ps-strip-icon" aria-hidden="true">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div className="ps-strip-text">
            <strong>Perto de si</strong>
            <small>Conheça o nosso Instituto.</small>
          </div>
        </a>
      </div><section className="ps-block ps-courses" id="cursos"><div className="ps-section-heading"><div><span className="ps-eyebrow">ESCOLHA O SEU CAMINHO</span><h2>{section('courses')?.title || 'Encontre o seu curso'}</h2></div><Link href="/cursos">Todos os cursos <Arrow /></Link></div>
        {query && <p className="ps-search-result">Resultados para “{query}” <button onClick={() => setQuery('')}>Limpar pesquisa</button></p>}
        <div className="ps-course-grid">{courses.map((c: any, i: number) => <Link className="ps-course-card" key={c.slug} href={`/cursos/${c.slug}`}><img src={asset(c.image || '/banner1.jpeg')} alt={c.name} loading="lazy" /><div className="ps-card-gradient" /><span className="ps-card-tag">FORMAÇÃO EM SAÚDE</span><div className="ps-course-name"><small>0{i + 1} / PARAÍSO DO SABER</small><h3>{c.name}</h3><span>Conhecer o curso <Arrow /></span></div></Link>)}</div>{!courses.length && <p className="ps-empty">Nenhum curso encontrado. Tente outro nome.</p>}
      </section>
    </>}
    {visible('enrollment') && <section className="ps-promos" id="matriculas">
      <a href="/matriculas" className="ps-promo ps-promo-yellow"><small>O PRÓXIMO PASSO É SEU</small><h2>{section('enrollment')?.title || 'Inscrições e matrículas abertas'}</h2><span>Fale com a nossa equipa <Arrow /></span><b aria-hidden="true">✳</b></a>
      <a href="/instituto" className="ps-promo ps-promo-blue"><small>ENSINO COM PROPÓSITO</small><h2>Mais do que ensinar.<br />Preparar para cuidar.</h2><span>Conheça o Instituto <Arrow /></span><b aria-hidden="true">+</b></a>
      <a href={whatsapp} target="_blank" rel="noreferrer" className="ps-promo ps-promo-photo"><img src="/banner3.jpeg" alt="" loading="lazy" /><div /><small>ESTAMOS PERTO DE SI</small><h2>O seu futuro merece uma conversa.</h2><span>Fale connosco <Arrow /></span></a>
    </section>}
    {visible('about') && <section id="instituto" className="ps-about ps-block"><div className="ps-about-visual"><img src="/banner2.jpeg" alt="Cuidados de saúde e formação profissional" loading="lazy" /><span><strong>Aprender.<br />Crescer.<br />Cuidar.</strong><small>PARAÍSO DO SABER</small></span></div><div><span className="ps-eyebrow">UM LUGAR PARA CONSTRUIR O FUTURO</span><h2>{section('about')?.title || 'Conheça o Paraíso do Saber'}</h2><p>{section('about')?.description || 'Somos uma instituição dedicada à formação de profissionais de saúde competentes, humanos e preparados para fazer a diferença na sua comunidade.'}</p><p>Acreditamos que uma educação de qualidade abre caminhos e transforma vidas.</p><a className="ps-button ps-blue" href="/contactos">Venha conhecer-nos <Arrow /></a></div></section>}
    {visible('video') && (
      <section className="ps-video-showcase ps-block" id="apresentacao">
        <div className="ps-section-heading">
          <div>
            <span className="ps-eyebrow">VEJA DE PERTO • APRESENTAÇÃO INSTITUCIONAL</span>
            <h2>{section('video')?.title || 'Conheça o Instituto'}</h2>
          </div>
          <Link href="/galeria">Visitar a galeria <Arrow /></Link>
        </div>

        <div className="ps-video-showcase-card">
          <div className="ps-video-showcase-info">
            <div className="ps-video-header-group">
              <span className="ps-video-kicker">
                <span className="ps-video-kicker-dot" aria-hidden="true" />
                TOUR VIRTUAL • CAMPUS LUANDA
              </span>
              <h3>Visita guiada às instalações e vida académica</h3>
              <p>
                Conheça as instalações do Instituto Técnico Privado de Saúde Paraíso do Saber: salas de aula modernas,
                corredores pedagógicos e laboratórios preparados para oferecer a melhor formação prática em saúde em Luanda.
              </p>
            </div>

            <div className="ps-video-features">
              <div className="ps-video-feature-item">
                <span className="ps-video-feature-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 9h1"/><path d="M14 9h1"/><path d="M9 13h1"/><path d="M14 13h1"/><path d="M11 21v-4h2v4"/>
                  </svg>
                </span>
                <div>
                  <strong>Campus próprio e estruturado</strong>
                  <small>Ambiente seguro, organizado e focado na aprendizagem</small>
                </div>
              </div>
              <div className="ps-video-feature-item">
                <span className="ps-video-feature-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/>
                  </svg>
                </span>
                <div>
                  <strong>Laboratórios práticos de saúde</strong>
                  <small>Equipamentos adequados para Enfermagem, Análises e Farmácia</small>
                </div>
              </div>
              <div className="ps-video-feature-item">
                <span className="ps-video-feature-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </span>
                <div>
                  <strong>Formação técnica humanizada</strong>
                  <small>Professores dedicados e compromisso com o rigor ético</small>
                </div>
              </div>
            </div>

            <div className="ps-video-bottom-bar">
              <div className="ps-video-playlist">
                <div className="ps-video-playlist-header">
                  <span className="ps-video-playlist-title">Outros vídeos disponíveis</span>
                  <span className="ps-video-playlist-count">{presentations.findIndex(p => p.file === selectedVideo) + 1} de {presentations.length}</span>
                </div>
                <div className="ps-video-playlist-items">
                  {presentations.map((p, idx) => {
                    const activeVideo = selectedVideo === p.file;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`ps-video-pill ${activeVideo ? 'is-active' : ''}`}
                        onClick={() => setSelectedVideo(p.file)}
                      >
                        <span className="ps-video-pill-play" aria-hidden="true">{activeVideo ? '●' : '▶'}</span>
                        <span>{p.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="ps-video-actions">
                <a href="/matriculas" className="ps-button ps-yellow">
                  Inscreva-se no Instituto <Arrow />
                </a>
                <a href={whatsapp} target="_blank" rel="noreferrer" className="ps-button ps-blue">
                  Fale pelo WhatsApp <Arrow />
                </a>
              </div>
            </div>
          </div>

          <div className="ps-video-player-stage">
            <div className="ps-video-player-wrapper">
              <div className="ps-video-device-frame">
                <div className="ps-video-device-top">
                  <span className="ps-video-device-camera" />
                  <span className="ps-video-device-speaker" />
                </div>
                <video
                  key={selectedVideo}
                  controls
                  preload="metadata"
                  poster={selectedVideo === '/publicidade3.mp4' ? '/media/video3_poster.jpg' : '/media/video_poster.jpg'}
                  className="ps-video-player"
                >
                  <source src={selectedVideo} type="video/mp4" />
                  O seu navegador não suporta a reprodução deste vídeo.
                </video>
                <div className="ps-video-device-bottom">
                  <span className="ps-video-device-home" />
                </div>
              </div>
              <span className="ps-video-player-tag">APRESENTAÇÃO OFICIAL · FORMATO REELS HD</span>
            </div>
          </div>
        </div>
      </section>
    )}
    {visible('news') && data.news.length > 0 && <section className="ps-block"><div className="ps-section-heading"><div><span className="ps-eyebrow">FIQUE POR DENTRO</span><h2>{section('news')?.title || 'Notícias do Instituto'}</h2></div><Link href="/noticias">Todas as notícias <Arrow /></Link></div><div className="ps-news-grid">{data.news.map((n: any) => <Link href={`/noticias/${n.slug}`} className="ps-news-card" key={n.id}><img src={asset(n.image || '/banner1.jpeg')} alt="" loading="lazy" /><small>{n.category}</small><h3>{n.title}</h3><p>{n.summary}</p><span>Ler notícia <Arrow /></span></Link>)}</div></section>}
    {visible('events') && data.events.length > 0 && <section className="ps-block"><div className="ps-section-heading"><h2>{section('events')?.title || 'Próximos eventos'}</h2><Link href="/eventos">Ver agenda <Arrow /></Link></div><div className="ps-events">{data.events.map((e: any) => <Link key={e.id} href={`/eventos/${e.slug}`}><time>{new Date(e.startsAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}</time><div><h3>{e.title}</h3><p>{e.location || 'Instituto Paraíso do Saber'}</p></div><Arrow /></Link>)}</div></section>}
    <section id="interesse" className="ps-enroll ps-block"><div><span className="ps-eyebrow">COMECE UMA NOVA HISTÓRIA</span><h2>O seu lugar na saúde começa aqui.</h2><p>Deixe o seu contacto. A nossa equipa ajuda-o a conhecer os cursos e a dar o próximo passo.</p><a href={whatsapp} target="_blank" rel="noreferrer">Prefere conversar pelo WhatsApp? <Arrow /></a></div>
      <form onSubmit={submit}>
        {status === 'sent' ? (
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
            <button type="button" className="ps-button ps-yellow in-form-resubmit" onClick={() => { setStatus('idle'); setSentLead(null); }}>
              Submeter novo pedido ↗
            </button>
          </div>
        ) : (
          <>
            <label>Nome completo<input name="name" required autoComplete="name" placeholder="Como se chama?" /></label>
            <label>Telefone / Telemóvel (WhatsApp)<input name="phone" required type="tel" autoComplete="tel" placeholder="+244" /></label>
            <label>Correio eletrónico (E-mail)<input name="email" type="email" autoComplete="email" placeholder="nome@email.com" /></label>
            <label>Curso de interesse<select name="course" defaultValue=""><option value="">Selecione um curso</option>{data.courses.map((c: any) => <option key={c.slug}>{c.name}</option>)}</select></label>
            <label>Município / Localidade<input name="municipality" autoComplete="address-level2" placeholder="Onde reside?" /></label>
            <label className="ps-full">Observações<textarea name="notes" rows={2} placeholder="Como podemos ajudar?" /></label>
            <button className="ps-button ps-yellow" disabled={status === 'sending'}>{status === 'sending' ? 'A enviar…' : 'Quero receber informações'}<Arrow /></button>
            {status === 'error' && <p className="ps-form-status is-error" role="status">Não foi possível enviar. Tente novamente ou contacte-nos pelo WhatsApp.</p>}
          </>
        )}
      </form></section>
    <AdmissionsSteps /><FAQ /></PublicLayout>
}
