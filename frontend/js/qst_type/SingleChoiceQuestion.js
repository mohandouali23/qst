export default class SingleChoiceQuestion {
  constructor(step) {
    this.step = step;
  }

  render(existingAnswer = null) {
    const template = document.getElementById('single-choice-question-template');
    const precisionTemplate = document.getElementById('precision-input-template');

    if (!template || !precisionTemplate) {
      console.error('Template SingleChoiceQuestion ou Precision non trouvé');
      return document.createElement('div');
    }

    const container = template.content.cloneNode(true).children[0];
    const optionsContainer = container.querySelector('.options-container');

    // this.step.options.forEach(option => {
    //   const div = document.createElement('div');

    //   const input = document.createElement('input');
    //   input.type = 'radio';
    //   input.name = this.step.id;
    //   input.value = option.label;
    //   if(existingAnswer && existingAnswer.value === option.label) input.checked = true;

    //   const span = document.createElement('span');
    //   span.textContent = option.label;

    //   div.appendChild(input);
    //   div.appendChild(span);

    //   // Champ précision cloné depuis template

    //   if(option.requiresPrecision) {
    //     const precisionClone = precisionTemplate.content.cloneNode(true);
    //     const precisionContainer = precisionClone.querySelector('.precision-container');
    //     const precisionInput = precisionContainer.querySelector('.precision-input');

    //     // Toujours cacher au départ
    //     precisionContainer.style.display = 'none';

    //     // Pré-remplissage si déjà répondu
    //     if(existingAnswer && 
    //       existingAnswer.value === option.label && 
    //       existingAnswer.precision) {
    //       precisionInput.value = existingAnswer.precision;
    //       precisionContainer.style.display = 'block';
    //     }

    //     div.appendChild(precisionContainer);

    //     // Afficher / cacher le champ selon sélection
    //     input.addEventListener('change', () => {
    //       precisionContainer.style.display = input.checked ? 'block' : 'none';
    //     });

    //     // Vérifie à l'initialisation si ce radio est coché
    //     if(input.checked) {
    //       precisionContainer.style.display = 'block';
    //     }
    //   }


    //   optionsContainer.appendChild(div);
    // });

    this.step.options.forEach(option => {
      const div = document.createElement('div');
      // Radio input
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = this.step.id;
      input.value = option.codeItem;

      if (existingAnswer && existingAnswer.value === option.codeItem) {
        input.checked = true;
      }

      const span = document.createElement('span');
      span.textContent = option.label;

      div.appendChild(input);
      div.appendChild(span);
      //  Champ précision (si nécessaire)
      let precisionContainer = null;

      if (option.requiresPrecision) {
        const precisionClone = precisionTemplate.content.cloneNode(true);
        precisionContainer = precisionClone.querySelector('.precision-container');
        const precisionInput = precisionContainer.querySelector('.precision-input');

        precisionContainer.style.display = 'none';

        // Pré-remplissage
        if (
          existingAnswer &&
          existingAnswer.value === option.codeItem &&
          existingAnswer.precision
        ) {
          precisionInput.value = existingAnswer.precision;
          precisionContainer.style.display = 'block';
        }

        div.appendChild(precisionContainer);
      }

      // ✅ GESTION GLOBALE DU CHANGE
      input.addEventListener('change', () => {
        // 1️⃣ cacher tous les champs précision
        optionsContainer
          .querySelectorAll('.precision-container')
          .forEach(pc => pc.style.display = 'none');

        // 2️⃣ afficher uniquement celui de "Autre"
        if (precisionContainer && input.checked) {
          precisionContainer.style.display = 'block';
        }
      });

      optionsContainer.appendChild(div);
    });

    return container;
  }
}
