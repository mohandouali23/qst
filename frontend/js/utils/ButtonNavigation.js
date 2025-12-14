export default class ButtonNavigation {
    constructor({ onNext, onPrevious }) {
      this.onNext = onNext;
      this.onPrevious = onPrevious;
    }
  
    render() {
      const template = document.getElementById('button-navigation-template');
      if (!template) {
        console.error('Template ButtonNavigation non trouvé');
        return document.createElement('div');
      }
  
      const container = template.content.cloneNode(true).children[0];
  
      // Événements
      const nextBtn = container.querySelector('.next-btn');
      const prevBtn = container.querySelector('.prev-btn');
  
      if (this.onNext) {
        nextBtn.addEventListener('click', this.onNext);
      }
  
      if (this.onPrevious) {
        prevBtn.addEventListener('click', this.onPrevious);
      }
  
      return container;
    }
  }
  