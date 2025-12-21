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
      //let precisionContainer = null;
      // if (option.requiresPrecision) {
      //   const precisionClone = precisionTemplate.content.cloneNode(true);
      //   precisionContainer = precisionClone.querySelector('.precision-container');
      //   const precisionInput = precisionContainer.querySelector('.precision-input');
      //   precisionContainer.style.display = 'none';

      //   if (existingAnswer && existingAnswer.value === option.codeItem && existingAnswer.precision) {
      //     precisionInput.value = existingAnswer.precision;
      //     precisionContainer.style.display = 'block';
      //   }

      //   precisionInput.addEventListener('input', e => {
      //     onChange({
      //       value: option.codeItem,
      //       label: option.label,
      //       precision: e.target.value || null
      //     });
      //   });

      //   div.appendChild(precisionContainer);
      // }

      input.addEventListener('change', () => {
        optionsContainer.querySelectorAll('.precision-container')
          .forEach(pc => pc.style.display = 'none');

        // if (precisionContainer && input.checked) {
        //   precisionContainer.style.display = 'block';
        // }
        if (precisionHandler && input.checked) precisionHandler.show();
        // const precisionValue = precisionContainer
        //   ? precisionContainer.querySelector('.precision-input').value || null
        //   : null;

        // On envoie un objet complet contenant value, label et precision
        onChange({
          value: option.codeItem,
          label: option.label,
          precision: precisionHandler?.getValue() || null,
          // precision: precisionValue,
          requiresSubQst: option.requiresSubQst || null
        });
      });

      optionsContainer.appendChild(div);
    });

    return container;
  }
}
