export default class AutocompleteRenderer {
  renderAutocomplete(step, sourceData, existingAnswer, onChange) {
    const template = document.getElementById('autocomplete-question-template');
    if (!template) {
      console.error('Template AutocompleteQuestion non trouvé');
      return document.createElement('div');
    }

    const container = template.content.cloneNode(true).children[0];
    const input = container.querySelector('.autocomplete-input');
    const suggestions = container.querySelector('.autocomplete-suggestions');

    if (step.placeholder) input.placeholder = step.placeholder;

    // Préremplissage si existant
    if (existingAnswer) {
      input.value = step.columns
        .filter(c => c.displayInInput)
        .map(c => existingAnswer[c.name])
        .filter(Boolean)
        .join(' - ');
        // const idColumn = step.columns.find(c => c.name === '_id');
        // input.dataset.id = existingAnswer[idColumn.name] || '';
      input.dataset.id = existingAnswer._id || '';
    }

    const renderSuggestions = (value) => {
      suggestions.innerHTML = '';
      if (!value) {
        suggestions.style.display = 'none';
        input.dataset.id = '';
        return;
      }

      const results = sourceData.filter(item =>
        step.columns.some(c => c.displayInList && item[c.name]?.toLowerCase().includes(value))
      );

      results.forEach(item => {
        const li = document.createElement('li');
        li.textContent = step.columns
          .filter(c => c.displayInList)
          .map(c => item[c.name])
          .filter(Boolean)
          .join(' - ');

        li.addEventListener('click', () => {
          input.value = step.columns
            .filter(c => c.displayInInput)
            .map(c => item[c.name])
            .filter(Boolean)
            .join(' - ');
          input.dataset.id = item._id;
          suggestions.style.display = 'none';
          onChange(item);
        });

        suggestions.appendChild(li);
      });

      suggestions.style.display = results.length ? 'block' : 'none';
    };

    input.addEventListener('input', (e) => renderSuggestions(e.target.value.toLowerCase().trim()));

    document.addEventListener('click', e => {
      if (!container.contains(e.target)) suggestions.style.display = 'none';
    });

    return container;
  }
}
