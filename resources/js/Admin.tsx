'use client';
import { useEffect, useState } from 'react';

const API = '/api';
const schemas: Record<string, { title: string; fields: string[] }> = {
  courses: { title: 'Cursos', fields: ['name','slug','description','image','duration','modality','area','status','featured','objectives','careerProfile','requirements','curriculum','schedule','location','metaTitle','metaDescription'] },
  events: { title: 'Eventos', fields: ['title','slug','description','image','video','startsAt','endsAt','publishAt','time','location','speaker','registrationUrl','status','publication','metaTitle','metaDescription'] },
  campaigns: { title: 'Publicidade e Destaques', fields: ['title','subtitle','description','image','video','buttonText','url','startsAt','endsAt','order','pages','status'] },
  news: { title: 'Notícias', fields: ['title','slug','summary','content','image','video','author','category','tags','status','publishAt','metaTitle','metaDescription'] },
  leads: { title: 'Pedidos de Informação', fields: ['name','phone','whatsapp','email','course','municipality','notes','status'] },
  users: { title: 'Utilizadores', fields: ['name','email','password','role','active'] },
  media: { title: 'Biblioteca Multimédia', fields: ['originalName','filename','url','mimeType','category'] },
  audit: { title: 'Registo de Auditoria', fields: ['action','entity','entityId','details','createdAt'] },
};
const navigation = [['overview','▦','Visão geral'],['courses','▤','Cursos'],['events','◷','Eventos'],['campaigns','▧','Publicidade'],['news','▤','Notícias'],['media','▣','Biblioteca multimédia'],['leads','◉','Pedidos / Candidatos'],['users','♙','Utilizadores'],['home','⌂','Página inicial'],['settings','⚙','Definições'],['audit','≡','Auditoria']];

interface RoleAccessConfig {
  label: string;
  badge: string;
  description: string;
  tabs: string[];
  canCreate: string[];
  canEdit: string[];
  canDelete: string[];
  permissionsSummary: { module: string; access: string; level: 'full' | 'read' | 'none' }[];
}

const ROLE_CONFIG: Record<string, RoleAccessConfig> = {
  ADMIN: {
    label: 'Administrador',
    badge: 'Acesso Total',
    description: 'Controlo integral sobre todos os módulos, conteúdos, candidaturas, utilizadores, página inicial, definições gerais e auditoria.',
    tabs: ['overview','courses','events','campaigns','news','media','leads','users','home','settings','audit'],
    canCreate: ['courses','events','campaigns','news','media','leads','users'],
    canEdit: ['courses','events','campaigns','news','media','leads','users','home','settings'],
    canDelete: ['courses','events','campaigns','news','media','leads','users'],
    permissionsSummary: [
      { module: 'Visão geral', access: 'Acesso total e indicadores globais', level: 'full' },
      { module: 'Cursos', access: 'Criar, editar, publicar e eliminar', level: 'full' },
      { module: 'Eventos, Publicidade e Notícias', access: 'Criar, editar, agendar e eliminar', level: 'full' },
      { module: 'Biblioteca multimédia', access: 'Carregar, catalogar e eliminar ficheiros', level: 'full' },
      { module: 'Pedidos / Candidatos', access: 'Consultar, registar, atualizar estado, exportar e eliminar', level: 'full' },
      { module: 'Utilizadores', access: 'Acesso total (com opção de realizar cadastro, edição e remoção)', level: 'full' },
      { module: 'Página inicial e Definições', access: 'Configuração completa de secções, contactos e SEO', level: 'full' },
      { module: 'Auditoria', access: 'Visualização integral do histórico de operações', level: 'read' },
    ],
  },
  EDITOR: {
    label: 'Editor de Conteúdos',
    badge: 'Gestão Editorial e Multimédia',
    description: 'Acesso dedicado à visão geral, eventos, publicidade, notícias, biblioteca multimédia e consulta de auditoria.',
    tabs: ['overview','events','campaigns','news','media','audit'],
    canCreate: ['events','campaigns','news','media'],
    canEdit: ['events','campaigns','news','media'],
    canDelete: ['events','campaigns','news','media'],
    permissionsSummary: [
      { module: 'Visão geral', access: 'Visualização de indicadores editoriais e multimédia', level: 'read' },
      { module: 'Eventos', access: 'Criar, editar, publicar e eliminar eventos', level: 'full' },
      { module: 'Publicidade', access: 'Criar, editar e gerir campanhas e destaques', level: 'full' },
      { module: 'Notícias', access: 'Criar, editar, agendar e eliminar notícias', level: 'full' },
      { module: 'Biblioteca multimédia', access: 'Carregar fotografias/vídeos, editar álbuns e eliminar', level: 'full' },
      { module: 'Auditoria', access: 'Visualização do registo de auditoria', level: 'read' },
      { module: 'Cursos, Pedidos, Utilizadores e Definições', access: 'Sem acesso', level: 'none' },
    ],
  },
  ATTENDANCE: {
    label: 'Atendimento / Secretaria',
    badge: 'Secretaria Académica e Candidatos',
    description: 'Acesso à visão geral, cursos, pedidos e candidatos, consulta de utilizadores (sem opção de realizar cadastro), página inicial e auditoria.',
    tabs: ['overview','courses','leads','users','home','audit'],
    canCreate: ['courses','leads'],
    canEdit: ['courses','leads','home'],
    canDelete: ['courses'],
    permissionsSummary: [
      { module: 'Visão geral', access: 'Visualização de indicadores académicos e de candidaturas', level: 'read' },
      { module: 'Cursos', access: 'Consultar, registar e atualizar oferta formativa', level: 'full' },
      { module: 'Pedidos / Candidatos', access: 'Gerir candidaturas, atualizar estados e exportar Excel/CSV', level: 'full' },
      { module: 'Utilizadores', access: 'Apenas visualização (sem opção de realizar cadastro ou alterar contas)', level: 'read' },
      { module: 'Página inicial', access: 'Gerir visibilidade, títulos e ordem das secções da capa', level: 'full' },
      { module: 'Auditoria', access: 'Visualização do registo de auditoria', level: 'read' },
      { module: 'Eventos, Publicidade, Notícias, Multimédia e Definições', access: 'Sem acesso', level: 'none' },
    ],
  },
};
const fieldLabels: Record<string, string> = {
  name: 'Nome',
  title: 'Título',
  subtitle: 'Subtítulo',
  slug: 'Identificador URL (Slug)',
  description: 'Descrição',
  summary: 'Resumo',
  content: 'Conteúdo',
  image: 'Imagem (caminho ou URL)',
  video: 'Vídeo (caminho ou URL)',
  duration: 'Duração',
  modality: 'Modalidade',
  area: 'Área de formação',
  status: 'Estado',
  publication: 'Estado de publicação',
  featured: 'Em destaque',
  objectives: 'Objetivos da formação',
  careerProfile: 'Saídas profissionais / Perfil',
  requirements: 'Requisitos de acesso',
  curriculum: 'Plano curricular',
  schedule: 'Horário / Turnos',
  location: 'Localização',
  metaTitle: 'Título SEO',
  metaDescription: 'Descrição SEO',
  startsAt: 'Data de início',
  endsAt: 'Data de fim',
  publishAt: 'Data de publicação',
  time: 'Horário',
  speaker: 'Oradores / Intervenientes',
  registrationUrl: 'Ligação externa / Inscrição',
  buttonText: 'Texto do botão',
  url: 'Ligação de destino (URL)',
  order: 'Ordem de exibição',
  pages: 'Páginas de exibição',
  author: 'Autor',
  category: 'Categoria',
  tags: 'Etiquetas (separadas por vírgula)',
  phone: 'Telefone / Telemóvel',
  whatsapp: 'WhatsApp',
  email: 'Correio eletrónico (E-mail)',
  course: 'Curso pretendido',
  municipality: 'Município / Localidade',
  notes: 'Observações',
  password: 'Palavra-passe',
  role: 'Perfil de acesso',
  active: 'Conta ativa',
  enabled: 'Secção ativa',
  originalName: 'Nome do ficheiro',
  filename: 'Ficheiro no servidor',
  mimeType: 'Formato (MIME)',
  action: 'Operação',
  entity: 'Módulo / Entidade',
  entityId: 'Identificador do registo',
  details: 'Detalhes',
  createdAt: 'Data de registo',
};
const valueLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  EDITOR: 'Editor de Conteúdos',
  ATTENDANCE: 'Atendimento / Secretaria',
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  SCHEDULED: 'Agendado',
  ARCHIVED: 'Arquivado',
  NEW: 'Novo pedido',
  CONTACTED: 'Contactado',
  NEGOTIATING: 'Em acompanhamento',
  ENROLLED: 'Matriculado',
  NOT_INTERESTED: 'Sem interesse',
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  CLOSED: 'Encerrado',
  UPCOMING: 'Próximo',
  ONGOING: 'A decorrer',
  ENDED: 'Concluído',
  CREATE: 'Criação',
  UPDATE: 'Atualização',
  DELETE: 'Eliminação',
  courses: 'Cursos',
  events: 'Eventos',
  campaigns: 'Publicidade',
  news: 'Notícias',
  leads: 'Pedidos de informação',
  users: 'Utilizadores',
  media: 'Multimédia',
  settings: 'Definições',
  sections: 'Secções da página inicial',
};
const label = (s: string) => fieldLabels[s] || s.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
const formatValue = (v: any) => {
  if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
  const str = String(v ?? '—');
  return valueLabels[str] || str;
};

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: string; text: string; type: ToastType; }
interface ConfirmModalData {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

export default function Admin({theme='light',onToggleTheme}:{theme?:'light'|'dark';onToggleTheme?:()=>void}={}) {
  const [token,setToken]=useState(''),[user,setUser]=useState<any>(null),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState('');
  const [showPassword,setShowPassword]=useState(false),[submitting,setSubmitting]=useState(false);
  const [tab,setTab]=useState('overview'),[rows,setRows]=useState<any[]>([]),[stats,setStats]=useState<any>({}),[settings,setSettings]=useState<any>({}),[homeSections,setHomeSections]=useState<any[]>([]),[loading,setLoading]=useState(false);
  const [toasts,setToasts]=useState<Toast[]>([]);
  const [confirmModal,setConfirmModal]=useState<ConfirmModalData|null>(null);

  useEffect(()=>{
    if(!confirmModal?.isOpen)return;
    const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setConfirmModal(null)};
    window.addEventListener('keydown',onKey);
    return()=>window.removeEventListener('keydown',onKey);
  },[confirmModal]);

  function notify(text:string,type:ToastType='info'){
    const id=Math.random().toString(36).substring(2,9);
    setToasts(prev=>[...prev,{id,text,type}]);
    setTimeout(()=>{
      setToasts(prev=>prev.filter(t=>t.id!==id));
    },4500);
  }
  function dismissToast(id:string){
    setToasts(prev=>prev.filter(t=>t.id!==id));
  }
  function flash(s:string,type?:ToastType){
    if(!s)return;
    const computedType=type||(s.toLowerCase().includes('erro')||s.toLowerCase().includes('não')||s.toLowerCase().includes('falha')?'error':'success');
    notify(s,computedType);
  }
  function askConfirm(data:{title:string;message:string;confirmLabel?:string;cancelLabel?:string;isDestructive?:boolean;onConfirm:()=>void}){
    setConfirmModal({
      isOpen:true,
      title:data.title,
      message:data.message,
      confirmLabel:data.confirmLabel||'Sim, remover',
      cancelLabel:data.cancelLabel||'Cancelar',
      isDestructive:data.isDestructive??true,
      onConfirm:()=>{
        setConfirmModal(null);
        data.onConfirm();
      }
    });
  }

  useEffect(()=>{const t=localStorage.getItem('ps_token');if(t){setToken(t);fetch(`${API}/auth/me`,{headers:{Authorization:`Bearer ${t}`}}).then(r=>r.ok?r.json():null).then(u=>{if(u)setUser(u);else localStorage.removeItem('ps_token')}).catch(()=>{})}},[]);
  useEffect(()=>{if(user&&token)void load(tab)},[user,token,tab]);
  async function request(path:string,init:any={}){const res=await fetch(`${API}${path}`,{...init,headers:{...(init.body instanceof FormData?{}:{'Content-Type':'application/json'}),Authorization:`Bearer ${token}`,...init.headers}});if(!res.ok){const body=await res.json().catch(()=>({}));throw new Error(body.message||'Não foi possível concluir a operação.')}return res}
  async function login(e:any){
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try{
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();
      const res=await fetch(`${API}/auth/login`,{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({email:cleanEmail,identifier:cleanEmail,password:cleanPassword})
      });
      const data=await res.json();
      if(!res.ok)throw new Error(data.message||'Credenciais inválidas');
      localStorage.setItem('ps_token',data.token);
      setToken(data.token);
      setUser(data.user);
      notify('Sessão iniciada com sucesso!', 'success');
    }catch(e:any){
      setError(e.message);
    }finally{
      setSubmitting(false);
    }
  }
  async function load(section:string){setLoading(true);try{if(section==='overview')setStats(await(await request('/admin/dashboard')).json());else if(section==='settings')setSettings(await(await request('/admin/settings')).json());else if(section==='home')setHomeSections(await(await request('/admin/sections')).json());else setRows(await(await request(`/admin/${section}`)).json())}catch(e:any){flash(e.message,'error')}finally{setLoading(false)}}
  async function create(e:any){e.preventDefault();const form=e.currentTarget;const data=Object.fromEntries(new FormData(form));try{await request(`/admin/${tab}`,{method:'POST',body:JSON.stringify(data)});form.reset();flash('Registo criado com sucesso.','success');void load(tab)}catch(e:any){flash(e.message,'error')}}
  async function update(id:string,data:any){try{await request(`/admin/${tab}/${id}`,{method:'PUT',body:JSON.stringify(data)});flash('Alterações guardadas com sucesso.','success');void load(tab)}catch(e:any){flash(e.message,'error')}}
  function remove(id:string,name?:string){
    const entityTitle=schema?.title||'registo';
    const itemName=name?` "${name}"`:'';
    askConfirm({
      title:'Remover registo',
      message:`Tem a certeza de que deseja eliminar${itemName} de ${entityTitle.toLowerCase()}? Esta ação é irreversível e os dados serão eliminados definitivamente.`,
      confirmLabel:'Sim, eliminar',
      cancelLabel:'Cancelar',
      isDestructive:true,
      onConfirm:async()=>{
        try{
          await request(`/admin/${tab}/${id}`,{method:'DELETE'});
          flash('Registo removido com sucesso.','success');
          void load(tab);
        }catch(e:any){
          flash(e.message||'Não foi possível remover o registo.','error');
        }
      }
    });
  }
  async function saveSettings(e:any){e.preventDefault();try{await request('/admin/settings',{method:'PUT',body:JSON.stringify(settings)});flash('Definições guardadas com sucesso.','success')}catch(e:any){flash(e.message,'error')}}
  async function saveSection(s:any){try{await request(`/admin/home-sections/${s.id}`,{method:'PUT',body:JSON.stringify(s)});flash('Secção atualizada com sucesso.','success')}catch(e:any){flash(e.message,'error')}}
  async function upload(e:any){const files=Array.from(e.target.files||[]) as File[];e.target.value='';if(!files.length)return;let sent=0;try{notify('A carregar ficheiro(s)...','info');for(const file of files){const form=new FormData();form.append('file',file);await request('/admin/upload',{method:'POST',body:form});sent++}flash(`${sent} ficheiro(s) carregado(s) com sucesso.`,'success');void load('media')}catch(e:any){flash(`${sent} ficheiro(s) carregado(s). ${e.message}`,'error');void load('media')}}
  async function exportXlsx(){try{notify('A preparar transferência em formato Excel...','info');const res=await request('/admin/leads/export.xlsx');const href=URL.createObjectURL(await res.blob());const a=document.createElement('a');a.href=href;a.download='pedidos-informacao.xlsx';a.click();URL.revokeObjectURL(href);notify('Transferência Excel concluída!','success')}catch(e:any){flash(e.message,'error')}}
  async function exportCsv(){try{notify('A preparar transferência em formato CSV...','info');const res=await request('/admin/leads/export.csv');const href=URL.createObjectURL(await res.blob());const a=document.createElement('a');a.href=href;a.download='pedidos-informacao.csv';a.click();URL.revokeObjectURL(href);notify('Transferência CSV concluída!','success')}catch(e:any){flash(e.message,'error')}}
  if(!user)return (
    <div className="kl-auth-page">
      <div className="kl-auth-bg" aria-hidden="true">
        <div className="kl-auth-bg-img" style={{ backgroundImage: "url('/banner1.jpeg')" }}></div>
        <div className="kl-auth-bg-gradient"></div>
        <div className="kl-auth-left-brand">
          <div className="kl-auth-hero-copy">
            <span className="kl-auth-eyebrow">INSTITUTO TÉCNICO PRIVADO DE SAÚDE</span>
            <h1>Educar para cuidar.<br/>Formar para a vida.</h1>
            <p>Aceda ao painel central do Paraíso do Saber para gerir formações, publicações, candidaturas e conteúdos institucionais.</p>
            <div className="kl-auth-features">
              <div className="kl-auth-feature-item">
                <span className="kl-feat-check">✓</span>
                <span>Gestão Integrada de Cursos de Saúde</span>
              </div>
              <div className="kl-auth-feature-item">
                <span className="kl-feat-check">✓</span>
                <span>Acompanhamento de Candidatos e Matrículas</span>
              </div>
              <div className="kl-auth-feature-item">
                <span className="kl-feat-check">✓</span>
                <span>Notícias, Eventos e Multimédia Oficial</span>
              </div>
            </div>
          </div>
          <div className="kl-auth-footer-tag">
            <span>Bairro Paraíso, Luanda · República de Angola</span>
          </div>
        </div>
      </div>

      <aside className="kl-auth-card-wrapper">
        <div className="kl-auth-top-controls">
          {onToggleTheme && (
            <button
              type="button"
              className="kl-auth-theme-btn"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
              <span>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
            </button>
          )}
          <div className="kl-auth-lang-badge">
            <span className="kl-flag" role="img" aria-label="Português de Portugal">🇵🇹</span>
            <span>Português (PT)</span>
          </div>
        </div>

        <div className="kl-auth-card-inner">
          <a href="/" className="kl-auth-brand-header" style={{ textDecoration: 'none' }}>
            <img src="/logo_transparent.png" alt="Logótipo do Instituto" className="kl-auth-logo" />
            <div className="kl-auth-brand-text">
              <strong className="kl-brand-name">PARAÍSO DO SABER</strong>
              <small className="kl-brand-sub">GESTÃO ESCOLAR INTELIGENTE</small>
            </div>
          </a>

          <div className="kl-auth-heading">
            <h2>Iniciar sessão</h2>
            <p>Introduza as suas credenciais para aceder ao painel administrativo.</p>
          </div>

          <form onSubmit={login} className="kl-auth-form">
            <div className="kl-field-group">
              <label className="kl-label" htmlFor="identifier">Utilizador ou E-mail</label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                required
                placeholder="E-mail ou identificador institucional"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="kl-input"
              />
              <span className="kl-field-hint">Utilize o correio eletrónico administrativo configurado no sistema.</span>
            </div>

            <div className="kl-field-group">
              <label className="kl-label" htmlFor="password">Palavra-passe</label>
              <div className="kl-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="kl-input kl-input-password"
                />
                <button
                  type="button"
                  className="kl-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                  title={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="kl-auth-options">
              <label className="kl-checkbox-label">
                <input type="checkbox" className="kl-checkbox" defaultChecked />
                <span>Manter sessão iniciada</span>
              </label>
              <a href="/recuperar-senha" className="kl-forgot-link">Recuperar palavra-passe</a>
            </div>

            {error && (
              <div className="kl-error-banner" role="alert">
                <span className="kl-error-icon">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="kl-submit-btn" disabled={submitting}>
              {submitting ? 'A validar credenciais…' : 'Iniciar sessão no portal'}
            </button>

            <div className="kl-auth-bottom">
              <a href="/" className="kl-back-site">← Voltar ao sítio público</a>
              <span className="kl-copyright">Instituto Técnico Privado de Saúde Paraíso do Saber</span>
            </div>
          </form>
        </div>
      </aside>
      <ToastContainer toasts={toasts} onDismiss={dismissToast}/>
    </div>
  );
  const roleKey = (user.role && ROLE_CONFIG[user.role]) ? user.role : 'ATTENDANCE';
  const currentRole = ROLE_CONFIG[roleKey];
  const allowedTabs = currentRole.tabs;
  const canCreateInTab = currentRole.canCreate.includes(tab);
  const canEditInTab = currentRole.canEdit.includes(tab);
  const canDeleteInTab = currentRole.canDelete.includes(tab);
  const schema=schemas[tab];
  const getEnumOptions=(k:string)=>k==='role'?['ADMIN','EDITOR','ATTENDANCE']:k==='publication'?['DRAFT','PUBLISHED','SCHEDULED','ARCHIVED']:tab==='leads'?['NEW','CONTACTED','NEGOTIATING','ENROLLED','NOT_INTERESTED']:tab==='courses'?['ACTIVE','INACTIVE','CLOSED']:['news','campaigns'].includes(tab)?['DRAFT','PUBLISHED','SCHEDULED','ARCHIVED']:['UPCOMING','ONGOING','ENDED'];
  const isWideField=(k:string)=>['description','summary','content','notes','objectives','careerProfile','requirements','curriculum','metaDescription','details'].includes(k);
  const allKpiCards:[string,any,string,string][]=[
    ['Cursos ativos',stats.courses,'courses','▤'],
    ['Próximos eventos',stats.events,'events','◷'],
    ['Campanhas ativas',stats.campaigns,'campaigns','▧'],
    ['Notícias publicadas',stats.news,'news','▤'],
    ['Pedidos de informação',stats.leads,'leads','◉'],
    ['Ficheiros multimédia',stats.media,'media','▣'],
  ];
  const kpiCards = allKpiCards.filter(([,,targetTab]) => allowedTabs.includes(targetTab));
  const allShortcuts:[string,string,string,string][]=[
    ['events','◷','Agenda e Eventos','Publicar jornadas, feiras de saúde e atividades'],
    ['campaigns','▧','Publicidade e Destaques','Gerir campanhas institucionais e avisos'],
    ['news','▤','Notícias do Instituto','Publicar comunicados e artigos informativos'],
    ['media','▣','Biblioteca Multimédia','Carregar fotografias, vídeos e documentos PDF'],
    ['courses','▤','Oferta Formativa (Cursos)','Consultar e atualizar cursos técnicos de saúde'],
    ['leads','◉','Pedidos e Candidatos','Acompanhar inscrições e exportar listagens'],
    ['users','♙','Utilizadores do Sistema',roleKey==='ATTENDANCE'?'Consultar contas ativas (modo de visualização)':'Gerir contas e perfis de acesso'],
    ['home','⌂','Secções da Página Inicial','Ativar, ocultar ou reordenar blocos da capa'],
    ['audit','≡','Registo de Auditoria','Consultar histórico de operações no sistema'],
  ];
  const visibleShortcuts = allShortcuts.filter(([key]) => allowedTabs.includes(key)).slice(0, 4);
  return <div className="admin-shell">
  <ToastContainer toasts={toasts} onDismiss={dismissToast}/>
  <ConfirmDialog modal={confirmModal} onClose={()=>setConfirmModal(null)}/>
  <aside className="admin-side">
    <a href="/" className="brand">
      <img src="/logo_transparent.png" alt="Logótipo Paraíso do Saber"/>
      <span><b>PARAÍSO DO SABER</b><small>PAINEL ADMINISTRATIVO</small></span>
    </a>
    <small className="side-label">GESTÃO DO PORTAL ({currentRole.label.toUpperCase()})</small>
    {navigation.filter(([key])=>allowedTabs.includes(key)).map(([key,icon,text])=>(
      <button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}>
        <span>{icon}</span>{text}
      </button>
    ))}
    <div className="admin-user">
      <div className="adm-user-meta">
        <span className="adm-user-avatar" aria-hidden="true">{(user.name||'AD').slice(0,2).toUpperCase()}</span>
        <div>
          <b>{user.name}</b>
          <small>{formatValue(user.role)}</small>
        </div>
      </div>
      <button onClick={()=>{void request('/auth/logout',{method:'POST'}).catch(()=>{});localStorage.removeItem('ps_token');setUser(null);setToken('')}}>Terminar sessão</button>
    </div>
  </aside>
  <main className="admin-content">
    <header className="admin-head">
      <div>
        <small>PORTAL DO INSTITUTO · PERFIL: {currentRole.label.toUpperCase()}</small>
        <h1>{tab==='overview'?'Visão geral':tab==='home'?'Página inicial':tab==='settings'?'Definições gerais':schema?.title||label(tab)}</h1>
      </div>
      <div className="adm-head-actions">
        {onToggleTheme && (
          <button
            type="button"
            className="adm-theme-switch"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          >
            <span className={`adm-theme-opt ${theme === 'light' ? 'is-active' : ''}`}>
              <b aria-hidden="true">☀</b> Claro
            </span>
            <span className={`adm-theme-opt ${theme === 'dark' ? 'is-active' : ''}`}>
              <b aria-hidden="true">☾</b> Escuro
            </span>
          </button>
        )}
        <span className="adm-role-chip" title={currentRole.description}>{formatValue(user.role)} · {currentRole.badge}</span>
        <a href="/">Ver sítio público ↗</a>
      </div>
    </header>
  {tab==='overview'&&<>
    <div className="stats">
      {kpiCards.map(([name,value,targetTab,icon])=>(
        <article key={name} className="adm-stat-card" onClick={()=>setTab(targetTab)} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')setTab(targetTab)}}>
          <div className="adm-stat-top">
            <small>{name}</small>
            <span className="adm-stat-icon" aria-hidden="true">{icon}</span>
          </div>
          <b>{value??'—'}</b>
          <span className="adm-stat-link">Gerir secção →</span>
        </article>
      ))}
    </div>
    <div className="adm-overview-grid">
      <section className="admin-box adm-welcome-box">
        <span className="adm-kicker">{currentRole.label.toUpperCase()} · {currentRole.badge.toUpperCase()}</span>
        <h2>Bem-vindo(a), {user.name}</h2>
        <p>{currentRole.description}</p>
        <div className="adm-quick-buttons">
          {allowedTabs.includes('leads')&&<button type="button" className="btn" onClick={()=>setTab('leads')}>Ver pedidos e candidatos ↗</button>}
          {allowedTabs.includes('events')&&<button type="button" className={allowedTabs.includes('leads')?'adm-btn-secondary':'btn'} onClick={()=>setTab('events')}>Gerir eventos {allowedTabs.includes('leads')?'':'↗'}</button>}
          {allowedTabs.includes('courses')&&<button type="button" className="adm-btn-secondary" onClick={()=>setTab('courses')}>Gerir cursos</button>}
          {allowedTabs.includes('news')&&<button type="button" className="adm-btn-secondary" onClick={()=>setTab('news')}>Publicar notícias</button>}
          {allowedTabs.includes('media')&&<button type="button" className="adm-btn-secondary" onClick={()=>setTab('media')}>Biblioteca multimédia</button>}
          {allowedTabs.includes('users')&&<button type="button" className="adm-btn-secondary" onClick={()=>setTab('users')}>{roleKey==='ATTENDANCE'?'Ver utilizadores':'Gerir utilizadores'}</button>}
          {allowedTabs.includes('audit')&&<button type="button" className="adm-btn-secondary" onClick={()=>setTab('audit')}>Ver auditoria</button>}
          {allowedTabs.includes('settings')&&<button type="button" className="adm-btn-secondary" onClick={()=>setTab('settings')}>Definições gerais</button>}
        </div>
      </section>
      <section className="admin-box adm-shortcuts-box">
        <h2>Atalhos rápidos do seu perfil</h2>
        <div className="adm-shortcut-list">
          {visibleShortcuts.map(([key,icon,title,desc])=>(
            <button key={key} type="button" onClick={()=>setTab(key)}>
              <span>{icon}</span>
              <div><strong>{title}</strong><small>{desc}</small></div>
            </button>
          ))}
        </div>
      </section>
    </div>
    <RolePermissionsMatrix activeRole={roleKey} onSelectTab={(t)=>allowedTabs.includes(t)&&setTab(t)}/>
  </>}
  {tab==='settings'&&allowedTabs.includes('settings')&&<form className="admin-box settings-form" onSubmit={saveSettings}><div className="adm-form-section-header"><h2>Informações gerais do Instituto</h2><p>Estes dados são apresentados no cabeçalho, rodapé e páginas de contacto do sítio público.</p></div>{Object.entries({institutionName:'Nome da Instituição',logo:'Logótipo (caminho ou URL)',favicon:'Ícone do sítio (Favicon)',phone1:'Telefone principal',phone2:'Telefone alternativo',whatsapp:'WhatsApp (apenas algarismos)',email:'Correio eletrónico (E-mail)',address:'Morada / Localização',facebook:'Página de Facebook',instagram:'Conta de Instagram',tiktok:'Conta de TikTok',youtube:'Canal de YouTube',officeHours:'Horário de atendimento da secretaria',footer:'Texto institucional do rodapé',metaTitle:'Título SEO predefinido',metaDescription:'Descrição SEO predefinida'}).map(([key,text])=><label key={key} className={['address','footer','metaDescription'].includes(key)?'adm-field-wide':''}>{text}<input value={settings[key]||''} onChange={e=>setSettings({...settings,[key]:e.target.value})}/></label>)}<StaticSeoSettings settings={settings} onChange={(key,value)=>setSettings({...settings,[key]:value})}/><button className="btn">Guardar definições</button></form>}
  {tab==='home'&&allowedTabs.includes('home')&&<div className="section-admin">{homeSections.map(s=><article className="admin-box section-edit" key={s.id}><div className="adm-section-card-head"><span className="adm-section-key">{s.key}</span><label className="check"><input type="checkbox" checked={s.enabled} onChange={e=>setHomeSections(homeSections.map(x=>x.id===s.id?{...x,enabled:e.target.checked}:x))}/> Secção visível na página inicial</label></div><label>Título da secção<input value={s.title||''} placeholder="Título da secção" onChange={e=>setHomeSections(homeSections.map(x=>x.id===s.id?{...x,title:e.target.value}:x))}/></label><label>Descrição complementar<textarea value={s.description||''} placeholder="Descrição da secção" onChange={e=>setHomeSections(homeSections.map(x=>x.id===s.id?{...x,description:e.target.value}:x))}/></label><div className="adm-section-card-foot"><label>Ordem de exibição<input type="number" value={s.order} onChange={e=>setHomeSections(homeSections.map(x=>x.id===s.id?{...x,order:+e.target.value}:x))}/></label><button className="btn" onClick={()=>saveSection(s)}>Guardar secção</button></div></article>)}</div>}
  {tab==='media'&&allowedTabs.includes('media')&&<section className="admin-box adm-upload-banner"><div><span className="adm-kicker">GESTÃO DE FICHEIROS E GALERIA</span><h2>Biblioteca Multimédia</h2><p>Carregue fotografias, vídeos e documentos institucionais (máximo de 100 MB por ficheiro).</p></div><label className="media-upload"><span>＋</span> Selecionar ficheiros do computador<input type="file" multiple accept="image/*,video/*,application/pdf" onChange={upload}/></label></section>}
  {schema&&allowedTabs.includes(tab)&&<>{tab!=='media'&&<section className="admin-box"><div className="box-head"><div><h2>{schema.title}</h2><p>{tab==='leads'?'Acompanhe os pedidos de informação e manifestações de interesse em matrículas.':tab==='audit'?'Histórico de ações realizadas pelos utilizadores no painel administrativo.':tab==='users'&&!canCreateInTab?'Consulta de contas de utilizadores registadas no sistema (perfil sem opção de realizar novo cadastro).':'Crie e atualize os conteúdos publicados no portal institucional.'}</p></div>{tab==='leads'&&<div className="export-actions"><button className="btn" onClick={exportXlsx}>Transferir Excel (.xlsx) ↓</button><button className="adm-btn-secondary" onClick={exportCsv}>Transferir CSV ↓</button></div>}{tab==='users'&&!canCreateInTab&&<span className="adm-readonly-pill">🔒 Apenas visualização (Sem opção de cadastro)</span>}</div>{tab!=='audit'&&canCreateInTab&&<form className="record-form" onSubmit={create}>{schema.fields.map(k=><label key={k} className={isWideField(k)?'adm-field-wide':''}>{label(k)}{isWideField(k)?<textarea name={k} placeholder={label(k)}/>:['publication','role','status'].includes(k)?<select name={k}><option value="">Predefinido</option>{getEnumOptions(k).map(v=><option key={v} value={v}>{formatValue(v)}</option>)}</select>:['featured','active'].includes(k)?<select name={k}><option value="false">Não</option><option value="true">Sim</option></select>:<input name={k} type={k==='password'?'password':['startsAt','endsAt','publishAt'].includes(k)?'datetime-local':k==='order'?'number':'text'} placeholder={label(k)}/>}</label>)}<div className="adm-form-submit-row"><button className="btn">Adicionar registo ↗</button></div></form>}</section>}{tab==='media'?<MediaLibrary rows={rows} onUpdate={update} onRemove={remove} onNotify={notify}/>:<Records rows={rows} fields={schema.fields} onUpdate={update} onRemove={remove} tab={tab} canEdit={canEditInTab} canDelete={canDeleteInTab}/>}</>}
  {loading&&<div className="busy">A carregar dados…</div>}</main></div>;
}

function RolePermissionsMatrix({activeRole,onSelectTab}:{activeRole:string;onSelectTab:(tab:string)=>void}){
  const rolesOrder = ['ADMIN','EDITOR','ATTENDANCE'];
  const matrixRows: {key:string;label:string;admin:string;editor:string;attendance:string}[] = [
    { key: 'overview', label: 'Visão geral', admin: 'Acesso total', editor: 'Visualização e atalhos', attendance: 'Visualização e atalhos' },
    { key: 'courses', label: 'Cursos', admin: 'Acesso total (Criar / Editar / Eliminar)', editor: 'Sem acesso', attendance: 'Acesso e gestão de cursos' },
    { key: 'events', label: 'Eventos', admin: 'Acesso total (Criar / Editar / Eliminar)', editor: 'Acesso total (Criar / Editar / Eliminar)', attendance: 'Sem acesso' },
    { key: 'campaigns', label: 'Publicidade', admin: 'Acesso total (Criar / Editar / Eliminar)', editor: 'Acesso total (Criar / Editar / Eliminar)', attendance: 'Sem acesso' },
    { key: 'news', label: 'Notícias', admin: 'Acesso total (Criar / Editar / Eliminar)', editor: 'Acesso total (Criar / Editar / Eliminar)', attendance: 'Sem acesso' },
    { key: 'media', label: 'Biblioteca multimédia', admin: 'Acesso total (Carregar / Editar / Eliminar)', editor: 'Acesso total (Carregar / Editar / Eliminar)', attendance: 'Sem acesso' },
    { key: 'leads', label: 'Pedidos e Candidatos', admin: 'Acesso total + Exportação', editor: 'Sem acesso', attendance: 'Acesso, acompanhamento e exportação' },
    { key: 'users', label: 'Utilizadores', admin: 'Acesso total (Com opção de cadastro)', editor: 'Sem acesso', attendance: 'Apenas visualização (Sem opção de cadastro)' },
    { key: 'home', label: 'Página inicial', admin: 'Acesso total (Secções da capa)', editor: 'Sem acesso', attendance: 'Acesso e gestão (Secções da capa)' },
    { key: 'settings', label: 'Definições gerais', admin: 'Acesso total (Institucional e SEO)', editor: 'Sem acesso', attendance: 'Sem acesso' },
    { key: 'audit', label: 'Auditoria', admin: 'Visualização completa', editor: 'Visualização completa', attendance: 'Visualização completa' },
  ];
  return (
    <section className="admin-box adm-permissions-box">
      <div className="box-head">
        <div>
          <span className="adm-kicker">CONTROLO DE ACESSOS E PERFILAMENTO</span>
          <h2>Perfis de Utilizador e Permissões de Acesso</h2>
          <p>Separação de módulos, opções de visualização e permissões operacionais atribuídas a cada perfil no painel administrativo.</p>
        </div>
      </div>
      <div className="adm-roles-cards">
        {rolesOrder.map(rKey => {
          const r = ROLE_CONFIG[rKey];
          const isCurrent = rKey === activeRole;
          return (
            <article key={rKey} className={`adm-role-card ${isCurrent ? 'is-current-role' : ''}`}>
              <div className="adm-role-card-top">
                <div>
                  <span className="adm-role-badge">{r.badge}</span>
                  <h3>{r.label}</h3>
                </div>
                {isCurrent && <span className="adm-role-active-tag">Perfil ativo</span>}
              </div>
              <p className="adm-role-desc">{r.description}</p>
              <div className="adm-role-tabs-list">
                <small>MÓDULOS DISPONÍVEIS NO MENU ({r.tabs.length})</small>
                <div className="adm-role-pills">
                  {navigation.filter(([k]) => r.tabs.includes(k)).map(([k, icon, txt]) => (
                    <button
                      key={k}
                      type="button"
                      className="adm-role-tab-pill"
                      onClick={() => onSelectTab(k)}
                      disabled={!ROLE_CONFIG[activeRole].tabs.includes(k)}
                    >
                      <span>{icon}</span> {txt}
                      {rKey === 'ATTENDANCE' && k === 'users' ? ' (Sem cadastro)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="table-wrap adm-matrix-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Módulo / Opção</th>
              <th>Administrador</th>
              <th>Editor de Conteúdos</th>
              <th>Atendimento / Secretaria</th>
            </tr>
          </thead>
          <tbody>
            {matrixRows.map(row => (
              <tr key={row.key}>
                <td><strong>{row.label}</strong></td>
                <td><span className="adm-perm-chip adm-perm-full">{row.admin}</span></td>
                <td><span className={`adm-perm-chip ${row.editor === 'Sem acesso' ? 'adm-perm-none' : row.key === 'audit' || row.key === 'overview' ? 'adm-perm-read' : 'adm-perm-full'}`}>{row.editor}</span></td>
                <td><span className={`adm-perm-chip ${row.attendance === 'Sem acesso' ? 'adm-perm-none' : row.key === 'users' || row.key === 'audit' || row.key === 'overview' ? 'adm-perm-read' : 'adm-perm-full'}`}>{row.attendance}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Records({rows,fields,onUpdate,onRemove,tab,canEdit=true,canDelete=true}:{rows:any[],fields:string[],onUpdate:(id:string,data:any)=>void,onRemove:(id:string,name?:string)=>void,tab:string,canEdit?:boolean,canDelete?:boolean}){
  const [editing,setEditing]=useState<any>(null);
  const [scheduleFilter,setScheduleFilter]=useState('all');
  const showActions=tab!=='audit'&&(canEdit||canDelete);
  const scheduledField=tab==='events'?'publication':'status';
  const isWideField=(k:string)=>['description','summary','content','notes','objectives','careerProfile','requirements','curriculum','metaDescription','details'].includes(k);
  const isBadgeField=(k:string)=>['status','publication','role','action'].includes(k);
  const getEnumOptions=(k:string)=>k==='role'?['ADMIN','EDITOR','ATTENDANCE']:k==='publication'?['DRAFT','PUBLISHED','SCHEDULED','ARCHIVED']:tab==='leads'?['NEW','CONTACTED','NEGOTIATING','ENROLLED','NOT_INTERESTED']:tab==='courses'?['ACTIVE','INACTIVE','CLOSED']:['news','campaigns'].includes(tab)?['DRAFT','PUBLISHED','SCHEDULED','ARCHIVED']:['UPCOMING','ONGOING','ENDED'];
  const filteredRows=rows.filter(row=>{if(scheduleFilter==='all')return true;const state=row[scheduledField];const date=Date.parse(row.publishAt||(tab==='campaigns'?row.startsAt:'')||'');if(scheduleFilter==='scheduled')return (state==='SCHEDULED'&&(!date||date>Date.now()))||(date>Date.now()&&state!=='DRAFT');if(scheduleFilter==='draft')return state==='DRAFT';if(scheduleFilter==='published')return (state==='PUBLISHED'||(state==='SCHEDULED'&&date>0&&date<=Date.now()))&&(!date||date<=Date.now())&&!(row.endsAt&&Date.parse(row.endsAt)<Date.now());if(scheduleFilter==='past')return !!row.endsAt&&Date.parse(row.endsAt)<Date.now();return true});
  return <section className="admin-box records">{editing&&canEdit&&<form className="edit-record" onSubmit={e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));onUpdate(editing.id,data);setEditing(null)}}><h3>Editar registo</h3><div>{fields.filter(k=>!['createdAt','updatedAt','passwordHash','id'].includes(k)&&(k!=='password'||tab==='users')).map(k=><label key={k} className={isWideField(k)?'adm-field-wide':''}>{label(k)}{isWideField(k)?<textarea name={k} defaultValue={editing[k]||''}/>:['publication','role','status'].includes(k)?<select name={k} defaultValue={editing[k]||''}>{getEnumOptions(k).map(v=><option key={v} value={v}>{formatValue(v)}</option>)}</select>:['featured','active','enabled'].includes(k)?<select name={k} defaultValue={String(editing[k]??false)}><option value="true">Sim</option><option value="false">Não</option></select>:<input name={k} type={k==='password'?'password':['startsAt','endsAt','publishAt'].includes(k)?'datetime-local':'text'} placeholder={k==='password'?'Nova palavra-passe (opcional)':undefined} defaultValue={k==='password'?'':typeof editing[k]==='string'&&['startsAt','endsAt','publishAt'].includes(k)?editing[k].replace(' ','T').slice(0,16):editing[k]??''}/>}</label>)}</div><div className="adm-edit-actions"><button className="btn">Guardar alterações</button><button type="button" className="adm-btn-secondary" onClick={()=>setEditing(null)}>Cancelar</button></div></form>}
  <div className="adm-table-toolbar">
    <span className="adm-records-count"><strong>{filteredRows.length}</strong> {filteredRows.length===1?'registo encontrado':'registos encontrados'}</span>
    {['events','campaigns','news'].includes(tab)&&<label className="schedule-filter">Filtrar por estado:<select value={scheduleFilter} onChange={e=>setScheduleFilter(e.target.value)}><option value="all">Todos os registos</option><option value="scheduled">Agendados / futuros</option><option value="published">Publicados / ativos</option><option value="draft">Rascunhos</option><option value="past">Concluídos</option></select></label>}
  </div>
  <div className="table-wrap"><table><thead><tr>{fields.slice(0,5).map(k=><th key={k}>{label(k)}</th>)}{showActions&&<th>Ações</th>}</tr></thead><tbody>{filteredRows.map((row,i)=><tr key={row.id||i}>{fields.slice(0,5).map(k=><td key={k}>{k==='image'&&row[k]?<img className="thumb" src={row[k].startsWith('/media/')?`${API.replace('/api','')}${row[k]}`:row[k].startsWith('/')?row[k]:`/${row[k]}`} alt=""/>:isBadgeField(k)&&row[k]?<span className={`adm-status-pill adm-status-${String(row[k]).toLowerCase()}`}>{formatValue(row[k])}</span>:formatValue(row[k]).slice(0,120)}</td>)}{showActions&&<td className="adm-actions-cell">{canEdit&&<button className="action-edit" onClick={()=>setEditing(row)}>Editar</button>}{canDelete&&<button className="action-remove" onClick={()=>onRemove(row.id, row.name||row.title||row.email||row.originalName)}>Eliminar</button>}</td>}</tr>)}</tbody></table>{filteredRows.length===0&&<p className="empty">Ainda não existem registos nesta secção.</p>}</div></section>;
}

function StaticSeoSettings({settings,onChange}:{settings:any,onChange:(key:string,value:string)=>void}){
  const pages=[['cursos','Cursos'],['eventos','Eventos'],['noticias','Notícias'],['galeria','Galeria'],['instituto','O Instituto'],['matriculas','Matrículas'],['contactos','Contactos']];
  return <section className="seo-settings"><h3>Otimização para Motores de Pesquisa (SEO) por página</h3><p>Personalize o título e a descrição que surgem nos resultados de pesquisa para cada página pública.</p>{pages.map(([key,name])=><div key={key}><b>{name}</b><label>Título (máximo de 70 caracteres)<input maxLength={70} value={settings[`metaTitle_${key}`]||''} onChange={e=>onChange(`metaTitle_${key}`,e.target.value)}/></label><label>Descrição (máximo de 170 caracteres)<textarea maxLength={170} value={settings[`metaDescription_${key}`]||''} onChange={e=>onChange(`metaDescription_${key}`,e.target.value)}/></label></div>)}</section>;
}

function MediaLibrary({rows,onUpdate,onRemove,onNotify}:{rows:any[],onUpdate:(id:string,data:any)=>void,onRemove:(id:string,name?:string)=>void,onNotify?:(text:string,type?:ToastType)=>void}){
  const [query,setQuery]=useState('');
  const [kind,setKind]=useState('all');
  const [categoryFilter,setCategoryFilter]=useState('all');
  const categories=[...new Set(rows.map(r=>r.category).filter(Boolean))];
  const filtered=rows.filter(row=>{
    const matches=`${row.originalName} ${row.category||''} ${row.mimeType}`.toLowerCase().includes(query.toLowerCase());
    const matchesKind=kind==='all'||(kind==='image'?row.mimeType?.startsWith('image/'):kind==='video'?row.mimeType?.startsWith('video/'):row.mimeType==='application/pdf');
    const matchesCat=categoryFilter==='all'||(row.category||'Geral')===categoryFilter;
    return matches&&matchesKind&&matchesCat;
  });
  return (
    <section className="admin-box media-library">
      <div className="media-tools">
        <div className="media-search-wrap">
          <span aria-hidden="true">⌕</span>
          <input aria-label="Pesquisar ficheiros" placeholder="Pesquisar por título, nome de ficheiro ou álbum…" value={query} onChange={e=>setQuery(e.target.value)}/>
          {query&&<button type="button" className="media-search-clear" onClick={()=>setQuery('')} aria-label="Limpar pesquisa">×</button>}
        </div>
        <select aria-label="Filtrar por formato" value={kind} onChange={e=>setKind(e.target.value)}>
          <option value="all">Todos os formatos</option>
          <option value="image">Fotografias / Imagens</option>
          <option value="video">Vídeos</option>
          <option value="document">Documentos PDF</option>
        </select>
        {categories.length>0&&(
          <select aria-label="Filtrar por categoria" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}>
            <option value="all">Todos os álbuns ({categories.length})</option>
            {categories.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <span className="adm-records-count"><strong>{filtered.length}</strong> de {rows.length} ficheiro(s)</span>
      </div>
      <div className="media-grid">
        {filtered.map(item=>{
          const href=item.url?.startsWith('http')?item.url:item.url?.startsWith('/')?item.url:`/${item.url}`;
          const ext=(item.mimeType?.split('/')[1]||'FICHEIRO').toUpperCase();
          const sizeKb=Math.max(1,Math.round((item.size||0)/1024));
          return (
            <article className="media-card" key={item.id}>
              <a href={href} target="_blank" rel="noreferrer" className="media-preview">
                <span className="media-badge-type">{ext}</span>
                <span className="media-badge-size">{sizeKb} KB</span>
                {item.mimeType?.startsWith('image/')?(
                  <img src={href} alt={item.originalName} loading="lazy"/>
                ):item.mimeType?.startsWith('video/')?(
                  <video src={href} muted preload="metadata"/>
                ):(
                  <span className="media-pdf-icon">📄 PDF</span>
                )}
              </a>
              <div className="media-card-meta">
                <div className="media-card-head">
                  <b title={item.originalName}>{item.originalName}</b>
                  <small>{item.category||'Geral'} · {item.mimeType}</small>
                </div>
                <label className="media-field-label">
                  <span>Título da fotografia / ficheiro</span>
                  <input aria-label="Nome do ficheiro" defaultValue={item.originalName||''} onBlur={e=>{if(e.target.value!==item.originalName)onUpdate(item.id,{originalName:e.target.value})}}/>
                </label>
                <label className="media-field-label">
                  <span>Álbum / Categoria</span>
                  <input aria-label="Categoria do ficheiro" defaultValue={item.category||'Geral'} onBlur={e=>{if(e.target.value!==item.category)onUpdate(item.id,{category:e.target.value})}}/>
                </label>
                <div className="media-card-actions">
                  <a href={href} target="_blank" rel="noreferrer" className="media-btn-open">Abrir ↗</a>
                  <button type="button" className="media-btn-copy" onClick={()=>{if(navigator.clipboard){void navigator.clipboard.writeText(new URL(href,window.location.origin).toString());onNotify?.('Ligação copiada para a área de transferência!','info')}}}>Copiar ligação</button>
                  <button type="button" className="action-remove media-btn-delete" onClick={()=>onRemove(item.id,item.originalName)}>Eliminar</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {filtered.length===0&&<p className="empty">Nenhum ficheiro corresponde aos critérios de pesquisa.</p>}
    </section>
  );
}

function ToastContainer({toasts,onDismiss}:{toasts:Toast[];onDismiss:(id:string)=>void}){
  if(!toasts.length)return null;
  return (
    <aside className="kl-toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map(t=>(
        <div key={t.id} className={`kl-toast kl-toast-${t.type}`} role="alert">
          <div className="kl-toast-icon">
            {t.type==='success'?(
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ):t.type==='error'?(
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ):t.type==='warning'?(
              '!'
            ):(
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            )}
          </div>
          <div className="kl-toast-content">
            <strong className="kl-toast-title">
              {t.type==='success'?'Sucesso':t.type==='error'?'Atenção / Erro':t.type==='warning'?'Aviso':'Informação'}
            </strong>
            <p className="kl-toast-message">{t.text}</p>
          </div>
          <button type="button" className="kl-toast-close" onClick={()=>onDismiss(t.id)} aria-label="Fechar notificação">×</button>
        </div>
      ))}
    </aside>
  );
}

function ConfirmDialog({modal,onClose}:{modal:ConfirmModalData|null;onClose:()=>void}){
  if(!modal||!modal.isOpen)return null;
  return (
    <div className="kl-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="kl-modal-title">
      <div className="kl-modal-card" onClick={e=>e.stopPropagation()}>
        <div className="kl-modal-body">
          <div className={`kl-modal-icon-wrap ${modal.isDestructive?'kl-modal-icon-destructive':'kl-modal-icon-info'}`}>
            {modal.isDestructive?(
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            ):(
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            )}
          </div>
          <div className="kl-modal-content">
            <h3 id="kl-modal-title" className="kl-modal-title">{modal.title}</h3>
            <p className="kl-modal-message">{modal.message}</p>
          </div>
        </div>
        <div className="kl-modal-actions">
          <button type="button" className="kl-modal-btn kl-modal-btn-cancel" onClick={onClose}>
            {modal.cancelLabel||'Cancelar'}
          </button>
          <button type="button" className={`kl-modal-btn ${modal.isDestructive?'kl-modal-btn-danger':'kl-modal-btn-primary'}`} onClick={modal.onConfirm} autoFocus>
            {modal.confirmLabel||'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
