import { Nunito } from 'next/font/google'
import LoginLinks from '@/app/LoginLinks'
import { ThemeModeScript } from "flowbite-react";

import '@/app/global.css'

const nunitoFont = Nunito({
    subsets: ['latin'],
    display: 'swap',
})

const RootLayout = ({ children }) => {
    return (
        <html lang="en" className={nunitoFont.className}>
            <head>
            <ThemeModeScript />
            </head>
            <body className="antialiased">
            <div className="relative flex items-top justify-center min-h-screen bg-gray-100 dark:bg-transparent sm:items-center sm:pt-0">
                    <LoginLinks />
                    {children}
                </div>
            </body>
        </html>
    )
}

export const metadata = {
    title: 'Laravel',
}

export default RootLayout
