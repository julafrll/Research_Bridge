import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AtomOrbits } from '@/components/Atom';
import { COMPETITION } from '@/config/competition';

const POINTS = [
  'Submit your research paper and scientific poster',
  'Reviewed independently by professional judges',
  'Track your entry and organizer feedback in one place',
];

/** Two-panel layout for sign-in, registration and password pages. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-muted-50 lg:grid-cols-[1fr_1.1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
        <AtomOrbits animate={false} className="pointer-events-none absolute -right-48 -top-40 h-[36rem] w-[36rem] opacity-60" />
        <div className="relative">
          <BrandLogo variant="light" size="md" />
        </div>
        <div className="relative max-w-md">
          <h2 className="text-5xl leading-[1.08] text-white">From curiosity to discovery.</h2>
          <p className="mt-4 text-blue-100">{COMPETITION.name}</p>
          <ul className="mt-8 space-y-4">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-blue-100">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Check className="h-3 w-3 text-white" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-blue-200/80">© {new Date().getFullYear()} Research Bridge</p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-500 hover:text-navy-900">
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-16 pt-4 sm:px-8">
          <div className="w-full max-w-md animate-slide-up">
            <div className="mb-8 lg:hidden">
              <BrandLogo size="md" />
            </div>
            <h1 className="text-4xl md:text-5xl">{title}</h1>
            {subtitle && <p className="mt-3 text-[17px] leading-relaxed text-muted-600">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function AuthError({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="mb-5 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
      {children}
    </div>
  );
}

export function AuthNotice({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="mb-5 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
      {children}
    </div>
  );
}
