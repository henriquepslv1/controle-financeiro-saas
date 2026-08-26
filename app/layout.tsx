import './globals.css'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
export const metadata: Metadata = { title:'Controle Financeiro', description:'Controle financeiro profissional em Português do Brasil' }
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}<Analytics /></body></html>}
