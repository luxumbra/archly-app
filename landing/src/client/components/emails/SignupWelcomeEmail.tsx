import {
  Text,
  Column,
  Container,
  Heading,
  Html,
  Img,
  Row,
  Section,
  Tailwind,
  Head,
  Preview,
  Body,
  Link,
} from "@react-email/components";

import { EmailHeader, EmailHeading, EmailTailwind } from "./shared";

interface EmailTemplateProps {
  email: string;
  newsletter: boolean;
}

/**
 * Order placed email component
 * @param props - The props for the email
 * @returns The email component
 */
function SignupWelcomeEmailTemplate({ email, newsletter }: EmailTemplateProps) {
  return (
    <EmailTailwind>
      <Html className="font-sans bg-secondary-background">
        <Head />
        <Preview>Thank you {email} for your signing up</Preview>
        <Body className="w-full max-w-2xl mx-auto my-10 bg-primary-background">
          {/* Header */}
          <EmailHeader />

          {/* Thank You Message */}
          <Container className="p-6">
            <EmailHeading>
              Thank you for registering interest in our little project!
            </EmailHeading>
            <Text className="mt-2 text-center text-[#A8B0A3]">
              We&apos;re building something special for archaeology and history
              lovers like yourself. You&apos;ll be among the first to know when
              we launch our beta version in 2025.
                      </Text>
                      {newsletter && (
                        <Text className="mt-2 text-center text-[#A8B0A3]">
                          As you registered interest in our newsletter, we will update you on our progress and launch date. As a subscriber (an early bird too) you'll also receive our monthly newsletter and some perks when the app launches.
                        </Text>
                      )}
          </Container>

          {/* Footer */}
          <Section className="p-6 mt-10 bg-[#18181b]">
            <Text className="text-sm text-center text-[#A8B0A3]">
              If you have any questions, reply to this email or contact our
              support team at halp@yore.earth.
            </Text>

            <Text className="mt-4 text-xs text-center text-gray-400">
              © {new Date().getFullYear()} Yore. All rights reserved.
            </Text>
          </Section>
        </Body>
      </Html>
    </EmailTailwind>
  );
}

/**
 * Order placed email
 * @param props - The props for the email
 * @returns The email component with test data
 */
const signupWelcomeEmail = (props: EmailTemplateProps) => (
  <SignupWelcomeEmailTemplate {...props} />
);

export { signupWelcomeEmail };

/**
 * Order placed email
 * @example This is a mock email for testing purposes.
 */
export default () => <SignupWelcomeEmailTemplate email={"dave@yore.earth"} newsletter={true} />;
