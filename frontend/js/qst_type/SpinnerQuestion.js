export default class SpinnerQuestion {
    constructor(step) {
      this.step = step;
    }
  
    render(existingAnswer = '') {
      const template = document.getElementById('spinner-question-template');
      if (!template) {
        console.error('Template SpinnerQuestion non trouvé');
        return document.createElement('div');
      }
  
      const container = template.content.cloneNode(true).children[0];
      const select = container.querySelector('.spinner-select');
  
      // Ajouter un élément par défaut vide ou placeholder
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.disabled = true;        // pour que ce ne soit pas sélectionnable comme valeur
      defaultOption.selected = !existingAnswer; // sélectionné si aucune valeur
      defaultOption.textContent = this.step.placeholder || '';
      select.appendChild(defaultOption);
  
      // Ajouter les options réelles
      this.step.options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
      });
  
      // Pré-remplissage si déjà répondu
      if (existingAnswer) select.value = existingAnswer;
  
      return container;
    }
  }
  