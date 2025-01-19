import './style.css';
import { Calculator } from './calc';

const calc = new Calculator();
const display = document.querySelector('.display');
const decimalPlacesInput = document.getElementById('decimal-places');
const useExponentialInput = document.getElementById('use-exponential');

// Обновление настроек калькулятора
const updateSettings = () => {
  const decimalPlaces = parseInt(decimalPlacesInput.value, 10);
  const useExponential = useExponentialInput.checked;
  calc.setSettings({ decimalPlaces, useExponential });
};

decimalPlacesInput.addEventListener('input', updateSettings);
useExponentialInput.addEventListener('change', updateSettings);
updateSettings();

const updateDisplay = () => {
  display.textContent = calc.currentExpression;
};

const colorInputs = {
  'bg-color': '--bg-color',
  'button-color': '--button-color',
  'button-hover-color': '--button-hover-color',
  'button-text-color': '--button-text-color',
  'display-bg-color': '--display-bg-color',
  'display-text-color': '--display-text-color',
};

// Обновление темы
const updateTheme = () => {
  const theme = document.getElementById('theme').value;
  document.body.classList.remove('white-theme', 'dark-theme');

  if (theme === 'white') {
    document.body.classList.add('white-theme');
    setThemeColors({
      '--bg-color': '#f5f5f5',
      '--button-color': '#ffffff',
      '--button-hover-color': '#f0f0f0',
      '--button-text-color': '#000000',
      '--display-bg-color': '#222222',
      '--display-text-color': '#ffffff',
      '--modal-bg-color': '#f5f5f5',
      '--modal-text-color': '#000000',
      '--modal-button-color': '#ffffff',
      '--modal-button-hover-color': '#f0f0f0',
      '--modal-button-text-color': '#000000',
      '--input-bg-color': '#ffffff',
      '--input-text-color': '#000000',
      '--select-bg-color': '#ffffff',
      '--select-text-color': '#000000',
    });
  } else if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    setThemeColors({
      '--bg-color': '#333333',
      '--button-color': '#444444',
      '--button-hover-color': '#555555',
      '--button-text-color': '#ffffff',
      '--display-bg-color': '#000000',
      '--display-text-color': '#ffffff',
      '--modal-bg-color': '#333333',
      '--modal-text-color': '#f5f5f5',
      '--modal-button-color': '#333333',
      '--modal-button-hover-color': '#555555',
      '--modal-button-text-color': '#ffffff',
      '--input-bg-color': '#444444',
      '--input-text-color': '#ffffff',
      '--select-bg-color': '#444444',
      '--select-text-color': '#ffffff',
    });
  }
};

// Установка цветов
const setThemeColors = (colors) => {
  Object.keys(colors).forEach((colorVar) => {
    document.documentElement.style.setProperty(colorVar, colors[colorVar]);
  });

  Object.keys(colorInputs).forEach((id) => {
    const input = document.getElementById(id);
    input.value = colors[colorInputs[id]];
  });
};

// Обновления цветов из инпутов
const updateColors = () => {
  Object.keys(colorInputs).forEach((id) => {
    const input = document.getElementById(id);
    const colorVar = colorInputs[id];
    document.documentElement.style.setProperty(colorVar, input.value);
  });
};

window.addEventListener('load', () => {
  updateTheme();
  updateColors();
});

document.getElementById('theme').addEventListener('change', updateTheme);

Object.keys(colorInputs).forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener('input', updateColors);
});

const holdTime = 300; // Время для зажатия

document.querySelectorAll('button').forEach((button) => {
  let holdTimeout;

  button.addEventListener('mousedown', (event) => {
    const value = event.target.textContent;

    if (value === 'C') {
      holdTimeout = setTimeout(() => {
        calc.clear();
        updateDisplay();
      }, holdTime);
    }
  });

  button.addEventListener('mouseup', (event) => {
    const value = event.target.textContent;

    if (value === 'C') {
      clearTimeout(holdTimeout);
      calc.deleteLastChar();
      updateDisplay();
    } else if (!isNaN(value) || ['+', '-', '×', '÷', '.'].includes(value)) {
      calc.append(value);
      updateDisplay();
    } else if (value === 'AC') {
      calc.clear();
      updateDisplay();
    } else if (value === '+/-') {
      calc.toggleSign();
      updateDisplay();
    } else if (value === '%') {
      calc.percent();
      updateDisplay();
    } else if (value === '=') {
      calc.calculate();
      updateDisplay();
    }
  });
});
const settingsModal = document.getElementById('settings-modal');
const gearButton = document.querySelector('button:first-child');
const closeButton = document.getElementById('close-settings');

// Окно настроек
gearButton.addEventListener('click', () => {
  settingsModal.classList.remove('hidden');
});
closeButton.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

updateDisplay();

const saveSettingsToLocalStorage = () => {
  const decimalPlaces = parseInt(decimalPlacesInput.value, 10);
  const useExponential = useExponentialInput.checked;

  localStorage.setItem(
    'calculatorSettings',
    JSON.stringify({
      decimalPlaces,
      useExponential,
    }),
  );

  const theme = document.getElementById('theme').value;
  localStorage.setItem('calculatorTheme', theme);

  const colorSettings = {};
  Object.keys(colorInputs).forEach((id) => {
    const input = document.getElementById(id);
    colorSettings[id] = input.value;
  });
  localStorage.setItem('calculatorColors', JSON.stringify(colorSettings));
};

const loadSettingsFromLocalStorage = () => {
  const savedSettings = JSON.parse(localStorage.getItem('calculatorSettings'));
  if (savedSettings) {
    decimalPlacesInput.value = savedSettings.decimalPlaces;
    useExponentialInput.checked = savedSettings.useExponential;
    calc.setSettings(savedSettings);
  }

  const savedTheme = localStorage.getItem('calculatorTheme');
  if (savedTheme) {
    document.getElementById('theme').value = savedTheme;
    updateTheme();
  }

  const savedColors = JSON.parse(localStorage.getItem('calculatorColors'));
  if (savedColors) {
    Object.keys(savedColors).forEach((id) => {
      const input = document.getElementById(id);
      input.value = savedColors[id];
    });
    updateColors();
  }
};

decimalPlacesInput.addEventListener('input', saveSettingsToLocalStorage);
useExponentialInput.addEventListener('change', saveSettingsToLocalStorage);
document
  .getElementById('theme')
  .addEventListener('change', saveSettingsToLocalStorage);
Object.keys(colorInputs).forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener('input', saveSettingsToLocalStorage);
});

window.addEventListener('load', () => {
  loadSettingsFromLocalStorage();
  updateDisplay();
});
