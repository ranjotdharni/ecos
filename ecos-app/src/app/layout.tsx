import { JetBrains_Mono } from "next/font/google"
import "./globals.css"

const JB_Mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: '400'
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <title>Hegemony - Online Economy Game</title>
      </head>
      <body className={`${JB_Mono.className}`}>
        {children}
        {/* Always leave 5vh at bottom of each page for footer */}
        <footer style={{zIndex: 10}}>
          <p style={{fontSize: 12, color: '#818181a0'}}>Icons by <a style={{textDecoration: 'underline'}} target='_blank' href='https://icons8.com'>Icons8</a></p>
        </footer>
      </body>
    </html>
  )
}
