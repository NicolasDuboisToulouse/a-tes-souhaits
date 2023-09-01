import './globals.css'
import type { Metadata } from 'next'

import { Alerts } from '_components/Alerts'
import { Spinner } from '_components/Spinner'
import { Header } from '_components/Header'
import { UserProvider } from '_components/UserProvider'


export const metadata: Metadata = {
  title: 'A tes souhaits !',
  description: 'Exprimes tes souhaits et comble ceux des autres!',
}

export default function RootLayout({ children } : { children: React.ReactNode}) {
  return (
    <html lang="fr">
      <body>
        <Spinner />
        <Alerts />
        <UserProvider>
          <Header />
          <div className="main-content">
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  )
}
