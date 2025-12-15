export default class AutocompleteQuestion {
  constructor(step, sourceData) {
    this.step = step;
    this.sourceData = sourceData || [];

    // récupérer les colonnes avec leurs règles
    this.columns = Array.isArray(step.columns) ? step.columns : [];

    // idField : on récupère la colonne qui sera l’ID dans la DB
    const idCol = this.columns.find(c => c.saveInDB && c.name.toLowerCase().includes('id'));
    this.idField = idCol ? idCol.name : 'id';
  }

  render(existingAnswer = '') {
    const template = document.getElementById('autocomplete-question-template');
    if (!template) {
      console.error('Template AutocompleteQuestion non trouvé');
      return document.createElement('div');
    }

    const container = template.content.cloneNode(true).children[0];
    const input = container.querySelector('.autocomplete-input');
    if (this.step.placeholder) input.placeholder = this.step.placeholder;
    const suggestions = container.querySelector('.autocomplete-suggestions');

    // préremplissage si existant
    if (existingAnswer) {
      input.value = this.columns
        .filter(c => c.displayInInput)
        .map(c => existingAnswer[c.name])
        .filter(Boolean)
        .join(' - ');
      input.dataset.id = existingAnswer[this.idField] || '';
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
        this.columns.some(c => c.displayInList && item[c.name] && item[c.name].toLowerCase().includes(value))
      );

      results.forEach(item => {
        const li = document.createElement('li');

        // afficher uniquement les colonnes displayInList dans la liste
        li.textContent = this.columns
          .filter(c => c.displayInList)
          .map(c => item[c.name])
          .filter(Boolean)
          .join(' - ');

        li.addEventListener('click', () => {
          // remplir input avec colonnes displayInInput
          input.value = this.columns
            .filter(c => c.displayInInput)
            .map(c => item[c.name])
            .filter(Boolean)
            .join(' - ');

          // id pour stockage
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

  // récupérer la valeur à enregistrer dans la DB
  getValue(input) {
    const selectedId = input.dataset.id;
    const selectedItem = this.sourceData.find(item => item[this.idField] == selectedId);
    if (!selectedItem) return null;

    // ne retourner que les colonnes à sauvegarder
    const value = {};
    this.columns.forEach(c => {
      if (c.saveInDB) value[c.name] = selectedItem[c.name];
    });

    return value;
  }
}
