import { showToast } from '../utils/toast.js';
import ButtonNavigation from '../utils/ButtonNavigation.js';

export default class SingleChoiceQuestion {
  constructor(step) {
    this.step = step;
  }

  render(existingAnswer) {
    const template = document.getElementById('single-choice-question-template');
    if (!template) {
      console.error('Template SingleChoiceQuestion non trouvé');
      return document.createElement('div');
    }

    // Cloner le template
    const container = template.content.cloneNode(true).children[0];

    // Mettre le label de la question
    container.querySelector('.question-Num').textContent = this.step.title;
    container.querySelector('.question-label').textContent = this.step.label;

    const optionsContainer = container.querySelector('.options-container');

    // Injecter les options
    this.step.options.forEach(option => {
      const div = document.createElement('div');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = this.step.id;
      input.value = option;
      if (existingAnswer === option) input.checked = true;

      const span = document.createElement('span');
      span.textContent = option;

      div.appendChild(input);
      div.appendChild(span);
      optionsContainer.appendChild(div);
    });

    // Boutons navigation
    const nav = new ButtonNavigation({
      onNext: () => {
        const selected = optionsContainer.querySelector('input[type="radio"]:checked');
        if(this.step.required && !selected) {
          showToast('Veuillez sélectionner une option.');
          return;
        }
        container.dispatchEvent(new CustomEvent('next', { 
          detail: selected ? selected.value : null, 
          bubbles: true 
        }));
      },
      onPrevious: () => {
        container.dispatchEvent(new CustomEvent('previous', { bubbles: true }));
      }
    });

    container.appendChild(nav.render());
    return container;
  }
}
