import { Card } from './card.model';
import { CardComponent } from './card.component';
import { Hand } from './hand.model';

interface DisplayedCard {
  cardComp: CardComponent;
  cardElem: HTMLDivElement;
  displayOrder: number;
}
/**
 * Display a Blackjack hand.
 */
export class HandComponent {
  private _bustElem!: HTMLDivElement;
  private _displayedCards: Map<Card, DisplayedCard> = new Map<
    Card,
    DisplayedCard
  >();

  constructor(readonly element: HTMLElement, readonly hand: Hand) {
    if (!element) {
      console.error(`The parent element for the Hand Component is undefined`);
      return;
    }

    const div: HTMLDivElement = document.createElement('div');
    div.innerText = 'BUST';
    div.classList.add('bust');
    this._bustElem = div;
    element.append(div);

    // Note: The listener gets called immediately.
    hand.addChangeListener(() => {
      this._render();
    });
  }

  /**
   * Render each card in the hand.
   */
  private _render() {
    if (this.hand.isBust) {
      this._bustElem.classList.remove('hide');
    } else {
      this._bustElem.classList.add('hide');
    }

    // Remove any cards that are no longer in the hand.
    for (let [card, displayedCard] of this._displayedCards) {
      if (!this.hand.has(card)) {
        displayedCard.cardElem.remove();
        this._displayedCards.delete(card);
      }
    }

    let displayOrder: number = 0;
    for (let card of this.hand.cardValues) {
      const displayedCard = this._displayedCards.get(card);
      if (displayedCard) {
        if (displayedCard.displayOrder !== displayOrder) {
          // Move the card in the displayed hand.
          displayedCard.cardElem.classList.remove(
            `card-${displayedCard.displayOrder}`,
          );
          displayedCard.cardElem.classList.add(`card-${displayOrder}`);
          displayedCard.displayOrder = displayOrder;
        }
      } else {
        // Add a new card to the displayed hand.
        const cardComp = new CardComponent(card);
        const cardElem = cardComp.render();
        cardElem.classList.add(`card-${displayOrder}`);
        this.element.append(cardElem);
        this._displayedCards.set(card, {
          cardComp,
          cardElem,
          displayOrder,
        });
      }
      displayOrder++;
    }
  }
}
