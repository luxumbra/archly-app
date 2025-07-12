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
              "primary-background": "#18181b",
              "secondary-background": "#a8b0a3",
              primary: "#b87333",
              secondary: "#a8b0a3",
            },
          },
        },
      }}
    >
      {children}
    </Tailwind>
  );
}
