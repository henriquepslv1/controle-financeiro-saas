import {NextResponse} from 'next/server'
import {createClient} from '@/lib/supabase/server'
export async function POST(req:Request){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:'Não autenticado'},{status:401});
 const {data:master}=await supabase.from('profiles').select('role').eq('id',user.id).single(); if(master?.role!=='MASTER_ADMIN')return NextResponse.json({error:'Não autorizado'},{status:403});
 const form=await req.formData(); const profileId=String(form.get('profile_id')||''); const action=String(form.get('action')||''); if(!profileId)return NextResponse.json({error:'Cliente inválido'},{status:400});
 const {data:sub}=await supabase.from('subscriptions').select('id,plan_id,price').eq('profile_id',profileId).order('due_date',{ascending:false}).limit(1).maybeSingle();
 if(!sub)return NextResponse.json({error:'Cliente sem assinatura'},{status:404});
 if(action==='activate'){const due=new Date(); due.setDate(due.getDate()+30); const {error}=await supabase.from('subscriptions').update({status:'ACTIVE',due_date:due.toISOString().slice(0,10),last_payment_at:new Date().toISOString()}).eq('id',sub.id); if(error)return NextResponse.json({error:error.message},{status:400}); await supabase.from('profiles').update({status:'ACTIVE'}).eq('id',profileId);}
 else if(action==='suspend'){const {error}=await supabase.from('subscriptions').update({status:'SUSPENDED'}).eq('id',sub.id); if(error)return NextResponse.json({error:error.message},{status:400}); await supabase.from('profiles').update({status:'SUSPENDED'}).eq('id',profileId);}
 else return NextResponse.json({error:'Ação inválida'},{status:400});
 return NextResponse.redirect(new URL('/admin/clientes',req.url),303);
}
