import {FormEvent, useState} from 'react';

export default function PasswordRecovery({reset = false}:{reset?:boolean}) {
  const query = new URLSearchParams(window.location.search);
  const [email,setEmail]=useState(query.get('email')||'');
  const [token,setToken]=useState(query.get('token')||'');
  const [password,setPassword]=useState('');
  const [confirmation,setConfirmation]=useState('');
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');setMessage('');try{const response=await fetch(`/api/auth/password/${reset?'reset':'forgot'}`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(reset?{email,token,password,password_confirmation:confirmation}:{email})});const data=await response.json();if(!response.ok)throw new Error(data.message||'Não foi possível concluir o pedido.');setMessage(data.message);if(reset){setTimeout(()=>window.location.assign('/admin'),1400)}}catch(e:any){setError(e.message)}finally{setBusy(false)}}
  return <main className="login recovery"><a href="/" className="brand"><img src="/logo_paraiso_do_saber.jpeg"/><span><b>PARAÍSO DO SABER</b><small>ÁREA ADMINISTRATIVA</small></span></a><form onSubmit={submit}><label>SEGURANÇA DA CONTA</label><h1>{reset?'Definir nova palavra-passe':'Recuperar palavra-passe'}</h1><p>{reset?'Escolha uma palavra-passe forte para voltar a aceder ao painel.':'Informe o e-mail associado à sua conta. Se estiver activa, receberá uma ligação para criar uma nova palavra-passe.'}</p><input type="email" required autoComplete="email" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)}/>{reset&&<><label>Ligação de recuperação<input required minLength={32} value={token} onChange={e=>setToken(e.target.value)} placeholder="Código recebido no e-mail"/></label><input type="password" required minLength={12} autoComplete="new-password" placeholder="Nova palavra-passe (mínimo 12 caracteres)" value={password} onChange={e=>setPassword(e.target.value)}/><input type="password" required autoComplete="new-password" placeholder="Confirmar palavra-passe" value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></>}{error&&<small className="error">{error}</small>}{message&&<p role="status" className="recovery-message">{message}</p>}<button className="btn" disabled={busy}>{busy?'A processar…':reset?'Guardar palavra-passe':'Enviar ligação segura'}</button><a href="/admin">Voltar ao início de sessão</a></form></main>;
}
