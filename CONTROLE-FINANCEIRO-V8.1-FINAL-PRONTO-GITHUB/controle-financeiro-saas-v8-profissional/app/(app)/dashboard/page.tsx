import Link from 'next/link'
import { ArrowUpRight, CalendarClock, CheckCircle2, CircleAlert, WalletCards } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const brl=(n:number)=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const dateBR=(d:string)=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR')
function visualStatus(status:string,due:string,principal:number,initial:number){
  if(principal<=0)return ['Quitado','green']
  const days=Math.ceil((new Date(due+'T23:59:59').getTime()-Date.now())/86400000)
  if(days<0)return ['Atrasado','red']
  if(days<=3)return ['Próximo','amber']
  if(principal<initial)return ['Parcial','amber']
  return ['Ativo','green']
}
export default async function Dashboard(){
 const supabase=await createClient()
 const {data:loansData}=await supabase.from('loans').select('id,friendly_id,principal_initial,principal_current,status,due_date,rate_value,people(name)').order('due_date',{ascending:true}).limit(100)
 const loans=loansData??[]
 const total=loans.reduce((s,l)=>s+Number(l.principal_current||0),0)
 const active=loans.filter(l=>Number(l.principal_current)>0).length
 const paid=loans.filter(l=>Number(l.principal_current)<=0).length
 const overdue=loans.filter(l=>Number(l.principal_current)>0 && new Date(l.due_date+'T23:59:59').getTime()<Date.now()).length
 const near=loans.filter(l=>{const d=Math.ceil((new Date(l.due_date+'T23:59:59').getTime()-Date.now())/86400000);return Number(l.principal_current)>0&&d>=0&&d<=3}).length
 const upcoming=loans.filter(l=>Number(l.principal_current)>0).slice(0,5)
 return <div className="container">
  <section className="hero-card"><div><div className="eyebrow">🇧🇷 CONTROLE FINANCEIRO</div><h1>Uma visão clara da sua carteira.</h1><p>Organize operações, pagamentos, vencimentos e saldos em um único lugar.</p></div><Link href="/operacoes/nova" className="hero-action">Nova operação <ArrowUpRight size={18}/></Link></section>
  <div className="grid grid-4 dashboard-stats">
   <div className="card stat stat-feature"><div className="stat-icon"><WalletCards size={19}/></div><div className="stat-label">Principal pendente</div><div className="stat-value">{brl(total)}</div><div className="stat-caption">Saldo atual da carteira</div></div>
   <div className="card stat"><div className="stat-icon"><CheckCircle2 size={19}/></div><div className="stat-label">Operações ativas</div><div className="stat-value">{active}</div><div className="stat-caption">Com saldo pendente</div></div>
   <div className="card stat"><div className="stat-icon amber-bg"><CalendarClock size={19}/></div><div className="stat-label">Próximas</div><div className="stat-value amber">{near}</div><div className="stat-caption">Vencem em até 3 dias</div></div>
   <div className="card stat"><div className="stat-icon red-bg"><CircleAlert size={19}/></div><div className="stat-label">Atrasadas</div><div className="stat-value red">{overdue}</div><div className="stat-caption">Precisam de atenção</div></div>
  </div>
  <div className="grid grid-2 dashboard-main">
   <section className="card panel"><div className="panel-head"><div><h2>Próximas operações</h2><p className="muted">Priorize o que precisa da sua atenção.</p></div><Link className="link" href="/operacoes">Ver todas</Link></div>
    {upcoming.length===0?<div className="empty">Nenhuma operação cadastrada ainda.<Link className="link" href="/operacoes/nova"> Criar primeira operação</Link></div>:<div className="operation-list">{upcoming.map((l:any)=>{const [label,color]=visualStatus(l.status,l.due_date,Number(l.principal_current),Number(l.principal_initial));return <Link href={`/operacoes/${l.id}`} className="operation-row" key={l.id}><div><strong>{l.people?.name||'Sem nome'}</strong><div className="muted small">{l.friendly_id} · vence {dateBR(l.due_date)}</div></div><div className="operation-right"><strong>{brl(Number(l.principal_current))}</strong><span className={`badge ${color}`}>{label}</span></div></Link>})}</div>}
   </section>
   <section className="card panel"><div className="panel-head"><div><h2>Resumo da carteira</h2><p className="muted">Indicadores rápidos do momento.</p></div></div><div className="summary-stack"><div><span>Quitadas</span><strong className="green">{paid}</strong></div><div><span>Com saldo</span><strong>{active}</strong></div><div><span>Atrasadas</span><strong className="red">{overdue}</strong></div><div><span>Próximas</span><strong className="amber">{near}</strong></div></div><div className="mini-note">Os valores são atualizados a partir dos registros do seu banco de dados.</div></section>
  </div>
 </div>
}

