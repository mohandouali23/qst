
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
      case 'text':
        value = this.container.querySelector('input')?.value.trim();
        if (!Validator.validate(value, this.step)) {
          showToast('Veuillez remplir ce champ'); return null;
        }
        break;
case 'single_choice': {
  value = store.get(this.step.id);
  console.log("value single", value)
  
  if (!value || (Array.isArray(value) && value.length === 0)) {
    showToast('Veuillez sélectionner une option'); 
    return null; 
  }

  const option = this.step.options.find(o => o.codeItem === value.value);
  
  if (option?.requiresPrecision && !value.precision) {
    showToast('Veuillez préciser votre réponse'); 
    return null;
  }

  // ⚠️ CORRECTION ICI : Vérifier la sous-question dans value.subAnswer
  if (option?.requiresSubQst?.value) {
    // La sous-question doit être dans value.subAnswer, pas dans le store racine
    if (!value.subAnswer || !value.subAnswer.value) {
      showToast('Veuillez répondre à la sous-question avant de continuer'); 
      return null;
    }
    
    // ❌ SUPPRIMER CETTE LIGNE : On ne cherche plus dans le store
    // const subAnswer = store.get(value.requiresSubQstId);
    
    // ✅ Utiliser directement value.subAnswer
    console.log("subAnswer single", value.subAnswer);
    
    // Vérifier que la valeur n'est pas vide
    if (!value.subAnswer.value || value.subAnswer.value.trim() === '') {
      showToast('Veuillez répondre à la sous-question avant de continuer'); 
      return null;
    }
  }
  break;
}
      // case 'multiple_choice': {
      //   const comp = this.step.component;
      //   value = comp.getAnswer()?.values || [];
      
      //   if (!Validator.validate(value, this.step)) {
      //     showToast('Veuillez sélectionner au moins une option');
      //     return null;
      //   }
      
      //   if (comp && comp.getSubAnswers) {
      //     const subAnswers = comp.getSubAnswers();
      //     if (subAnswers === null) {
      //       showToast('Veuillez répondre à toutes les sous-questions des options sélectionnées');
      //       return null;
      //     }
      
      //     const storedValue = comp.getAnswer();
      //     storedValue.subAnswers = subAnswers;
      //     QuestionContent.getStore().set(this.step.id, storedValue);
      //   }
      
      //   break;
      // }
      
      case 'multiple_choice': {
        value = store.get(this.step.id);
      console.log("value multi nav",value)
        if (!Validator.validate(value, this.step)) {
          showToast('Veuillez sélectionner au moins une option');
          return null;
        }
      
        // Vérifier si une option nécessite une précision
        for (const option of this.step.options) {
          if (option.requiresPrecision) {
            // Trouver si l'option est cochée
            const selected = value.find(v => v.value === option.value);
            if (selected && (!selected.precision || selected.precision.trim() === '')) {
              showToast(`Veuillez préciser votre réponse pour "${option.label}"`);
              return null;
            }
          }
        }
      
      
       // Vérification des sous-questions
for (const selected of value) {
  if (selected.subAnswer) {
    const subVal = selected.subAnswer.value;

    if (
      subVal === null ||
      subVal === undefined ||
      (typeof subVal === 'string' && subVal.trim() === '')
    ) {
      showToast(
        `Veuillez répondre à la sous-question pour "${selected.label}"`
      );
      return null;
    }
  }
}

      
        break;
      }
      
      // case 'multiple_choice': {
      //   value = store.get(this.step.id);
      
      //   if (!Validator.validate(value, this.step)) {
      //     showToast('Veuillez sélectionner au moins une option');
      //     return null;
      //   }
      
      //   break;
      //}
      
      case 'spinner': value = this.container.querySelector('select')?.value; if (!Validator.validate(value, this.step)) { showToast('Veuillez sélectionner une option'); return null; } break;

//       case 'spinner': {
//   const selectedValue = this.container.querySelector('select')?.value;
  
//   // Trouver l'objet complet correspondant
//   const valueObj = this.step.options.find(opt => opt.value === selectedValue) || null;

//   if (!Validator.validate(valueObj, this.step)) {
//     showToast('Veuillez sélectionner une option');
//     return null;
//   }

//   // Stocker ou retourner l'objet complet
//   value = valueObj;
//   break;
// }


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


// // utils/ButtonNavigation.js
// import Validator from './Validator.js';
// import { showToast } from './toast.js';
// import QuestionContent from '../qst_type/QuestionContent.js';

// export default class ButtonNavigation {
//   constructor(container, step, { onNext, onPrevious }) {
//     this.container = container;
//     this.step = step;
//     this.onNext = onNext;
//     this.onPrevious = onPrevious;
//     this.init();
//   }

//   init() {
//     const nextBtn = this.container.querySelector('.next-btn');
//     const prevBtn = this.container.querySelector('.prev-btn');

//     if (nextBtn) {
//       nextBtn.addEventListener('click', () => {
//         const value = this.getValue();
//         if (value === null) return; // validation échouée
//         if (this.onNext) this.onNext(value);
//       });
//     }

//     if (prevBtn && this.onPrevious) {
//       prevBtn.addEventListener('click', this.onPrevious);
//     }
//   }

//   getValue() {
//     let value = null;

//     switch (this.step.type) {
//       case 'text': {
//         const input = this.container.querySelector('input');
//         value = input.value.trim();
//         if (!Validator.validate(value, this.step)) {
//           showToast('Veuillez remplir ce champ');
//           input.focus();
//           return null;
//         }
//         break;
//       }

//       case 'single_choice': {
//         //ON LIT LE STORE
//         const storedValue = QuestionContent.getStore().get(this.step.id);
       
//         console.log('storevalue',storedValue)
      
//         if (!storedValue || (Array.isArray(storedValue) && storedValue.length === 0)) {
//           showToast('Veuillez sélectionner une option');
//           return null;
//         }
      
//         // validation précision si nécessaire
//         const option = this.step.options.find(o => o.codeItem === storedValue.value);
      
//         if (option?.requiresPrecision && !storedValue.precision) {
//           showToast('Veuillez préciser votre réponse');
//           return null;
//         }

        
//     // Vérifier la sous-question si elle existe
//     if (storedValue.requiresSubQstId) {
//         // Récupérer l'instance de la sous-question
//         const mainInstance = this.step.component; //  on doit passer l'instance ici
//         console.log("mainInstance",mainInstance)
        
//         let subAnswer = null;
//         if (mainInstance?.subQuestionInstance) {
//             subAnswer = mainInstance.subQuestionInstance.component?.getAnswer?.() || null;
//         }

//         if (!subAnswer) {
//             showToast('Veuillez répondre à la sous-question avant de continuer');
//             return null;
//         }

//         // Mettre à jour la valeur dans le store
//         storedValue.subAnswer = subAnswer;
//         QuestionContent.getStore().set(this.step.id, storedValue);
//     }
//         value = storedValue; //  CONTIENT value + label + precision
//         break;
//       }
      
      

//       case 'multiple_choice': {
//         value = [...this.container.querySelectorAll('input[type="checkbox"]:checked')].map(i => i.value);
//         if (!Validator.validate(value, this.step)) {
//           showToast('Veuillez sélectionner au moins une option');
//           return null;
//         }
//         break;
//       }

//       case 'spinner': {
//         const select = this.container.querySelector('select');
//         value = select.value;
//         if (!Validator.validate(value, this.step)) {
//           showToast('Veuillez sélectionner une option');
//           select.focus();
//           return null;
//         }
//         break;
//       }

//       case 'autocomplete': {
//         const input = this.container.querySelector('.autocomplete-input');
//         const label = input.value.trim();
//         const id = input.dataset.id;
//         value = { id, label };
      
//         if (!id) { // 🔥
//           showToast('Veuillez choisir une valeur dans la liste');
//           input.focus();
//           return null;
//         }
      
//         if (!Validator.validate(value, this.step)) {
//           showToast('Veuillez choisir une valeur dans la liste');
//           input.focus();
//           return null;
//         }
//         break;
//       }
      

//       default:
//         console.warn('Type non géré :', this.step.type);
//         return null;
//     }

//     return value;
//   }
// }
