// Written by an AI assistant, from this request:
//
//   "The makerspace lends tools. A tool is lent to at most one person at a
//    time. Some tools need a deposit; most don't. Staff need to see which
//    tools are out."
//
// It runs, and the two examples at the bottom print what you would expect.
// Review it before it is used.

export class Tool {
  constructor(name, deposit) {
    this.name = name;
    this.deposit = deposit;                 // optional: most tools have none
    this.borrower = null;
  }

  label() {
    return this.deposit === null ? this.name : `${this.name} ($${this.deposit} deposit)`;
  }
}

export class ToolShelf extends Map {
  add(tool) {
    this.set(tool.name, tool);
  }

  lend(name, person) {
    const tool = this.get(name);
    if (tool.borrower !== null) throw new Error(`${name} is already out`);
    tool.borrower = person;
  }

  giveBack(name) {
    this.get(name).borrower = null;
  }

  // Staff view: the tools that are out. A new array, so callers can't change the shelf.
  get onLoan() {
    return [...this.values()].filter(tool => tool.borrower !== null);
  }
}

// Examples
const shelf = new ToolShelf();
shelf.add(new Tool('Tile cutter', 20));
shelf.add(new Tool('Pipe bender', null));
shelf.lend('Tile cutter', 'Ana');
console.log(shelf.onLoan.map(t => t.label()));   // [ 'Tile cutter ($20 deposit)' ]
console.log(shelf.get('Pipe bender').label());   // Pipe bender
