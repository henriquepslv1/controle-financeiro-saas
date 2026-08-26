 'use client'
import Link from 'next/link'
import {LayoutDashboard,Users,Wallet,Shield,Menu,X,Settings,ChevronRight} from 'lucide-react'
import {usePathname} from 'next/navigation'
import {useState} from 'react'
export default function Nav({isAdmin=false}:{isAdmin?:boolean}){
 const [open,setOpen]=useState(false); const pathname=usePathname()
 const items=[['/dashboard','Dashboard',LayoutDashboard],['/pessoas','Pessoas',Users],['/operacoes','Operações',Wallet]] as const
 const active=(h:string)=>pathname===h||pathname.startsWith(h+'/'); const close=()=>setOpen(false)
 return <>
  <button aria-label="Abrir menu" className="mobile-menu" onClick={()=>setOpen(true)}><Menu size={21}/></button>
  <aside className={`side-nav ${open?'open':''}`}>
   <div className="side-head"><div><div className="brand">Controle<span>.Financeiro</span></div><div className="brand-sub">Gestão de carteira</div></div><button aria-label="Fechar menu" className="close-nav" onClick={close}><X size={20}/></button></div>
   <div className="brand-country">🇧🇷 Português (Brasil)</div>
   <div className="nav-section-label">PRINCIPAL</div>
   <nav>{items.map(([href,label,Icon])=><Link className={active(href)?'active':''} key={href} href={href} onClick={close}><Icon size={18}/><span>{label}</span>{active(href)&&<ChevronRight size={15} className="nav-chevron"/>}</Link>)}</nav>
   {isAdmin&&<><div className="nav-section-label nav-admin-label">ADMINISTRAÇÃO</div><nav><Link className={active('/admin')?'active':''} href="/admin" onClick={close}><Shield size={18}/><span>Administração</span>{active('/admin')&&<ChevronRight size={15} className="nav-chevron"/>}</Link></nav></>}
   <div className="nav-section-label nav-bottom-label">SISTEMA</div><nav><Link className={active('/configuracoes')?'active':''} href="/configuracoes" onClick={close}><Settings size={18}/><span>Configurações</span></Link></nav>
   <div className="nav-footer">Controle.Financeiro<br/><span>Organização simples. Gestão profissional.</span></div>
  </aside>{open&&<div className="nav-overlay" onClick={close}/>}
  <style jsx>{` .side-nav{position:fixed;left:0;top:0;bottom:0;width:260px;background:linear-gradient(180deg,#10251a 0%,#0d2117 100%);color:white;padding:24px 15px;z-index:50;display:flex;flex-direction:column;overflow-y:auto;box-shadow:12px 0 35px rgba(16,37,26,.08)}.side-head{display:flex;align-items:center;justify-content:space-between;padding:0 7px}.brand{font-size:20px;font-weight:900;letter-spacing:-.03em}.brand span{opacity:.5}.brand-country{font-size:12px;color:#b7c8bd;margin:18px 0 22px;padding:9px 10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.06);border-radius:10px}.side-nav nav{display:grid;gap:5px}.side-nav a{display:flex;align-items:center;gap:10px;color:#dce9e0;text-decoration:none;padding:11px 12px;border-radius:11px;font-weight:650;font-size:13px;transition:.15s;background:transparent}.side-nav a:hover{background:rgba(255,255,255,.08);color:white}.close-nav,.mobile-menu{display:none}.nav-overlay{display:none}.mobile-menu{position:fixed;left:12px;top:12px;z-index:45;border:1px solid #dce5df;background:white;color:#17201b;border-radius:10px;padding:9px;box-shadow:0 8px 22px rgba(20,35,25,.10)}.side-nav~main{margin-left:260px;min-width:0}@media(max-width:800px){.side-nav{transform:translateX(-105%);transition:.22s ease}.side-nav.open{transform:translateX(0)}.close-nav{display:block;background:none;border:0;color:white;padding:5px;cursor:pointer}.nav-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,.38);z-index:49}.mobile-menu{display:block}.side-nav~main{margin-left:0}}`}</style>
 </>
}
