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
  }

  // init() {
  //   this.existingAnswer = this.getAnswer();

  //   // Si sous-question existante dans le store, créer l'instance
  //   if (this.existingAnswer?.requiresSubQstId) {
  //     const subStep = this.allSteps.find(s => s.id === this.existingAnswer.requiresSubQstId);
  //     if (subStep) {
  //       //subStep.isSubQuestion = true;
  //       this.subQuestionInstance = new QuestionContent(subStep, this.allSteps, {}, 'sub-question-template');
  //       this.subQuestionInstance.initComponent();
  //     }
  //   }
  //   // Attacher l'instance au step pour ButtonNavigation
  //   this.step.component = this;
  // }
 init() {
    const existingAnswer = this.getAnswer();
    this.selectedOption = existingAnswer?.value ?? null;

    // Si la sous-question existe déjà dans le store
    const subStepId = existingAnswer?.subAnswer ? Object.keys(existingAnswer.subAnswer)[0] : null;
    if (subStepId) {
      const subStep = this.allSteps.find(s => s.id === subStepId);
      if (subStep) {
        const tableData = subStep.table ? { [subStep.table]: this.sources[subStep.table] || [] } : {};
        this.subQuestionInstance = new QuestionContent(subStep, this.allSteps, tableData, 'sub-question-template');
        this.subQuestionInstance.initComponent();

        // pré-remplir la valeur si existante
        this.subQuestionInstance.component?.setAnswer(existingAnswer.subAnswer[subStepId]);
      }
    }

    this.step.component = this;
  }
  buildAnswerObject() {
    if (!this.selectedOption) return null;

    const valueObj = {
      codeItem: this.selectedOption.codeItem,
      label: this.selectedOption.label
    };

    // Ajouter la précision directement à l'intérieur de value
    if (this.selectedOption?.precision) {
      valueObj.precision = this.selectedOption.precision;
    }
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
    console.log("this.selectedOption.requiresPrecision", this.selectedOption)
    // Vérification réponse principale
    if (!this.selectedOption?.codeItem) {
      showToast('Veuillez sélectionner une option');
      return false;
    }
    console.log("this.selectedOption.requiresPrecision", this.selectedOption)
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
  // renderSubQuestion(container) {
  //   // Supprimer l'ancienne sous-question
  //   const oldSub = container.querySelector('.sub-question-container');
  //   if (oldSub) oldSub.remove();

  //   if (!this.subQuestionInstance) return;

  //   const subContainer = subQuestionRender.renderSubQuestion(this.subQuestionInstance);
  //   container.appendChild(subContainer);

  //   // Mettre à jour le store quand la sous-question change
  //   const subComp = this.subQuestionInstance.component;
  //   if (subComp?.setAnswer) {
  //     const originalSetAnswer = subComp.setAnswer.bind(subComp);
  //     subComp.setAnswer = (val) => {
  //       originalSetAnswer(val);

  //       // Mettre à jour UNIQUEMENT la réponse principale avec la sous-question imbriquée
  //       const mainAnswer = this.getAnswer() || {};
  //       mainAnswer.subAnswer = {
  //         [this.subQuestionInstance.step.id]: val
  //         // id: this.subQuestionInstance.step.id,
  //         // value: val
  //       };

  //       // Sauvegarder UNIQUEMENT la réponse principale
  //       this.setAnswer(mainAnswer);
  //     };
  //   }
  // }
  // getSourceData(step) {
  //   if (step.type === 'autocomplete') {
  //     // Retourner les données correspondant au step.table, ou via API
  //     return this.sourceDataMap?.[step.table] || [];
  //   }
  //   return [];
  // }

}
