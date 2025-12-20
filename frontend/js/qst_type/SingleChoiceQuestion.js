import Question from './Question.js';
import QuestionContent from './QuestionContent.js';
import SubQuestionRender from '../render/SubQuestionRender.js';
import { showToast } from '../utils/toast.js';

const subQuestionRender = new SubQuestionRender();

export default class SingleChoiceQuestion extends Question {
  constructor(step, store, renderer, allSteps = [], sources = {}) {
    super(step, store, renderer);
    this.allSteps = allSteps;
    this.sources = sources;
    this.selectedOption = null;
    this.subQuestionInstance = null;
    this.precisionHandler = null;
  }
init() {
  this.existingAnswer = this.getAnswer();

  // Restaurer la sélection principale
  if (this.existingAnswer?.value) {
    this.selectedOption = this.step.options.find(
      o => o.codeItem === this.existingAnswer.value.codeItem
    );

    if (this.existingAnswer.value.precision) {
      this.selectedOption.precision = this.existingAnswer.value.precision;
    }
  } else {
    this.selectedOption = null;
  }

  // Restaurer la sous-question
  const subStepId = this.existingAnswer?.subAnswer
    ? Object.keys(this.existingAnswer.subAnswer)[0]
    : null;

  if (subStepId) {
    const subStep = this.allSteps.find(s => s.id === subStepId);
    if (subStep) {
      const tableData = subStep.table ? { [subStep.table]: this.sources[subStep.table] || [] } : {};
      this.subQuestionInstance = new QuestionContent(subStep, this.allSteps, tableData, 'sub-question-template');

      // Important : initialiser d'abord le composant
      this.subQuestionInstance.initComponent();

      // Ensuite passer la valeur existante
      const existingSubAnswer = this.existingAnswer.subAnswer[subStepId] || this.store.get(subStep.id);
      if (existingSubAnswer) {
        // Appel après initComponent
        setTimeout(() => {
          this.subQuestionInstance.component?.setAnswer(existingSubAnswer);
        }, 0);
      }

      // Redéfinir setAnswer pour propager au parent
      const subComp = this.subQuestionInstance.component;
      if (subComp) {
        const originalSetAnswer = subComp.setAnswer.bind(subComp);
        subComp.setAnswer = (val) => {
          originalSetAnswer(val);
          this.setAnswer(this.buildAnswerObject());
        };
      }
    }
  } else {
    this.subQuestionInstance = null;
  }

  this.step.component = this;
}


  // init() {
  //   this.existingAnswer = this.getAnswer();
  //   if (this.existingAnswer?.value) {
  //     console.log('existingAnswer?.value', this.existingAnswer?.value)
  //     // Trouver l'option correspondante dans la liste
  //     this.selectedOption = this.step.options.find(
  //       o => o.codeItem === this.existingAnswer.value.codeItem
  //     );
  //     console.log(' this.selectedOption option', this.selectedOption)
  //     // Restaurer la précision si elle existe
  //     if (this.existingAnswer.value.precision) {
  //       this.selectedOption.precision = this.existingAnswer.value.precision;
  //     }
  //   } else {
  //     this.selectedOption = null;
  //   }
  //   // Si la sous-question existe déjà dans le store
  //   const subStepId = this.existingAnswer?.subAnswer ? Object.keys(this.existingAnswer.subAnswer)[0] : null;
  //   if (subStepId) {
  //     const subStep = this.allSteps.find(s => s.id === subStepId);
  //     if (subStep) {
  //       const tableData = subStep.table ? { [subStep.table]: this.sources[subStep.table] || [] } : {};
  //       this.subQuestionInstance = new QuestionContent(subStep, this.allSteps, tableData, 'sub-question-template');
  //       this.subQuestionInstance.initComponent();

  //       // Pré-remplir la valeur existante
  //       // this.subQuestionInstance.component?.setAnswer(this.existingAnswer.subAnswer[subStepId]);
  //       const existingSubAnswer =
  //         this.existingAnswer.subAnswer[subStepId] || this.store.get(subStep.id);
  //         console.log('existingSubAnswer',existingSubAnswer)
  //       if (existingSubAnswer) {
  //         this.subQuestionInstance.component?.setAnswer(existingSubAnswer);
  //          console.log('existingSubAnswer33',this.subQuestionInstance.component)
  //       }
  //       // Redéfinir setAnswer pour propager au parent
  //       const subComp = this.subQuestionInstance.component;
  //       if (subComp) {
  //         const originalSetAnswer = subComp.setAnswer.bind(subComp);
  //         subComp.setAnswer = (val) => {
  //           originalSetAnswer(val);
  //           this.setAnswer(this.buildAnswerObject());
  //         };
  //       }
  //     }
  //   } else {
  //     this.subQuestionInstance = null;
  //   }
  //   this.step.component = this;
  // }
  buildAnswerObject() {
    if (!this.selectedOption) return null;

    const valueObj = {
      codeItem: this.selectedOption.codeItem,
      label: this.selectedOption.label,
      precision: this.selectedOption.precision || null
    };

    // Ajouter la précision directement à l'intérieur de value
    // if (this.selectedOption?.precision) {
    //   valueObj.precision = this.selectedOption.precision;
    // }
    const answer = {
      questionId: this.step.id,
      type: 'single_choice',
      value: valueObj
      // value: this.selectedOption?.value ?? null,
      // label: this.selectedOption?.label ?? null
    };

    // Ajouter la sous-question si elle existe
    if (this.subQuestionInstance) {
      //  const subAnswer = this.subQuestionInstance.component?.getAnswer?.() ?? null;
      const subAnswerObj = this.subQuestionInstance.component?.buildAnswerObject?.();
      if (subAnswerObj) {
        answer.subAnswer = {
          [this.subQuestionInstance.step.id]: subAnswerObj
          // id: this.subQuestionInstance.step.id,
          // value: subAnswer
        };
      }
    }

    return answer;
  }

  onChange(selected) {

    //const answer = { value: selected.value, label: selected.label };
    // if (selected.precision) answer.precision = selected.precision;

    // selected.value = codeItem envoyé par le renderer
    this.selectedOption = this.step.options.find(o => o.codeItem === selected.value);

    // si l’utilisateur a rempli la précision, on la garde
    if (selected.precision) {
      this.selectedOption.precision = selected.precision;
    }

    console.log('selectedOption complète:', this.selectedOption);

    // Gérer sous-question
    if (selected.requiresSubQst?.value) {
      // answer.requiresSubQstId = selected.requiresSubQst.subQst_id;

      const subStep = this.allSteps.find(s => s.id === selected.requiresSubQst.subQst_id);
      console.log('subStep', subStep)
      if (subStep) {
        //subStep.isSubQuestion = true;
        // Vérifier si c’est un autocomplete et récupérer les données
        const tableData = subStep.table ? { [subStep.table]: this.sources[subStep.table] || [] } : {}; console.log('tableData', tableData)
        this.subQuestionInstance = new QuestionContent(subStep, this.allSteps, tableData, 'sub-question-template');
        this.subQuestionInstance.initComponent();

        // Pré-remplir si déjà existant
        const existingSubAnswer = this.store.get(subStep.id);
        if (existingSubAnswer) this.subQuestionInstance.component.setAnswer(existingSubAnswer);
        // redéfinir setAnswer pour propager au parent
        const subComp = this.subQuestionInstance.component;
        if (subComp) {
          const originalSetAnswer = subComp.setAnswer.bind(subComp);
          subComp.setAnswer = (val) => {
            originalSetAnswer(val);
            this.setAnswer(this.buildAnswerObject());
          };
        }
      }
    } else {
      this.subQuestionInstance = null;
    }

    //this.setAnswer(answer);
    // Sauvegarder la réponse principale avec buildAnswerObject
    this.setAnswer(this.buildAnswerObject());
  }
  isValid() {
    console.log("this.selectedOption", this.selectedOption)
    // Vérification réponse principale
    if (!this.selectedOption?.codeItem) {
      showToast('Veuillez sélectionner une option');
      return false;
    }

    // Vérification précision si nécessaire
    if (this.selectedOption.requiresPrecision && (!this.selectedOption.precision || this.selectedOption.precision.trim() === '')) {
      showToast('Veuillez préciser votre réponse');
      return false;
    }

    // Vérification sous-question si existante
    if (this.subQuestionInstance) {
      const subValid = this.subQuestionInstance.isValid?.();
      if (!subValid) return false;
    }

    return true;
  }
  render() {
    this.init();
    const container = this.renderer.renderSingleChoice(
      this.step,
      this.existingAnswer,

      (selected) => {
        this.onChange(selected);
        this.renderSubQuestion(container);
      }
    );

    this.renderSubQuestion(container);
    return container;
  }
  renderSubQuestion(container) {
    if (!this.subQuestionInstance) return;

    const oldSub = container.querySelector('.sub-question-container');
    if (oldSub) oldSub.remove();

    const subContainer = subQuestionRender.renderSubQuestion(this.subQuestionInstance);
    container.appendChild(subContainer);
  }


}
