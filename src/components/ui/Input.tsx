import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input-field ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-100' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-error-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-muted-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label-text">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`input-field min-h-[100px] resize-y ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-100' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-error-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-muted-400">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', id, children, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label-text">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`input-field cursor-pointer ${error ? 'border-error-500' : ''} ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1.5 text-xs text-error-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
