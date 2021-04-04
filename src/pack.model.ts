import { Card, CardTO } from './card.model';
import { Suit } from './suit.enum';

export interface PackTO {
  cards: CardTO[];
}

export class Pack {
  static fromTO(packTO: PackTO): Pack {
    const cards: Card[] = packTO.cards.map((cardTO) => Card.fromTO(cardTO));
    const pack = new Pack(cards);
    return pack;
  }

  static getNewPack(): Pack {
    const cards: Card[] = [];
    for (const suit of Suit.values) {
      for (let value: number = 1; value <= 13; value++) {
        cards.push(new Card(suit, value));
      }
    }
    const pack = new Pack(cards);
    return pack;
  }

  draw(): Card {
    const cardIdx: number = Math.floor(Math.random() * this._cards.length);
    return this._cards.splice(cardIdx, 1)[0];
  }

  toJSON(): Object {
    return {
      cards: this._cards,
    };
  }

  private constructor(private _cards: Card[]) {}
}
