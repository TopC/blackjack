export class Suit {
  private static readonly _lookup: Map<string, Suit> = new Map<string, Suit>();
  private static _nextOrdinal: number = 0;

  static readonly CLUBS: Suit = new Suit('clubs', '♣', false, 2);
  static readonly DIAMONDS: Suit = new Suit('diamonds', '♦', true, 1);
  static readonly HEARTS: Suit = new Suit('hearts', '♥', true, 3);
  static readonly SPADES: Suit = new Suit('spades', '♠', false, 4);

  /**
   * Used to order Suits alphabetically. The conventional ranking
   * order (low to high) used by many card games including Bridge.
   */
  static comparitor(a: Suit, b: Suit): number {
    return a._ordinal - b._ordinal;
  }

  /**
   * Used to order Suits by alternating colour. The same as
   * alphabetic order but with the first two Suits swapped.
   * Typically used to arrange cards in a player's hand.
   */
  static handOrderComparitor(a: Suit, b: Suit): number {
    return a._handOrdinal - b._handOrdinal;
  }

  /**
   * Used to reconstitute a Suit Enum from its string representation.
   */
  static fromString(name: string): Suit | undefined {
    return Suit._lookup.get(name);
  }

  /**
   * Returns a new Iterator object that contains the values for each enum.
   */
  static get values(): IterableIterator<Suit> {
    return Suit._lookup.values();
  }

  _ordinal: number;

  toString(): string {
    return this.name;
  }

  /**
   * Allow the Enum to be serialised using just its name. There's
   * no need to serialise the rest of the Enum's static information.
   * The Enum can be reconstituted using fromString().
   *
   * NOTE: Any unique identifier would do (e.g. it could be the Enum's
   * ordinal value) but making it human friendly is part of the reason
   * why we use JSON (rather than a binary representation).
   */
  toJSON(): string {
    return this.name;
  }

  /**
   * NOTE: Making the constructor private discourages misuse of the Enum.
   *
   * @param name The name of the Suit. Used to identify Enum when serialised.
   * @param symbol The Unicode character used to represent the Suit.
   * @param isRed Whether the Suit is red or not (i.e. black).
   * @param _handOrdinal A number used to represent the "alternating colour"
   *                     order of Suits, the order typically used to arrange
   *                     cards in a player's hand.
   */
  private constructor(
    readonly name: string,
    readonly symbol: string,
    readonly isRed: boolean,
    private readonly _handOrdinal: number,
  ) {
    this._ordinal = Suit._nextOrdinal++;
    Suit._lookup.set(name, this);
  }
}
