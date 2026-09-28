import { openToAll } from './policies.js';

/**
 * One workshop session at the makerspace: a title, a number of places, maybe a
 * room, and the people who have booked or are waiting.
 *
 * The invariant — true after every operation, whatever a caller does:
 *   1. never more people booked than `capacity`;
 *   2. nobody appears twice, across booked and waiting together;
 *   3. nobody waits while a place is free.
 *
 * Task 1 is the constructor, the getters for what it stores, and label().
 * Task 2 is everything to do with bookings.
 * Task 3 adds the policy.
 */
export class Session {
  // Subgoal: make the state private.
  //   Declare the fields this type keeps here, each starting with #.

  /**
   * @param {object} details
   * @param {string} details.title      required: a non-empty string — otherwise throw a TypeError
   * @param {number} details.capacity   required: a whole number, 1 or more — otherwise throw a RangeError
   * @param {string|null} [details.room]  optional: missing, undefined or null all mean "not decided yet"
   * @param {import('./policies.js').AdmissionPolicy} [details.policy]  optional (task 3): who may book
   */
  constructor({ title, capacity, room, policy } = {}) {
    // Subgoal: refuse what is required
    // Subgoal: store the required state
    // Subgoal: store each optional field as one chosen absence
    throw new Error('not implemented');
  }

  /** @returns {string} */
  get title() { throw new Error('not implemented'); }

  /** @returns {number} Read-only from outside: a caller cannot change it. */
  get capacity() { throw new Error('not implemented'); }

  /** @returns {string|null} null when no room has been decided */
  get room() { throw new Error('not implemented'); }

  /** @returns {number} places not yet booked. Derived — compute it, do not store it. */
  get spacesLeft() { throw new Error('not implemented'); }

  /** @returns {string[]} names booked, in booking order. The caller may change what you hand out. */
  get attendees() { throw new Error('not implemented'); }

  /** @returns {string[]} names waiting, first come first served. The caller may change what you hand out. */
  get waiting() { throw new Error('not implemented'); }

  /**
   * @param {string} name
   * @returns {'booked'|'waiting'|null} null for someone who is neither
   */
  statusOf(name) {
    throw new Error('not implemented');
  }

  /**
   * Books a person if there is a place, otherwise adds them to the waitlist.
   * Throws a TypeError if the person has no name, and an Error if that name is
   * already booked or waiting. (Task 3: first asks the policy, and throws an
   * Error whose message is its reason if it refuses.) A refused booking
   * changes nothing.
   *
   * @param {{ name: string, memberId?: string|null }} person
   * @returns {'booked'|'waiting'}
   */
  book(person) {
    // Subgoal: check before you change
    throw new Error('not implemented');
  }

  /**
   * Removes a person, whether booked or waiting. If they held a place and
   * someone is waiting, the first person waiting is booked into it.
   *
   * @param {string} name
   * @returns {boolean} true if they were booked or waiting, false if they were neither
   */
  cancel(name) {
    throw new Error('not implemented');
  }

  /**
   * @returns {string} "Intro to soldering · Room B · 3 of 8 places left", or
   *   "Wood turning · room to be confirmed · 3 of 3 places left" with no room
   */
  label() {
    throw new Error('not implemented');
  }
}
