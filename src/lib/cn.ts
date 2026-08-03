import clsx, { type ClassValue } from 'clsx';

/** Class-name joiner. Kept as its own module so components import one helper. */
export const cn = (...inputs: ClassValue[]) => clsx(inputs);
