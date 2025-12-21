//import PrecisionHandler from '../utils/PrecisionHandler.js';
export default class MultipleChoiceRenderer {
  renderMultipleChoice(step, selectedValues, onChange) {
    const template = document.getElementById('multiple-choice-question-template');
    const precisionTemplate = document.getElementById('precision-input-template');

    if (!template || !precisionTemplate) {
      console.error('Template MultipleChoiceQuestion non trouvé');
      return document.createElement('div');
    }

    const container = template.content.cloneNode(true).children[0];
    const optionsContainer = container.querySelector('.options-container');
    const selectedValuesOnly = selectedValues.map(v => v.value);

    step.options.forEach(option => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = step.id;
      checkbox.value = option.value;
      checkbox.checked = selectedValuesOnly.includes(option.value);

      const span = document.createElement('span');
      span.textContent = option.label;

      // Precision
      let precisionContainer = null;
      let precisionInput = null;

      if (option.requiresPrecision) {
        const precisionClone = precisionTemplate.content.cloneNode(true);
        precisionContainer = precisionClone.querySelector('.precision-container');
        precisionInput = precisionContainer.querySelector('.precision-input');
        precisionContainer.style.display = checkbox.checked ? 'block' : 'none';

        const stored = selectedValues.find(v => v.value === option.value);
        if (stored && stored.precision) {
          precisionInput.value = stored.precision;
        }

        precisionInput.addEventListener('input', e => {
          const val = e.target.value.trim() || null;
          onChange(option)(true, val);
        });
      }

      // Événement checkbox
      checkbox.addEventListener('change', e => {
        const isChecked = e.target.checked;

       // Afficher ou cacher le champ precision pour cette option
        if (precisionContainer) {
          precisionContainer.style.display = isChecked ? 'block' : 'none';
        }
        const precisionValue = precisionInput ? (precisionInput.value.trim() || null) : null;
        onChange(option)(isChecked, precisionValue);

       // Après avoir appliqué la règle exclusive, synchroniser les precision
        step.options.forEach(opt => {
          const cb = optionsContainer.querySelector(`input[value="${opt.value}"]`);
          const pc = cb?.parentElement.querySelector('.precision-container');
          if (cb && pc) {
            pc.style.display = cb.checked && opt.requiresPrecision ? 'block' : 'none';
          }
        });
      });

      label.appendChild(checkbox);
      label.appendChild(span);

      if (precisionContainer) {
        label.appendChild(precisionContainer);
      }

      optionsContainer.appendChild(label);
    });

    return container;
  }

  syncCheckboxes(questionId, values) {
    document.querySelectorAll(`input[name="${questionId}"]`).forEach(cb => {
      cb.checked = values.includes(cb.value);
    });
  }
}
