# Workshop bookings

The makerspace runs workshops: soldering, wood turning, a repair café. Each
session has a title, a number of places, and maybe a room. People book, and
when it is full they wait. Some sessions are for members only.

You will build the type that keeps those bookings. It has to keep its own rules
whatever a caller does, decide which of its fields may be missing, hold a part
that decides who may book, and then grow a variant — a drop-in session — in a
way you choose and defend.

That is the whole of *Objects and modeling* in one program: designing a type,
private state that guards an invariant, a contract nothing checks for you, and
choosing between inheritance and composition.

Allow about three hours for the build and the review together.

## Getting started

1. Create your own repository from this template (**Use this template** on
   GitHub).
2. Open it in a Codespace, or clone it and open it in VS Code on your own
   machine. Both work the same way; *Set up where your code runs* in Start Here
   covers each.
3. Run the tests:

   ```sh
   npm test
   ```

   Nothing to install. Every test fails at first — that is the starting point.
   The same tests run on GitHub every time you push, so you can see where you
   stand from the repository page.

The code you write goes in `src/`. The tests in `test/` are part of the spec:
read them. Each one checks one behaviour, and its name says which. When one
fails, its message says what it expected, what came back, and which idea to
look at again.

| File | What it is |
|---|---|
| `src/session.js` | the `Session` type — tasks 1, 2 and 3 |
| `src/policies.js` | admission policies and the contract they meet — task 3 |
| `src/drop-in.js` | the drop-in variant — task 4 |
| `review/tool-shelf.js` | code to review — not yours to fix in place |
| `REVIEW.md` | your review |

## The tasks

Work in order. Each task's tests are named `task 1: …`, `task 2: …`, and so on,
so you can see which ones are yours to pass next.

### Task 1 — What a session holds

Write the constructor, the getters `title`, `capacity` and `room`, and
`label()`.

```js
const s = new Session({ title: 'Intro to soldering', capacity: 8, room: 'Room B' });
s.label();   // 'Intro to soldering · Room B · 8 of 8 places left'
```

Decide each field once, in the constructor:

- `title` is **required**: a non-empty string. Anything else throws a
  `TypeError`.
- `capacity` is **required**: a whole number, 1 or more. Anything else throws a
  `RangeError`.
- `room` is **optional**. Missing, `undefined` and `null` all mean "not decided
  yet", and `room` reads as `null` for all three. `label()` says
  `room to be confirmed` instead.

### Task 2 — Bookings nothing outside can break

A session keeps three rules, whatever a caller does:

1. never more people booked than `capacity`;
2. nobody appears twice, across booked and waiting together;
3. nobody waits while a place is free.

Write `book(person)`, `cancel(name)`, `statusOf(name)` and the getters
`spacesLeft`, `attendees` and `waiting`. Their contracts are in the JSDoc in
`src/session.js`. In short:

```js
const s = new Session({ title: 'Wood turning', capacity: 1 });
s.book({ name: 'Ana' });   // 'booked'
s.book({ name: 'Bo' });    // 'waiting'
s.statusOf('Cy');          // null
s.cancel('Ana');           // true — and Bo now has the place
s.attendees;               // ['Bo']
```

The rules only hold if nothing outside can reach the state they are about. So:

- Keep the state in `#private` fields. A check inside `book` protects `book`;
  only private state protects the rules.
- `attendees` and `waiting` hand out **copies**. A caller may push onto what
  they get back; the session must not notice.
- `capacity` can be read, not changed.
- Keep the person's **name**, not the object they booked with. The caller still
  holds that object and may change it later.
- Check before you change. A refused booking leaves the session exactly as it
  was.

### Task 3 — Who may book: a contract

Some sessions are for members only; some are by invitation. A session does not
decide this itself. It **holds a policy** and asks it.

A policy is any object with a `reasonToRefuse(person)` method that returns
`null` when the person may book, or a short reason when they may not. The full
contract is the comment at the top of `src/policies.js`. Read it closely — what
the method returns when there is *nothing* to say is part of it.

1. In `src/policies.js`, write `openToAll`, `membersOnly()`,
   `invitedOnly(names)` and `allOf(...policies)`. `allOf` holds other policies
   and refuses with the first reason any of them gives.
2. In `Session`, accept an optional `policy` in the constructor. `book` asks it
   first. If it refuses, `book` throws an `Error` whose message is the reason,
   and nobody is booked or waitlisted.
3. With no policy, everyone may book. Decide how a missing policy is stored so
   that `book` stays simple — `openToAll` is already imported for you, if you
   want it.

```js
const s = new Session({ title: 'Laser cutter induction', capacity: 6, policy: membersOnly() });
s.book({ name: 'Bo' });   // throws Error: members only
```

JavaScript checks none of this. A plain object literal with a
`reasonToRefuse` method is as good a policy as anything in `policies.js`, and
the tests hand your `Session` one. Do not check what class a policy is.

### Task 4 — A drop-in session, and the choice behind it

The repair café is a **drop-in**. It works like any session, except that it
has no waitlist: when it is full, `book` throws `Error('full')`, and nobody is
added to a waitlist. Everything else — the rules, the policy, the getters,
`label`, `cancel` — works exactly as it does for a `Session`. Code written for
"a session" must work when handed a drop-in.

Make `createDropIn(details)` in `src/drop-in.js` return one. There is more than
one reasonable design:

- **Inheritance** — `class DropInSession extends Session`, overriding what
  differs.
- **Composition** — an object that holds a `Session` and forwards to it,
  changing only what differs.
- **An option on `Session`** — a `waitlist: false` detail, and `createDropIn`
  passes it.

Pick one and build it. The tests only call `createDropIn` and what a session
offers, so every one of these can pass them. The tests cannot tell whether you
chose well. Your answers below say that.

## The review

`review/tool-shelf.js` was written by an AI assistant for the makerspace's
tool library. It runs, and its two examples print the right thing. It still has
problems of the kind this module is about, and at least one from earlier in the
course.

Find at least three. For each, write in `REVIEW.md`:

- **which lines**;
- **what goes wrong** — in terms of the idea, not only the symptom;
- **a concrete input that shows it** — a few lines of code someone could run,
  and what they print or do;
- **the fix** — the changed lines, not a rewrite of the file.

Write it for the teammate who will fix it. Do not change `tool-shelf.js`
itself. There are no tests for the review: a person reads `REVIEW.md`.

## Your answers

Answer under each question, in a few sentences. A person reads these too.

### 1. Which design did you choose for the drop-in, and why?

Use the three questions from *Contracts, and choosing between the three*: is a
drop-in genuinely a kind of session, is `Session` stable and meant to be
extended, and must unrelated types be interchangeable? Say which one decided it.

*Your answer.*

### 2. What does your choice commit you to?

Next term, `Session` gains a new method, `moveTo(room)`. What happens to your
drop-in — does it get `moveTo`, and is that what you want? Then name one change
to `Session` that could break your drop-in without anyone touching
`drop-in.js`, or say why none can.

*Your answer.*

### 3. How is `cancel` found?

Someone calls `dropIn.cancel('Ana')` on one of your drop-ins. Your drop-in's
code may not define `cancel` itself. Say where the method that runs is found,
step by step — which objects are checked, in what order, and where it stops.

*Your answer.*

### 4. The contract of "a session"

A caller holds a session and does not know whether it is a drop-in. Write what
they may rely on: each member, what it returns — including when there is
nothing — and one thing they must not rely on.

*Your answer.*

## Done means

- `npm test` passes, locally and on GitHub.
- `REVIEW.md` names at least three problems, each with lines, what goes wrong,
  an input that shows it, and a fix.
- The four answers above are filled in.
