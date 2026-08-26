import {notFound} from 'next/navigation'
import Link from 'next/link'
import {createClient} from '@/lib/supabase/server'
import PaymentForm from '@/components/PaymentForm'
import AdjustmentForm from '@/components/AdjustmentForm'

const brl=(n:number)=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const labels:any={ACTIVE:'Ativo',PARTIAL:'Parcial',NEAR_DUE:'Próximo do vencimento',OVERDUE:'Atrasado',PAID:'Quitado',ARCHIVED:'Arquivado'}
const badge=(status:string)=>status==='OVERDUE'?'red':status==='PAID'?'green':status==='ACTIVE'?'green':'amber'
const visualStatus=(loan:any)=>{if(Number(loan.principal_current)<=0)return 'PAID';const days=Math.ceil((new Date(loan.due_date+'T23:59:59').getTime()-Date.now())/86400000);if(days<0)return 'OVERDUE';if(days<=3)return 'NEAR_DUE';if(Number(loan.principal_current)<Number(loan.principal_initial))return 'PARTIAL';return 'ACTIVE'}

export default async function Detalhes({params}:{params:Promise<{id:string}>}){
 const {id}=await params
 const supabase=await createClient()
 const {data:loan}=await supabase.from('loans').select('*,people(name,phone)').eq('id',id).single()
 if(!loan)notFound()
 const [{data:paymentsData},{data:periodsData},{data:adjustmentsData}]=await Promise.all([
  supabase.from('payments').select('*').eq('loan_id',id).order('payment_date',{ascending:false}),
  supabase.from('loan_periods').select('*').eq('loan_id',id).order('start_date',{ascending:false}),
  supabase.from('loan_adjustments').select('*').eq('loan_id',id).order('created_at',{ascending:false}),
 ])
 const payments=paymentsData??[]
 const periods=periodsData??[]
 const adjustments=adjustmentsData??[]
 const received=payments.reduce((s:any,p:any)=>s+Number(p.total_amount),0)
 const charges=payments.reduce((s:any,p:any)=>s+Number(p.charge_amount),0)
 const principalPaid=payments.reduce((s:any,p:any)=>s+Number(p.principal_amount),0)
 const currentCharge=Number(loan.principal_current)*Number(loan.rate_value)/100; const currentStatus=visualStatus(loan)
 return <div className="container">
  <div className="page-title"><div><div className="muted" style={{fontWeight:800,fontSize:13}}>{loan.friendly_id}</div><h1>{loan.people?.name}</h1><p className="muted">Operação criada em {new Date(loan.operation_date+'T12:00:00').toLocaleDateString('pt-BR')}</p></div><div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}><span className={`badge ${badge(currentStatus)}`}>{labels[currentStatus]}</span><Link className="btn btn-secondary" href={`/operacoes/${id}/editar`}>Editar dados</Link></div></div>
  <div className="grid grid-4"><div className="card stat"><div className="stat-label">Principal atual</div><div className="stat-value">{brl(Number(loan.principal_current))}</div></div><div className="card stat"><div className="stat-label">Próximo encargo</div><div className="stat-value amber">{brl(currentCharge)}</div></div><div className="card stat"><div className="stat-label">Total recebido</div><div className="stat-value green">{brl(received)}</div></div><div className="card stat"><div className="stat-label">Principal abatido</div><div className="stat-value">{brl(principalPaid)}</div></div></div>
  <div className="grid grid-2" style={{marginTop:20}}><div className="card" style={{padding:20}}><h2 style={{marginTop:0}}>Resumo da operação</h2><div className="detail-list"><div><span>Taxa mensal</span><strong>{Number(loan.rate_value).toLocaleString('pt-BR',{minimumFractionDigits:2})}%</strong></div><div><span>Vencimento</span><strong>{new Date(loan.due_date+'T12:00:00').toLocaleDateString('pt-BR')}</strong></div><div><span>Principal inicial</span><strong>{brl(Number(loan.principal_initial))}</strong></div><div><span>Encargos pagos</span><strong>{brl(charges)}</strong></div><div><span>Pessoa</span><strong>{loan.people?.name}</strong></div></div></div><div className="card" style={{padding:20}}><h2 style={{marginTop:0}}>Regra atual</h2><div className="big-number">{brl(currentCharge)}</div><p className="muted">O próximo encargo é calculado sobre o principal atual de <strong>{brl(Number(loan.principal_current))}</strong>, usando a taxa configurada.</p></div></div>
  <div className="grid grid-2" style={{marginTop:20}}><PaymentForm loanId={id} principal={Number(loan.principal_current)} chargeDue={Number(currentCharge)}/><AdjustmentForm loanId={id} principal={Number(loan.principal_current)}/></div>
  <div className="card" style={{padding:20,marginTop:20}}><div className="panel-head"><div><h2>Histórico de pagamentos</h2><p className="muted">Cada pagamento permanece registrado individualmente.</p></div></div>{payments.length===0?<div className="empty">Nenhum pagamento registrado.</div>:payments.map((p:any)=><div key={p.id} className="history-row"><div><strong>{brl(Number(p.total_amount))}</strong><div className="muted small">Encargo: {brl(Number(p.charge_amount))} · Principal: {brl(Number(p.principal_amount))} · {p.payment_method}</div></div><span className="muted">{new Date(p.payment_date+'T12:00:00').toLocaleDateString('pt-BR')}</span></div>)}</div>
  <div className="grid grid-2" style={{marginTop:20}}><div className="card" style={{padding:20}}><h2 style={{marginTop:0}}>Períodos</h2>{periods.length===0?<div className="empty">Nenhum período registrado.</div>:periods.map((p:any)=><div key={p.id} className="history-row"><div><strong>{new Date(p.start_date+'T12:00:00').toLocaleDateString('pt-BR')} → {new Date(p.end_date+'T12:00:00').toLocaleDateString('pt-BR')}</strong><div className="muted small">Base {brl(Number(p.base_principal))} · Encargo {brl(Number(p.calculated_charge))}</div></div><span className={`badge ${p.status==='PAID'?'green':'amber'}`}>{p.status==='PAID'?'Pago':'Aberto'}</span></div>)}</div><div className="card" style={{padding:20}}><h2 style={{marginTop:0}}>Movimentações de principal</h2>{adjustments.length===0?<div className="empty">Nenhuma movimentação registrada.</div>:adjustments.map((a:any)=><div key={a.id} className="history-row"><div><strong>{a.type==='ADD_PRINCIPAL'?'Acréscimo':'Redução'} · {brl(Number(a.amount))}</strong><div className="muted small">{a.reason||'Sem motivo informado'}</div></div><span className="muted">{new Date(a.created_at).toLocaleDateString('pt-BR')}</span></div>)}</div></div>
 </div>
}

