
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
    let value = null;
    const store = QuestionContent.getStore();

    switch (this.step.type) {
      case 'text': {
       // value = store.get(this.step.id);
       const answer = store.get(this.step.id);
        value = answer?.value ?? '';
      console.log("value text",answer);
        if (value === null || value === undefined || value.trim() === '') {
          showToast('Veuillez remplir ce champ');
          return null;
        }
      
        break;
      }
      

      case 'single_choice': {
        value = store.get(this.step.id);
        console.log("value single", value);
      
        // Vérification réponse principale
        if (!value || !value.value) {
          showToast('Veuillez sélectionner une option'); 
          return null; 
        }
      
        // Vérifier si la précision est requise
        const option = this.step.options.find(o => o.codeItem === value.value);
        if (option?.requiresPrecision && (!value.precision || value.precision.trim() === '')) {
          showToast('Veuillez préciser votre réponse'); 
          return null;
        }
      
       // Vérifier la sous-question
if (option?.requiresSubQst?.value) {
  const subAnswer = value.subAnswer;
console.log("sous subanswer",subAnswer)
  // subAnswer = { q8: { questionId: "q8", type: ..., value: ..., label: ... } }
if (
  !subAnswer || // null ou undefined
  Object.keys(subAnswer).length === 0 || // aucun sous-answer
  Object.values(subAnswer).some(sa => {
    // vérifier que chaque sous-answer a une valeur valide
    return sa.value === null || sa.value === undefined || (typeof sa.value === 'string' && sa.value.trim() === '');
  })
) {
  showToast('Veuillez répondre à la sous-question avant de continuer');
  return null;
}

  // if (
  //   subAnswer === null ||
  //   subAnswer === undefined ||
  //   (typeof subAnswer === 'string' && subAnswer.trim() === '') ||
  //   (Array.isArray(subAnswer) && subAnswer.length === 0)
  // ) {
  //   showToast('Veuillez répondre à la sous-question avant de continuer'); 
  //   return null;
  // }


}

      
        break;
      }
      
    
      
      case 'multiple_choice': {
       const answer = store.get(this.step.id); // value = { questionId, type, value: [...] }
  if (!answer) {
    showToast('Veuillez sélectionner au moins une option');
    return null;
  }   const selectedValues = answer.value ?? [];
  
  // 1. Vérifier qu'il y a au moins une option sélectionnée
  if (!selectedValues || selectedValues.length === 0) {
    showToast('Veuillez sélectionner au moins une option');
    return null;
  }

  // 2. Vérifier si une option nécessite une précision
  for (const option of this.step.options) {
    if (option.requiresPrecision) {
      const selected = selectedValues.find(v => v.value === option.value);
      if (selected && (!selected.precision || selected.precision.trim() === '')) {
        showToast(`Veuillez préciser votre réponse pour "${option.label}"`);
        return null;
      }
    }
  }

  // 3. Vérifier les sous-questions imbriquées
  for (const selected of selectedValues) {
    if (selected.subAnswer) {
      const subVal = Object.values(selected.subAnswer)[0]; // récupère la sous-question imbriquée
      if (!subVal || subVal.value === null || subVal.value === undefined || 
          (typeof subVal.value === 'string' && subVal.value.trim() === '')) {
        showToast(`Veuillez répondre à la sous-question pour "${selected.value}"`);
        return null;
      }
    }
  }

  // Renvoie l'objet complet pour ButtonNavigation
  value = answer;
  console.log("value multi nav", value);


  break;
}
      case 'spinner': value = this.container.querySelector('select')?.value; if (!Validator.validate(value, this.step)) { showToast('Veuillez sélectionner une option'); return null; } break;


      case 'autocomplete':{
        const input = this.container.querySelector('.autocomplete-input');
        value = { id: input.dataset.id, label: input.value.trim() };
        if (!value.id || !Validator.validate(value, this.step)) {
          showToast('Veuillez choisir une valeur dans la liste'); return null;
        }
        break;
      }
      default:
        console.warn('Type non géré :', this.step.type);
        return null;
    }

    return value;
  }
}
