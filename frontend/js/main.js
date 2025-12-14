import TextQuestion from './Components/TextQuestion.js';
import SingleChoiceQuestion from './Components/SingleChoiceQuestion.js';
import { loadTemplate } from './loadTemplates.js';

const answers = {};
let currentStep = 0;
let survey = null;

async function initTemplates() {
  await loadTemplate('./Components/TextQuestion.html');
  await loadTemplate('./Components/SingleChoiceQuestion.html');
  await loadTemplate('./Components/utils/ButtonNavigation.html');
  // await loadTemplate('./Components/single-choice-question.html');
}

async function renderStep() {
  if (!survey) {
    const response = await fetch('./data/Survey_667.json');
    survey = await response.json();
  }

  const step = survey.steps[currentStep];
  const app = document.getElementById('app');
  app.innerHTML = '';

  let component;
  switch(step.type) {
    case 'text':
      component = new TextQuestion(step);
      break;
    case 'single_choice':
      component = new SingleChoiceQuestion(step);
      break;
    default:
      console.error('Type inconnu :', step.type);
      return;
  }

  // ⚡ Render une seule fois et écouter les événements sur le DOM affiché
  if(component) {
    const existingAnswer = answers[step.id]; // récupère la valeur sauvegardée
    const node = component.render(existingAnswer); 
    app.appendChild(node);

    node.addEventListener('next', (e) => {
      answers[step.id] = e.detail; //  sauvegarde la réponse
      handleNext(e.detail); // e.detail contient la valeur saisie
    });

    node.addEventListener('previous', () => {
      handlePrevious();
    });
  }
}

function handleNext(value) {
  const step = survey.steps[currentStep];
  answers[step.id] = value;

  if(step.redirection) {
    const nextIndex = survey.steps.findIndex(q => q.id === step.redirection);
    if(nextIndex !== -1) {
      currentStep = nextIndex;
      renderStep();
      return;
    }
  }

  currentStep++;
  if(currentStep < survey.steps.length) renderStep();
  else console.log('Fin questionnaire', answers);
}

function handlePrevious() {
  if(currentStep === 0) return;
  currentStep--;
  renderStep();
}

// Initialisation
(async function() {
  await initTemplates();
  renderStep();
})();
