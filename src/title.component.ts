import { CardComponent } from './card.component';
import { Card } from './card.model';
import { Pack } from './pack.model';

/**
 * Title Graphic - A couple of playing cards
 * Just to be pretty
 */
export class TitleComponent {
  constructor(readonly element: HTMLElement) {
    const pack: Pack = Pack.getNewPack();

    for (let i = 0; i < 2; i++) {
      const card: Card = pack.draw();
      const cardDiv: HTMLDivElement = new CardComponent(card).render();
      element.append(cardDiv);
    }
  }
}
