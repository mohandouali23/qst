import QuestionContent from './qst_type/QuestionContent.js';
import { loadTemplate } from './loadTemplates.js';
import ButtonNavigation from './utils/ButtonNavigation.js';

const answers = {};
let currentStep = 0;
let survey = null;
let sources = {};

// Charger les templates
async function initTemplates() { 
  await loadTemplate('./html/qst_type/TextQuestion.html'); 
  await loadTemplate('./html/qst_type/SingleChoiceQuestion.html'); 
  await loadTemplate('./html/qst_type/MultipleChoiceQuestion.html'); 
  await loadTemplate('./html/qst_type/AutocompleteQuestion.html'); 
  await loadTemplate('./html/qst_type/SpinnerQuestion.html'); 
  await loadTemplate('./html/qst_type/question-template.html');
  await loadTemplate('./html/utils/PrecisionField.html'); 
}

async function loadSources() {
  const res = await fetch('./data/communes.json');
  const data = await res.json();
  sources.communes = data.communes;
}
// Affichage de la question courante
async function renderStep() {
  if (!survey) {
    const response = await fetch('./data/Survey_667.json');
    survey = await response.json(); 
  }

  const step = survey.steps[currentStep];
  const app = document.getElementById('app');
  app.innerHTML = '';

  const questionContent = new QuestionContent(step, answers, sources);
  const node = questionContent.render(); 
  app.appendChild(node);

  // Navigation avec ButtonNavigation
  new ButtonNavigation(node, step, answers, {
    onNext: handleNext,
    onPrevious: handlePrevious
  });
}

// Passage à la question suivante
function handleNext() {
  const step = survey.steps[currentStep];

  // Redirection conditionnelle
  if (step.redirection) {
    const nextIndex = survey.steps.findIndex(q => q.id === step.redirection);
    if (nextIndex !== -1) {
      currentStep = nextIndex;
      renderStep();
      return;
    }
  }

  currentStep++;
  if (currentStep < survey.steps.length) renderStep();
  else console.log('Fin questionnaire', answers);
}

// Passage à la question précédente
function handlePrevious() {
  if (currentStep === 0) return;
  currentStep--;
  renderStep();
}

// Initialisation
(async function(){ 
  await initTemplates();
  await loadSources();
  renderStep(); 
})();
