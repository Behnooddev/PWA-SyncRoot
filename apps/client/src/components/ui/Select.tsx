import type { SelectHTMLAttributes } from "react";
import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  options: SelectOption[];
}

/**
 * Native <select>, not a custom listbox — a real gap until now (nothing
 * before Phase 7 needed a dropdown). A native element gets keyboard
 * navigation, mobile-native picker UI, and screen-reader semantics for
 * free; a from-scratch listbox would have to rebuild all three just to
 * look slightly more "on-brand", which isn't worth it for a form field.
 */
export function Select({ label, options, className, id, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-text-secondary text-sm font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "border-border-strong bg-bg-elevated text-text-primary h-10 w-full appearance-none rounded-[var(--radius-control)] border px-3 pr-9 text-sm",
            "focus:border-accent transition-colors outline-none",
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="text-text-tertiary pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
      </div>
    </div>
  );
}
