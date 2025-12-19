import QuestionContent from './qst_type/QuestionContent.js';
import { loadTemplate, loadJSON } from './utils/JSONLoader.js';
import ButtonNavigation from './utils/ButtonNavigation.js';

//const answers = {};
let currentStep = 0;
let survey = null;
let sources = {};

// Charger les templates
async function initTemplates() {
  const templates = [
    './html/qst_type/TextQuestion.html',
    './html/qst_type/SingleChoiceQuestion.html',
    './html/qst_type/MultipleChoiceQuestion.html',
    './html/qst_type/AutocompleteQuestion.html',
    './html/qst_type/SpinnerQuestion.html',
    './html/qst_type/question-template.html',
    './html/utils/SubQuestion.html',
    './html/utils/PrecisionField.html'
  ];
  for (const t of templates) {
    await loadTemplate(t);
  }
}

// Charger les sources JSON (ex: communes)
async function loadSources() {
  const data = await loadJSON('./data/communes.json');
  if (data?.communes) sources.communes = data.communes;
}

// Charger le questionnaire JSON
async function loadSurvey() {
  if (!survey) {
    survey = await loadJSON('./data/Survey_667.json');
  }
}
// Affichage de la question courante
async function renderStep() {
  await loadSurvey();
  const step = survey.steps[currentStep];
  const app = document.getElementById('app');
  app.innerHTML = '';

  const questionContent = new QuestionContent(step, survey.steps, sources, 'question-template');
  const node = questionContent.render();
  app.appendChild(node);

  // Navigation avec validation et stockage
  new ButtonNavigation(node, step, {
    onNext: (value) => {
      // sauvegarde dans le store global
      QuestionContent.getStore().set(step.id, value);

      // Vérifier redirection
      if (step.redirection) {
        console.log('step redirection',step.redirection)
        if (step.redirection.toUpperCase() === 'FIN') {
          console.log('Fin du questionnaire', QuestionContent.getStore().getAll());
          return; // stop navigation
        }

        const nextIndex = survey.steps.findIndex(q => q.id === step.redirection);
        if (nextIndex !== -1) {
          currentStep = nextIndex;
          renderStep();
          return;
        } else {
          console.warn(`Redirection invalide : ${step.redirection}`);
        }
      }

      // sinon prochaine question
      currentStep++;
      if (currentStep < survey.steps.length) renderStep();
      else console.log('Fin questionnaire', QuestionContent.getStore().getAll());
    },
    onPrevious: () => {
      if (currentStep === 0) return;
      currentStep--;
      renderStep();
    }
  });
}

// Initialisation
(async function init() {
  await initTemplates();
  await loadSources();
  await loadSurvey();
  renderStep();
})();