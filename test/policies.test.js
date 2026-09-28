// Task 3 — src/policies.js, and the policy a Session holds.
// The contract every policy meets is the comment at the top of src/policies.js.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Session } from '../src/session.js';
import { openToAll, membersOnly, invitedOnly, allOf } from '../src/policies.js';

// Frozen, so a policy that writes to the person it is given fails loudly.
const person = (name, memberId) =>
  Object.freeze(memberId === undefined ? { name } : { name, memberId });

test('task 3: openToAll admits anyone — reasonToRefuse returns null', () => {
  const r = openToAll.reasonToRefuse(person('Ana'));
  assert.equal(r, null, `openToAll.reasonToRefuse returned ${String(r)}. The contract says null — not undefined, not false — when a person may book.`);
});

test('task 3: membersOnly refuses anyone without a member id, with "members only"', () => {
  const policy = membersOnly();
  const cases = [['no memberId key', person('Bo')], ['memberId: null', person('Bo', null)], ['memberId: ""', person('Bo', '')]];
  for (const [how, p] of cases) {
    assert.equal(policy.reasonToRefuse(p), 'members only', `With ${how}, reasonToRefuse returned ${JSON.stringify(policy.reasonToRefuse(p))}. The person's memberId is optional — decide once what counts as "not a member".`);
  }
});

test('task 3: membersOnly admits a member with exactly null', () => {
  const r = membersOnly().reasonToRefuse(person('Ana', 'M-104'));
  assert.equal(r, null, `reasonToRefuse returned ${String(r)} for a member. The contract says null — a function that falls off its end returns undefined, which a Session checking === null reads as a refusal.`);
});

test('task 3: invitedOnly admits the names on its list and refuses others with "invitation only"', () => {
  const policy = invitedOnly(['Ana', 'Bo']);
  assert.equal(policy.reasonToRefuse(person('Bo')), null);
  assert.equal(policy.reasonToRefuse(person('Cy')), 'invitation only');
});

test('task 3: invitedOnly is not changed by later changes to the array it was given', () => {
  const list = ['Ana'];
  const policy = invitedOnly(list);
  list.push('Mallory');
  list.splice(0, 1);
  assert.equal(policy.reasonToRefuse(person('Mallory')), 'invitation only', 'A name pushed onto the caller\'s array after the policy was made got in. The policy kept the caller\'s array — a second name for it — rather than its own copy.');
  assert.equal(policy.reasonToRefuse(person('Ana')), null, 'Ana was invited, then removed from the caller\'s array, and the policy now refuses her. Keep a copy of what you were given.');
});

test('task 3: allOf refuses with the first reason any of its policies gives', () => {
  const policy = allOf(membersOnly(), invitedOnly(['Ana']));
  assert.equal(policy.reasonToRefuse(person('Bo')), 'members only', 'Bo is not a member and not invited; the first policy that refuses gives the reason.');
  const r = policy.reasonToRefuse(person('Bo', 'M-7'));
  assert.equal(r, 'invitation only', `A member who is not invited got ${JSON.stringify(r)}. allOf must ask every policy it holds, not only the first.`);
});

test('task 3: allOf admits, with null, only when every policy admits', () => {
  assert.equal(allOf(membersOnly(), invitedOnly(['Ana'])).reasonToRefuse(person('Ana', 'M-1')), null);
  assert.equal(allOf().reasonToRefuse(person('Ana')), null, 'allOf() holding no policies has nothing to refuse for, so it admits.');
});

test('task 3: a Session with no policy admits everyone', () => {
  const s = new Session({ title: 'Laser cutter induction', capacity: 2 });
  assert.equal(s.book(person('Ana')), 'booked');
});

test('task 3: a Session refuses whom its policy refuses — the reason is the error message, and nothing changes', () => {
  const s = new Session({ title: 'Laser cutter induction', capacity: 1, policy: membersOnly() });
  s.book(person('Ana', 'M-1'));
  assert.throws(() => s.book(person('Bo')), { message: 'members only' },
    'book() should throw an Error whose message is the reason the policy gave.');
  assert.equal(s.statusOf('Bo'), null, 'Bo was refused, so he must be neither booked nor waiting — even on a full session. Ask the policy before you change anything.');
  assert.deepEqual(s.waiting, []);
});

test('task 3: a Session accepts any object that meets the contract — not only the ones in policies.js', () => {
  const closed = { reasonToRefuse: () => 'closed for cleaning' };
  const s = new Session({ title: 'Welding', capacity: 4, policy: closed });
  assert.throws(() => s.book(person('Ana', 'M-1')), { message: 'closed for cleaning' },
    'A plain object with a reasonToRefuse method is a policy. Nothing should check which class it came from — the contract is the shape (duck typing).');

  class Weekday { reasonToRefuse(p) { return p.name.startsWith('S') ? 'weekdays only' : null; } }
  const s2 = new Session({ title: 'Welding', capacity: 4, policy: new Weekday() });
  assert.equal(s2.book(person('Ana')), 'booked', 'A class instance whose reasonToRefuse lives on its prototype meets the contract too.');
  assert.throws(() => s2.book(person('Sam')), { message: 'weekdays only' });
});

test('task 3: a Session can hold a combined policy', () => {
  const s = new Session({ title: 'CNC router', capacity: 3, policy: allOf(membersOnly(), invitedOnly(['Ana', 'Bo'])) });
  assert.equal(s.book(person('Ana', 'M-1')), 'booked');
  assert.throws(() => s.book(person('Bo')), { message: 'members only' });
  assert.throws(() => s.book(person('Cy', 'M-3')), { message: 'invitation only' });
  assert.deepEqual(s.attendees, ['Ana']);
});
