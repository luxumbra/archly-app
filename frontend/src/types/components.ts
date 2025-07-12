import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes } from 'react';
import type { User } from './index';

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Button component props
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

// Input component props
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

// Label component props
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: ReactNode;
}

// Input error component props
export interface InputErrorProps {
  message?: string;
  className?: string;
}

// Dropdown component props
export interface DropdownProps {
  align?: 'left' | 'right';
  width?: string;
  contentClasses?: string;
  trigger: ReactNode;
  children: ReactNode;
}

export interface DropdownLinkProps {
  href?: string;
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
  as?: 'button' | 'a';
  children: ReactNode;
  onClick?: () => void;
}

// Navigation component props
export interface NavLinkProps {
  active?: boolean;
  href: string;
  children: ReactNode;
  className?: string;
}

export interface ResponsiveNavLinkProps {
  active?: boolean;
  href: string;
  children: ReactNode;
  className?: string;
}

// Layout component props
export interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export interface HeaderProps {
  user?: User;
}

export interface NavigationProps {
  user?: User;
}

// Auth status component props
export interface AuthSessionStatusProps {
  status?: string | null;
  className?: string;
}

// Loading component props
export interface LoadingProps {
  message?: string;
  className?: string;
}

// Application logo props
export interface ApplicationLogoProps {
  className?: string;
}

// Safe HTML content props
export interface SafeHTMLContentProps {
  content: string;
  className?: string;
  allowedTags?: string[];
}

// User profile props
export interface UserProfileProps {
  user: User;
  className?: string;
}