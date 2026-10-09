# АгроМаркет — React, лабораторная работа №6

Frontend подключён к собственному Express API: `http://localhost:3000/api`.
ФИО не указывается по пожеланию пользователя.

## Запуск

Нужен Node.js 22.12+.

В первом терминале запустите отдельный backend, расположенный рядом:

```sh
cd ../agromarket-server
npm install
npm run db:local:start
npm run dev
```

Во втором терминале, в этой папке:

```sh
npm install
npm run dev
```

Откройте `http://localhost:5173`. Порт закреплён: если он занят, Vite сообщит об ошибке вместо смены порта, которая нарушила бы настройки CORS. json-server больше не используется.

## Что сделано

- Каталог загружает товары через `GET /api/products` с обработкой загрузки и ошибки.
- Существующий поиск по названиям работает в React без учёта регистра. Сервер также поддерживает независимые запросы `search`, `maxPrice`, `sort`.
- Форма отправляет `product_id`, `name`, `email`, `phone`, `quantity`, `date`, `comment` через `POST /api/orders` в JSON.
- Успех: alert с номером заявки и очистка формы. Ошибка API или недоступный сервер: alert, введённые данные сохраняются.
- Во время запроса кнопка отключена и показывает «Отправка…», повторная отправка блокируется.
- В форме можно выбрать товар: `product_id` сохраняется в PostgreSQL, название доступно через JOIN.
- Каталог загружает все страницы API по 100 товаров.
- Общий адрес API вынесен в `src/api.js`.
- Оригинальные товары и оформление сохранены.

## Проверки

```sh
npm run build
npm run lint
npm --prefix ../agromarket-server test
```

Документация API, ответы на эксперименты, все четыре бонуса и вопросы для защиты находятся в [README backend](../agromarket-server/README.md).

## Проверка вручную

1. Откройте каталог, в Network найдите `GET http://localhost:3000/api/products?limit=100&offset=0`: 200.
2. Заполните форму, укажите не менее 10 кг и отправьте. Появится «Заявка №… принята!».
3. Откройте `http://localhost:3000/api/orders`: заявка находится в списке.
4. В консоли браузера выполните:

```js
fetch('http://localhost:3000/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Тест', email: 't@t.kz', quantity: 5 }),
}).then(async (response) => console.log(response.status, await response.json()));
```

Ожидается 400 и «Минимальный объём заказа — 10 кг».
Заявки хранятся в PostgreSQL и сохраняются после перезапуска backend и базы.
В этой копии база уже подготовлена; на другом компьютере настройте `.env` и выполните `npm run db:init` один раз по README backend.

## GitHub

Исходная папка была архивом без `.git` и удалённых репозиториев. Для публикации и получения двух ссылок для сдачи необходимо указать GitHub-репозитории frontend и backend.

## Лабораторная 6

Backend поддерживает полный CRUD товаров, статусы заявок, пагинацию и фильтры. Отчёт лабораторной 6 и Postman-коллекция находятся в соседнем проекте `agromarket-server`. Для проверки коллекции: `npm --prefix ../agromarket-server run test:postman`.
