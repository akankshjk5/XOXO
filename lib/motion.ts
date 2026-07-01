import type { Transition, Variants } from "framer-motion";

/** Premium easing — Apple / Linear style */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = {
  micro: 0.18,
  fast: 0.22,
  normal: 0.26,
  slow: 0.42,
  page: 0.28,
} as const;

/** Subtle reveal distance — intentional, not dramatic */
export const REVEAL_OFFSET = 20;

export const SPRING = {
  snappy: { type: "spring" as const, stiffness: 400, damping: 30 },
  soft: { type: "spring" as const, stiffness: 260, damping: 26 },
  gentle: { type: "spring" as const, stiffness: 180, damping: 22 },
};

export function transition(reduced: boolean, t: Transition = {}): Transition {
  if (reduced) return { duration: 0 };
  return { ease: EASE_OUT, ...t };
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: REVEAL_OFFSET },
  visible: (reduced: boolean) => ({
    opacity: 1,
    y: 0,
    transition: transition(reduced, { duration: DURATION.normal }),
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (reduced: boolean) => ({
    opacity: 1,
    transition: transition(reduced, { duration: DURATION.normal }),
  }),
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: (reduced: boolean) => ({
    opacity: 1,
    x: 0,
    transition: transition(reduced, { duration: DURATION.normal }),
  }),
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: (reduced: boolean) => ({
    opacity: 1,
    x: 0,
    transition: transition(reduced, { duration: DURATION.normal }),
  }),
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (reduced: boolean) => ({
    opacity: 1,
    scale: 1,
    transition: transition(reduced, { duration: DURATION.normal }),
  }),
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: (reduced: boolean) => ({
    transition: reduced ? {} : { staggerChildren: 0.06, delayChildren: 0.04 },
  }),
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (reduced: boolean) => ({
    opacity: 1,
    y: 0,
    transition: transition(reduced, { duration: DURATION.normal }),
  }),
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: (reduced: boolean) => ({
    opacity: 1,
    y: 0,
    transition: transition(reduced, { duration: DURATION.page }),
  }),
  exit: (reduced: boolean) => ({
    opacity: 0,
    y: -4,
    transition: transition(reduced, { duration: DURATION.fast }),
  }),
};

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: (reduced: boolean) => ({
    opacity: 1,
    transition: transition(reduced, { duration: DURATION.fast }),
  }),
  exit: (reduced: boolean) => ({
    opacity: 0,
    transition: transition(reduced, { duration: DURATION.fast }),
  }),
};

export const modalContent: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.96 },
  visible: (reduced: boolean) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: reduced ? { duration: 0 } : { ...SPRING.soft },
  }),
  exit: (reduced: boolean) => ({
    opacity: 0,
    y: 24,
    scale: 0.98,
    transition: transition(reduced, { duration: DURATION.fast }),
  }),
};

export const drawerPanel: Variants = {
  hidden: { x: "100%" },
  visible: (reduced: boolean) => ({
    x: 0,
    transition: reduced ? { duration: 0 } : { ...SPRING.snappy },
  }),
  exit: (reduced: boolean) => ({
    x: "100%",
    transition: transition(reduced, { duration: DURATION.fast }),
  }),
};

export const accordionContent: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: (reduced: boolean) => ({
    height: "auto",
    opacity: 1,
    transition: reduced
      ? { duration: 0 }
      : { height: { duration: DURATION.normal, ease: EASE_IN_OUT }, opacity: { duration: DURATION.fast } },
  }),
};

export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: (reduced: boolean) =>
    reduced ? {} : { y: -4, scale: 1.005, transition: { duration: DURATION.fast, ease: EASE_OUT } },
  tap: (reduced: boolean) => (reduced ? {} : { scale: 0.99, transition: { duration: 0.08 } }),
};

export const buttonTap = (reduced: boolean) =>
  reduced ? {} : { scale: 0.97, transition: { duration: 0.1 } };
