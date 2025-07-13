import useSWR from "swr";
import axios from "@/lib/axios";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  AuthHookReturn,
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordForm,
  ResetPasswordForm,
  ValidationErrors,
} from "@/types";

interface AuthParams {
  middleware?: "auth" | "guest";
  redirectIfAuthenticated?: string;
}

export const useAuth = ({
  middleware,
  redirectIfAuthenticated,
}: AuthParams = {}): AuthHookReturn => {
  const router = useRouter();

  const {
    data: user,
    error,
    mutate,
  } = useSWR<User>(
    "/user", 
    async () => {
      try {
        const response = await axios.get<User>("/user");
        return response.data;
      } catch (error: unknown) {
        // Don't throw 401 errors - just return null for unauthenticated users
        if (error && typeof error === 'object' && 'response' in error && 
            error.response && typeof error.response === 'object' && 
            'status' in error.response && error.response.status === 401) {
          return null;
        }
        throw error;
      }
    },
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 0,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  const register = async ({
    setErrors,
    ...props
  }: RegisterCredentials & {
    setErrors: (errors: ValidationErrors) => void;
  }) => {
    await csrf();
    setErrors({});

    try {
      await axios.post("/register", props);
      mutate();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status !== 422) throw error;
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'errors' in error.response.data) {
        setErrors(error.response.data.errors as ValidationErrors);
      }
    }
  };

  const login = async ({
    setErrors,
    setStatus,
    ...props
  }: LoginCredentials & {
    setErrors: (errors: ValidationErrors) => void;
    setStatus: (status: string | null) => void;
  }) => {
    await csrf();
    setErrors({});
    setStatus(null);

    try {
      await axios.post("/login", props);
      mutate();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status !== 422) throw error;
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'errors' in error.response.data) {
        setErrors(error.response.data.errors as ValidationErrors);
      }
    }
  };

  const forgotPassword = async ({
    setErrors,
    setStatus,
    email,
  }: ForgotPasswordForm & {
    setErrors: (errors: ValidationErrors) => void;
    setStatus: (status: string | null) => void;
  }) => {
    await csrf();
    setErrors({});
    setStatus(null);

    try {
      const response = await axios.post("/forgot-password", { email });
      setStatus(response.data.status);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status !== 422) throw error;
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'errors' in error.response.data) {
        setErrors(error.response.data.errors as ValidationErrors);
      }
    }
  };

  const resetPassword = async ({
    setErrors,
    setStatus,
    ...props
  }: ResetPasswordForm & {
    setErrors: (errors: ValidationErrors) => void;
    setStatus: (status: string | null) => void;
  }) => {
    await csrf();
    setErrors({});
    setStatus(null);

    try {
      const response = await axios.post("/reset-password", {
        // token: params.token,
        ...props,
      });
      router.push("/login?reset=" + btoa(response.data.status));
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status !== 422) throw error;
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'errors' in error.response.data) {
        setErrors(error.response.data.errors as ValidationErrors);
      }
    }
  };

  const resendEmailVerification = ({
    setStatus,
  }: {
    setStatus: (status: string) => void;
  }) => {
    axios
      .post("/email/verification-notification")
      .then((response) => setStatus(response.data.status));
  };

  const logout = useCallback(async () => {
    if (!error) {
      await axios.post("/logout").then(() => mutate());
    }
    window.location.pathname = "/login";
  }, [error, mutate]);

  useEffect(() => {
    if (middleware === "guest" && redirectIfAuthenticated && user)
      router.push(redirectIfAuthenticated);
    if (window.location.pathname === "/verify-email" && user?.email_verified_at)
      router.push(redirectIfAuthenticated || "/dashboard");
    if (middleware === "auth" && error) logout();
  }, [user, error, logout, middleware, redirectIfAuthenticated, router]);

  return {
    user,
    register,
    login,
    forgotPassword,
    resetPassword,
    resendEmailVerification,
    logout,
  };
};
