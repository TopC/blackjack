import { Blackjack } from './blackjack.model';
import { HandComponent } from './hand.component';
import { Player } from './player.model';

export class BlackjackSeatComponent {
  // I don't think this "Definite Assignment Assertions" should be
  // necessary because it is "definitely" assigned in constructor.
  private _cardPosElem!: HTMLElement;
  private _doubleDownBtnElem?: HTMLElement;
  private _gameControlsElem?: HTMLElement;
  private _splitBtnElem?: HTMLElement;
  private _stakeControlsElem?: HTMLElement;
  private _stashElem?: HTMLElement;
  private _nameElem?: HTMLInputElement;
  private _stakeElem?: HTMLInputElement;

  private _handComp?: HandComponent;

  /**
   * Create a Blackjack "seat", the place on the table where a player and their
   * hand is represented.
   *
   * @param element Parent HTML element to attach seat to.
   * @param blackjack TODO Remove when player has been established.
   * @param player The player at this seat. A temporary player until overridden
   *               by a named one. Not in game until a stake has been placed.
   */
  constructor(
    readonly element: HTMLElement,
    readonly blackjack: Blackjack,
    readonly player: Player,
  ) {
    if (!element) {
      console.error('No element to attach seat to');
      return;
    }

    const div = document.createElement('div');
    div.classList.add('blackjack-seat');
    element.append(div);

    if (player.seatIndex === 0) {
      div.innerHTML = `
        <h2>Dealer</h2>
        <h4>Total: <span class="stash">${player.stash}</span></h4>
        <div class="card-position"></div><br>
      `;
    } else {
      div.innerHTML = `
        <h2>Player ${player.seatIndex}</h2>
        <h4>Total: <span class="stash">${player.stash}</span></h4>
        <div class="card-position"></div>
        <br>
        <label>Your Name</label> <input type="text" value="${player.name}"><br>
        <label>Stake</label> <input type="text" value="${player.stake}"><br>
        <div class="stake-controls">
          10 <button>+</button><button>-</button>
          100 <button>+</button><button>-</button><br>
        </div>
        <div class="game-controls">
          <button class="double-down">Double Down</button>
          <button>Stand</button>
          <button>Hit</button>
          <button class="split">Split</button>
        </div>
      `;

      this._doubleDownBtnElem = this._getElementByClass(div, 'double-down');
      this._splitBtnElem = this._getElementByClass(div, 'split');
      this._stakeControlsElem = this._getElementByClass(div, 'stake-controls');
      this._gameControlsElem = this._getElementByClass(div, 'game-controls');

      const inputs = div.getElementsByTagName('input');
      this._nameElem = inputs[0] as HTMLInputElement;
      this._stakeElem = inputs[1] as HTMLInputElement;
      this._nameElem.addEventListener('change', () => this.nameChanged());
      this._stakeElem.addEventListener('change', () => this.stakeChanged());

      const btns = div.getElementsByTagName('button');
      btns[0].addEventListener('click', () => this.bet(10));
      btns[1].addEventListener('click', () => this.bet(-10));
      btns[2].addEventListener('click', () => this.bet(100));
      btns[3].addEventListener('click', () => this.bet(-100));
      btns[4].addEventListener('click', () => this.cmd('double'));
      btns[5].addEventListener('click', () => this.cmd('stand'));
      btns[6].addEventListener('click', () => this.cmd('hit'));
      btns[7].addEventListener('click', () => this.cmd('split'));
    }

    this._cardPosElem = this._getElementByClass(div, 'card-position');
    this._stashElem = this._getElementByClass(div, 'stash');

    player.addChangeListener(() => this._playerChanged());
    blackjack.addChangeListener(() => this._gameChanged());
  }

  bet(amount: number): void {
    this.player.stake += amount;
  }

  cmd(cmd: string): void {
    this.blackjack.cmd(cmd, this.player.seatIndex);
  }

  /**
   * User changed name via input field.
   */
  nameChanged(): void {
    if (this._nameElem) {
      let name = this._nameElem.value.trim();
      this.player.name = name;
    }
  }

  /**
   * User changed stake via input field.
   */
  stakeChanged(): void {
    if (this._stakeElem) {
      const stake = parseInt(this._stakeElem.value, 10);
      this.player.stake = stake;
    }
  }

  /**
   * Player object changed callback
   */
  private _playerChanged(): void {
    this._update();
  }

  private _gameChanged(): void {
    if (this._stakeControlsElem) {
      if (this.blackjack.noMoreBets) {
        this._stakeControlsElem.classList.add('hide');
      } else {
        this._stakeControlsElem.classList.remove('hide');
      }
    }

    if (this._gameControlsElem) {
      if (this.blackjack.isActivePlayer(this.player)) {
        this._gameControlsElem.classList.remove('hide');
      } else {
        this._gameControlsElem.classList.add('hide');
      }
    }

    if (this._doubleDownBtnElem && this.player.hand) {
      if (this.player.hand.cardQty > 2) {
        this._doubleDownBtnElem.classList.add('hide');
      } else {
        this._doubleDownBtnElem.classList.remove('hide');
      }
    }

    if (this._splitBtnElem && this.player.hand) {
      if (this.player.hand.canSplit) {
        // TODO Implement Split
        // this._splitBtnElem.classList.remove('hide');
      } else {
        this._splitBtnElem.classList.add('hide');
      }
    }
  }

  /**
   * Update UI because something may have changed.
   */
  private _update(): void {
    if (this._stakeElem) {
      this._stakeElem.value = this.player.stake.toString();
    }

    if (this._nameElem) {
      this._nameElem.value = this.player.name;
    }

    if (this._cardPosElem && this.player.hand && !this._handComp) {
      this._handComp = new HandComponent(this._cardPosElem, this.player.hand);
    }

    if (this._stashElem) {
      this._stashElem.innerText = `${this.player.stash}`;
      if (this.player.stash < 0) {
        this._stashElem.classList.add('negative');
      } else {
        this._stashElem.classList.remove('negative');
      }
    }
  }

  /**
   * Get first element by class name.
   */
  private _getElementByClass(
    parentElem: HTMLElement,
    className: string,
  ): HTMLElement {
    const elem: HTMLElement = parentElem.getElementsByClassName(
      className,
    )[0] as HTMLElement;
    if (elem) {
      return elem;
    } else {
      throw new Error(`${className} was not found`);
    }
  }
}
