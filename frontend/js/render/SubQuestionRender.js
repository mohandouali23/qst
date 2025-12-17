// frontend/render/SubQuestionRender.js
export default class SubQuestionRender {
    /**
     * Render d’une sous-question
     * @param {Object} subQuestionInstance - Instance de QuestionContent
     * @returns {HTMLElement}
     */
    renderSubQuestion(subQuestionInstance) {
      if (!subQuestionInstance) return document.createElement('div');
  
      // Création du container
      const container = document.createElement('div');
      container.classList.add('sub-question-container');
  
      // Rendu du contenu de la sous-question
      const subNode = subQuestionInstance.render();
      container.appendChild(subNode);
  
      return container;
    }
  }
  