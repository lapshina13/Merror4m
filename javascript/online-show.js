document.addEventListener('DOMContentLoaded', () => {

    const onlineShowPage = document.querySelector('.online-show-page');

    if (onlineShowPage) {
        const frontImageSrc = '../images/blueFace.webp';

        // вставляем разные маски на обратную часть синего лица
        const randomBackImages = [];
        for (let i = 1; i <= 22; i++) {
            randomBackImages.push(`../images/red-face-${i}.webp`);
        }


        // код для переварота лиц
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
            const randomIndex = Math.floor(Math.random() * randomBackImages.length);
            backImg.src = randomBackImages[randomIndex];
            backImg.alt = 'Случайное изображение';
            cardBack.appendChild(backImg);

            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            card.appendChild(cardInner);

            return card;
        };

        const cardContainers = onlineShowPage.querySelectorAll('[data-cards]');
        cardContainers.forEach(container => {
            const numCards = parseInt(container.dataset.cards, 10);
            for (let i = 0; i < numCards; i++) {
                container.appendChild(createCard());
            }
        });

        onlineShowPage.addEventListener('click', (event) => {
            const clickedCard = event.target.closest('.online-show__card');
            if (clickedCard) {
                const inner = clickedCard.querySelector('.online-show__card-inner');
                if (inner) {
                    inner.classList.toggle('is-flipped');
                }
            }
        });
    }

});