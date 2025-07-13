import type { Metadata } from "next";
import { Playfair_Display, Open_Sans } from 'next/font/google'
import { ThemeModeScript } from "flowbite-react";
import AppHeader from '@/components/AppHeader'
import "./globals.css";

const playfairFont = Playfair_Display({
    subsets: ['latin'],
    display: 'swap',
})
const openSansFont = Open_Sans({
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
        <html lang="en" className={`${playfairFont.className} ${openSansFont.className}`}>
            <head>
                <ThemeModeScript />
            </head>
            <body className="antialiased bg-yore-dark">
                <AppHeader />
                <div className="w-full">
                    {children}
                </div>
            </body>
        </html>
    );
}
