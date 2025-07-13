'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/auth'

const LoginLinks = () => {
    const { user } = useAuth({ middleware: 'guest' })

    return (
        <div className="flex items-center space-x-4">
            {user ? (
                <Link
                    href="/dashboard"
                    className="text-sm text-gray-200 hover:text-gray-500 transition-colors"
                >
                    Dashboard
                </Link>
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