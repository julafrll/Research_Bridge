import { Link } from 'react-router-dom';

interface BrandLogoProps {
  href?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
};

export function BrandLogo({
  href = '/',
  variant = 'dark',
  size = 'md',
  showTagline = false,
}: BrandLogoProps) {
  const content = (
    <div className="flex items-center gap-3">
      <img
        src="/Research_Bridge_Logo-selection.png"
        alt="Research Bridge"
        className={`${sizeClasses[size]} shrink-0 rounded-full object-cover`}
      />
      <div className="leading-none">
        <span
          className={`block text-[0.68rem] font-medium uppercase tracking-[0.24em] ${
            variant === 'light' ? 'text-blue-100' : 'text-navy-500'
          }`}
        >
          Research
        </span>
        <span
          className={`mt-1 block text-lg font-bold uppercase tracking-[0.08em] ${
            variant === 'light' ? 'text-white' : 'text-navy-900'
          }`}
        >
          Bridge
        </span>
        {showTagline && (
          <span
            className={`mt-1.5 block text-xs tracking-wide ${
              variant === 'light' ? 'text-blue-200' : 'text-muted-500'
            }`}
          >
            From Curiosity to Discovery.
          </span>
        )}
      </div>
    </div>
  );

  return href ? <Link to={href}>{content}</Link> : content;
}
