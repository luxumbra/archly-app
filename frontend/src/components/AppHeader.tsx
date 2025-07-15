'use client'

import React from 'react'
import Link from 'next/link'
import ApplicationLogo from '@/components/ApplicationLogo'
import LoginLinks from '@/components/LoginLinks'

const AppHeader = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/60 from-0% to-black/20 border-b border-yore-dark shadow-md  shadow-black/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Home link on the left */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <ApplicationLogo className="h-12 w-auto" />
                        </Link>
                    </div>

                    {/* Login links on the right */}
                    <div className="flex-shrink-0">
                        <LoginLinks />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default AppHeader
