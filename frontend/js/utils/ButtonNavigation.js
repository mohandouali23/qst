
import Validator from './Validator.js';
import { showToast } from './toast.js';
import QuestionContent from '../qst_type/QuestionContent.js';

export default class ButtonNavigation {
  constructor(container, step, { onNext, onPrevious }) {
    this.container = container;
    this.step = step;
    this.onNext = onNext;
    this.onPrevious = onPrevious;
    this.init();
  }

  init() {
    this.container.querySelector('.next-btn')?.addEventListener('click', () => {
      const value = this.getValue();
      if (value === null) return;
      this.onNext?.(value);
    });
    this.container.querySelector('.prev-btn')?.addEventListener('click', this.onPrevious);
  }

 getValue() {
  if (!this.questionContent) return null;

  if (!this.questionContent.isValid()) {
    return null;
  }

  return this.questionContent.getAnswer();
}


  // getValue() {
  //   let value = null;
  //   const store = QuestionContent.getStore();
  //   const component = store.get(this.step.id)?.component || null; // si on stocke le component


  //   switch (this.step.type) {
  //     case 'text': {
  //       // value = store.get(this.step.id);
  //       const answer = store.get(this.step.id);
  //       value = answer?.value ?? '';
  //       console.log("value text", answer);
  //       if (value === null || value === undefined || value.trim() === '') {
  //         showToast('Veuillez remplir ce champ');
  //         return null;
  //       }
  //       value = answer;
  //       break;
  //     }


  //     case 'single_choice': {
  //       value = store.get(this.step.id);
  //       console.log("value single", value);

  //       // Vérification réponse principale
  //       if (!value || !value.value) {
  //         showToast('Veuillez sélectionner une option');
  //         return null;
  //       }

  //       // Vérifier si la précision est requise
  //       const option = this.step.options.find(o => o.codeItem === value.value);
  //       if (option?.requiresPrecision && (!value.precision || value.precision.trim() === '')) {
  //         showToast('Veuillez préciser votre réponse');
  //         return null;
  //       }

  //       // Vérifier la sous-question
  //       if (option?.requiresSubQst?.value) {
  //         const subAnswer = value.subAnswer;
  //         console.log("sous subanswer", subAnswer)
  //         // subAnswer = { q8: { questionId: "q8", type: ..., value: ..., label: ... } }
  //         if (
  //           !subAnswer || // null ou undefined
  //           Object.keys(subAnswer).length === 0 || // aucun sous-answer
  //           Object.values(subAnswer).some(sa => {
  //             // vérifier que chaque sous-answer a une valeur valide
  //             return sa.value === null || sa.value === undefined || (typeof sa.value === 'string' && sa.value.trim() === '');
  //           })
  //         ) {
  //           showToast('Veuillez répondre à la sous-question avant de continuer');
  //           return null;
  //         }

  //         // if (
  //         //   subAnswer === null ||
  //         //   subAnswer === undefined ||
  //         //   (typeof subAnswer === 'string' && subAnswer.trim() === '') ||
  //         //   (Array.isArray(subAnswer) && subAnswer.length === 0)
  //         // ) {
  //         //   showToast('Veuillez répondre à la sous-question avant de continuer'); 
  //         //   return null;
  //         // }


  //       }


  //       break;
  //     }

  //     case 'multiple_choice': {
  //       const answer = store.get(this.step.id); // value = { questionId, type, value: [...] }

  //       console.log("value multi", answer);
  //       if (!answer) {
  //         showToast('Veuillez sélectionner au moins une option');
  //         return null;
  //       }
  //       const selectedValues = answer.value ?? [];


  //       // 2. Vérifier si une option nécessite une précision
  //       for (const option of this.step.options) {
  //         if (option.requiresPrecision) {
  //           const selected = selectedValues.find(v => v.value === option.value);
  //           if (selected && (!selected.precision || selected.precision.trim() === '')) {
  //             showToast(`Veuillez préciser votre réponse pour "${option.label}"`);
  //             return null;
  //           }
  //         }
  //       }

  //       // 3. Vérifier les sous-questions imbriquées
  //       for (const selected of selectedValues) {
  //         //  console.log("selected.sub answer ", selected)
  //         if (!selected.subAnswer) continue;


  //         if (!selected.subAnswer || Object.keys(selected.subAnswer).length === 0) {
  //           showToast(`Veuillez répondre à la sous-question pour "${selected.value}"`);
  //           return null;
  //         }

  //         // Récupérer le vrai subAnswer
  //         const subAnswerObj = Object.values(selected.subAnswer)[0];

  //         // Extraire la valeur
  //         const subVal = subAnswerObj?.value;
  //         // console.log("sub val.", subVal)

  //         if (!subVal
  //         ) {
  //           showToast(`Veuillez répondre à la sous-question pour "${selected.value}"`);
  //           return null;
  //         }

  //       }


  //       // Renvoie l'objet complet pour ButtonNavigation
  //       value = answer;
  //       //  console.log("value multi nav", value);


  //       break;
  //     }
  //     case 'spinner': {
  //       value = store.get(this.step.id);
  //       console.log("spinner", value);
  //       if (!value) {
  //         showToast('Veuillez sélectionner une option');
  //         return null;
  //       }
  //       break;
  //     }

  //     case 'autocomplete': {
  //       const answer = store.get(this.step.id);
  //       console.log("auto", answer);

  //       // Vérifier qu'il y a une valeur sélectionnée
  //       const val = answer?.value;
  //       if (!val || (typeof val === 'string' && val.trim() === '')) {
  //         showToast('Veuillez choisir une valeur dans la liste');
  //         return null;
  //       }

  //       value = answer;
  //       break;
  //     }

  //     default:
  //       console.warn('Type non géré :', this.step.type);
  //       return null;
  //   }

  //   return value;
  // }
}
