import { Card } from './card.model';
import { Pack, PackTO } from './pack.model';
import { Player } from './player.model';

interface BlackjackTO {
  pack: PackTO;
  players: Player[];
}

export class Blackjack {
  static fromTO(blackjackTO: BlackjackTO): Blackjack {
    const pack: Pack = Pack.fromTO(blackjackTO.pack);
    const players: Player[] = []; // TODO Implement fromTO
    const blackjack = new Blackjack(0);
    blackjack._pack = pack;
    blackjack._players = players;
    return blackjack;
  }

  static load(): Blackjack | undefined {
    let blackjack: Blackjack | undefined;
    const localStorage = window.localStorage;
    const json: string | null = localStorage.getItem('game');
    if (json) {
      const gameTO: BlackjackTO = JSON.parse(json) as BlackjackTO;
      blackjack = Blackjack.fromTO(gameTO);
      console.log(`Game was loaded`);
      console.log(blackjack);
    } else {
      console.warn(`There isn't a game to load`);
    }
    return blackjack;
  }

  /** The deck of playing cards. */
  private _pack?: Pack;
  /** The player that represents the dealer === _players[0] */
  private _dealer: Player;
  /** All potential players - effectively all the seats. */
  private _players: Array<Player>;
  /** All players that have placed a bet. */
  private _activePlayers: Array<Player> = [];
  /** The player that is currently playing. An index into _activePlayers */
  private _activePlayerIdx: number = 0;
  /** The game has started and no more bets are allowed. */
  private _noMoreBets: boolean = false;
  private _changeListeners: Array<() => void> = [];

  private _isEndGame = false;

  isActivePlayer(player: Player): boolean {
    return player === this._activePlayers[this._activePlayerIdx];
  }

  /**
   * Record game in local storage
   */
  save(): void {
    const localStorage = window.localStorage;
    localStorage.setItem('game', JSON.stringify(this));
  }

  /**
   * Start play by dealing cards to players who have placed a bet.
   */
  start(): void {
    this._activePlayers = this._players.filter(
      (player: Player) => player.stake > 0,
    );

    if (this._activePlayers.length === 0) {
      console.log('No bets have been placed');
      return;
    }

    this._activePlayerIdx = 0;
    this._pack = Pack.getNewPack();
    this._noMoreBets = true;

    // Deal every player in the game two cards,
    // and the dealer just one.
    for (let cardQty = 1; cardQty < 3; cardQty++) {
      for (let player of this._activePlayers) {
        const card: Card = this._pack.draw();
        player.addCard(card);
      }
      // Deal just one card to the dealer.
      if (cardQty === 1) {
        const card: Card = this._pack.draw();
        this._dealer.addCard(card);
      }
    }

    this._callChangeListeners();
  }

  addChangeListener(fn: () => void) {
    this._changeListeners.push(fn);
    fn();
  }

  /**
   * Start a new game
   */
  newGame(): void {
    // Reset Players
    this._activePlayers = [];
    for (let player of this._players) {
      player.stake = 0;
      player.newHand();
    }

    this._noMoreBets = false;
    this._isEndGame = false;
    this._callChangeListeners();
  }

  /**
   * Move into the "end game" state.
   */
  endGame(): void {
    this._isEndGame = true;

    // Play Dealer's hand
    // TODO Refine this implementation
    for (
      ;
      this._dealer.score && this._dealer.score < 18;
      this._dealer.addCard(this._pack.draw())
    ) {}

    // Settle up winnings.
    const dealerScore = this._dealer.hasBlackjack ? 22 : this._dealer.score;
    for (let player of this._activePlayers) {
      const playerScore = player.hasBlackjack ? 22 : player.score;
      if (playerScore > dealerScore) {
        const winnings = player.hasBlackjack
          ? player.stake * 1.5
          : player.stake;
        player.addToStash(winnings);
        this._dealer.addToStash(-winnings);
      } else if (dealerScore > playerScore) {
        player.addToStash(-player.stake);
        this._dealer.addToStash(player.stake);
      }
    }

    this._callChangeListeners();
  }

  get isEndGame(): boolean {
    return this._isEndGame;
  }

  // removeChnageListener(fnToRemove: () => void) {
  //   this._changeListeners = this._changeListeners.filter((fn: () => void) => {
  //     return fn !== fnToRemove;
  //   });
  // }

  getPlayer(seatIdx: number): Player | undefined {
    return this._players[seatIdx];
  }

  nextPlayer(): void {
    this._activePlayerIdx++;
    if (this._activePlayers.length === this._activePlayerIdx) {
      this.endGame();
    } else {
      this._callChangeListeners();
    }
  }

  toJSON(): Object {
    return {
      pack: this._pack,
      players: this._players,
    };
  }

  // set activePlayer(playerId: number) {
  //   this._activePlayerIdx = playerId;
  //   this._callChangeListeners();
  // }

  get noMoreBets(): boolean {
    return this._noMoreBets;
  }

  /**
   * Number of seats (not number of active players).
   */
  get playerQty(): number {
    return this._players.length;
  }

  /**
   *
   * @param seatQty Number of players.
   */
  constructor(seatQty: number) {
    this._players = [];
    for (let seatIdx = 0; seatIdx <= seatQty; seatIdx++) {
      const player: Player = new Player(seatIdx);
      this._players.push(player);
    }

    this._dealer = this._players[0];
    this._dealer.name = 'Dealer';
  }

  /**
   * The idea is to drive the game via commands.
   * So that they can be recorded, played back, used to support
   * undo and be broadcast to other remote players.
   *
   * @param cmd
   * @param seatIdx
   */
  cmd(cmd: string, seatIdx: number): void {
    const player: Player | undefined = this.getPlayer(seatIdx);
    if (player) {
      switch (cmd) {
        case 'double':
          this.doubleDown(player);
          break;
        case 'stand':
          this.stand(player);
          break;
        case 'hit':
          this.hit(player);
          break;
        default:
          console.log(`got cmd ${cmd}`);
          break;
      }
    } else {
      console.error(`There isn't a player at seat ${seatIdx}`);
    }
  }

  doubleDown(player: Player): void {
    player.doubleDown();
    this.hit(player);
    this.stand(player);
  }

  /**
   * Should this rename the player or find an existing one?
   *
   * @param player
   * @param name Name to use for player
   */
  namePlayer(player: Player, name: string): void {
    // TODO If there is already a player with this name
    // use that player. Need to replace in list.
    player.name = name;
  }

  /**
   * Any stake highter than 0 allows the player to participate
   * in the game.
   */
  stake(player: Player, stake: number): void {
    player.stake = stake;
  }

  /**
   * Stand (or Stick)
   * Play moves to next player
   */
  stand(player: Player): void {
    this.nextPlayer();
  }

  /**
   * Hit (or Twist)
   */
  hit(player: Player): void {
    if (this._pack) {
      player.drawCard(this._pack);
      this._callChangeListeners();
    }
    if (player.isBust) {
      this.nextPlayer();
    }
  }

  /**
   * Returns an iterable of Player values.
   */
  get playerValues(): IterableIterator<Player> {
    return this._players.values();
  }

  private _callChangeListeners() {
    for (let fn of this._changeListeners) {
      fn();
    }
  }
}
