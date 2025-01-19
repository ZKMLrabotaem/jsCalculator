export class Calculator {
  constructor() {
    this.currentExpression = '0'; // Строка выражения
    this.decimalPlaces = 3; // Количество знаков после запятой
    this.useExponential = false; // Экспоненциальное представление вкл/выкл
  }
  setSettings({ decimalPlaces, useExponential }) {
    this.decimalPlaces = decimalPlaces;
    this.useExponential = useExponential;
  }

  append(value) {
    const numberRegex = /\d+(\.\d*)?$/;
    const lastChar = this.currentExpression.slice(-1);
    const preLastChar = this.currentExpression.slice(-2, -1);

    if (this.currentExpression.includes('e')) {
      return;
    }

    if (
      this.currentExpression === '0' &&
      !['.', '+', '×', '÷'].includes(value)
    ) {
      this.currentExpression = '';
    } else if (
      this.currentExpression === '-0' &&
      !['.', '+', '×', '÷'].includes(value)
    ) {
      this.currentExpression = '';
    }

    if (this.currentExpression === '') {
      if (value === '-') {
        this.currentExpression += value;
      } else if (!isNaN(value)) {
        this.currentExpression += value;
      }
      return;
    }

    if (this.currentExpression === '-' && value === '-') {
      return;
    }
    if (lastChar === '%' && !['+', '-', '×', '÷'].includes(value)) {
      return;
    }

    if (value === '.') {
      if (isNaN(lastChar)) {
        this.currentExpression = this.currentExpression.slice(0, -1);
        return;
      }
      const lastNumber = this.currentExpression.match(numberRegex);
      if (lastNumber && lastNumber[0].includes('.')) {
        return;
      }
    }

    if (['+', '-', '×', '÷'].includes(lastChar)) {
      if (value === '-') {
        if (['-', '×', '÷', '+'].includes(preLastChar)) {
          return;
        }
        this.currentExpression += value;
      } else if (['+', '×', '÷'].includes(value)) {
        return;
      } else {
        this.currentExpression += value;
      }
    } else {
      this.currentExpression += value;
    }
  }

  clear() {
    this.currentExpression = '0';
  }

  deleteLastChar() {
    this.currentExpression = this.currentExpression.slice(0, -1);
    if (this.currentExpression === '') {
      this.currentExpression = '0';
    }
  }

  customAbs(number) {
    return number < 0 ? -number : number;
  }

  toExponentialFormat(number) {
    if (number === 0) {
      return '0';
    }

    const isNegative = number < 0;
    const absNumber = this.customAbs(number);
    let exponent = 0;
    let adjustedNumber = absNumber;

    while (adjustedNumber >= 10) {
      adjustedNumber /= 10;
      exponent++;
    }
    while (adjustedNumber < 1 && adjustedNumber > 0) {
      adjustedNumber *= 10;
      exponent--;
    }

    adjustedNumber = this.round(adjustedNumber);
    let result = adjustedNumber.toString();

    if (result.includes('.')) {
      const decimalIndex = result.indexOf('.');
      result = result.slice(0, decimalIndex + this.decimalPlaces + 1);
      result = result.replace(/\.?0+$/, '');
    }

    if (result.endsWith('.')) {
      result = result.slice(0, -1);
    }

    result += 'e' + (exponent >= 0 ? '+' : '') + exponent;
    if (isNegative) {
      result = '-' + result;
    }
    return result;
  }

  round(number) {
    let [integerPart, decimalPart] = number.toString().split('.');
    if (!decimalPart) return number;
    decimalPart = decimalPart.slice(0, this.decimalPlaces);
    return parseFloat(`${integerPart}.${decimalPart}`);
  }

  calculate() {
    try {
      const tokens = this.tokenize(this.currentExpression);
      let result = this.evaluate(tokens);

      if (
        this.useExponential &&
        (result >= 1e10 ||
          result <= -1e10 ||
          (result !== 0 && result < 1e-10 && result > -1e-10))
      ) {
        result = this.toExponentialFormat(result);
        result = result
          .replace(/(\.\d*?)0+(?=e)/, '$10')
          .replace(/(\.\d+?)e/, '$1e');
      } else {
        result = this.round(result);
      }

      this.currentExpression = result
        .toString()
        .replace(/(\.\d*?)0+$/, '$1')
        .replace(/\.$/, '');
    } catch (error) {
      this.currentExpression = 'Error';
    }
  }

  tokenize(expression) {
    while (true) {
      const percentRegex = /(-?\d+(\.\d*)?)%\s*([+\-×÷])\s*(-?\d+(\.\d*)?)%/;

      const match = percentRegex.exec(expression);
      if (!match) break;

      const leftPercentage = parseFloat(match[1]); // Первое число с процентами
      const operator = match[3];
      const rightPercentage = parseFloat(match[4]); // Второе число с процентами
      let replacementValue;

      const leftValue = leftPercentage / 100;
      const rightValue = rightPercentage / 100;

      switch (operator) {
        case '×':
          replacementValue = leftValue * rightValue;
          break;
        case '÷':
          replacementValue = leftValue / rightValue;
          break;
        case '+':
          replacementValue = leftValue + rightValue * leftValue;
          break;
        case '-':
          replacementValue = leftValue - rightValue * leftValue;
          break;
        default:
          throw new Error(`Error`);
      }

      expression = expression.replace(match[0], replacementValue);
    }

    while (true) {
      const percentRegex = /(-?\d+(\.\d*)?)\s*([+\-×÷])\s*(-?\d+(\.\d*)?)%/;
      const match = percentRegex.exec(expression);
      if (!match) break;

      const leftValue = parseFloat(match[1]); // Число перед процентами
      const operator = match[3];
      const percentageValue = parseFloat(match[4]); // Процентное число
      let replacementValue;

      if (!operator) {
        replacementValue = percentageValue / 100;
      } else {
        switch (operator) {
          case '×':
            replacementValue = leftValue * (percentageValue / 100);
            break;
          case '÷':
            replacementValue = leftValue / (percentageValue / 100);
            break;
          case '+':
            replacementValue = leftValue + leftValue * (percentageValue / 100);
            break;
          case '-':
            replacementValue = leftValue - leftValue * (percentageValue / 100);
            break;
          default:
            throw new Error(`Error`);
        }
      }

      expression = expression.replace(match[0], replacementValue);
    }

    while (true) {
      const percentRegex = /(-?\d+(\.\d*)?)%\s*([+\-×÷])\s*(-?\d+(\.\d*)?)/;
      const match = percentRegex.exec(expression);
      if (!match) break;

      const percentageValue = parseFloat(match[1]); // Процентное число
      const operator = match[3];
      const rightValue = parseFloat(match[4]); // Число после процентов
      let replacementValue;

      switch (operator) {
        case '×':
          replacementValue = (percentageValue / 100) * rightValue;
          break;
        case '÷':
          replacementValue = percentageValue / 100 / rightValue;
          break;
        case '+':
          replacementValue = percentageValue / 100 + rightValue;
          break;
        case '-':
          replacementValue = percentageValue / 100 - rightValue;
          break;
        default:
          throw new Error(`Unexpected operator: ${operator}`);
      }

      expression = expression.replace(match[0], replacementValue);
    }

    const tokens = [];
    let numberBuffer = '';
    let expectNegative = true;

    for (let char of expression) {
      if (!isNaN(char) || char === '.') {
        numberBuffer += char;
        expectNegative = false;
      } else if (char === '-' && expectNegative) {
        numberBuffer += char;
      } else {
        if (numberBuffer) {
          tokens.push(parseFloat(numberBuffer));
          numberBuffer = '';
        }
        if (['+', '-', '×', '÷'].includes(char)) {
          tokens.push(char);
        }
        expectNegative = char === '-' || ['+', '-', '×', '÷'].includes(char);
      }
    }

    if (numberBuffer) {
      tokens.push(parseFloat(numberBuffer));
    }

    if (
      tokens.length &&
      ['+', '-', '×', '÷'].includes(tokens[tokens.length - 1])
    ) {
      tokens.pop();
    }

    return tokens;
  }

  evaluate(tokens) {
    const highPriority = [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === '×' || tokens[i] === '÷') {
        const left = highPriority.pop();
        const right = tokens[++i];
        const result =
          tokens[i - 1] === '×'
            ? left * right
            : right === 0
              ? (() => {
                  throw new Error('Деление на ноль');
                })()
              : left / right;
        highPriority.push(result);
      } else {
        highPriority.push(tokens[i]);
      }
    }

    let result = highPriority[0];
    for (let i = 1; i < highPriority.length; i += 2) {
      const operator = highPriority[i];
      const value = highPriority[i + 1];
      result = operator === '+' ? result + value : result - value;
    }

    return result;
  }

  percent() {
    if (this.currentExpression.includes('e')) {
      return;
    }

    const numberRegex = /\d+(\.\d*)?%?$/;
    const match = this.currentExpression.match(numberRegex);

    if (match) {
      const numberWithPercent = match[0];
      const hasPercent = numberWithPercent.includes('%');
      if (hasPercent) {
        this.currentExpression = this.currentExpression.replace(/%$/, '');
      } else {
        this.currentExpression += '%';
      }
    }
  }

  toggleSign() {
    if (this.currentExpression.includes('e')) {
      return;
    }

    const numberRegex = /(\d+(\.\d*)?%?)$/;
    const nonNumberRegex = /[^0-9.%]/;

    const lastNumberMatch = this.currentExpression.match(numberRegex);

    if (lastNumberMatch) {
      const lastNumber = lastNumberMatch[0];
      const indexOfLastNumber = this.currentExpression.lastIndexOf(lastNumber);

      const charBeforeLastNumber =
        this.currentExpression[indexOfLastNumber - 1] || '';
      const charTwoBeforeLastNumber =
        this.currentExpression[indexOfLastNumber - 2] || '';

      if (charBeforeLastNumber === '') {
        this.currentExpression =
          this.currentExpression.slice(0, indexOfLastNumber) + `-${lastNumber}`;
        return;
      }

      if (charTwoBeforeLastNumber === '') {
        this.currentExpression =
          this.currentExpression.slice(0, indexOfLastNumber - 1) +
          this.currentExpression.slice(indexOfLastNumber);
        return;
      }

      if (
        nonNumberRegex.test(charBeforeLastNumber) &&
        nonNumberRegex.test(charTwoBeforeLastNumber)
      ) {
        this.currentExpression =
          this.currentExpression.slice(0, indexOfLastNumber - 1) +
          this.currentExpression.slice(indexOfLastNumber);
      } else if (nonNumberRegex.test(charBeforeLastNumber)) {
        this.currentExpression =
          this.currentExpression.slice(0, indexOfLastNumber) + `-${lastNumber}`;
      } else {
        this.currentExpression =
          this.currentExpression.slice(0, indexOfLastNumber) + `-${lastNumber}`;
      }
    }
  }
}
