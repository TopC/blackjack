import { Blackjack } from './blackjack.model';
import { BlackjackSeatComponent } from './blackjack-seat.component';

export class BlackjackTableComponent {
  readonly seats: BlackjackSeatComponent[] = [];

  private _dealerElem!: HTMLElement;
  private _placeYourBetsElem!: HTMLElement;
  private _endGameElem!: HTMLElement;

  constructor(readonly element: HTMLElement, readonly blackjack: Blackjack) {
    if (!element) {
      console.error(`The element is undefined`);
      return;
    }

    element.innerHTML = `
      <h1>Blackjack</h1>
      <div id="dealer">
        <p id="place-your-bets">Place your bets. When you are ready click
        <button>Play</button><br/>
        <div id="end-game"><button>New Game</button></div>
      </div>
      `;

    this._dealerElem = this._getElementById('dealer');
    this._placeYourBetsElem = this._getElementById('place-your-bets');
    this._endGameElem = this._getElementById('end-game');

    this._endGameElem.addEventListener('click', () => this.blackjack.newGame());

    const btns = element.getElementsByTagName('button');
    btns[0].addEventListener('click', () => this.play());

    for (let player of this.blackjack.playerValues) {
      if (player.seatIndex === 0) {
        new BlackjackSeatComponent(this._dealerElem, blackjack, player);
      } else {
        this.seats.push(new BlackjackSeatComponent(element, blackjack, player));
      }
    }

    blackjack.addChangeListener(() => this._gameChanged());
  }

  /**
   * Start play by dealing cards to players who have placed a bet.
   */
  play() {
    this.blackjack.start();
  }

  private _gameChanged(): void {
    if (this.blackjack.noMoreBets && this._placeYourBetsElem) {
      this._placeYourBetsElem.classList.add('hide');
    }
    if (!this.blackjack.noMoreBets && this._placeYourBetsElem) {
      this._placeYourBetsElem.classList.remove('hide');
    }
    if (!this.blackjack.isEndGame && this._endGameElem) {
      this._endGameElem.classList.add('hide');
    }
    if (this.blackjack.isEndGame && this._endGameElem) {
      this._endGameElem.classList.remove('hide');
    }
  }

  /**
   * Get first element by class name.
   */
  private _getElementById(id: string): HTMLElement {
    const elem: HTMLElement | null = document.getElementById(id);
    if (elem) {
      return elem;
    } else {
      throw new Error(`${id} was not found`);
    }
  }
}
