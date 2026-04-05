import type { Metadata } from 'next'
import Providers from './Providers'
import { Navbar } from './lib/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'CyberSimulator',
  description: 'Интерактивный веб-симулятор для повышения цифровой грамотности и безопасности',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}