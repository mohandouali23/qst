export default class PrecisionHandler {
  constructor(container, option, existingAnswer, onChange) {
    this.container = container;
    this.option = option;
    this.onChange = onChange;

    const template = document.getElementById('precision-input-template');
    if (!template) {
      console.error('Template precision-input non trouvé');
      return;
    }

    // Cloner le template
    const clone = template.content.cloneNode(true);
    this.precisionContainer = clone.querySelector('.precision-container');
    this.precisionInput = this.precisionContainer.querySelector('.precision-input');

    this.precisionContainer.style.display = 'none';

    // Pré-remplir si nécessaire
    if (existingAnswer && existingAnswer?.value?.codeItem === option.codeItem && existingAnswer.value.precision) {
      this.precisionInput.value = existingAnswer.value.precision;
      this.precisionContainer.style.display = 'block';
    }

    // Ajouter l'événement input
    this.precisionInput.addEventListener('input', (e) => {
     
       this.onChange(e.target.value || null);
      
    });

    // On peut attacher le container à l'extérieur
    if (this.container) this.container.appendChild(this.precisionContainer);
  }

  show() {
    if (this.precisionContainer) this.precisionContainer.style.display = 'block';
  }

  hide() {
    if (this.precisionContainer) this.precisionContainer.style.display = 'none';
  }

  getValue() {
    return this.precisionInput?.value || null;
  }
}
