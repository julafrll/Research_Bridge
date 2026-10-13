import { type ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const variantConfig: Record<
  AlertVariant,
  { container: string; icon: ReactNode }
> = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Info className="h-5 w-5 text-blue-500" />,
  },
  success: {
    container: 'bg-success-50 border-success-100 text-success-700',
    icon: <CheckCircle className="h-5 w-5 text-success-500" />,
  },
  warning: {
    container: 'bg-warning-50 border-warning-100 text-warning-700',
    icon: <AlertCircle className="h-5 w-5 text-warning-500" />,
  },
  error: {
    container: 'bg-error-50 border-error-100 text-error-700',
    icon: <XCircle className="h-5 w-5 text-error-500" />,
  },
};

export function Alert({ variant = 'info', title, children, className = '' }: AlertProps) {
  const config = variantConfig[variant];
  return (
    <div
      className={`flex gap-3 rounded-lg border px-4 py-3 ${config.container} ${className}`}
    >
      <div className="flex-shrink-0">{config.icon}</div>
      <div className="flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
