// Путь к файлу JSON для отправки запроса
const url = './db/data.json';

// Определяем состояние, записываем в него 
// id редактируемой строки (trEdit)
const state = {
    data: [],
    rowEdit: null,
    pagesQuantity: null,
    page: 1,
    buttons: {
        hideName: false,
        hideSurname: false,
        hideAbout: false,
        hideEyeColor: false
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Только после получения данных рендерим
    // саму страницу/приложение
    getData().then(() => {
        renderApp();
    })
})

// Функция получения данных из JSON-файла
function getData() {
    // Запрашиваем данные из файла JSON
    return fetch(url)
    // Конвертируем формат JSON в массив объектов
    .then(response => response.json())
    // Записываем данные в state.data, далее работаем
    // только со state.data. Вместо переменной также можно
    // записать данные в localStorage.
    .then(data => { 
        state.data = state.data.concat(data);
        return data;
    })
    .catch(err => {
      alert(err);
    });
}

// Функция рендеринга страницы/приложения
function renderApp() {
    setPagesQuantity();
    renderPageNumeration();
    renderHideButtons();
    renderTable(state.page);
}

// Функция подсчета количества страниц
function setPagesQuantity() {
    state.pagesQuantity = Math.ceil(state.data.length / 10);
}

// Функция рендеринга нумерации страниц
function renderPageNumeration() {
    const pagesContainer = document.querySelector('.pages');
    pagesContainer.innerHTML = '';
    // Заранее может быть неизвестно, сколько данных мы можем получить
    // в ответе от сервера, поэтому количество страниц определяем
    // динамически
    for (let i = 1; i <= state.pagesQuantity; i++) {
        const pageDiv = document.createElement('div');
        pageDiv.innerHTML = `<p>${i}</p>`;
        pageDiv.classList.add('pages__page');
        // Добавляем класс 'active' указателю текущей страницы (state.page)
        if (i === state.page) pageDiv.classList.add('active');
        pageDiv.addEventListener('click', switchPage);
        pagesContainer.append(pageDiv);
    } 
}

// Функция-обработчик переключений между страницами
function switchPage(event) {
    state.page = Number(event.target.textContent);
    renderPageNumeration();
    renderTable(state.page);
}

// Функция рендеринга кнопок скрытия/показа колонок
function renderHideButtons() {
    const hideButtons = document.querySelector('.hide');
    hideButtons.innerHTML = '';
    for (let button in state.buttons) {
        // В зависимости от состояния кнопки скрытия (true/false) задаем нужный текст
        const text =  (state.buttons[button]) ? 'Показать колонку' : 'Скрыть колонку';
        // Добавляеи нужные кнопки
        if (button === 'hideName') hideButtons.append(createButton('hide__name', `${text} "Имя"`));
        if (button === 'hideSurname') hideButtons.append(createButton('hide__surname', `${text} "Фамилия"`));
        if (button === 'hideAbout') hideButtons.append(createButton('hide__about', `${text} "Описание"`));
        if (button === 'hideEyeColor') hideButtons.append(createButton('hide__eyeColor', `${text} "Цвет глаз"`));
    }
}

// Функция создания одной кнопки скрытия/показа колонок
function createButton(buttonClass, buttonText) {
    const button = document.createElement('button');
    button.classList.add(buttonClass);
    button.textContent = buttonText;
    button.addEventListener('click', hideShow);
    return button;
}

// Функция рендеринга таблицы полностью
function renderTable(pageNum) {
    renderTableHead();
    renderTableBody(pageNum);
}

// Функция рендеринга шапки таблицы (с учетом состояния кнопок скрытия колонок)
function renderTableHead() {
    const tableHeader = document.querySelector('.table__header');
    tableHeader.innerHTML = '';
    const row = document.createElement('tr');

    for (let i = 0; i < 4; i++) {
        if (i === 0 && !state.buttons.hideName) row.append(createCell('table__name', 'Имя'));
        if (i === 1 && !state.buttons.hideSurname) row.append(createCell('table__surname', 'Фамилия'));
        if (i === 2 && !state.buttons.hideAbout) row.append(createCell('table__about', 'Описание'));
        if (i === 3 && !state.buttons.hideEyeColor) row.append(createCell('table__eyeColor', 'Цвет глаз'));
    }
    tableHeader.append(row);
}

// Функция рендеринга тела таблицы (непосредственно с данными из JSON файла, 
// с учетом состояния кнопок скрытия колонок)
function renderTableBody(pageNum) {
    const tableBody = document.querySelector('.table__body');
    tableBody.innerHTML = '';
    
    // Для рендеринга одной страницы таблицы нам нужно только 10 элементов с данными
    const dataPerPage = state.data.slice(10 * (pageNum - 1), 10 * pageNum);
    // Для каждого элемента массива данных добавляем строку с
    // соответствующими данными
    for (let item of dataPerPage) {
        tableBody.append(createBodyRow(item));
    }
    
    // Добавляем слушатели событий на ячейки-заголовки, поскольку
    // сортировку будем делать по клику на них
    const tableHeaders = document.querySelector('.table__header').firstChild.childNodes;

    tableHeaders.forEach(tableHeader => {
        // Сбрасываем стили сортировки у ячеек заголовков
        // при ререндеринге таблицы (например, при переключении
        // страниц)
        tableHeader.classList.remove('active', 'sortedToHigh');
        tableHeader.addEventListener('click', sort);
    })
}

// Функция создания строки с данными,
// возвращает элемент строки tr
function createBodyRow(item) {
    const tr = document.createElement('tr');
    tr.id = item.id;
    const {firstName, lastName} = item.name;
    const props = [ firstName, lastName, item.about, item.eyeColor ];
    
    // Создаем ячейки с нужными данными
    for (let prop of props) {
        if (prop === firstName && !state.buttons.hideName) tr.append(createCell('table__name', prop));
        if (prop === lastName && !state.buttons.hideSurname) tr.append(createCell('table__surname', prop));
        if (prop === item.about && !state.buttons.hideAbout) tr.append(createCell('table__about', prop));
        if (prop === item.eyeColor && !state.buttons.hideEyeColor) {
            const cell = createCell('table__eyeColor', prop);
            // Если создается ячейка с данными о цвете глаз,
            // создаем внутри ячейки div с цветом фона,
            // соответствующим цвету глаз
            const divColor = document.createElement('div');
            divColor.style.backgroundColor = prop;
            cell.append(divColor); 
            tr.append(cell);
        }
        
        
        // Навешиваем слушатель событий на строку,
        // чтобы по нажатию на нее открывался
        // блок редактирования
        tr.addEventListener('click', openEditForm);
    }
    return tr;
}

// Функция создания ячейки с данными (как для шапки таблицы, 
// так и для тела таблицы)
function createCell(cellClass, cellText) {
    const cell = document.createElement('td');
    cell.classList.add(cellClass);
    cell.innerHTML = `<p>${cellText}</p>`;
    return cell;
}

// Функция сортировки столбца (в данном случае регистрозависимая,
// поскольку иного не требуется в соответствии с данными в JSON файле)
function sort(event) {
    // "Активация" сортировки, псевдоэлементы ::after меняют цвет
    // с серого на черный
    event.target.classList.add('active');
    // Проверяем класс ячейки, на которую кликнули, чтобы
    // определить индекс ячеек (в строках) по которым будем
    // проводить сортировку
    let cellsIndex;
    if (event.target.classList.contains('table__name')) cellsIndex = 0;
    if (event.target.classList.contains('table__surname')) cellsIndex = 1;
    if (event.target.classList.contains('table__about')) cellsIndex = 2;
    if (event.target.classList.contains('table__eyeColor')) cellsIndex = 3;

    // Cсоздаем массив строк с данными, не включая первую с заголовками 
    const tableBody = document.querySelector('.table__body');
    const tableRows = Array.from(tableBody.childNodes);

    if (!event.target.classList.contains('sortedToHigh')) {
        // Если ячейка, по которой кликнули, не помечена классом
        // 'sortedToHigh', сортируем 'по возрастанию'
        tableRows.sort((rowA, rowB) => rowA.cells[cellsIndex].textContent > rowB.cells[cellsIndex].textContent ? 1 : -1); 
    } else {
        // Если ячейка, по которой кликнули, помечена классом
        // 'sortedToHigh', сортируем 'по убыванию'
        tableRows.sort((rowA, rowB) => rowA.cells[cellsIndex].textContent < rowB.cells[cellsIndex].textContent ? 1 : -1); 
    }
    // Перезаписываем содержание таблицы и 
    tableBody.append(...tableRows); 
    // Lобавляем пометку в виде класса 'sortedToHigh', если сортировка была
    // 'по возрастанию' и удаляем, если 'по убыванию'.
    // Чтобы не возникло путаницы, при сортировке по одному
    // столбцу сортировка другого столбца сбрасывается
    event.target.parentElement.childNodes.forEach(cellHeader => {
        (cellHeader === event.target) ? 
            cellHeader.classList.toggle('sortedToHigh') :
            cellHeader.classList.remove('sortedToHigh');
    });
}

// Функция открытия формы редактирования
function openEditForm(event) {
    // Определяем строку, которую будем редактировать
    const rowToEdit = event.target.parentElement;
    // Отправляем в state идентификатор редактируемой строки
    state.rowEdit = rowToEdit.id;

    const itemToEdit = state.data.find(row => row.id === state.rowEdit);

    // Выносим текстовое содержание в переменные
    // с соответствующими именами
    const { firstName, lastName } = itemToEdit.name;
    const about = itemToEdit.about;
    const eyeColor = itemToEdit.eyeColor;
    // Открываем блок редактирования с предзаполнением
    // инпутов содержанием редактируемой строки
    // (чтобы было что редактировать, а не просто писать
    // с нуля новое содержание)
    const editBlock = document.querySelector('.edit');
    editBlock.classList.add('visible');

    const editName = document.querySelector('#name');
    editName.value = firstName;
    const editSurame = document.querySelector('#surname');
    editSurame.value = lastName;
    const editAbout = document.querySelector('#about');
    editAbout.value = about;
    const editEyeColor = document.querySelector('#eye-color');
    editEyeColor.value = eyeColor;

    // Навешиваем слушатель событий на кнопку отмены,
    // чтобы по ее нажатию закрыть блок редактирования
    const cancelBtn = document.querySelector('.edit__cancelBtn');
    cancelBtn.addEventListener('click', close);
    
    // Навешиваем слушатель событий на кнопку редактирования
    // для отправки изменений
    const editBtn = document.querySelector('.edit__editBtn');
    editBtn.addEventListener('click', edit);
}
// Функция закрытия блока редактирования по клику на
// кнопку отмены
function close() {
    const editBlock = document.querySelector('.edit');
    editBlock.classList.remove('visible');
}
// Функция отправки изменений в строку
function edit() {
    const editBlock = document.querySelector('.edit');

    const editName = document.querySelector('#name');
    const editSurname = document.querySelector('#surname');
    const editAbout = document.querySelector('#about');
    const editEyeColor = document.querySelector('#eye-color');
    
    // Обновление данных в state.data
    const dataItem = state.data.find(dataItem => dataItem.id === state.rowEdit);
    dataItem.name = { 
        firstName: editName.value,
        lastName: editSurname.value
    }
    dataItem.about = editAbout.value;
    dataItem.eyeColor = editEyeColor.value;

    // По нужному id ищем строку и меняем ее содержимое
    // в соответствии с изменениями state.data
    const tableBody = document.querySelector('.table__body');
    const tableRow = Array.from(tableBody.childNodes).find(tableRow => tableRow.id === state.rowEdit);
    // Перерисовываем редактируемую строку в соответствии с изменениями
    tableRow.replaceWith(createBodyRow(dataItem));
    
    // Изменения отправлены, нужно закрыть блок редактирования
    editBlock.classList.remove('visible');
}

// Функция скрытия/показа колонки по нажатию
function hideShow(event) {
    const btn = event.target;
    // Меняем состояние кнопки в state.buttons
    if (btn.classList.contains('hide__name')) state.buttons.hideName = !state.buttons.hideName;
    if (btn.classList.contains('hide__surname')) state.buttons.hideSurname = !state.buttons.hideSurname;
    if (btn.classList.contains('hide__about')) state.buttons.hideAbout = !state.buttons.hideAbout;
    if (btn.classList.contains('hide__eyeColor')) state.buttons.hideEyeColor = !state.buttons.hideEyeColor;
    renderHideButtons();
    renderTable(state.page);
}

