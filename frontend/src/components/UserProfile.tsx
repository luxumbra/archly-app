'use client'

import React from 'react'
import { useAuth } from '@/hooks/auth'

const UserProfile = () => {
    const { user } = useAuth({ middleware: 'auth' })

    return (
        <div className="flex items-center">
            <div className="text-sm text-gray-800">
                {user?.name}
            </div>
            <div className="ml-2 text-sm text-gray-500">
                {user?.email}
            </div>
        </div>
    )
}

export default UserProfile