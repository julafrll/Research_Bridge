import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Menu, X } from 'lucide-react';
import { AnimatedOutlet } from '@/components/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import { BrandLogo } from '@/components/BrandLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BridgeArch, EASE, Reveal } from '@/components/editorial';
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

function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

export function PublicLayout() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const scrolled = useScrolled();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const accountLink = user ? (isAdmin ? '/admin' : '/dashboard') : '/login';

  return (
    <div className="flex min-h-screen flex-col bg-muted-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <header
        className={`sticky top-0 z-40 transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled || open
            ? 'border-b border-muted-200 bg-muted-50/90 backdrop-blur-xl'
            : 'border-b border-transparent bg-muted-50'
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 transition-[height] duration-300 sm:px-8 ${
            scrolled ? 'h-16' : 'h-20'
          }`}
        >
          <BrandLogo size="sm" />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative px-3 py-2 text-[14px] font-medium transition-colors duration-200 ${
                    isActive ? 'text-navy-950' : 'text-muted-500 hover:text-navy-950'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-teal-500"
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-1 lg:flex">
            <ThemeToggle />
            <Link to={accountLink} className="btn-ghost">
              {user ? 'My account' : 'Sign in'}
            </Link>
            {!user && (
              <Link to="/register" className="btn-primary group">
                Register <ArrowRight className="arrow" />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-md text-navy-950 hover:bg-muted-100"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu: full-screen, large serif links */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 flex flex-col overflow-y-auto bg-muted-50 px-5 pb-10 pt-24 sm:px-8 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <nav className="flex flex-col" aria-label="Main">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: EASE, delay: 0.03 * i }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-baseline justify-between border-b border-muted-200 py-4 ${
                        isActive ? 'text-navy-950' : 'text-navy-700'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="display text-4xl">{item.label}</span>
                        {isActive && <span className="h-2 w-2 rounded-full bg-teal-500" />}
                      </>
                    )}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
            <motion.div
              className="mt-auto grid grid-cols-2 gap-3 pt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <Link to={accountLink} className="btn-secondary py-3.5">
                {user ? 'My account' : 'Sign in'}
              </Link>
              {!user ? (
                <Link to="/register" className="btn-primary py-3.5">
                  Register
                </Link>
              ) : (
                <span />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="main" className="flex-1">
        <AnimatedOutlet />
      </main>

      <SiteFooter />
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Footer
 * --------------------------------------------------------------------------*/

function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="grain overflow-hidden bg-ink text-blue-100">
      <div className="mx-auto max-w-7xl px-5 pt-20 sm:px-8">
        <Reveal className="grid items-end gap-10 border-b border-white/10 pb-16 lg:grid-cols-[1.4fr_1fr]">
          <p className="display text-5xl leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            From curiosity
            <br />
            to discovery.
          </p>
          <div className="h-28 w-full max-w-sm justify-self-start lg:justify-self-end">
            <BridgeArch animate={false} traveller={false} stroke="faint" />
          </div>
        </Reveal>

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <BrandLogo variant="light" size="sm" />
            <p className="mt-5 text-sm leading-relaxed text-blue-200">
              {COMPETITION.name}. Students from any country submit original research, scored by professional judges.
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
          <FooterCol title="Contact">
            <FooterLink to="/contact">Questions and FAQ</FooterLink>
            {COMPETITION.contactEmail && (
              <a href={`mailto:${COMPETITION.contactEmail}`} className="text-sm text-blue-200 transition-colors hover:text-white">
                {COMPETITION.contactEmail}
              </a>
            )}
            {COMPETITION.instagramUrl && (
              <a href={COMPETITION.instagramUrl} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 text-sm text-blue-200 transition-colors hover:text-white">
                Instagram <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            )}
          </FooterCol>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-[13px] text-blue-300 sm:flex-row sm:justify-between">
          <span>© {year} Research Bridge</span>
          <span>{COMPETITION.edition}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="mb-5 text-[13px] font-medium text-aqua-300">{title}</h4>
      <div className="flex flex-col items-start gap-3">{children}</div>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="bg-gradient-to-r from-white to-white bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-px text-sm text-blue-200 transition-[background-size,color] duration-300 hover:bg-[length:100%_1px] hover:text-white"
    >
      {children}
    </Link>
  );
}

/* ----------------------------------------------------------------------------
 * Page masthead — light, editorial, with a margin rail.
 * --------------------------------------------------------------------------*/

export function PageMasthead({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-x-12 gap-y-6 px-5 pb-16 pt-14 sm:px-8 md:pb-24 md:pt-20 lg:grid-cols-[11rem_1fr]">
        <motion.p
          className="text-[13px] font-medium text-teal-600 lg:pt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {eyebrow}
        </motion.p>
        <div>
          <motion.h1
            className="max-w-4xl text-[3.25rem] leading-[0.98] sm:text-7xl lg:text-[5.5rem]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            {title}
          </motion.h1>
          {intro && (
            <motion.p
              className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-600 md:text-xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            >
              {intro}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}

/** Faint drafting grid behind ink surfaces. */
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

/** Heading for a block inside a page (inner pages). */
export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-10 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-3 text-[13px] font-medium text-teal-600">{eyebrow}</p>}
        <h2 className="text-4xl md:text-5xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
