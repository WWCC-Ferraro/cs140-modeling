import { Session } from './session.js';

/*
 * Task 4. A drop-in session is a Session with no waitlist: when it is full,
 * book throws Error("full") instead of adding anyone to a waitlist. Everything
 * else a Session does, a drop-in does the same way.
 *
 * How you build it is your decision — the README lists the designs. Whatever
 * you choose, createDropIn is how the rest of the program makes one, so the
 * tests only ever call this.
 */

/**
 * @param {object} details  the same details a Session takes
 * @returns a drop-in session: everything a Session offers, but no waitlist
 */
export function createDropIn(details) {
  throw new Error('not implemented');
}
