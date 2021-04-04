import { Blackjack } from './blackjack.model';
import { BlackjackTableComponent } from './blackjack-table.component';
import { TitleComponent } from './title.component';

const titleElem: HTMLElement = document.getElementsByClassName(
  'title-graphic',
)[0] as HTMLElement;
new TitleComponent(titleElem);

const blackjack = new Blackjack(2);

const gameElem: HTMLElement | null = document.getElementById('game');
if (gameElem) {
  new BlackjackTableComponent(gameElem, blackjack);
}
