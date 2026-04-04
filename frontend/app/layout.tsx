import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './lib/AuthContext'

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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
