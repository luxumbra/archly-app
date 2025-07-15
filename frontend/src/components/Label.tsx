import React from 'react'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    className?: string
    children: React.ReactNode
}

const Label = ({ className = '', children, ...props }: LabelProps) => (
    <label
        className={`${className} block font-medium text-sm text-gray-300`}
        {...props}>
        {children}
    </label>
)

export default Label