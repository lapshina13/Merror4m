// Ждем, пока вся страница (HTML) загрузится, и только потом запускаем наш код.
document.addEventListener('DOMContentLoaded', () => {

    // --- ОБЩИЕ ФУНКЦИИ САЙТА ---

    // Это объект, где мы храним всю информацию о наших спектаклях.
    const eventsData = {
        reflection: {
            title: 'Отражение души',
            date: '4 декабря',
            imgSrc: 'images/afisha-poster-1-1.webp'
        },
        splash: {
            title: 'Всплеск',
            date: '7 августа',
            imgSrc: 'images/afisha-poster-2-1.webp'
        },
        masterclass: {
            title: 'Мастер-класс по актерскому мастерству',
            date: '12 декабря',
            imgSrc: 'images/afisha-poster-3-1.webp'
        },
        emotions: {
            title: 'Не бойся своих эмоций',
            date: '5 июня',
            imgSrc: 'images/afisha-poster-4-1.webp'
        }
    };

    // Функция для обновления счетчика товаров в корзине (в хедере).
    function updateCartCounter() {
        // Находим кружок-счетчик в HTML.
        const counterElement = document.querySelector('.cart-counter');
        // Если его нет на странице, просто выходим из функции.
        if (!counterElement) return;

        // Достаем из памяти браузера количество товаров. Если там ничего нет, считаем, что их 0.
        const itemCount = parseInt(localStorage.getItem('cartItemCount')) || 0;

        // Если товаров больше нуля
        if (itemCount > 0) {
            // пишем в кружок их количество и делаем его видимым.
            counterElement.textContent = itemCount;
            counterElement.classList.add('visible');
        } else {
            // иначе прячем кружок.
            counterElement.classList.remove('visible');
        }
    }

    // Вызываем функцию один раз при загрузке любой страницы, чтобы сразу показать правильное число.
    updateCartCounter();


    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ "АФИША" ---

    // Проверяем, на странице "Афиша" ли мы сейчас.
    if (document.querySelector('.afisha-page')) {
        // Находим все кнопки "купить билет".
        const eventButtons = document.querySelectorAll('.afisha-event__button');
        // Проходимся по каждой кнопке.
        eventButtons.forEach(button => {
            // Вешаем на каждую кнопку "слушателя" кликов.
            button.addEventListener('click', function(e) {
                // Отменяем стандартное поведение ссылки (чтобы страница не дергалась).
                e.preventDefault();
                // Находим родительский блок всего мероприятия, на которое кликнули.
                const eventBlock = this.closest('.afisha-event');
                // Из этого блока забираем его ID (например, "reflection").
                const eventId = eventBlock.dataset.eventId;
                // Если ID есть и для него есть данные в нашем объекте `eventsData`
                if (eventId && eventsData[eventId]) {
                    // сохраняем инфу о выбранном спектакле в память браузера.
                    sessionStorage.setItem('selectedEvent', JSON.stringify(eventsData[eventId]));
                    // И только потом переходим на страницу билетов.
                    window.location.href = this.href;
                }
            });
        });
    }


    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ "БИЛЕТЫ" ---

    // Проверяем, на странице "Билеты" ли мы сейчас.
    if (document.querySelector('.tickets-page')) {
        // Достаем из памяти браузера информацию о выбранном спектакле.
        const selectedEventJSON = sessionStorage.getItem('selectedEvent');
        // Если там что-то есть
        if (selectedEventJSON) {
            // превращаем текст обратно в объект.
            const selectedEvent = JSON.parse(selectedEventJSON);
            // Находим на странице нужные места для вставки данных.
            const titleElement = document.getElementById('ticket-title');
            const dateElement = document.getElementById('ticket-date');
            const posterElement = document.getElementById('ticket-poster-img');

            // Вставляем данные в HTML, если элементы нашлись.
            if (titleElement) titleElement.textContent = selectedEvent.title;
            if (dateElement) dateElement.textContent = selectedEvent.date;
            if (posterElement) {
                posterElement.src = selectedEvent.imgSrc;
                posterElement.alt = `Постер постановки ${selectedEvent.title}`;
            }
        }

        // Работа с формой покупки.
        const purchaseForm = document.getElementById('purchase-form');
        // Если форма на странице есть
        if (purchaseForm) {
            // вешаем на нее "слушателя" отправки.
            purchaseForm.addEventListener('submit', function(e) {
                // Отменяем стандартную отправку формы.
                e.preventDefault();
                // Находим все поля, которые обязательно нужно заполнить.
                const inputs = purchaseForm.querySelectorAll('input[required]');
                let allValid = true;
                // Проверяем каждое поле.
                inputs.forEach(input => {
                    // Если это чекбокс, и он не нажат - форма невалидна.
                    if (input.type === 'checkbox' && !input.checked) {
                        allValid = false;
                    }
                    // Если это обычное поле, и оно пустое - форма невалидна.
                    else if (input.type !== 'checkbox' && input.value.trim() === '') {
                        allValid = false;
                    }
                });

                // Если все поля заполнены
                if (allValid) {
                    // перекидываем пользователя на страницу "спасибо".
                    window.location.href = 'thank-you.html';
                } else {
                    // иначе ругаемся.
                    alert('Пожалуйста, заполните все обязательные поля.');
                }
            });
        }
    }


    // --- ЛОГИКА ДЛЯ СЛАЙДЕРА (СТРАНИЦА "О НАС") ---

    // Ищем слайдер на странице.
    const slider = document.querySelector('.about-slider');
    // Если нашли
    if (slider) {
        // находим все его части: слайды, кнопки, точки.
        const slides = slider.querySelectorAll('.about-slider__slide');
        const prevButton = slider.querySelector('.about-slider__arrow--prev');
        const nextButton = slider.querySelector('.about-slider__arrow--next');
        const dotsContainer = slider.querySelector('.about-slider__dots');
        let currentSlide = 0; // Номер текущего слайда.
        let dots = []; // Массив для хранения точек.

        // Функция для первоначальной настройки слайдера.
        function initSlider() {
            // Если слайдов нет, ничего не делаем.
            if (slides.length === 0 || !dotsContainer) return;
            // Для каждого слайда создаем свою точку.
            slides.forEach((slide, index) => {
                const dot = document.createElement('span');
                dot.classList.add('about-slider__dot');
                // При клике на точку, показываем нужный слайд.
                dot.addEventListener('click', () => showSlide(index));
                dotsContainer.appendChild(dot);
                dots.push(dot);
            });
            // Показываем первый слайд при загрузке.
            showSlide(0);
        }

        // Функция для показа конкретного слайда.
        function showSlide(index) {
            // Убираем у всех слайдов и точек класс 'active'.
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));

            // Магия для зацикливания слайдера.
            currentSlide = (index + slides.length) % slides.length;

            // Добавляем класс 'active' только нужному слайду и точке.
            if (slides[currentSlide]) slides[currentSlide].classList.add('active');
            if (dots[currentSlide]) dots[currentSlide].classList.add('active');
        }

        // Вешаем клики на стрелки.
        if (prevButton) prevButton.addEventListener('click', () => showSlide(currentSlide - 1));
        if (nextButton) nextButton.addEventListener('click', () => showSlide(currentSlide + 1));

        // Запускаем настройку слайдера.
        initSlider();
    }


    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ "МАГАЗИН" ---

    // Проверяем, на странице "Магазин" ли мы сейчас.
    if (document.querySelector('.shop-page')) {
        // Логика для добавления в корзину.
        const addToCartButtons = document.querySelectorAll('.shop-product__cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                // Берем текущее значение счетчика из памяти, или 0.
                let currentCount = parseInt(localStorage.getItem('cartItemCount')) || 0;
                // Увеличиваем на 1.
                currentCount++;
                // Сохраняем новое значение обратно в память.
                localStorage.setItem('cartItemCount', currentCount);
                // Обновляем кружок-счетчик в хедере.
                updateCartCounter();
            });
        });

        // Логика для смены картинки при наведении.
        const swapImages = document.querySelectorAll('.product-swap-on-hover');
        if (swapImages.length > 0) {
            swapImages.forEach(product => {
                const imageWrapper = product.querySelector('.shop-product__image-wrapper');
                const image = product.querySelector('.shop-product__image');
                const originalSrc = image.src; // Запоминаем оригинальную картинку.
                const hoverSrc = image.dataset.hoverSrc; // Берем путь к новой картинке из атрибута.

                if (imageWrapper && image && hoverSrc) {
                    // Когда мышка заходит на картинку, меняем ее.
                    imageWrapper.addEventListener('mouseenter', () => image.src = hoverSrc);
                    // Когда мышка уходит, возвращаем старую.
                    imageWrapper.addEventListener('mouseleave', () => image.src = originalSrc);
                }
            });
        }
    }


    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ "КОНКУРС" ---

    // Проверяем, на странице "Конкурс" ли мы сейчас.
    if (document.querySelector('.contest-page')) {
        const openModalBtn = document.querySelector('.contest-hero__button--solid');
        const overlay = document.getElementById('contest-modal-overlay');
        const formModal = document.getElementById('contest-form-modal');
        const successModal = document.getElementById('contest-success-modal');
        const contestForm = document.getElementById('contest-application-form');

        // Только если все нужные элементы есть, продолжаем.
        if (openModalBtn && overlay && formModal && successModal && contestForm) {
            const closeButtons = overlay.querySelectorAll('.modal-close-btn');

            // Функция, чтобы открыть модалку с формой.
            const openFormModal = () => {
                overlay.classList.add('active');
                formModal.classList.add('active');
                successModal.classList.remove('active'); // Прячем модалку "успех" на всякий случай.
            };

            // Функция, чтобы закрыть все модалки.
            const closeModal = () => {
                overlay.classList.remove('active');
            };

            // Вешаем открытие модалки на кнопку "Принять участие".
            openModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openFormModal();
            });

            // Вешаем закрытие на все крестики.
            closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
            // Закрываем модалку, если кликнуть на темный фон.
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal();
            });

            // Логика отправки формы конкурса.
            contestForm.addEventListener('submit', (e) => {
                e.preventDefault();
                let allValid = true;
                const requiredInputs = contestForm.querySelectorAll('input[required]');

                requiredInputs.forEach(input => {
                    // Универсальная проверка для всех типов полей.
                    if ((input.type === 'checkbox' && !input.checked) ||
                        (input.type === 'file' && input.files.length === 0) ||
                        (input.type !== 'checkbox' && input.type !== 'file' && input.value.trim() === '')) {
                        allValid = false;
                    }
                });

                if (allValid) {
                    // Если все ок, прячем форму и показываем "успех".
                    formModal.classList.remove('active');
                    successModal.classList.add('active');
                    contestForm.reset(); // Сбрасываем поля формы.
                } else {
                    alert('Пожалуйста, заполните все поля и загрузите файл.');
                }
            });
        }
    }


    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ "ОНЛАЙН ПРЕДСТАВЛЕНИЕ" ---

    const onlineShowPage = document.querySelector('.online-show-page');
    // Если мы на этой странице
    if (onlineShowPage) {
        const frontImageSrc = 'images/online-show-mask.webp';
        const randomBackImages = [];
        // Создаем массив с путями ко всем 22 картинкам.
        for (let i = 1; i <= 22; i++) {
            randomBackImages.push(`images/red-face-${i}.webp`);
        }
        // Функция, которая создает одну переворачивающуюся карточку.
        const createCard = () => {
            const card = document.createElement('div');
            card.className = 'online-show__card';
            const cardInner = document.createElement('div');
            cardInner.className = 'online-show__card-inner';
            const cardFront = document.createElement('div');
            cardFront.className = 'online-show__card-front';
            const frontImg = document.createElement('img');
            frontImg.src = frontImageSrc;
            frontImg.alt = 'Театральная маска';
            cardFront.appendChild(frontImg);
            const cardBack = document.createElement('div');
            cardBack.className = 'online-show__card-back';
            const backImg = document.createElement('img');
            // Выбираем случайную картинку для обратной стороны.
            const randomIndex = Math.floor(Math.random() * randomBackImages.length);
            backImg.src = randomBackImages[randomIndex];
            backImg.alt = 'Случайное изображение';
            cardBack.appendChild(backImg);
            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            card.appendChild(cardInner);
            return card;
        };

        // Находим все ряды для карточек.
        const cardContainers = onlineShowPage.querySelectorAll('[data-cards]');
        cardContainers.forEach(container => {
            // Заполняем каждый ряд нужным количеством карточек.
            const numCards = parseInt(container.dataset.cards, 10);
            for (let i = 0; i < numCards; i++) {
                container.appendChild(createCard());
            }
        });

        // Вешаем один "слушатель" на всю страницу для экономии ресурсов.
        onlineShowPage.addEventListener('click', (event) => {
            const clickedCard = event.target.closest('.online-show__card');
            if (clickedCard) {
                // Находим ее "внутренности" и переворачиваем.
                const inner = clickedCard.querySelector('.online-show__card-inner');
                if (inner) {
                    inner.classList.toggle('is-flipped');
                }
            }
        });
    }


});