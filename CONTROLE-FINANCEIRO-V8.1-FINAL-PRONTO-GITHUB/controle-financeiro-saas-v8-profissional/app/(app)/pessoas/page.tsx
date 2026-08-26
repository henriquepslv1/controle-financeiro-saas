'use client'
import {useCallback,useEffect,useMemo,useState} from 'react'
import {createClient} from '@/lib/supabase/client'
import {Pencil, UserPlus, Search, UsersRound, X, Save} from 'lucide-react'

const empty={name:'',phone:''}

export default function Pessoas(){
 const supabase=useMemo(()=>createClient(),[])
 const [people,setPeople]=useState<any[]>([])
 const [form,setForm]=useState(empty)
 const [editing,setEditing]=useState<string|null>(null)
 const [loading,setLoading]=useState(true)
 const [saving,setSaving]=useState(false)
 const [error,setError]=useState('')
 const [success,setSuccess]=useState('')
 const [search,setSearch]=useState('')

 const load=useCallback(async()=>{
  setLoading(true);setError('')
  const {data,error}=await supabase.from('people').select('id,name,phone,created_at').order('created_at',{ascending:false})
  if(error){setError(`Não foi possível carregar as pessoas: ${error.message}`);setPeople([])}else setPeople(data||[])
  setLoading(false)
 },[supabase])

 useEffect(()=>{void load()},[load])

 async function save(e:React.FormEvent){
  e.preventDefault();setSaving(true);setError('');setSuccess('')
  const name=form.name.trim()
  if(!name){setError('Informe o nome completo.');setSaving(false);return}
  const {data:{user},error:userError}=await supabase.auth.getUser()
  if(userError||!user){setError('Sua sessão expirou. Entre novamente para continuar.');setSaving(false);return}
  const payload={profile_id:user.id,name,phone:form.phone.trim()||null}
  const q=editing?supabase.from('people').update({name:payload.name,phone:payload.phone}).eq('id',editing):supabase.from('people').insert(payload)
  const {error}=await q
  if(error){
   const message=error.code==='42501'?'Seu acesso não está autorizado a cadastrar pessoas. Como Administrador Master, verifique se você está conectado com a conta Master correta.':error.code==='23505'?'Já existe um cadastro com esses dados.':`Não foi possível salvar a pessoa: ${error.message}`
   setError(message)
  }else{
   setForm(empty);setEditing(null);setSuccess(editing?'Pessoa atualizada com sucesso.':'Pessoa cadastrada com sucesso.');await load()
  }
  setSaving(false)
 }

 function edit(p:any){setEditing(p.id);setForm({name:p.name||'',phone:p.phone||''});setError('');setSuccess('');window.scrollTo({top:0,behavior:'smooth'})}
 function cancel(){setEditing(null);setForm(empty);setError('');setSuccess('')}

 const filtered=people.filter(p=>`${p.name||''} ${p.phone||''}`.toLowerCase().includes(search.toLowerCase()))

 return <div className="container">
  <div className="page-title">
   <div><div className="eyebrow-dark">CADASTRO · CARTEIRA</div><h1>Pessoas</h1><p className="muted">Centralize os contatos vinculados às suas operações, com histórico e edição rápida.</p></div>
   <div className="page-title-meta"><span className="badge green"><UsersRound size={13}/> {people.length} cadastrada{people.length===1?'':'s'}</span></div>
  </div>

  <div className="grid grid-2 people-layout">
   <form onSubmit={save} className="card people-form-card">
    <div className="panel-head"><div><div className="section-kicker">{editing?'EDIÇÃO':'NOVO CADASTRO'}</div><h2>{editing?'Editar pessoa':'Adicionar pessoa'}</h2><p className="muted">Preencha apenas as informações necessárias.</p></div><div className="form-icon"><UserPlus size={19}/></div></div>
    <div style={{display:'grid',gap:15}}>
     <label className="label">Nome completo<input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex.: João da Silva" autoComplete="name" required/></label>
     <label className="label">Telefone <span className="muted" style={{fontWeight:400}}>(opcional)</span><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="(21) 99999-9999" inputMode="tel" autoComplete="tel"/></label>
     {error&&<div className="alert error">{error}</div>}
     {success&&<div className="alert success">{success}</div>}
     <div className="form-actions"><button className="btn btn-primary" disabled={saving}>{saving?'Salvando...':editing?<><Save size={16}/> Salvar alterações</>:<><UserPlus size={16}/> Cadastrar pessoa</>}</button>{editing&&<button type="button" className="btn btn-secondary" onClick={cancel}><X size={16}/> Cancelar</button>}</div>
    </div>
   </form>

   <section className="card people-list-card">
    <div className="panel-head people-list-head"><div><div className="section-kicker">SUA BASE</div><h2>Pessoas cadastradas</h2><p className="muted">Encontre e edite rapidamente qualquer contato.</p></div></div>
    <div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por nome ou telefone..."/></div>
    {loading?<div className="empty">Carregando sua carteira...</div>:filtered.length===0?<div className="person-empty"><div className="person-empty-icon"><UsersRound size={23}/></div><strong>{search?'Nenhuma pessoa encontrada':'Sua carteira ainda está vazia'}</strong><p className="muted">{search?'Tente outro nome ou telefone.':'Cadastre sua primeira pessoa usando o formulário ao lado.'}</p></div>:<div className="person-list">{filtered.map(p=><div className="person-card" key={p.id}><div className="person-main"><div className="person-avatar">{(p.name||'?').slice(0,1).toUpperCase()}</div><div className="person-meta"><strong>{p.name}</strong><span>{p.phone||'Telefone não informado'}</span><small>Cadastrada em {new Date(p.created_at).toLocaleDateString('pt-BR')}</small></div></div><div className="person-actions"><button className="btn btn-secondary btn-sm" onClick={()=>edit(p)}><Pencil size={14}/> Editar</button></div></div>)}</div>}
   </section>
  </div>
 </div>
}
