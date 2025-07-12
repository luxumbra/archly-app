export const constants = {
  TURNSTILE_SITE_KEY:
    import.meta.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    "0x4AAAAAABkrQwMkIo4ajpz9",
  RESEND_API_KEY: import.meta.env.RESEND_API_KEY || "",
  RESEND_AUDIENCE_ID: import.meta.env.RESEND_AUDIENCE_ID || "",
  RESEND_ACTIONS_KEY: import.meta.env.RESEND_ACTIONS_KEY || "",
  TURNSTILE_SECRET_KEY: import.meta.env.TURNSTILE_SECRET_KEY || "",
  BRAND_NAME: "Yore",
    CONTACT_EMAIL: "hello@yore.earth",
  SUPPORT_EMAIL: "halp@yore.earth"
};
