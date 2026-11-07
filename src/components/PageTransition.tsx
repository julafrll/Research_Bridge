import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';

/**
 * Drop-in replacement for <Outlet /> that cross-fades between pages:
 * the old page lifts away quickly, the new one settles in.
 * Reduced-motion users get an instant swap (MotionConfig in App).
 */
export function AnimatedOutlet({ scrollToTop = true }: { scrollToTop?: boolean }) {
  const location = useLocation();
  // Freeze the outlet element per location so the exiting page keeps
  // rendering its own content while it animates out.
  const outlet = useOutlet();

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => {
        if (scrollToTop && !location.hash) window.scrollTo({ top: 0 });
      }}
    >
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } }}
        exit={{ opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
