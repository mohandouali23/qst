export default class AutocompleteQuestion {
    constructor(step, sourceData, config = {}) {
      this.step = step;
      this.sourceData = sourceData;
  
      // configuration générique
      this.labelField = config.labelField || 'label';
      this.idField = config.idField || 'id';
    }
  
    render(existingAnswer = '') {
      const template = document.getElementById('autocomplete-question-template');
      if (!template) {
        console.error('Template AutocompleteQuestion non trouvé');
        return document.createElement('div');
      }
  
      const container = template.content.cloneNode(true).children[0];
      const input = container.querySelector('.autocomplete-input');
      const suggestions = container.querySelector('.autocomplete-suggestions');
  
      if (existingAnswer?.label) {
        input.value = existingAnswer.label;
        input.dataset.id = existingAnswer.id;
      }
  
      input.addEventListener('input', () => {
        const value = input.value.toLowerCase().trim();
        suggestions.innerHTML = '';
  
        if (!value) {
          suggestions.style.display = 'none';
          input.dataset.id = '';
          return;
        }
  
        const results = this.sourceData.filter(item =>
          item[this.labelField].toLowerCase().includes(value)
        );
  
        results.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item[this.labelField];
  
          li.addEventListener('click', () => {
            input.value = item[this.labelField];
            input.dataset.id = item[this.idField];
            suggestions.style.display = 'none';
          });
  
          suggestions.appendChild(li);
        });
  
        suggestions.style.display = results.length ? 'block' : 'none';
      });
  
      document.addEventListener('click', e => {
        if (!container.contains(e.target)) {
          suggestions.style.display = 'none';
        }
      });
  
      return container;
    }
  }
  