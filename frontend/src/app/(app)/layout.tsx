'use client'

import React from 'react'
import { useAuth } from '@/hooks/auth'
import Navigation from '@/app/(app)/Navigation'
import Loading from '@/app/(app)/Loading'
import type { User } from '@/types'

interface AppLayoutProps {
    children: React.ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
    const { user } = useAuth({ middleware: 'auth' })

    if (!user) {
        return <Loading />
    }

    return (
        <div className="min-h-screen bg-yore-dark">
            <Navigation user={user as User} />
            <main>{children}</main>
        </div>
    )
}

export default AppLayout