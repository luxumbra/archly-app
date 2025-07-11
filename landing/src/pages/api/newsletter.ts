import type { APIRoute } from "astro";
import { Resend } from "resend";
import {
  signupWelcomeEmail,
  SignupWelcomeEmailTemplate,
} from "../../client/components/SignupWelcomeEmail";
import { constants } from "../../contants";

export const prerender = false;

interface TurnstileResponse {
  success: boolean;
  error_codes?: string[];
  challenge_ts?: string;
  hostname?: string;
}
async function verifyTurnstileToken(
  token: string,
  remoteip?: string
): Promise<boolean> {
  const formData = new FormData();
  formData.append("secret", constants.TURNSTILE_SECRET_KEY!);
  formData.append("response", token);
  if (remoteip) {
    formData.append("remoteip", remoteip);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        body: formData,
        method: "POST",
      }
    );

    console.log("Cloudflare response status:", response.status);
    const data: TurnstileResponse = await response.json();
    console.log("Cloudflare response data:", data);
    if (!data.success && data.error_codes) {
      console.log("Error codes:", data.error_codes);
    }

    return data.success;
  } catch (error) {
    console.error("Turnstile verification failed:", error);
    return false;
  }
}

const POST: APIRoute = async ({ request }) => {
  const resend = new Resend(constants.RESEND_API_KEY);
  try {
    console.log("=== API Request Debug ===");

    const data = await request.formData();
    const email = data.get("email") as string;
    const turnstileToken = data.get("cf-turnstile-response") as string;

    console.log("Email received:", email);
    console.log(
      "Turnstile token received:",
      turnstileToken ? "Yes (length: " + turnstileToken.length + ")" : "No"
    );
    console.log("All form data keys:", Array.from(data.keys()));

    if (!email) {
      console.log("❌ Email validation failed");

      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate required fields
    if (!email && !turnstileToken) {
      return new Response(
        JSON.stringify({
          error: "Email and security verification are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!turnstileToken) {
      console.log("❌ Turnstile token is missing");
      return new Response(
        JSON.stringify({
          error: "Security verification is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.log(
      "Secret key loaded:",
      process.env.TURNSTILE_SECRET_KEY ? "Yes" : "No"
    );
    console.log(
      "Secret key length:",
      import.meta.env.TURNSTILE_SECRET_KEY?.length
    );
    console.log("✅ All required fields are present");

    // Verify Turnstile token
    const clientIP =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For") ||
      "unknown";

    const isValidToken = await verifyTurnstileToken(turnstileToken, clientIP);

    if (!isValidToken) {
      console.log("❌ Turnstile token verification failed");
      console.log("Client IP:", clientIP);
      return new Response(
        JSON.stringify({
          error: "Security verification failed. Please try again.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.log("✅ Turnstile token verified successfully");
    console.log("Test signup:", email);
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Send welcome email to subscriber
    const { data: resendWelcomeData, error: resendWelcomeError } =
      await resend.emails.send({
        from: "Yore <hello@updates.yore.earth>",
        to: email,
        subject: "Welcome to Yore - Your Archaeological Journey Begins!",
        react: signupWelcomeEmail({ email }),
      });

    // Optional: Send notification to yourself
    const { data: adminNewSignupData, error: adminNewSignupError } =
      await resend.emails.send({
        from: "Yore <hello@updates.yore.earth>",
        to: "joinus@yore.earth", // Replace with your email
        subject: "New Yore Newsletter Signup",
        html: `
        <h2>New newsletter signup</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `,
      });
    console.log(
      "Admin notification sent:",
      adminNewSignupData,
      adminNewSignupError
    );
    console.log("Welcome email sent:", resendWelcomeData, resendWelcomeError);

    return new Response(
      JSON.stringify({ message: "Successfully subscribed!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export { POST, verifyTurnstileToken };
export type { TurnstileResponse };
