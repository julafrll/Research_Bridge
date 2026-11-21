import { Link } from 'react-router-dom';
import { AtomMark } from '@/components/Atom';

interface BrandLogoProps {
  href?: string;
  /** `light` for blue surfaces, `dark` for light surfaces. */
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

const markSize = { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-16 w-16' };
const wordSize = {
  sm: ['text-[0.6rem]', 'text-[1.05rem]'],
  md: ['text-[0.68rem]', 'text-[1.2rem]'],
  lg: ['text-[0.85rem]', 'text-[1.6rem]'],
};

/** The Research Bridge lockup: atom mark plus the two-weight wordmark. */
export function BrandLogo({ href = '/', variant = 'dark', size = 'md', showTagline = false }: BrandLogoProps) {
  const onBlue = variant === 'light';
  const content = (
    <div className="flex items-center gap-3">
      <AtomMark className={`${markSize[size]} shrink-0`} tone={onBlue ? 'light' : 'blue'} />
      <div className="leading-none">
        <span
          className={`block font-light tracking-[0.28em] ${wordSize[size][0]} ${onBlue ? 'text-[#d9d9d8]' : 'text-navy-600'}`}
        >
          RESEARCH
        </span>
        <span className={`mt-0.5 block font-bold tracking-[0.02em] ${wordSize[size][1]} ${onBlue ? 'text-white' : 'text-navy-950'}`}>
          BRIDGE
        </span>
        {showTagline && (
          <span className={`mt-1.5 block text-xs ${onBlue ? 'text-blue-200' : 'text-muted-500'}`}>
            From curiosity to discovery.
          </span>
        )}
      </div>
    </div>
  );

  return href ? (
    <Link to={href} aria-label="Research Bridge home">
      {content}
    </Link>
  ) : (
    content
  );
}
