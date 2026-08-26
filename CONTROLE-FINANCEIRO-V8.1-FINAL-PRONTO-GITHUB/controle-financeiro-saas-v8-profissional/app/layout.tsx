import './globals.css'
import type { Metadata } from 'next'
export const metadata: Metadata = { title:'Controle Financeiro', description:'Controle financeiro profissional em Português do Brasil' }
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
