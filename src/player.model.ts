import { Card } from './card.model';
import { Hand } from './hand.model';
import { Pack } from './pack.model';

/**
 * A Blackjack player
 * Has a name, an ID, a hand, a stake, and a score.
 */
export class Player {
  private static _playerQty: number = 0;

  private _playerId: number = Player._playerQty++;
  private _changeListeners: Array<() => void> = [];
  private _name: string = '';
  private _hand: Hand | undefined;
  private _stash: number = 0;
  private _stake: number = 0;

  addChangeListener(fn: () => void) {
    this._changeListeners.push(fn);
    fn();
  }

  removeChnageListener(fnToRemove: () => void) {
    this._changeListeners.filter((fn: () => void) => {
      return fn !== fnToRemove;
    });
  }

  get name(): string {
    return this._name;
  }

  set name(name: string) {
    if (name.length === 0) {
      name = `Player ${this._playerId}`;
    }
    if (this.name !== name) {
      this._name = name;
      this._callChangeListeners();
    }
  }

  get stake(): number {
    return this._stake;
  }

  /**
   * Negative values are assumed to be 0.
   */
  set stake(stake: number) {
    if (stake < 0) {
      stake = 0;
    }
    if (this._stake !== stake) {
      this._stake = stake;
      this._callChangeListeners();
    }
  }

  get stash(): number {
    return this._stash;
  }

  /**
   * Get player's active hand
   */
  get hand(): Hand | undefined {
    return this._hand;
  }

  /**
   * Undefiend if the player doesn't have a hand (i.e. isn't playing).
   */
  get isBust(): boolean | undefined {
    return this._hand ? this._hand.isBust : undefined;
  }

  get hasBlackjack(): boolean {
    return this._hand ? this._hand.isBlackjack : false;
  }

  /**
   * The player's score. 0 if bust or not playing.
   */
  get score(): number {
    return this._hand ? this._hand.score : 0;
  }

  /**
   * In Blackjack drawing a card is equivalent to playing the card.
   * The player's hand is effectively public.
   */
  drawCard(pack: Pack): void {
    const card: Card = pack.draw();
    if (!this._hand) {
      this._hand = new Hand();
    }
    this._hand.add(card);
  }

  /**
   * Add a card to the players active hand.
   * Note: A player can have more than one hand if they choose to split
   * a pair of identical value cards.
   *
   * @param card
   */
  addCard(card: Card): void {
    if (!this._hand) {
      this._hand = new Hand();
    }
    this._hand.add(card);
    this._callChangeListeners();
  }

  /**
   * Adjust the player's stash/total by the specified amount.
   *
   * @param amount The amount to adjust by.
   */
  addToStash(amount: number): void {
    this._stash += amount;
    this._callChangeListeners();
  }

  doubleDown(): void {
    this.stake += this.stake;
  }

  newHand(): void {
    if (this._hand) {
      this._hand.clear();
      this._callChangeListeners();
    }
  }

  constructor(readonly seatIndex: number) {}

  private _callChangeListeners() {
    for (let fn of this._changeListeners) {
      fn();
    }
  }
}
