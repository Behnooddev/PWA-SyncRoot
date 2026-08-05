import type { InputHTMLAttributes } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-text-secondary text-sm font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "border-border-strong bg-bg-elevated text-text-primary placeholder:text-text-tertiary h-10 rounded-[var(--radius-control)] border px-3 text-sm",
          "focus:border-accent transition-colors outline-none",
          error && "border-danger focus:border-danger",
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-danger text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
