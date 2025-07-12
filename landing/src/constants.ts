type Socials = {
  x: string;
  instagram: string;
  facebook: string;
};

const yoreSocials: Socials = {
  x: "https://x.com/yoreearth",
  instagram: "https://www.instagram.com/yoreearth",
  facebook: "https://www.facebook.com/yoreearth",
};

// Helper function to safely get environment variables
const getEnv = (key: string, fallback: string = ""): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback;
  }
  return fallback;
};

export const constants = {
  TURNSTILE_SITE_KEY: getEnv("TURNSTILE_SITE_KEY", "0x4AAAAAABkrQwMkIo4ajpz9"),
  RESEND_API_KEY: getEnv("RESEND_API_KEY"),
  RESEND_AUDIENCE_ID: getEnv("RESEND_AUDIENCE_ID"),
  RESEND_ACTIONS_KEY: getEnv("RESEND_ACTIONS_KEY"),
  TURNSTILE_SECRET_KEY: getEnv("TURNSTILE_SECRET_KEY"),
  BRAND_NAME: "Yore",
  CONTACT_EMAIL: "hello@yore.earth",
  SUPPORT_EMAIL: "halp@yore.earth",
  SOCIALS: yoreSocials,
};
