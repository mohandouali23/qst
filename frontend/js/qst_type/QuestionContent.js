// frontend/core/QuestionContent.js
import MultipleChoiceQuestion from './MultipleChoiceQuestion.js';
import TextQuestion from './TextQuestion.js';
import SingleChoiceQuestion from './SingleChoiceQuestion.js';
import AutocompleteQuestion from './AutocompleteQuestion.js';

import MultipleChoiceRenderer from '../render/MultipleChoiceRenderer.js';
import TextRender from '../render/TextRender.js';
import SingleChoiceRender from '../render/SingleChoiceRender.js';
import AutoCompleteRender from '../render/AutoCompleteRender.js';

import AnswerStore from '../store/AnswerStore.js';
import SpinnerRender from '../render/SpinnerRender.js';
import SpinnerQuestion from './SpinnerQuestion.js';
import Question from './Question.js';

const store = new AnswerStore();
const renderers = {
  multiple_choice: new MultipleChoiceRenderer(),
  text: new TextRender(),
  single_choice: new SingleChoiceRender(),
  autoComplete: new AutoCompleteRender(),
  spinner: new SpinnerRender(),
};
const TEMPLATE_CONFIG = {
  'question-template': {
    num: '.question-num',
    text: '.question-text',
    content: '.question-content'
  },
  'sub-question-template': {
    num: '.sub-question-num',
    text: '.sub-question-text',
    content: '.sub-question-content'
  }
};

export default class QuestionContent extends Question{ 
  /**
   * @param {Object} step - La question courante
   * @param {Array} allSteps - Toutes les étapes du questionnaire
   * @param {Object} sources - Les données sources (ex: communes)
   * @param {string} templateId - ID du template HTML à utiliser (optionnel)
   */
  constructor(step, allSteps = [], sources = {}, templateId = null) {
    super(step, store);
    this.step = step;
    this.allSteps = allSteps;
    this.sources = sources;
    this.templateId = templateId || 
      (step.isSubQuestion ? 'sub-question-template' : 'question-template');
      this.component = null;
  }
  
  static getStore() {
    return store;
  }
  initComponent() {
    const existingAnswer = store.get(this.step.id);

    switch(this.step.type) {
      case 'multiple_choice':
        this.component = new MultipleChoiceQuestion(this.step, store, renderers.multiple_choice, this.allSteps);
        break;

      case 'single_choice':
        this.component = new SingleChoiceQuestion(this.step, store, renderers.single_choice, this.allSteps);
        break;

      case 'text':
        this.component = new TextQuestion(this.step, store, renderers.text);
        break;

      case 'spinner':
        this.component = new SpinnerQuestion(this.step, store, renderers.spinner);
        break;

      case 'autocomplete': {
        const tableData = this.sources[this.step.table] || [];
        this.component = new AutocompleteQuestion(this.step, store, renderers.autoComplete, tableData);
        break;
      }

      default:
        console.error('Type inconnu :', this.step.type);
    }

    // Pré-remplissage automatique
    if (existingAnswer && this.component?.setAnswer) {
      this.component.setAnswer(existingAnswer);
    }
  }

  render() {
    if (!this.component) this.initComponent();
  
    const template = document.getElementById(this.templateId);
    if (!template) {
      console.error(`Template ${this.templateId} non trouvé`);
      return document.createElement('div');
    }
  
    const container = template.content.cloneNode(true).children[0];
  
    const config = TEMPLATE_CONFIG[this.templateId];
    if (!config) {
      console.error(`Configuration manquante pour ${this.templateId}`);
      return container;
    }
  
    // Numéro / titre
    const numEl = container.querySelector(config.num);
    if (numEl) numEl.textContent = this.step.title;
  
    const textEl = container.querySelector(config.text);
    if (textEl) textEl.textContent = this.step.label;
  
    // Contenu spécifique de la question
    const contentContainer = container.querySelector(config.content);
    if (!contentContainer) {
      console.error('Zone de contenu introuvable dans le template');
      return container;
    }
  
    const questionNode = this.component.render();
    contentContainer.appendChild(questionNode);
  
    return container;
  }
  
}
