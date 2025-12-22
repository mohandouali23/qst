import PrecisionHandler from '../utils/PrecisionHandler.js';
export default class SingleChoiceRender {
  renderSingleChoice(step, existingAnswer = null, onChange) {
    console.log('exist pour render', existingAnswer, 'step:', step.id);
    const template = document.getElementById('single-choice-question-template');
    const precisionTemplate = document.getElementById('precision-input-template');

    if (!template || !precisionTemplate) {
      console.error('Template SingleChoiceQuestion ou Precision non trouvé');
      return document.createElement('div');
    }

    const container = template.content.cloneNode(true).children[0];
    const optionsContainer = container.querySelector('.options-container');
// Vider le container avant d'ajouter les nouvelles options
optionsContainer.innerHTML = '';

    step.options.forEach(option => {
      const div = document.createElement('div');
      div.classList.add('option-item');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = step.id;
      input.value = option.codeItem;
      input.id = `${step.id}_${option.codeItem}`;
      if (existingAnswer && existingAnswer.value?.codeItem === option.codeItem) {
        input.checked = true;
      }

      const span = document.createElement('span');
      span.textContent = option.label;

      div.appendChild(input);
      div.appendChild(span);

      let precisionHandler = null;
      if (option.requiresPrecision) {
        precisionHandler = new PrecisionHandler(div, option, existingAnswer, (precision) => {
          onChange({
            value: option.codeItem,
            label: option.label,
            precision
          });
        });
      }
      // Si l’option est déjà cochée et nécessite précision, afficher le champ
      if (input.checked && precisionHandler) {
        precisionHandler.show();
      }
     
      input.addEventListener('change', () => {
        optionsContainer.querySelectorAll('.precision-container')
          .forEach(pc => pc.style.display = 'none');
        if (precisionHandler && input.checked) precisionHandler.show();
    
        // On envoie un objet complet contenant value, label et precision
        onChange({
          value: option.codeItem,
          label: option.label,
          ...(precisionHandler?.getValue() !== undefined && { precision: precisionHandler.getValue() }),
          ...(option.requiresSubQst && { requiresSubQst: option.requiresSubQst })
          // precision: precisionHandler?.getValue() || null,
          // requiresSubQst: option.requiresSubQst || null
        });
      });

      optionsContainer.appendChild(div);
    });

    return container;
  }
}
