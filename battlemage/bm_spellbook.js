
"use strict";

/**
 * Common code between both server and client.
 */

/**
 * Spell shape:
 *
 *      |\
 *      | \
 *      |  *
 *      |
 *      |
 *      .
 */
function makeSpell_MagicDart() {
  return new Spell({
    id: "magicdart",
    name: "Magic Dart",
    manaCost: 1,
    pattern: new SpellPattern([ [0.4, 0.8], [0.4, 0.2], [0.6, 0.4] ])
  });
}

function makeSpellBook() {
  let spellBook = new SpellBook();
  spellBook.addSpell(makeSpell_MagicDart());
  return spellBook;
}

function makeDeck(spellBook) {
  let magicDart = spellBook.getSpellById('magicdart');

  let deck = new Deck();

  // Initial deck is just 100 Magic Dart spells.
  for (let i = 0; i < 100; i++) {
    deck.addCard(new Card({spell: magicDart}));
  }

  return deck;
}
