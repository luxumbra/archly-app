'use client'

import React from 'react'
import Link from 'next/link'
import ApplicationLogo from '@/components/ApplicationLogo'
import LoginLinks from '@/components/LoginLinks'

const AppHeader = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Home link on the left */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <ApplicationLogo className="h-8 w-8 fill-current text-gray-800" />
                            <span className="ml-2 text-xl font-semibold text-gray-800">Yore</span>
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