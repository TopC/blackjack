import { Suit } from './suit.enum';

/**
 * Card Transfer Object.
 * The anemic version of a Card object.
 */
export interface CardTO {
  suit: string;
  value: number;
}

export class Card {
  /**
   * Reconstitute a Card object from its Transfer Object representation.
   */
  static fromTO(cardTO: CardTO) {
    const suit: Suit | undefined = Suit.fromString(cardTO.suit);
    if (suit === undefined) {
      throw new Error(`TO is incorrect - suit: "${cardTO.suit}"`);
    }
    return new Card(suit, cardTO.value);
  }

  static valueFirstComparator(a: Card, b: Card): number {
    const result: number = a.value - b.value;
    return result === 0 ? Suit.comparitor(a.suit, b.suit) : result;
  }

  static suitFirstComparator(a: Card, b: Card): number {
    const result: number = Suit.handOrderComparitor(a.suit, b.suit);
    return result === 0 ? a.value - b.value : result;
  }

  constructor(
    readonly suit: Suit,
    /** Card value 1 (Ace) though to 13 (King) */
    readonly value: number,
  ) {}

  get displayValue(): string {
    switch (this.value) {
      case 1:
        return 'A';
      case 11:
        return 'J';
      case 12:
        return 'Q';
      case 13:
        return 'K';
      default:
        return this.value.toString();
    }
  }
}
