'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'

const UserProfile = () => {
    const { user } = useAuth({ middleware: 'auth' })
    const [profile, setProfile] = useState<{ total_points?: number; current_level?: number } | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user?.id) {
            setLoading(true)
            axios.get('/profile')
                .then(response => {
                    setProfile(response.data)
                })
                .catch(error => {
                    console.error('Error fetching profile:', error)
                })
                .finally(() => {
                    setLoading(false)
                })
        }
    }, [user?.id])

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <div className="text-sm text-gray-800">
                {user?.name}
            </div>
            <div className="ml-0 sm:ml-2 text-sm text-gray-500">
                {user?.email}
            </div>
            <div className="mt-2 sm:mt-0 sm:ml-4 text-sm text-yore-primary font-semibold">
                {loading ? 'Loading...' : `Points: ${profile?.total_points ?? 0}`}
            </div>
            {profile?.current_level && (
                <div className="mt-2 sm:mt-0 sm:ml-2 text-sm text-gray-600">
                    Level: {profile.current_level}
                </div>
            )}
        </div>
    )
}

export default UserProfile