import React from 'react'
import Link from 'next/link'

interface NavLinkProps extends Omit<React.ComponentProps<typeof Link>, 'href' | 'children'> {
    active?: boolean
    href: string
    children: React.ReactNode
}

const NavLink = ({ active = false, children, ...props }: NavLinkProps) => (
    <Link
        {...props}
        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 focus:outline-none transition duration-150 ease-in-out ${
            active
                ? 'border-indigo-400 text-gray-900 focus:border-indigo-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300'
        }`}>
        {children}
    </Link>
)

export default NavLink