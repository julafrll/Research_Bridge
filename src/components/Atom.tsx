/**
 * The atom from the Research Bridge logo, drawn as SVG so it stays sharp at
 * any size: three orbits (one upright, two tilted 30°), an electron at the end
 * of each, and a nucleus in the middle.
 */
import { motion, useReducedMotion } from 'framer-motion';

const ORBIT_ANGLES = [90, 30, -30] as const;

/** Ellipse as a path, so it can be drawn in and used as a motion path. */
function orbitPath(rx: number, ry: number) {
  return `M ${-rx} 0 A ${rx} ${ry} 0 1 0 ${rx} 0 A ${rx} ${ry} 0 1 0 ${-rx} 0`;
}

/**
 * Small logo mark: the atom inside a filled circle, as in the round logo.
 * `tone="blue"` is the blue disc with light orbits; `tone="light"` is the grey
 * disc with blue orbits.
 */
export function AtomMark({ className = 'h-10 w-10', tone = 'blue' }: { className?: string; tone?: 'blue' | 'light' }) {
  const disc = tone === 'blue' ? '#2a4d88' : '#d9d9d8';
  const strokes = tone === 'blue' ? ['#7c94b8', '#ffffff', '#b1bbcb'] : ['#b1bbcb', '#2a4d88', '#7c94b8'];
  const nucleus = tone === 'blue' ? '#ffffff' : '#2a4d88';
  return (
    <svg viewBox="-50 -50 100 100" className={className} role="img" aria-label="Research Bridge">
      <circle r="50" fill={disc} />
      {ORBIT_ANGLES.map((angle, i) => (
        <g key={angle} transform={`rotate(${angle})`}>
          <ellipse rx="29" ry="10.5" fill="none" stroke={strokes[i]} strokeWidth="3.6" />
          <circle cx="29" r="3.6" fill={strokes[i]} />
          <circle cx="-29" r="3.6" fill={strokes[i]} />
        </g>
      ))}
      <circle r="6.5" fill={nucleus} />
    </svg>
  );
}

/**
 * Large decorative orbits for blue surfaces. They draw in once on load, then
 * one electron per orbit travels slowly. With reduced motion, everything is
 * shown at rest.
 */
export function AtomOrbits({ className = '', animate = true }: { className?: string; animate?: boolean }) {
  const reduce = useReducedMotion();
  const play = animate && !reduce;
  const rx = 46;
  const ry = 16;
  const d = orbitPath(rx, ry);
  const colors = ['#7c94b8', '#e3e9f3', '#b1bbcb'];
  const durations = [26, 34, 30];
  return (
    <svg viewBox="-50 -50 100 100" className={`overflow-visible ${className}`} aria-hidden>
      {ORBIT_ANGLES.map((angle, i) => (
        <g key={angle} transform={`rotate(${angle})`}>
          <motion.path
            d={d}
            fill="none"
            stroke={colors[i]}
            strokeOpacity={i === 1 ? 0.9 : 0.6}
            strokeWidth={0.24}
            initial={play ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.2 }}
          />
          {play ? (
            <circle r="1.1" fill={colors[i]} opacity="0">
              <animateMotion dur={`${durations[i]}s`} begin={`${1.8 + i * 0.3}s`} repeatCount="indefinite" path={d} />
              <animate attributeName="opacity" from="0" to="1" dur="0.6s" begin={`${1.8 + i * 0.3}s`} fill="freeze" />
            </circle>
          ) : (
            <circle cx={rx} r="1.1" fill={colors[i]} />
          )}
        </g>
      ))}
      <motion.circle
        r="3.2"
        fill="#ffffff"
        initial={play ? { scale: 0, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.1 }}
      />
    </svg>
  );
}
