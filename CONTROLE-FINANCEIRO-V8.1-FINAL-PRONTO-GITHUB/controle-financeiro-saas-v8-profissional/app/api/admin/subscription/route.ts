import {NextResponse} from 'next/server'
import {createClient} from '@/lib/supabase/server'

export async function POST(req:Request){
 const supabase=await createClient()
 const {data:{user}}=await supabase.auth.getUser()
 if(!user)return NextResponse.json({error:'Não autenticado'},{status:401})
 const {data:master}=await supabase.from('profiles').select('role').eq('id',user.id).single()
 if(master?.role!=='MASTER_ADMIN')return NextResponse.json({error:'Não autorizado'},{status:403})
 const form=await req.formData()
 const profileId=String(form.get('profile_id')||'')
 const action=String(form.get('action')||'')
 if(!profileId)return NextResponse.json({error:'Cliente inválido'},{status:400})

 if(action==='activate'){
  const {error}=await supabase.rpc('master_activate_subscription',{p_profile_id:profileId,p_days:null})
  if(error)return NextResponse.json({error:error.message},{status:400})
 }else if(action==='suspend'){
  const {error}=await supabase.rpc('master_set_subscription_status',{p_profile_id:profileId,p_status:'SUSPENDED',p_reason:'Suspensão manual pelo Administrador Master'})
  if(error)return NextResponse.json({error:error.message},{status:400})
 }else if(action==='reactivate'){
  const {error}=await supabase.rpc('master_activate_subscription',{p_profile_id:profileId,p_days:null})
  if(error)return NextResponse.json({error:error.message},{status:400})
 }else if(action==='cancel'){
  const {error}=await supabase.rpc('master_set_subscription_status',{p_profile_id:profileId,p_status:'CANCELLED',p_reason:'Cancelamento manual pelo Administrador Master'})
  if(error)return NextResponse.json({error:error.message},{status:400})
 }else return NextResponse.json({error:'Ação inválida'},{status:400})

 return NextResponse.redirect(new URL('/admin/clientes',req.url),303)
}
