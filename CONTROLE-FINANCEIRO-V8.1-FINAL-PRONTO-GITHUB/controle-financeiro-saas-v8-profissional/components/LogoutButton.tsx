'use client'
import {createClient} from '@/lib/supabase/client'
import {useRouter} from 'next/navigation'
export default function LogoutButton(){const router=useRouter();return <button className="btn btn-secondary" onClick={async()=>{await createClient().auth.signOut();router.replace('/login')}}>Sair</button>}

