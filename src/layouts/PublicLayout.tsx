import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { AnimatedOutlet } from '@/components/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import { BrandLogo } from '@/components/BrandLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { EASE, RiseHeading } from '@/components/editorial';
import { AtomOrbits } from '@/components/Atom';
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
            ? 'border-b border-muted-200 bg-surface/90 backdrop-blur-xl'
            : 'border-b border-muted-200 bg-surface'
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
                Register
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
                        <span className="text-3xl font-semibold">{item.label}</span>
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
      {!user && <MobileRegisterBar hidden={open} />}
    </div>
  );
}

/** Phones only: a register button pinned to the bottom once the visitor scrolls past the top of the page. */
function MobileRegisterBar({ hidden }: { hidden: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && !hidden && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-muted-200 bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <div className="mx-auto flex max-w-md items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy-950">
                {COMPETITION.submissionsOpen ? 'Submissions are open' : 'Submissions are closed'}
              </p>
              <p className="truncate text-xs text-muted-500">Top prize $250</p>
            </div>
            <Link to="/register" className="btn-primary shrink-0 px-5 py-2.5">
              Register
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------------------------------------------------------
 * Footer
 * --------------------------------------------------------------------------*/

function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-blue-100">
      <div className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 pb-12 sm:gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:pb-14">
          <div className="col-span-2 max-w-xs lg:col-span-1">
            <BrandLogo variant="light" size="md" />
            <p className="mt-6 text-sm leading-relaxed text-blue-200">
              From curiosity to discovery. {COMPETITION.name} for school students in any country, judged by professionals.
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

        <div className="flex flex-col gap-2 border-t border-white/15 pb-24 pt-6 text-[13px] text-blue-200 sm:flex-row sm:justify-between lg:pb-6">
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
      <h4 className="mb-4 text-sm font-semibold text-white">{title}</h4>
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
 * Page masthead — the blue band at the top of inner pages, with the atom from
 * the logo. Pass `sections` to add a sticky "on this page" bar below it.
 * `eyebrow` is accepted for old call sites but not shown.
 * --------------------------------------------------------------------------*/

export interface PageSection {
  id: string;
  label: string;
}

export function PageMasthead({
  title,
  intro,
  sections,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  sections?: PageSection[];
}) {
  const reduce = useReducedMotion();
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <motion.div
          className="pointer-events-none absolute -right-60 top-[calc(50%-15rem)] h-[30rem] w-[30rem] opacity-25 sm:-right-24 sm:opacity-70 lg:right-0 lg:top-[calc(50%-17rem)] lg:h-[34rem] lg:w-[34rem]"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 140, ease: 'linear', repeat: Infinity }}
        >
          <AtomOrbits className="h-full w-full" />
        </motion.div>
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 md:pb-20 md:pt-20">
          <RiseHeading text={title} className="max-w-3xl text-4xl text-white sm:text-5xl lg:text-[3.6rem]" />
          {intro && (
            <motion.p
              className="mt-6 max-w-2xl text-lg leading-relaxed text-blue-100 md:text-xl"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
            >
              {intro}
            </motion.p>
          )}
        </div>
      </section>
      {sections && sections.length > 0 && <SectionNav sections={sections} />}
    </>
  );
}

/** Sticky row of links to the page's sections; the one in view is highlighted. */
function SectionNav({ sections }: { sections: PageSection[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-35% 0px -60% 0px' }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  // Keep the highlighted pill visible when the row is wider than the screen.
  const rowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = rowRef.current;
    const pill = row?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (row && pill) row.scrollTo({ left: pill.offsetLeft - row.clientWidth / 2 + pill.offsetWidth / 2, behavior: 'smooth' });
  }, [active]);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav aria-label="On this page" className="sticky top-16 z-30 border-b border-muted-200 bg-surface/90 backdrop-blur-xl">
      <div ref={rowRef} className="relative mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 py-2.5 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <a
              key={s.id}
              data-section={s.id}
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                go(s.id);
              }}
              aria-current={isActive ? 'location' : undefined}
              className={`relative shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-muted-600 hover:text-navy-950'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="section-nav-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <span className="relative">{s.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

/** Kept for old call sites; blue surfaces no longer carry a background grid. */
export function HeroBackdrop() {
  return null;
}

/** Heading for a block inside a page (inner pages). */
export function SectionHeading({ title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-10 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-3xl md:text-4xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
