import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedOutlet } from '@/components/PageTransition';
import { Menu, X, ArrowRight, Mail, Instagram } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BrandLogo } from '@/components/BrandLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { COMPETITION } from '@/config/competition';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Guidelines', to: '/guidelines' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Judges', to: '/judges' },
  { label: 'Winners', to: '/winners' },
  { label: 'Contact', to: '/contact' },
];

export function PublicLayout() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const accountLink = user ? (isAdmin ? '/admin' : '/dashboard') : '/login';

  return (
    <div className="flex min-h-screen flex-col bg-muted-50">
      <header className="sticky top-0 z-40 border-b border-muted-200/80 bg-muted-50/85 backdrop-blur-lg">
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
          <BrandLogo size="sm" />

          <nav className="isolate hidden items-center gap-0.5 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-navy-950' : 'text-muted-600 hover:text-navy-950'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-navy-100/80"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-1 lg:flex">
            <ThemeToggle />
            <Link to={accountLink} className="rounded-lg px-3 py-2 text-sm font-medium text-navy-800 hover:text-navy-950">
              {user ? 'My account' : 'Sign in'}
            </Link>
            {!user && (
              <Link
                to="/register"
                className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-brand-950 px-5 py-2 text-sm font-semibold text-white shadow-card transition-all hover:bg-brand-900 hover:shadow-card-hover dark:bg-teal-500 dark:text-muted-50 dark:hover:bg-teal-400"
              >
                Register <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="flex items-center lg:hidden">
            <ThemeToggle />
            <button
              className="rounded-lg p-2 text-navy-900 hover:bg-muted-100"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-muted-200 bg-surface px-4 py-3 lg:hidden animate-slide-down">
            <nav className="flex flex-col">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `border-l-2 px-3 py-2.5 text-sm font-medium ${
                      isActive ? 'border-teal-500 text-navy-950' : 'border-transparent text-muted-600'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 flex gap-2 border-t border-muted-200 pt-3">
              <Link to={accountLink} className="btn-secondary flex-1">
                {user ? 'My account' : 'Sign in'}
              </Link>
              {!user && (
                <Link to="/register" className="btn-primary flex-1">
                  Register
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <AnimatedOutlet />
      </main>

      <footer className="bg-brand-950 text-blue-100 dark:bg-[#0a1422]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <BrandLogo variant="light" size="sm" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-blue-200">
              {COMPETITION.name} — an international student research competition with professional judging.
            </p>
          </div>
          <FooterCol title="Competition">
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/guidelines">Submission guidelines</FooterLink>
            <FooterLink to="/about#judging">Judging criteria</FooterLink>
            <FooterLink to="/register">Register</FooterLink>
          </FooterCol>
          <FooterCol title="Exhibition">
            <FooterLink to="/gallery">Research gallery</FooterLink>
            <FooterLink to="/winners">Winners</FooterLink>
            <FooterLink to="/judges">Judges</FooterLink>
          </FooterCol>
          <FooterCol title="Connect">
            <FooterLink to="/contact">Contact & FAQ</FooterLink>
            {COMPETITION.contactEmail && (
              <a href={`mailto:${COMPETITION.contactEmail}`} className="flex items-center gap-2 text-sm text-blue-200 hover:text-white">
                <Mail className="h-3.5 w-3.5" /> Email us
              </a>
            )}
            {COMPETITION.instagramUrl && (
              <a href={COMPETITION.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-200 hover:text-white">
                <Instagram className="h-3.5 w-3.5" /> Instagram
              </a>
            )}
          </FooterCol>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-blue-300 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>© {new Date().getFullYear()} Research Bridge. All rights reserved.</span>
            <span className="font-serif italic">{COMPETITION.tagline}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-medium text-aqua-300">{title}</h4>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-sm text-blue-200 transition-colors hover:text-white">
      {children}
    </Link>
  );
}

/** Navy masthead used at the top of every inner public page. */
export function PageMasthead({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="relative overflow-hidden bg-brand-950 text-white dark:bg-[#0f2140]">
      <HeroBackdrop />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <p className="eyebrow-light">{eyebrow}</p>
        <h1 className="mt-5 max-w-3xl text-[2.75rem] text-white md:text-7xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-blue-100/90">{intro}</p>}
      </div>
    </section>
  );
}

/** Faint drafting grid behind navy surfaces. */
export function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 85%)',
      }}
    />
  );
}

/** Serif section heading with a thin teal rule, journal-style. */
export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-12 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-4xl text-navy-950 md:text-[2.75rem]">{title}</h2>
      </div>
      {action}
    </div>
  );
}
