import { Card } from './card.model';

export class CardComponent {
  constructor(public readonly card: Card) {}

  render(): HTMLDivElement {
    const cardElem: HTMLDivElement = document.createElement('div');
    cardElem.classList.add('card');
    cardElem.classList.add(`card-value-${this.card.value}`);
    cardElem.classList.add(this.card.suit.isRed ? 'red-suit' : 'black-suit');

    const suitSymbol: string = this.card.suit.symbol;
    let pips: string[] = [];
    let pictureCard: string = '';
    let displayValue: string = this.card.displayValue;
    if (this.card.value > 10) {
      pictureCard = `<div class="picture-card">
        <span>${displayValue}</span>
        </div>`;
    } else {
      for (let pipIdx = 1; pipIdx <= this.card.value; pipIdx++) {
        pips.push(`<span class="pip pip-${pipIdx}">${suitSymbol}</span>`);
      }
    }
    cardElem.innerHTML = `
    ${pictureCard}
    <div class="card-value"><span>${displayValue}</span><br><span class="suit-symbol">${suitSymbol}</span></div>
    <div class="card-value bottom"><span>${displayValue}</span><br><span class="suit-symbol">${suitSymbol}</span></div>
    ${pips.join('')}
    `;
    return cardElem;
  }
}
