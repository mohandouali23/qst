// GridQuestion.js
import Question from './Question.js';
import { showToast } from '../utils/toast.js';
import ExclusiveRule from '../rules/ExclusiveRule.js';

export default class GridQuestion extends Question {
  constructor(step, store, renderer) {
    super(step, store, renderer);
    this.values = {}; // { rowId: [val,...] pour checkbox, {rowId: {value,label}} pour radio
    this._hasInitialized = false;
  }

  /************** INIT **************/
  init() {
    if (this._hasInitialized) return;

    const existingAnswer = this.getAnswer();
    this.values = existingAnswer?.value || {};

    this.step.component = this;
    this._hasInitialized = true;
  }

  /************** ON CHANGE **************/
  onChange(rowId, col, checked = true) {
    const multi = !this.step.rules?.onePerRow;

    if (multi) {
      if (!this.values[rowId]) this.values[rowId] = [];

      if (checked) {
        // Appliquer la règle exclusive
        const currentSelections = this.values[rowId].map(v => ({ value: v }));
        let updated = ExclusiveRule.apply(this.step.columns, currentSelections, col.value);

        // Ajouter la valeur cochée si absente
        if (!updated.some(v => v.value === col.value)) updated.push({ value: col.value });

        this.values[rowId] = updated.map(v => v.value);
      } else {
        this.values[rowId] = this.values[rowId].filter(v => v !== col.value);
      }
    } else {
      // radio
      this.values[rowId] = { value: col.value, label: col.label };
    }

    this.setAnswer(this.buildAnswerObject());
  }

  /************** BUILD ANSWER **************/
  buildAnswerObject() {
    return {
      questionId: this.step.id,
      type: 'grid',
      value: this.values
    };
  }

  /************** VALIDATION **************/
  isValid() {
    const { rules = {}, rows } = this.step;

    // requiredRows (validation séparée)
    if (rules.requiredRows) {
      for (const rowId of rules.requiredRows) {
        const val = this.values[rowId];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          showToast(`Veuillez répondre à la ligne ${rowId}`);
          return false;
        }
      }
    }

    // forbiddenCombinations
    if (rules.forbiddenCombinations) {
      for (const rule of rules.forbiddenCombinations) {
        const val = Array.isArray(this.values[rule.row])
          ? this.values[rule.row]
          : [this.values[rule.row]?.value];
        if (val.includes(rule.value)) {
          showToast(`Valeur interdite pour ${rule.row}`);
          return false;
        }
      }
    }

    return true;
  }

  /************** RENDER **************/
  render() {
    if (!this._hasInitialized) this.init();

    const answerForRender = this.getAnswer();
    return this.renderer.renderGrid(
      this.step,
      answerForRender,
      (rowId, col, checked) => {
        this.onChange(rowId, col, checked);

        // Mise à jour visuelle immédiate
        const multi = !this.step.rules?.onePerRow;
        const rowDiv = document.querySelector(`[data-row-id="${rowId}"]`);
        if (rowDiv && multi) {
          const rowInputs = rowDiv.querySelectorAll('input');
          const selectedValues = this.values[rowId] || [];
          rowInputs.forEach(i => {
            i.checked = selectedValues.includes(i.value);
          });
        }
      }
    );
  }

  /************** RESET **************/
  reset() {
    this._hasInitialized = false;
    this.values = {};
  }
}
