export default class SpinnerRender {
  renderSpinner(step, value = '', onChange) {
    const template = document.getElementById('spinner-question-template');
    if (!template) {
      console.error('Template SpinnerQuestion non trouvé');
      return document.createElement('div');
    }

    const container = template.content.cloneNode(true).children[0];
    const select = container.querySelector('.spinner-select');

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = !value; // sélectionné si aucune valeur
    defaultOption.textContent = step.placeholder || '';
    select.appendChild(defaultOption);

    // Ajouter les options réelles
    step.options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
      select.appendChild(opt);
    });

    // Pré-remplissage si déjà répondu
    if (value) select.value = value;

    // Gestion du changement
    if (typeof onChange === 'function') {
      select.addEventListener('change', (e) => onChange(e.target.value));
    } else {
      console.error('SpinnerRender: onChange n’est pas une fonction');
    }

    return container;
  }
}
