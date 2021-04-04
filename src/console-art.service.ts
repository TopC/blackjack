import { Card } from './card.model';
import { Hand } from './hand.model';

/**
 * A couple of methods that render a player's hand (or just a card) as line art.
 *
 * It only works as intended if the console supports the unicode characters
 * used (it works on repel.it where it was first implemented).
 *
 * NOTE: These methods could easily have been implemented as standalone
 * functions. The "service" construct has only been used as a "namespace"; as
 * a way to gather some loosely related behaviour that doesn't necessarily
 * belong with the objects they are  rendering. Although it was tempting to
 * follow the pattern used by the card.element class, used to render a card
 * object as HTML, and pass the model object in via the constructor, there
 * isn't much point when all it does is render the model. On the other hand
 * the card.element has the potential to support other features.
 */
export class ConsoleArtService {
  private static _instance: ConsoleArtService;

  static getInstance(): ConsoleArtService {
    if (!ConsoleArtService._instance) {
      ConsoleArtService._instance = new ConsoleArtService();
    }
    return ConsoleArtService._instance;
  }

  private constructor() {}

  playHand(hand: Hand) {
    console.log();
    debugger;
    let cardQty: number = 1;
    let lineArt: string[] = [];
    for (let card of hand.cardValues) {
      let lineIdx: number = 0;
      for (const line of this.toLineArt(card)) {
        const currentLine: string = lineArt[lineIdx];
        lineArt[lineIdx] = currentLine ? `${currentLine} ${line}` : line;
        lineIdx++;
      }

      if (cardQty % 5 === 0) {
        for (const line of lineArt) {
          console.log(`${line}`);
        }
        lineArt = [];
        console.log();
      }

      cardQty++;
    }

    if (cardQty >= 0) {
      for (const line of lineArt) {
        console.log(`${line}`);
      }
      console.log();
    }
  }

  toLineArt(card: Card): string[] {
    const lines: string[] = [];

    const red: string = '\x1b[31m';
    const black: string = '\x1b[30m';
    const fg: string = card.suit.isRed ? red : black;

    const value: number = card.value;
    const suitChar: string = `${fg}${card.suit.symbol}`;

    function pip(condition: number[]): string {
      return condition.indexOf(value) >= 0 ? suitChar : ' ';
    }

    const valueChar: string = `${fg}${card.displayValue}`;

    lines[0] = `${valueChar}${value === 10 ? '' : ' '}       `;
    if (value > 10) {
      lines[1] = `${suitChar}${black}┌─────┐ `;
      lines[2] = ` ${black}│     │ `;
      lines[3] = ` ${black}│  ${valueChar}  ${black}│ `;
      lines[4] = ` ${black}│     │ `;
      lines[5] = ` ${black}└─────┘${suitChar}`;
    } else {
      lines[1] = `${suitChar} ${pip([4, 5, 6, 7, 8, 9, 10])} ${pip([
        2,
        3,
      ])} ${pip([4, 5, 6, 7, 8, 9, 10])}  `;
      lines[2] = `  ${pip([9, 10])} ${pip([8, 10])} ${pip([9, 10])}  `;
      lines[3] = `  ${pip([6, 8])} ${pip([1, 3, 5, 9])} ${pip([6, 8])}  `;
      lines[4] = `  ${pip([9, 10])} ${pip([7, 8, 10])} ${pip([9, 10])}  `;
      lines[5] = `  ${pip([4, 5, 6, 7, 8, 9, 10])} ${pip([2, 3])} ${pip([
        4,
        5,
        6,
        7,
        8,
        9,
        10,
      ])} ${suitChar}`;
    }
    lines[6] = `       ${value === 10 ? '' : ' '}${valueChar}`;

    // Add a white background colour to every line
    const bgWhite: string = '\x1b[47m';
    const reset: string = '\x1b[0m';

    return lines.map((line: string) => `${bgWhite}${line}${reset}`);
  }
}
