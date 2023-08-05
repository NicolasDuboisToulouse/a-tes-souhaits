import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'A tes souhaits !',
  description: 'Exprimes tes souhaits et comble ceux des autres!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <div className="main-content">
          {children}
        </div>
      </body>
    </html>
  )
}
