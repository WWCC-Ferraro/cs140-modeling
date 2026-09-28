// Tasks 1 and 2 — src/session.js.
// Each test checks one behaviour. When one fails, its message says what was
// expected, what came back, and which idea to look at again.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Session } from '../src/session.js';

const person = name => Object.freeze({ name });
const soldering = (capacity = 2, extra = {}) =>
  new Session({ title: 'Intro to soldering', capacity, room: 'Room B', ...extra });

// ── Task 1 · What a session holds ─────────────────────────────────────────

test('task 1: a session keeps its title and capacity', () => {
  const s = soldering(8);
  assert.equal(s.title, 'Intro to soldering', `title came back as ${JSON.stringify(s.title)}. The constructor should store what it was given, and a getter hand it out.`);
  assert.equal(s.capacity, 8, `capacity came back as ${JSON.stringify(s.capacity)}; expected 8.`);
});

test('task 1: a session with no title, or an empty one, is refused with a TypeError', () => {
  for (const title of [undefined, '', 42]) {
    assert.throws(() => new Session({ title, capacity: 4 }), TypeError,
      `new Session({ title: ${JSON.stringify(title)}, capacity: 4 }) should throw a TypeError. A required field is refused in the constructor — see "Designing a type", the table of required, optional and derived.`);
  }
});

test('task 1: capacity must be a whole number, 1 or more — anything else is a RangeError', () => {
  for (const capacity of [0, -3, 2.5, '8', undefined]) {
    assert.throws(() => new Session({ title: 'Knife sharpening', capacity }), RangeError,
      `capacity ${JSON.stringify(capacity)} should be refused with a RangeError. Check it is a number, whole, and at least 1 — a string "8" is not a number.`);
  }
});

test('task 1: a missing room is stored as null, however it went missing', () => {
  const cases = [
    ['no room key at all', new Session({ title: 'Wood turning', capacity: 3 })],
    ['room: undefined', new Session({ title: 'Wood turning', capacity: 3, room: undefined })],
    ['room: null', new Session({ title: 'Wood turning', capacity: 3, room: null })],
  ];
  for (const [how, s] of cases) {
    assert.equal(s.room, null, `With ${how}, room came back as ${String(s.room)}. JavaScript has two absences; the type decides once which one it stores, so every reader has one "nothing" to check for.`);
  }
});

test('task 1: label names the room, or says it is to be confirmed', () => {
  assert.equal(soldering(8).label(), 'Intro to soldering · Room B · 8 of 8 places left');
  const tbc = new Session({ title: 'Wood turning', capacity: 3 }).label();
  assert.equal(tbc, 'Wood turning · room to be confirmed · 3 of 3 places left',
    `label() gave ${JSON.stringify(tbc)}. An optional field is guarded where it is read — does label check the one absence the constructor stored?`);
});

// ── Task 2 · Bookings nothing outside can break ───────────────────────────

test('task 2: book returns "booked" while there are places, and attendees keeps booking order', () => {
  const s = soldering(3);
  assert.equal(s.book(person('Ana')), 'booked');
  assert.equal(s.book(person('Bo')), 'booked');
  assert.deepEqual(s.attendees, ['Ana', 'Bo'], `attendees came back as ${JSON.stringify(s.attendees)}. It should list names, in the order they booked.`);
  assert.equal(s.spacesLeft, 1, `spacesLeft is ${s.spacesLeft} with 2 of 3 booked. It is derived: capacity minus the number booked.`);
});

test('task 2: when the session is full, book returns "waiting" and adds them to the waitlist', () => {
  const s = soldering(1);
  s.book(person('Ana'));
  const result = s.book(person('Bo'));
  assert.equal(result, 'waiting', `The second booking on a 1-place session returned ${JSON.stringify(result)}.`);
  assert.deepEqual(s.attendees, ['Ana'], 'A full session must not book anyone else — rule 1 of the invariant.');
  assert.deepEqual(s.waiting, ['Bo'], `waiting came back as ${JSON.stringify(s.waiting)}.`);
  assert.equal(s.spacesLeft, 0);
});

test('task 2: statusOf answers "booked", "waiting", or null for someone who is neither', () => {
  const s = soldering(1);
  s.book(person('Ana'));
  s.book(person('Bo'));
  assert.equal(s.statusOf('Ana'), 'booked');
  assert.equal(s.statusOf('Bo'), 'waiting');
  const nobody = s.statusOf('Cy');
  assert.equal(nobody, null, `statusOf("Cy") returned ${String(nobody)}. The spec chose null for "not on this session" — not undefined, not false. A caller checks === null and relies on it.`);
});

test('task 2: booking the same name twice throws, and changes nothing', () => {
  const s = soldering(1);
  s.book(person('Ana'));
  s.book(person('Bo'));
  for (const name of ['Ana', 'Bo']) {
    assert.throws(() => s.book(person(name)), Error, `${name} is already on the session (booked or waiting). A second booking should throw — rule 2 of the invariant.`);
  }
  assert.deepEqual([s.attendees, s.waiting], [['Ana'], ['Bo']], 'After the refused bookings, the session changed. Check before you change: refuse first, then write.');
});

test('task 2: a booking with no name is refused with a TypeError', () => {
  const s = soldering(2);
  for (const who of [{}, { name: '' }, undefined]) {
    assert.throws(() => s.book(who), TypeError, `book(${JSON.stringify(who)}) should throw a TypeError: a name is required.`);
  }
  assert.deepEqual(s.attendees, []);
});

test('task 2: when a booked person cancels, the first person waiting takes the place', () => {
  const s = soldering(2);
  for (const n of ['Ana', 'Bo', 'Cy', 'Di']) s.book(person(n));
  assert.equal(s.cancel('Ana'), true);
  assert.deepEqual(s.attendees, ['Bo', 'Cy'], `attendees is ${JSON.stringify(s.attendees)} after Ana cancelled. Nobody may wait while a place is free — rule 3 — so the first person waiting is booked.`);
  assert.deepEqual(s.waiting, ['Di']);
});

test('task 2: cancelling someone who is waiting just removes them', () => {
  const s = soldering(1);
  for (const n of ['Ana', 'Bo', 'Cy']) s.book(person(n));
  assert.equal(s.cancel('Bo'), true);
  assert.deepEqual([s.attendees, s.waiting], [['Ana'], ['Cy']], 'Cancelling a waiting person frees no place, so nobody moves.');
});

test('task 2: cancelling someone who is not there returns false and changes nothing', () => {
  const s = soldering(1);
  s.book(person('Ana'));
  const r = s.cancel('Zed');
  assert.equal(r, false, `cancel("Zed") returned ${String(r)}; expected false.`);
  assert.deepEqual(s.attendees, ['Ana']);
});

test('task 2: attendees and waiting hand out copies — changing them changes nothing inside', () => {
  const s = soldering(1);
  s.book(person('Ana'));
  s.book(person('Bo'));
  s.attendees.push('Mallory');
  s.waiting.length = 0;
  assert.deepEqual(s.attendees, ['Ana'], 'A caller pushed onto attendees and the session changed. The getter handed out the private array itself — a reference, not a copy. See "Private state that guards an invariant", "Handing out the inside".');
  assert.deepEqual(s.waiting, ['Bo'], 'A caller emptied waiting and the session changed. Hand out a copy.');
});

test('task 2: capacity cannot be changed from outside', () => {
  const s = soldering(2);
  try { s.capacity = 99; } catch { /* a getter with no setter throws here — that is fine */ }
  for (const n of ['Ana', 'Bo', 'Cy']) s.book(person(n));
  assert.equal(s.capacity, 2, `After a caller assigned capacity = 99, it reads ${s.capacity}. A public field is guarded by nothing; make the state private and hand out a getter.`);
  assert.deepEqual(s.attendees, ['Ana', 'Bo'], 'A caller raised capacity from outside, and the session overbooked.');
});

test('task 2: a caller who writes to every public property still cannot break the rules', () => {
  const s = soldering(2);
  s.book(person('Ana'));
  for (const key of Object.keys(s)) {
    const v = s[key];
    try {
      if (Array.isArray(v)) v.push('Ana', 'Ana', 'Bo', 'Cy');
      else if (v instanceof Set) { v.add('Ana'); v.add('Cy'); }
      else if (v instanceof Map) { v.set('Cy', 'booked'); v.set('Di', 'booked'); }
      else if (typeof v === 'number') s[key] = 1000;
    } catch { /* ignore: refusing is fine */ }
  }
  s.book(person('Bo'));
  s.book(person('Cy'));
  const names = [...s.attendees, ...s.waiting];
  assert.ok(s.attendees.length <= 2, `After a caller wrote to the public properties ${JSON.stringify(Object.keys(s))}, ${s.attendees.length} people are booked on a 2-place session. State that guards an invariant has to be private (#fields, or a closure).`);
  assert.equal(new Set(names).size, names.length, `After a caller wrote to the public properties ${JSON.stringify(Object.keys(s))}, someone appears twice: ${JSON.stringify(names)}.`);
});

test('task 2: the session keeps the name, not the object you booked with', () => {
  const s = soldering(2);
  const ana = { name: 'Ana' };
  s.book(ana);
  ana.name = 'Changed later';
  assert.deepEqual(s.attendees, ['Ana'], `attendees became ${JSON.stringify(s.attendees)} when the caller changed their own object after booking. Keeping the caller's object keeps a second name for it — store what you need from it instead. (Copying and sharing.)`);
});

test('task 2: after any mix of bookings and cancellations, the three rules still hold', () => {
  const s = soldering(3);
  const script = [
    ['book', 'Ana'], ['book', 'Bo'], ['book', 'Cy'], ['book', 'Di'], ['book', 'Ed'],
    ['cancel', 'Bo'], ['book', 'Fay'], ['cancel', 'Di'], ['cancel', 'Ana'], ['cancel', 'Ed'],
    ['book', 'Gus'], ['book', 'Bo'], ['cancel', 'Cy'], ['cancel', 'Fay'], ['book', 'Hal'],
  ];
  for (const [op, name] of script) {
    if (op === 'book') s.book(person(name)); else s.cancel(name);
    const { attendees, waiting } = s;
    const all = [...attendees, ...waiting];
    const where = `after ${op}("${name}"): attendees ${JSON.stringify(attendees)}, waiting ${JSON.stringify(waiting)}`;
    assert.ok(attendees.length <= 3, `Rule 1 broken ${where}.`);
    assert.equal(new Set(all).size, all.length, `Rule 2 broken — someone appears twice — ${where}.`);
    assert.ok(waiting.length === 0 || attendees.length === 3, `Rule 3 broken — someone waits while a place is free — ${where}.`);
    assert.equal(s.spacesLeft, 3 - attendees.length, `spacesLeft disagrees with attendees ${where}. Derived state should be computed, not stored.`);
  }
  assert.deepEqual(s.attendees, ['Gus', 'Bo', 'Hal']);
});
