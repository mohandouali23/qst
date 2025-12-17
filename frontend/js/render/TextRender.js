export default class TextRenderer {
    renderText(step, value = '', onChange) {
      const template = document.getElementById('text-question-template');
      if (!template) {
        console.error('Template TextQuestion non trouvé');
        return document.createElement('div');
    }
  
      const container = template.content.cloneNode(true).children[0];
      const input = container.querySelector('.question-input');
  
      if (step.placeholder) input.placeholder = step.placeholder;
      if (value) input.value = value;
  
      input.addEventListener('input', (e) =>
         onChange(e.target.value));
  
      return container;
    }
  }
  