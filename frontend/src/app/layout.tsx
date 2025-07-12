import type { Metadata } from "next";
import { Nunito } from 'next/font/google'
import { ThemeModeScript } from "flowbite-react";
import LoginLinks from '@/components/LoginLinks'
import "./globals.css";

const nunitoFont = Nunito({
    subsets: ['latin'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Yore - History in your pocket',
    description: 'Discover ancient monuments and archaeological sites around the world',
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
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
    );
}
