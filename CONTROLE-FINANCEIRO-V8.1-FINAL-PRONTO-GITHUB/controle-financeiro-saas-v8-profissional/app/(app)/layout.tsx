import {redirect} from 'next/navigation'
import {createClient} from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import LogoutButton from '@/components/LogoutButton'
import {ShieldCheck} from 'lucide-react'
export default async function AppLayout({children}:{children:React.ReactNode}){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login')
 const {data:profile}=await supabase.from('profiles').select('full_name,role,status,email').eq('id',user.id).single()
 if(!profile||profile.status!=='ACTIVE')redirect('/login')
 if(profile.role!=='MASTER_ADMIN'){const {data:sub}=await supabase.from('subscriptions').select('status,due_date').eq('profile_id',user.id).order('due_date',{ascending:false}).limit(1).maybeSingle();const {data:setting}=await supabase.from('settings').select('value').eq('key','grace_period_days').maybeSingle();const graceDays=Number(setting?.value)||3;const validUntil=sub?.due_date?new Date(sub.due_date+'T23:59:59'):null;if(!sub||!['ACTIVE','EXPIRING'].includes(sub.status)||!validUntil||validUntil.getTime()+graceDays*86400000<Date.now())redirect('/assinatura')}
 return <div className="app-shell"><Nav isAdmin={profile.role==='MASTER_ADMIN'}/><main className="app-main"><header className="app-topbar"><div className="topbar-user"><div className="topbar-avatar">{(profile.full_name||profile.email||'U').slice(0,1).toUpperCase()}</div><div><div className="topbar-name">{profile.full_name||profile.email}</div><div className="topbar-role"><ShieldCheck size={12}/>{profile.role==='MASTER_ADMIN'?'Administrador Master':'Conta ativa'}</div></div><LogoutButton/></div></header>{children}</main></div>
}
