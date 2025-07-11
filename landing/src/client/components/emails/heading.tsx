import { Heading } from "@react-email/components";

export default function EmailHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Heading className="text-2xl font-bold text-center text-[#B87333]">
      {children}
    </Heading>
  );
}
