import React from 'react'
import Link from 'next/link'
import { Menu } from '@headlessui/react'

interface DropdownLinkProps extends Omit<React.ComponentProps<typeof Link>, 'href' | 'children'> {
    href: string
    children: React.ReactNode
}

interface DropdownButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}

const DropdownLink = ({ children, ...props }: DropdownLinkProps) => (
    <Menu.Item>
        {({ active }) => (
            <Link
                {...props}
                className={`w-full text-left block px-4 py-2 text-sm leading-5 text-gray-300 ${
                    active ? 'bg-yore-explore' : ''
                } focus:outline-none transition duration-150 ease-in-out`}>
                {children}
            </Link>
        )}
    </Menu.Item>
)

export const DropdownButton = ({ children, ...props }: DropdownButtonProps) => (
    <Menu.Item>
        {({ active }) => (
            <button
                className={`w-full text-left block px-4 py-2 text-sm leading-5 text-gray-300 ${
                    active ? 'bg-gray-100' : ''
                } focus:outline-none transition duration-150 ease-in-out`}
                {...props}>
                {children}
            </button>
        )}
    </Menu.Item>
)

export default DropdownLink