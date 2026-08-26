'use client'
import Link from 'next/link'
import {LayoutDashboard,Users,Wallet,Shield,Menu,X,Settings} from 'lucide-react'
import {useState} from 'react'
export default function Nav({isAdmin=false}:{isAdmin?:boolean}){
 const [open,setOpen]=useState(false)
 const items=[['/dashboard','Dashboard',LayoutDashboard],['/pessoas','Pessoas',Users],['/operacoes','Operações',Wallet]] as const
 return <>
  <button aria-label="Abrir menu" className="mobile-menu" onClick={()=>setOpen(true)}><Menu size={21}/></button>
  <aside className={`side-nav ${open?'open':''}`}>
   <div className="side-head"><div className="brand">Controle<span>.Financeiro</span></div><button className="close-nav" onClick={()=>setOpen(false)}><X size={20}/></button></div>
   <div className="brand-country">🇧🇷 Português (Brasil)</div>
   <nav>{items.map(([href,label,Icon])=><Link key={href} href={href} onClick={()=>setOpen(false)}><Icon size={18}/>{label}</Link>)}{isAdmin&&<Link href="/admin" onClick={()=>setOpen(false)}><Shield size={18}/> Administração</Link>}<Link href="/configuracoes" onClick={()=>setOpen(false)}><Settings size={18}/> Configurações</Link></nav>
  </aside>
  {open&&<div className="nav-overlay" onClick={()=>setOpen(false)}/>} 
  <style jsx>{` .side-nav{position:fixed;left:0;top:0;bottom:0;width:255px;background:#10251a;color:white;padding:22px 16px;z-index:50}.side-head{display:flex;align-items:center;justify-content:space-between}.brand{font-size:20px;font-weight:900;letter-spacing:-.03em}.brand span{opacity:.5}.brand-country{font-size:12px;color:#b7c8bd;margin:12px 0 22px;padding:8px 10px;background:rgba(255,255,255,.06);border-radius:10px}.side-nav nav{display:grid;gap:6px}.side-nav a{display:flex;align-items:center;gap:10px;color:#e8f2ec;text-decoration:none;padding:11px 12px;border-radius:10px;font-weight:650}.side-nav a:hover{background:rgba(255,255,255,.09)}.close-nav,.mobile-menu{display:none}.nav-overlay{display:none}.mobile-menu{position:fixed;left:12px;top:12px;z-index:45;border:1px solid #dce5df;background:white;border-radius:10px;padding:9px}.side-nav~main{margin-left:255px}@media(max-width:800px){.side-nav{transform:translateX(-105%);transition:.2s}.side-nav.open{transform:translateX(0)}.close-nav{display:block;background:none;border:0;color:white}.nav-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:49}.mobile-menu{display:block}.side-nav~main{margin-left:0}}`}</style>
 </>
}
