import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface BaseProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  masked?: boolean;
  onToggleMask?: () => void;
}

interface InputFieldProps extends BaseProps, Omit<InputHTMLAttributes<HTMLInputElement>, "required"> {
  as?: "input";
}
interface TextareaFieldProps extends BaseProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "required"> {
  as: "textarea";
}
interface SelectFieldProps extends BaseProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, "required"> {
  as: "select";
  options: { value: string; label: string }[];
}

type ProfileFormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

const fieldClass = `
  w-full px-4 py-2.5 bg-[#07172b] border border-[rgba(112,145,190,.25)]
  rounded-xl text-white text-sm placeholder:text-[#718096]
  focus:outline-none focus:border-[rgba(71,118,255,.6)] focus:ring-1 focus:ring-[rgba(71,118,255,.3)]
  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
`;

export function ProfileFormField(props: ProfileFormFieldProps) {
  const { label, error, hint, required, masked, onToggleMask, as, ...rest } = props;

  const id = typeof rest.id === "string" ? rest.id : `field_${label.toLowerCase().replace(/\s+/g, "_")}`;

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-[#aab6c9] mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5" aria-label="majburiy">*</span>}
      </label>

      <div className="relative">
        {as === "textarea" ? (
          <textarea
            id={id}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            className={`${fieldClass} resize-none min-h-[100px] ${error ? "border-red-500/50" : ""} ${rest.className ?? ""}`}
          />
        ) : as === "select" ? (
          <select
            id={id}
            {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}
            className={`${fieldClass} ${error ? "border-red-500/50" : ""} ${rest.className ?? ""}`}
          >
            {(props as SelectFieldProps).options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0a1b30]">
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
            type={masked ? "password" : ((rest as InputHTMLAttributes<HTMLInputElement>).type ?? "text")}
            className={`${fieldClass} ${error ? "border-red-500/50" : ""} ${onToggleMask ? "pr-10" : ""} ${rest.className ?? ""}`}
          />
        )}

        {onToggleMask && (
          <button
            type="button"
            onClick={onToggleMask}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-white transition-colors text-xs"
          >
            {masked ? "Ko'rish" : "Yashirish"}
          </button>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-400" role="alert">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-[#718096]">{hint}</p>}
    </div>
  );
}
