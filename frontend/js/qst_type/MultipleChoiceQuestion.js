export default class MultipleChoiceQuestion {
  constructor(step) {
    this.step = step;
  }

  render(existingAnswer = []) {
    const template = document.getElementById('multiple-choice-question-template');
    if (!template) {
      console.error('Template MultipleChoiceQuestion non trouvé');
      return document.createElement('div');
    }

    const container = template.content.cloneNode(true).children[0];
    const optionsContainer = container.querySelector('.options-container');
    this.step.options.forEach(option => {
      const label = document.createElement('label');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = option;

      // pré-remplissage si retour arrière
      if (existingAnswer.includes(option)) {
        checkbox.checked = true;
      }

      const span = document.createElement('span');
      span.textContent = option;

      label.appendChild(checkbox);
      label.appendChild(span);
      optionsContainer.appendChild(label);
    });

    return container;
  }
}
