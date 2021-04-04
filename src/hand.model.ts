import { Card, CardTO } from './card.model';

/**
 * Hand Transfer Object.
 * The anemic version of a Hand object.
 */
export interface HandTO {
  hand: CardTO[];
}

/**
 * Models a Blackjack player's hand.
 * Knows how to tally the card score.
 */
export class Hand {
  private static readonly _TARGET_BLACKJACK_SCORE: number = 21;
  private static readonly _PICTURE_CARD_VALUE: number = 10;

  /**
   * Reconstitute a Hand object from its Transfer Object representation.
   */
  static fromTO(handTO: HandTO) {
    const hand = new Hand();
    hand._hand = handTO.hand.map((cardTO: CardTO) => Card.fromTO(cardTO));
    return hand;
  }
  private _changeListeners: Array<() => void> = [];
  private _hand: Card[] = [];
  /** Array of possible scores (allowing for aces being worth 1 or 11) */
  private _scores: number[] = [0];

  /**
   * Returns an iterable of all Card values in the Hand.
   * In the order that they are currently in.
   */
  get cardValues(): IterableIterator<Card> {
    return this._hand.values();
  }

  get cardQty(): number {
    return this._hand.length;
  }

  get canSplit(): boolean {
    if (this._hand.length === 2) {
      const value1 = Math.min(this._hand[0].value, Hand._PICTURE_CARD_VALUE);
      const value2 = Math.min(this._hand[1].value, Hand._PICTURE_CARD_VALUE);
      return value1 === value2;
    }
    return false;
  }

  addChangeListener(fn: () => void) {
    this._changeListeners.push(fn);
    fn();
  }

  // removeChnageListener(fnToRemove: () => void) {
  //   this._changeListeners.filter((fn: () => void) => {
  //     return fn !== fnToRemove;
  //   });
  // }

  add(card: Card) {
    this._hand.push(card);
    this._tally(card);
    this._callChangeListeners();
  }

  clear() {
    this._hand = [];
    this._scores = [0];
    this._callChangeListeners();
  }

  has(card: Card): boolean {
    return this._hand.indexOf(card) >= 0;
  }

  get isBust(): boolean {
    return this._scores.length === 0;
  }

  get isBlackjack(): boolean {
    return this.score === 21 && this._hand.length === 2;
  }

  /**
   * The player's score. 0 if bust.
   */
  get score(): number {
    return this._scores.length === 0
      ? 0
      : this._scores[this._scores.length - 1];
  }

  /**
   * Used by JSON to serialise the Hand class. It returns a JavaScript Object
   * that represent the essence of the Hand object (NOT a string or a HandTO).
   *
   * NOTE:
   * This method does NOT return a string (or a HandTO). This is how toJSON()
   * is intended to work. toJson() is recursive so any child objects will be
   * serialized in the same way. There is no point definiting a return type
   * other than Object because this is the only place where it would be used
   * and it would simply add an unnecessary maineneance overhead.
   */
  toJSON(): Object {
    return {
      hand: this._hand,
    };
  }

  toString(): string {
    return this._hand
      .map((card: Card) => `${card.value} of ${card.suit.symbol}`)
      .join('\n');
  }

  private _callChangeListeners() {
    for (let fn of this._changeListeners) {
      fn();
    }
  }

  /**
   * Keep a tally of the Hand's Blackjack score.
   * Adds the card's value to the hand's current score(s).
   */
  private _tally(card: Card) {
    // Allow for aces being worth 1 or 11 by duplicating
    // each potential score and adding 10 to the duplicate.
    if (card.value === 1) {
      const newScores: number[] = this._scores.map(
        (score: number) => score + Hand._PICTURE_CARD_VALUE,
      );
      this._scores = this._scores.concat(newScores);
    }

    // Add value of card to each possible score
    // (allowing for picture cards being worth 10)
    // and discard any scrores over 21.
    const value: number = Math.min(card.value, Hand._PICTURE_CARD_VALUE);
    this._scores = this._scores
      .map((score: number) => score + value)
      .filter((score) => score <= Hand._TARGET_BLACKJACK_SCORE);
  }
}
