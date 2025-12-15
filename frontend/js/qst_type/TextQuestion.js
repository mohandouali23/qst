
export default class TextQuestion {
  constructor(step) {
    this.step = step;
  }

  render(existingAnswer = '') {
    const template = document.getElementById('text-question-template');
    if (!template) {
      console.error('Template non trouvé');
      return document.createElement('div');
    }
    const container = template.content.cloneNode(true).children[0];

    const input = container.querySelector('.question-input');
    if (this.step.placeholder) input.placeholder = this.step.placeholder;

    if(this.step.placeholder) input.placeholder = this.step.placeholder;
    if(existingAnswer) input.value = existingAnswer;

    container.appendChild(input);
    return container;
  }
}
