// Shared motion settings: one soft spring and one smooth ease-out, so everything new moves the same way.
export const SPRING = { type: 'spring', stiffness: 380, damping: 34, mass: 0.9 } as const
export const EASE_OUT: [number, number, number, number] = [0.32, 0.72, 0, 1]
