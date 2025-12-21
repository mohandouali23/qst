

// export default class Validator {
//   // Vérifie si une valeur est requise
//   static required(value, step) {
//     if (!step.required) return true;

//     if (value === null || value === undefined) return false;

//     if (Array.isArray(value)) return value.length > 0;

//     if (typeof value === 'object') {
//       if ('id' in value) return !!value.id; // valide seulement si id existe et n'est pas vide
//       return Object.keys(value).length > 0;
//     }

//     if (typeof value === 'string') return value.trim().length > 0;

//     return true;
//   }

//   // Vérifie une condition (input_cond ou output_cond) définie dans le JSON
//   static checkCondition(value, condition) {
//     if (!condition) return true;

//     try {
//       // exemple simple : "value.length > 0"
//       return new Function('value', `return ${condition}`)(value);
//     } catch (err) {
//       console.warn('Erreur lors de l\'évaluation de la condition :', condition, err);
//       return false;
//     }
//   }

//   // Validation complète d'une question
//   static validate(value, step) {
//     if (!Validator.required(value, step)) return false;
//     if (!Validator.checkCondition(value, step.output_cond)) return false;
//     return true;
//   }
// }
