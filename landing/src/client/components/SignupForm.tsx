import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

import type { FormEvent } from "react";
import { constants } from "../../contants";

interface MessageState {
  text: string;
  type: "success" | "error" | null;
}

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<MessageState>({
    text: "",
    type: null,
  });
  const [turnstileToken, setTurnstileToken] = useState("");

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });

    // Hide message after 5 seconds
    setTimeout(() => {
      setMessage({ text: "", type: null });
    }, 5000);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form data:", { email, turnstileToken });
    if (!email.trim()) {
      showMessage("Please enter your email address.", "error");
      return;
    }

    if (!turnstileToken) {
      showMessage("Please complete the security verification.", "error");
      return;
    }

    setIsLoading(true);
    console.log("Turnstile token:", turnstileToken);
    console.log("Token length:", turnstileToken?.length);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("cf-turnstile-response", turnstileToken);
      console.log("FormData entries:", Array.from(formData.entries()));

      const response = await fetch("/api/newsletter", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(
          "Thanks for signing up! Check your email for confirmation.",
          "success"
        );
        setEmail("");
      } else {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        showMessage(
          result.error || "Something went wrong. Please try again.",
          "error"
        );
      }
    } catch (error) {
      showMessage("Network error. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center max-w-md gap-4 mx-auto newsletter-form"
    >
      <div className="flex items-center justify-center gap-2 form-group">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          className="flex-1 px-4 py-3 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-lg email-input focus:border-yore-primary focus:outline-none"
          disabled={isLoading}
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={isLoading || !turnstileToken}
          className="px-8 py-3 text-white transition-all rounded-lg submit-button bg-yore-primary hover:bg-yore-primary/90 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600"
        >
          {isLoading ? "Signing up..." : "Sign up"}
        </button>
      </div>
      {/* Turnstile Widget */}
      <div className="flex justify-center mb-4">
        <Turnstile
          siteKey={constants.TURNSTILE_SITE_KEY}
          onSuccess={setTurnstileToken}
          onError={() => setTurnstileToken("")}
          onExpire={() => setTurnstileToken("")}
        />
      </div>
      {message.type && (
        <div
          className={`message ${message.type} ${
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/30"
              : "bg-red-500/10 text-red-400 border border-red-500/30"
          }`}
        >
          {message.text}
        </div>
      )}
    </form>
  );
}

export { SignupForm };
