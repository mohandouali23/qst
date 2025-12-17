// utils/SubQuestionManager.js
import QuestionContent from '../qst_type/QuestionContent.js'
export default class SubQuestionManager {
  constructor(store, allSteps) {
    this.store = store;
    this.allSteps = allSteps; // toutes les étapes du survey
    this.subQuestionInstance = null;
  }

  /**
   * Vérifie les options sélectionnées et crée la sous-question si nécessaire
   * @param {Object|Array} selected - option sélectionnée (single) ou tableau (multi)
   */
  handleSubQuestion(selected, container) {
    // Supprimer sous-question existante
    if (this.subQuestionInstance) {
      const oldSub = container.querySelector('.sub-question-container');
      if (oldSub) oldSub.remove();
      this.subQuestionInstance = null;
    }

    let subStepId = null;

    if (Array.isArray(selected)) {
      // Multi choix : vérifier toutes les options sélectionnées
      const optWithSub = selected.find(opt => opt.requiresSubQst?.value);
      if (optWithSub) subStepId = optWithSub.requiresSubQst.subQst_id;
    } else {
      // Single choix
      if (selected.requiresSubQst?.value) subStepId = selected.requiresSubQst.subQst_id;
    }

    if (!subStepId) return; // pas de sous-question à afficher

    const subStep = this.allSteps.find(s => s.id === subStepId);
    if (!subStep) return;

    // créer l'instance
    this.subQuestionInstance = new QuestionContent(subStep);

    // Rendu sous-question
    const subContainer = document.createElement('div');
    subContainer.classList.add('sub-question-container');
    subContainer.appendChild(this.subQuestionInstance.render());

    container.appendChild(subContainer);

    return this.subQuestionInstance; // pour éventuellement récupérer subAnswer
  }
}
