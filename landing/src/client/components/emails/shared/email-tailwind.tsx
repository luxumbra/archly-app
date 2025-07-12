import { Tailwind } from "@react-email/components";

export default function EmailTailwind({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              "primary-background": "#1F2732",
              "secondary-background": "#7A8EC4",
              primary: "#7B8C55",
              secondary: "#7A8EC4",
            },
          },
        },
      }}
    >
      {children}
    </Tailwind>
  );
}
