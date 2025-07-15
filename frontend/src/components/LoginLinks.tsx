'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/auth'
import { Avatar, Dropdown } from 'flowbite-react'

const LoginLinks = () => {
    const { user, logout } = useAuth({ middleware: 'guest' })

    return (
        <div className="flex items-center space-x-4">
            {user ? (
                <Dropdown
                    arrowIcon={false}
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
                    <Dropdown.Header>
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                        </span>
                        <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                        </span>
                    </Dropdown.Header>
                    <Dropdown.Item>
                        <Link href="/profile" className="w-full block">
                            Profile
                        </Link>
                    </Dropdown.Item>
                    <Dropdown.Item>
                        <Link href="/dashboard" className="w-full block">
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