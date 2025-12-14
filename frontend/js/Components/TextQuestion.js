import { showToast } from '../utils/toast.js';
import ButtonNavigation from '../utils/ButtonNavigation.js';

export default class TextQuestion {
  constructor(step) {
    this.step = step;
  }

  render(existingAnswer) {
    const template = document.getElementById('text-question-template');
    if (!template) {
      console.error('Template non trouvé');
      return document.createElement('div');
    }

    const container = template.content.cloneNode(true).children[0];
    container.querySelector('.question-Num').textContent = this.step.title;
    container.querySelector('.question-label').textContent = this.step.label;

    const input = container.querySelector('.question-input');
    if (this.step.placeholder) input.placeholder = this.step.placeholder;
//  Pré-remplir si déjà répondu
if (existingAnswer) {
    input.value = existingAnswer;
}
    //  Boutons navigation
    const nav = new ButtonNavigation({
      onNext: () => {
        const value = input.value.trim();
        if (this.step.required && !value) {
          showToast('Veuillez remplir ce champ');
          input.focus();
          return;
        }
        container.dispatchEvent(new CustomEvent('next', { detail: value, bubbles: true }));
      },
      onPrevious: () => {
        container.dispatchEvent(new CustomEvent('previous', { bubbles: true }));
      }
    });

    container.appendChild(nav.render());
    return container;
  }
}
