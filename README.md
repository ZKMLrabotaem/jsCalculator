# jsCalculator
## 1. Задача: https://docs.google.com/document/d/1zpXXeSae-BlcxPKgw3DhxZA92cspVailrPYoaXSYrW8/edit?tab=t.0
## 2. Шаги для сборки и запуска

1. Клонируйте репозиторий с GitHub

2. Перейдите в папку проекта и установите зависимости с помощью ```npm install```

3. Соберите проект с помощью ```npm run build```. В папке проекта появиться папка dist с html и js файлом приложения.

Проект имеет следующую структуру:
```
jsCalculator/
├── dist/                   # Собранные файлы
├── node_modules/           # Модули npm
├── src/                    # Исходный код приложения
│   ├── calc.js             # JS файл, реализующий логику калькулятора
│   ├── index.js            # Основной JS файл
│   ├── style.css           # Основной файл стилей
│   └── index.html          # Основной HTML файл
├── .eslintrc.json          # Конфигурация ESLint
├── .prettierrc             # Конфигурация Prettier
├── package.json            # Информация о проекте и зависимости
├── webpack.config.js       # Конфигурация Webpack
└── README.md               # Инструкция по сборке проекта
```
