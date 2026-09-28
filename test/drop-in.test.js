// Task 4 — src/drop-in.js.
// These tests use only createDropIn and what a Session offers, so any of the
// designs in the README passes them. Which one you chose, and why, goes in the
// README's answer section — the tests cannot judge that.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Session } from '../src/session.js';
import { membersOnly } from '../src/policies.js';
import { createDropIn } from '../src/drop-in.js';

const person = (name, memberId) =>
  Object.freeze(memberId === undefined ? { name } : { name, memberId });
const repairCafe = (capacity = 2, extra = {}) =>
  createDropIn({ title: 'Repair café', capacity, room: 'Workshop', ...extra });

test('task 4: a drop-in books people while it has places', () => {
  const d = repairCafe(2);
  assert.equal(d.book(person('Ana')), 'booked');
  assert.equal(d.book(person('Bo')), 'booked');
  assert.deepEqual(d.attendees, ['Ana', 'Bo']);
});

test('task 4: a full drop-in refuses with Error("full") and keeps no waitlist', () => {
  const d = repairCafe(1);
  d.book(person('Ana'));
  assert.throws(() => d.book(person('Bo')), { message: 'full' },
    'Booking a full drop-in should throw an Error with the message "full", instead of adding them to a waitlist.');
  assert.deepEqual(d.waiting, [], `waiting is ${JSON.stringify(d.waiting)}. A drop-in has no waitlist — nobody is added to one.`);
  assert.equal(d.statusOf('Bo'), null, 'Bo was refused, so he is not on the drop-in at all.');
});

test('task 4: a cancellation frees a place on a drop-in', () => {
  const d = repairCafe(1);
  d.book(person('Ana'));
  assert.equal(d.cancel('Ana'), true);
  assert.equal(d.spacesLeft, 1);
  assert.equal(d.book(person('Bo')), 'booked');
});

test('task 4: a drop-in offers everything a Session offers', () => {
  const d = createDropIn({ title: 'Repair café', capacity: 3 });
  d.book(person('Ana'));
  const got = {
    title: d.title, capacity: d.capacity, room: d.room, spacesLeft: d.spacesLeft,
    attendees: d.attendees, waiting: d.waiting,
    statusOf: typeof d.statusOf === 'function' ? d.statusOf('Ana') : 'no statusOf method',
    label: typeof d.label === 'function' ? d.label() : 'no label method',
    cancel: typeof d.cancel === 'function' ? d.cancel('Zed') : 'no cancel method',
  };
  assert.deepEqual(got, {
    title: 'Repair café', capacity: 3, room: null, spacesLeft: 2,
    attendees: ['Ana'], waiting: [],
    statusOf: 'booked', label: 'Repair café · room to be confirmed · 2 of 3 places left', cancel: false,
  }, 'Code written for "a session" must work when handed a drop-in. Every member a Session offers has to be there and behave the same. If you hold a Session, a member you did not forward does not exist on the holder.');
});

test('task 4: code written for any session works unchanged on a drop-in', () => {
  const summary = s => `${s.label()} — ${s.attendees.join(', ') || 'nobody yet'}`;
  const plain = new Session({ title: 'Repair café', capacity: 2, room: 'Workshop' });
  const d = repairCafe(2);
  for (const s of [plain, d]) s.book(person('Ana'));
  assert.equal(summary(d), summary(plain), 'The same function, given a Session and a drop-in in the same state, should say the same thing.');
});

test('task 4: a drop-in keeps the Session\'s rules — required fields, policies, private state', () => {
  assert.throws(() => createDropIn({ title: '', capacity: 2 }), TypeError, 'A drop-in with no title should be refused like any Session.');
  assert.throws(() => createDropIn({ title: 'Repair café', capacity: 0 }), RangeError, 'A drop-in with capacity 0 should be refused like any Session.');

  const members = repairCafe(2, { policy: membersOnly() });
  assert.throws(() => members.book(person('Bo')), { message: 'members only' }, 'The drop-in should still ask its policy.');

  const d = repairCafe(1);
  d.book(person('Ana'));
  d.attendees.push('Mallory');
  try { d.capacity = 50; } catch { /* fine */ }
  assert.deepEqual(d.attendees, ['Ana'], 'Pushing onto a drop-in\'s attendees changed it. Whatever it hands out must still be a copy.');
  assert.throws(() => d.book(person('Bo')), { message: 'full' }, 'A caller set capacity = 50 on a 1-place drop-in and got a second booking in. Its capacity must be as private as a Session\'s.');
});

test('task 4: making a drop-in does not change ordinary sessions', () => {
  repairCafe(1);
  const plain = new Session({ title: 'Intro to soldering', capacity: 1 });
  plain.book(person('Ana'));
  let result;
  assert.doesNotThrow(() => { result = plain.book(person('Bo')); },
    'After a drop-in was made, an ordinary full Session threw instead of waitlisting. Did drop-in.js change something every Session shares — Session.prototype, or a field every session reads?');
  assert.equal(result, 'waiting');
});
