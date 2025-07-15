import React from 'react'

interface AuthCardProps {
    logo?: React.ReactNode
    children: React.ReactNode
}

const AuthCard = ({ logo, children }: AuthCardProps) => (
    <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-yore-dark">
        <div>{logo}</div>

        <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white/10 backdrop-blur-2xl shadow-lg shadow-black/50 overflow-hidden sm:rounded-lg sm:rounded-br-2xl sm:rounded-tr-lg text-gray-200">
            {children}
        </div>
    </div>
)

export default AuthCard