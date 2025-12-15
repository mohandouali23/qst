import TextQuestion from '../qst_type/TextQuestion.js';
import SingleChoiceQuestion from '../qst_type/SingleChoiceQuestion.js';
import MultipleChoiceQuestion from '../qst_type/MultipleChoiceQuestion.js';
import AutocompleteQuestion from '../qst_type/AutocompleteQuestion.js';
import SpinnerQuestion from '../qst_type/SpinnerQuestion.js';


export default class QuestionContent {
  constructor(step, answers, sources = {}) {
    this.step = step;
    this.answers = answers;
    this.sources = sources; // ex: { communes: [...] }
  }
 
  render() {
    
    const template = document.getElementById('question-template');
    if (!template) {
      console.error('Template question-template non trouvé');
      return document.createElement('div');
    }

    // Cloner le template
    const container = template.content.cloneNode(true).children[0];
    container.querySelector('.question-num').textContent = this.step.title;
    container.querySelector('.question-text').textContent = this.step.label;

    // Partie contenu
    const content = container.querySelector('.question-content');
    let component;

    // Instancie la bonne classe selon le type
    switch(this.step.type) {
      case 'text':
        component = new TextQuestion(this.step);
        break;
      case 'single_choice':
        component = new SingleChoiceQuestion(this.step);
        break;
      case 'multiple_choice':
        component = new MultipleChoiceQuestion(this.step);
        break;
        case 'spinner':
          component = new SpinnerQuestion(this.step);
          break;
        case 'autocomplete': {
          const source = this.sources[this.step.source]; // ex: "communes"
        
          component = new AutocompleteQuestion(
            this.step,
            source,
            {
              labelField: 'commune',
              idField: '_id'
            }
          );
          break;
        }
        

      default:
        console.error('Type inconnu :', this.step.type);
        return container;
    }

    // Pré-remplissage si déjà répondu
    const existingAnswer = this.answers[this.step.id];
    const node = component.render(existingAnswer);
    content.appendChild(node);

    return container;
  }
  
}
