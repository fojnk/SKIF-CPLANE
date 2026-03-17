## Frontend проекта StreamFlow

Версия ноды: [здесь](.nvmrc)  
Основной стек: [react](https://react.dev), [effector](https://effector.dev/), [gravity-ui](https://gravity-ui.com/)  

## Локальный запуск   

> Необходимо чтобы на локальной машине была установлена NodeJS версии, указанной [в файле .nvmrc](./.nvmrc)

1. Установка зависимостей  
```bash
npm ci # or npm i --force
```
2. Создание переменных окружения
Необходимо создать `.env` файл с переменными окружения (пример: `.env.example`)   

3. Запуск проекта  

**dev.** режим:  
```bash
npm run dev
```
**pred.prod.** режим:
```bash
npm run build:preview # создаст директорию dist с собранной статикой
npm run preview
```
**prod.** сборка:
```bash
npm run build # создаст директорию dist с собранной статикой
```

#### Проверка изменений файлов
Можно запустить две команды:  
1. `npm run lint:fix` - фикс проблем линтера  
2. `npm run build:preview` - сборка кода в продакшн с режимом превью (также после можно запустить `npm run preview`, которая позволить проверить собранный продакшне код)
