import Question from './Question.js';
import ExclusiveRule from '../rules/ExclusiveRule.js';
import QuestionContent from './QuestionContent.js';
import SubQuestionRender from '../render/SubQuestionRender.js';

const subQuestionRender = new SubQuestionRender();

export default class MultipleChoiceQuestion extends Question {
  constructor(step, store, renderer, allSteps) {
    super(step, store, renderer);
    this.selectedValues = [];
    this.allSteps = allSteps;
    this.subQuestionInstance = null;
    this.container = null;
  }

  init() {
    this.selectedValues = this.getAnswer() || [];
    // Attacher l'instance au step pour ButtonNavigation
    this.step.component = this;
  }

  onChange(option, checked, precision = null) {
    const existingIndex = this.selectedValues.findIndex(v => v.value === option.value);

    if (checked) {
      const obj = {
        value: option.value,
        label: option.label,
        codeItem: option.codeItem
      };

      if (precision && precision.trim() !== '') {
        obj.precision = precision.trim();
      }

      // Ajouter ou mettre à jour l'objet sélectionné
      if (existingIndex >= 0) {
        this.selectedValues[existingIndex] = { ...this.selectedValues[existingIndex], ...obj };
      } else {
        this.selectedValues.push(obj);
      }

      // Gérer sous-question si nécessaire
      if (option.requiresSubQst?.value) {
        const subStep = this.allSteps.find(s => s.id === option.requiresSubQst.subQst_id);
        if (subStep) {
          this.subQuestionInstance = new QuestionContent(subStep, this.allSteps, {}, 'sub-question-template');
          this.subQuestionInstance.initComponent();
          this.subQuestionInstance.parentValue = option.value;

          // Pré-remplir la sous-question si déjà existante
          const existingSub = this.selectedValues[existingIndex]?.subAnswer;
          if (existingSub) {
            this.subQuestionInstance.component.setAnswer(existingSub);
          }
        }
      } else {
        this.subQuestionInstance = null;
      }

    } else {
      // Décocher → supprimer l'objet et la sous-question correspondante
      this.selectedValues = this.selectedValues.filter(v => v.value !== option.value);
      if (this.subQuestionInstance?.parentValue === option.value) {
        this.subQuestionInstance = null;
      }
    }

    // Appliquer la règle exclusive
    this.selectedValues = ExclusiveRule.apply(
      this.step.options,
      this.selectedValues,
      option.value
    );

    // Stocker la réponse
    this.setAnswer([...this.selectedValues]);

    // Mettre à jour le DOM des checkboxes
    this.renderer.syncCheckboxes(
      this.step.id,
      this.selectedValues.map(v => v.value)
    );

    // Mettre à jour le DOM de la sous-question
    if (this.container) this.renderSubQuestion(this.container);
  }

  render() {
    this.init();

    this.container = this.renderer.renderMultipleChoice(
      this.step,
      this.selectedValues,
      (option) => (checked, precision = null) => this.onChange(option, checked, precision)
    );

    this.renderSubQuestion(this.container);
    return this.container;
  }

  renderSubQuestion(container) {
    // Supprimer l'ancienne sous-question
    const oldSub = container.querySelector('.sub-question-container');
    if (oldSub) oldSub.remove();

    if (!this.subQuestionInstance) return;

    const subContainer = subQuestionRender.renderSubQuestion(this.subQuestionInstance);
    container.appendChild(subContainer);

    // Mettre à jour le store quand la sous-question change
    const subComp = this.subQuestionInstance.component;
    if (subComp?.setAnswer) {
      //const originalSetAnswer = subComp.setAnswer.bind(subComp);
      subComp.setAnswer = (val) => {
        //originalSetAnswer(val);

        // Mettre à jour uniquement l'objet correspondant à l'option parent
        const mainAnswer = this.getAnswer() || [];
        const index = mainAnswer.findIndex(v => v.value === this.subQuestionInstance.parentValue);
        if (index >= 0) {
          mainAnswer[index] = {
            ...mainAnswer[index],
            subAnswer: {
              id: this.subQuestionInstance.step.id, // id de la sous-question
              value: val // valeur saisie
            }
          };
          console.log('mainAnswer',mainAnswer)
          this.setAnswer(mainAnswer);
        }
      };
    }
  }
}
