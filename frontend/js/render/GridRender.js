// GridRender.js
export default class GridRender {
    renderGrid(step, existingAnswer = null, onChange) {
      const template = document.getElementById('grid-question-template');
      if (!template) return document.createElement('div');
  
      const container = template.content.cloneNode(true).children[0];
      const header = container.querySelector('.grid-header');
      const body = container.querySelector('.grid-body');
  
      // Header
      step.columns.forEach(col => {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.textContent = col.label;
        header.appendChild(cell);
      });
  
      // Body
      const multi = !step.rules?.onePerRow;
      step.rows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('grid-row');
        rowDiv.dataset.rowId = row.id;
  
        const labelCell = document.createElement('div');
        labelCell.classList.add('grid-cell', 'grid-row-label');
        labelCell.textContent = row.label;
        rowDiv.appendChild(labelCell);
  
        step.columns.forEach(col => {
          const cell = document.createElement('div');
          cell.classList.add('grid-cell');
  
          const input = document.createElement('input');
          input.type = multi ? 'checkbox' : 'radio';
          input.name = `grid_${step.id}_${row.id}`;
          input.value = col.value;
  
          // Restaurer depuis le store
          const existingRowAnswer = existingAnswer?.value?.[row.id];
          if (multi && Array.isArray(existingRowAnswer) && existingRowAnswer.includes(col.value)) {
            input.checked = true;
          } else if (!multi && existingRowAnswer?.value === col.value) {
            input.checked = true;
          }
  
          input.addEventListener('change', e => onChange(row.id, col, e.target.checked));
  
          cell.appendChild(input);
          rowDiv.appendChild(cell);
        });
  
        body.appendChild(rowDiv);
      });
  
      return container;
    }
  }
  