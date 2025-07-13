import React from 'react'

interface ApplicationLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    className?: string
}

const ApplicationLogo = (props: ApplicationLogoProps) => (
    <img
        src="https://yore.b-cdn.net/assets/images/yore-logo.png"
        alt="Yore Logo"
        {...props}
    />
)

export default ApplicationLogo