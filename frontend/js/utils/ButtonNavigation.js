import { showToast } from './toast.js';

export default class ButtonNavigation {
  constructor(container, step, answers, { onNext, onPrevious }) {
    this.container = container;
    this.step = step;
    this.answers = answers;
    this.onNext = onNext;
    this.onPrevious = onPrevious;
    this.init();
  }

  init() {
    const nextBtn = this.container.querySelector('.next-btn');
    const prevBtn = this.container.querySelector('.prev-btn');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const value = this.getValue();
        if (value === null) return; // validation échouée

        // sauvegarde réponse
        this.answers[this.step.id] = value;

        if (this.onNext) this.onNext(value);
      });
    }

    if (prevBtn && this.onPrevious) {
      prevBtn.addEventListener('click', this.onPrevious);
    }
  }

  getValue() {
    let value = null;

    switch (this.step.type) {
      case 'text': {
        const input = this.container.querySelector('input');
        value = input.value.trim();

        if (this.step.required && !value) {
          showToast('Veuillez remplir ce champ');
          input.focus();
          return null;
        }
        break;
      }

      case 'single_choice': {
        const selectedInput = this.container.querySelector('input[type="radio"]:checked');
        if(this.step.required && !selectedInput) {
          showToast('Veuillez sélectionner une option');
          return null;
        }
      
        const selectedOption = selectedInput.value;
        const div = selectedInput.parentElement;
        const precisionInput = div.querySelector('input[type="text"]');
        let precision = null;
      
        if(precisionInput && precisionInput.style.display !== 'none') {
          precision = precisionInput.value.trim();
          if(!precision) {
            showToast('Veuillez préciser votre réponse');
            precisionInput.focus();
            return null;
          }
        }
      
        value = { value: selectedOption, precision };
        break;
      }
      

      case 'multiple_choice': {
        const selected = [
          ...this.container.querySelectorAll('input[type="checkbox"]:checked')
        ].map(i => i.value);

        if (this.step.required && selected.length === 0) {
          showToast('Veuillez sélectionner au moins une option');
          return null;
        }
        value = selected;
        break;
      }
      case 'spinner': {
        const select = this.container.querySelector('select');
        value = select.value;
        if (this.step.required && !value) {
          showToast('Veuillez sélectionner une option');
          select.focus();
          return null;
        }
        break;
      }
      
      case 'autocomplete': {
        const input = this.container.querySelector('.autocomplete-input');
        const label = input.value.trim();
        const id = input.dataset.id;
      
        if (this.step.required && (!label || !id)) {
          showToast('Veuillez choisir une valeur dans la liste');
          input.focus();
          return null;
        }
      
        value = { id, label };
        break;
      }
      

      default:
        console.warn('Type non géré :', this.step.type);
        return null;
    }

    return value;
  }
}
