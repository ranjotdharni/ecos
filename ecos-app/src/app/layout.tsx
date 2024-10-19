import { handleAuthentication } from "./server/auth"
import { JetBrains_Mono } from "next/font/google"
import type { Metadata } from "next"
import "./globals.css"

const JB_Mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: '400'
})

const metadata: Metadata = {
  title: "Ecos - Online Economy Game",
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
      </body>
    </html>
  );
}
