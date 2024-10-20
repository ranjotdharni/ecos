import { handleAuthentication } from "./server/auth"
import { JetBrains_Mono } from "next/font/google"
import type { Metadata } from "next"
import "./globals.css"

const JB_Mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: '400'
})

const metadata: Metadata = {
  title: "Hegemony - Online Economy Game",
  description: "Online Economy Game",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  await handleAuthentication()

  return (
    <html lang="en">
      <body className={`${JB_Mono.className}`}>
        {children}

        {/* Always leave 5vh at bottom of each page for footer */}
        <footer>
          <p style={{fontSize: 12, color: '#818181a0'}}>Icons by <a style={{textDecoration: 'underline'}} target='_blank' href='https://icons8.com'>Icons8</a></p>
        </footer>
      </body>
    </html>
  );
}
