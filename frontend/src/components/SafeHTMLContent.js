import DOMPurify from 'dompurify';

const SafeHTMLContent = ({ htmlContent }) => {
    // Sanitize the HTML content
    const sanitizedHTML = DOMPurify.sanitize(htmlContent);

    return (
        <div
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
        />
    );
};

export default SafeHTMLContent;
