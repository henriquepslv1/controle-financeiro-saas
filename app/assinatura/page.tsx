import {redirect} from 'next/navigation'
import Link from 'next/link'
import {createClient} from '@/lib/supabase/server'
const brl=(n:number)=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
export default async function Assinatura(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect('/login');
 const {data:p}=await s.from('profiles').select('role,full_name,email').eq('id',user.id).single();
 if(p?.role==='MASTER_ADMIN') redirect('/admin');
 const {data:sub}=await s.from('subscriptions').select('status,due_date,price,plans(name,period_days)').eq('profile_id',user.id).order('due_date',{ascending:false}).limit(1).maybeSingle();
 return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'linear-gradient(135deg,#f7fbf8,#eef6f0)'}}><div className="card" style={{maxWidth:620,width:'100%',padding:32}}><div style={{fontSize:42}}>🇧🇷</div><h1 style={{margin:'12px 0 8px'}}>Sua assinatura está pendente</h1><p className="muted">Olá, {p?.full_name||p?.email}. Para usar o Controle Financeiro, mantenha seu plano ativo.</p><div className="card" style={{margin:'24px 0',padding:20,background:'#f8faf9'}}><div className="muted">Plano atual</div><h2 style={{margin:'6px 0'}}>{(sub?.plans as any)?.name||'Profissional'}</h2><div style={{fontSize:28,fontWeight:800}}>{brl(Number(sub?.price||40))}<span className="muted" style={{fontSize:13}}>/ {Number((sub?.plans as any)?.period_days||30)} dias</span></div><p className="muted">Status: {sub?.status==='PENDING'?'Aguardando pagamento':sub?.status==='EXPIRED'?'Expirada':sub?.status==='SUSPENDED'?'Suspensa':'Não ativa'}</p></div><div style={{display:'grid',gap:10}}><button className="btn btn-primary" disabled>Pagamento online — Mercado Pago em breve</button><Link href="/login" className="btn" style={{textAlign:'center',textDecoration:'none'}}>Sair</Link></div><p className="muted" style={{fontSize:12,marginTop:18}}>O acesso aos seus dados financeiros continua protegido no banco. Assim que a assinatura for confirmada, o acesso será liberado automaticamente.</p></div></main>
}
