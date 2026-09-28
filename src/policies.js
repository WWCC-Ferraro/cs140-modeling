/**
 * The contract a Session relies on. Nothing in JavaScript checks it: any object
 * with this method, behaving this way, will do.
 *
 * @typedef {Object} AdmissionPolicy
 * @property {(person: Person) => string|null} reasonToRefuse
 *
 *   Returns null when this person may book — null, never undefined, never "".
 *   Otherwise returns a short reason a person could read, such as "members only".
 *   Does not change the person it is given.
 *
 *   A caller must not rely on HOW the decision is made: what the policy keeps,
 *   or which of the person's fields it reads.
 *
 * @typedef {Object} Person
 * @property {string} name
 * @property {string|null} [memberId]  optional: missing, undefined, null or "" all mean "not a member"
 */

/** Everyone may book. */
export const openToAll = {
  reasonToRefuse(person) {
    throw new Error('not implemented');
  },
};

/**
 * Refuses anyone without a member id, with the reason "members only".
 * @returns {AdmissionPolicy}
 */
export function membersOnly() {
  throw new Error('not implemented');
}

/**
 * Refuses anyone whose name is not on the list, with the reason "invitation only".
 * Later changes to the array you passed in do not change who is invited.
 * @param {string[]} names
 * @returns {AdmissionPolicy}
 */
export function invitedOnly(names) {
  throw new Error('not implemented');
}

/**
 * Holds several policies and asks each in turn. Refuses with the reason of the
 * first one that refuses; admits only when every one admits. With no policies
 * at all, admits.
 * @param {...AdmissionPolicy} policies
 * @returns {AdmissionPolicy}
 */
export function allOf(...policies) {
  throw new Error('not implemented');
}
