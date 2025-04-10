document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const movesDisplay = document.getElementById('moves');
    const pairsDisplay = document.getElementById('pairs');
    const restartButton = document.getElementById('restart');

    let cards = [];
    let flippedCards = [];
    let moves = 0;
    let pairsFound = 0;
    let canFlip = true;
    let champions = [];
    let selectedChampions = [];

    async function loadChampions() {
        try {
            const response = await fetch('https://ddragon.leagueoflegends.com/cdn/14.12.1/data/pt_BR/champion.json');
            const data = await response.json();
            champions = Object.values(data.data);

            selectedChampions = [...champions]
                .sort(() => 0.5 - Math.random())
                .slice(0, 8);

            createBoard();
        } catch (error) {
            console.error('Erro ao carregar campeões:', error);
            selectedChampions = [
                { key: '266', id: 'Aatrox', image: { full: 'Aatrox.png' } },
                { key: '103', id: 'Ahri', image: { full: 'Ahri.png' } },
                { key: '84', id: 'Akali', image: { full: 'Akali.png' } },
                { key: '166', id: 'Akshan', image: { full: 'Akshan.png' } },
                { key: '12', id: 'Alistar', image: { full: 'Alistar.png' } },
                { key: '32', id: 'Amumu', image: { full: 'Amumu.png' } },
                { key: '34', id: 'Anivia', image: { full: 'Anivia.png' } },
                { key: '1', id: 'Annie', image: { full: 'Annie.png' } }
            ];
            createBoard();
        }
    }

    function createBoard() {
        board.innerHTML = '';

        let deck = [...selectedChampions, ...selectedChampions]
            .map(champ => ({
                ...champ,
                uniqueId: champ.key + '-' + Math.random().toString(36).substr(2, 9)
            }))
            .sort(() => Math.random() - 0.5);

        deck.forEach((champion) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.id = champion.uniqueId;
            card.dataset.championKey = champion.key;

            const img = document.createElement('img');
            img.className = 'champion-img';
            img.src = `https://ddragon.leagueoflegends.com/cdn/14.12.1/img/champion/${champion.image.full}`;
            img.alt = champion.id;

            card.appendChild(img);
            card.addEventListener('click', flipCard);
            board.appendChild(card);
        });

        cards = document.querySelectorAll('.card');
        moves = 0;
        pairsFound = 0;
        flippedCards = [];
        updateStats();
    }

    function flipCard() {
        if (!canFlip || this.classList.contains('flipped') || this.classList.contains('matched')) {
            return;
        }

        this.classList.add('flipped');
        flippedCards.push(this);

        if (flippedCards.length === 2) {
            canFlip = false;
            moves++;
            updateStats();
            checkForMatch();
        }
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;

        if (card1.dataset.championKey === card2.dataset.championKey) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            pairsFound++;
            updateStats();
            flippedCards = [];
            canFlip = true;

            if (pairsFound === selectedChampions.length) {
                setTimeout(() => {
                    alert(`Parabéns! Você completou o jogo em ${moves} jogadas!`);
                }, 500);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                canFlip = true;
            }, 1000);
        }
    }

    function updateStats() {
        movesDisplay.textContent = moves;
        pairsDisplay.textContent = `${pairsFound}/${selectedChampions.length}`;
    }

    restartButton.addEventListener('click', loadChampions);

    loadChampions();
});