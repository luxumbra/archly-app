'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/auth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Avatar, Dropdown } from 'flowbite-react'

const LoginLinks = () => {
    const { user, logout } = useAuth({ middleware: 'guest' })
    const { profile } = useUserProfile()

    return (
        <div className="flex items-center space-x-4 ">
            {user ? (
                <Dropdown
                    arrowIcon={false}
                    className='bg-yore-dark text-gray-200 hover:text-gray-500 transition-colors'
                    inline
                    label={
                        <Avatar
                            alt={user.name}
                            placeholderInitials={user.name.charAt(0).toUpperCase()}
                            rounded
                            size="sm"
                            className="cursor-pointer"
                        />
                    }
                >
                    <Dropdown.Header className='border-0'>
                        <span className="block text-sm font-medium text-yore-discover dark:text-white">
                            {user.name} ({profile?.total_points || 0}) {profile?.current_level || 0}
                        </span>
                        <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                        </span>
                    </Dropdown.Header>
                    <Dropdown.Item>
                        <Link href="/profile" className="text-left w-full block text-yore-primary">
                            Profile
                        </Link>
                    </Dropdown.Item>
                    <Dropdown.Item>
                        <Link href="/dashboard" className="text-left text-yore-primary w-full block hover:text-gray-300">
                            Dashboard
                        </Link>
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={logout}>
                        Logout
                    </Dropdown.Item>
                </Dropdown>
            ) : (
                <>
                    <Link
                        href="/login"
                        className="text-sm text-gray-200 hover:text-gray-500 transition-colors"
                    >
                        Login
                    </Link>

                    <Link
                        href="/register"
                        className="text-sm bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                        Register
                    </Link>
                </>
            )}
        </div>
    )
}

export default LoginLinks