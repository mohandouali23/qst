export default class ExclusiveRule {
  static apply(options, selectedValues, changedValue) {
    const changedOption = options.find(o => o.value === changedValue);
    const exclusiveValues = options
      .filter(o => o.exclusive)
      .map(o => o.value);

    // Si l'option cochée est exclusive → elle seule
    if (changedOption?.exclusive) {
      return selectedValues.filter(v => v.value === changedValue);
    }

    // Sinon → on enlève les exclusives
    return selectedValues.filter(
      v => !exclusiveValues.includes(v.value)
    );
  }
}
