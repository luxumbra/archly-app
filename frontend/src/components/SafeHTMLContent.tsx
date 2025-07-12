import React from 'react'
import DOMPurify from 'dompurify'

interface SafeHTMLContentProps {
    htmlContent: string
}

const SafeHTMLContent = ({ htmlContent }: SafeHTMLContentProps) => {
    const sanitizedHTML = DOMPurify.sanitize(htmlContent)

    return (
        <div
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
        />
    )
}

export default SafeHTMLContent