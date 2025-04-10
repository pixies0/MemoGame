document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("board");
  const movesDisplay = document.getElementById("moves");
  const pairsDisplay = document.getElementById("pairs");
  const totalPairsDisplay = document.getElementById("total-pairs");
  const restartButton = document.getElementById("restart");

  let cards = [];
  let flippedCards = [];
  let moves = 0;
  let pairsFound = 0;
  let canFlip = true;
  let champions = [];
  let selectedChampions = [];

  let timerInterval;
  let seconds = 0;
  let timerStarted = false;
  const timerDisplay = document.querySelector(".timer");

  function startTimer() {
    if (!timerStarted) {
      timerStarted = true;
      timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
      }, 1000);
    }
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function resetTimer() {
    stopTimer();
    seconds = 0;
    timerStarted = false;
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    timerDisplay.textContent = `${mins}:${secs}`;
  }

  const difficultySettings = {
    easy: {
      pairs: 2,
      cols: 2,
      cardSize: "120px",
    },
    medium: {
      pairs: 8,
      cols: 4,
      cardSize: "100px",
    },
    hard: {
      pairs: 18, // 6x6 (36 cartas)
      cols: 6,
      cardSize: "80px",
    },
  };

  let currentDifficulty = "medium";

  async function loadChampions() {
    try {
      const response = await fetch(
        "https://ddragon.leagueoflegends.com/cdn/14.12.1/data/pt_BR/champion.json"
      );
      const data = await response.json();
      champions = Object.values(data.data);
      setupGame();
    } catch (error) {
      console.error("Erro ao carregar campeões:", error);
      champions = [
        { key: "266", id: "Aatrox", image: { full: "Aatrox.png" } },
        { key: "103", id: "Ahri", image: { full: "Ahri.png" } },
        { key: "84", id: "Akali", image: { full: "Akali.png" } },
        { key: "166", id: "Akshan", image: { full: "Akshan.png" } },
        { key: "12", id: "Alistar", image: { full: "Alistar.png" } },
        { key: "32", id: "Amumu", image: { full: "Amumu.png" } },
        { key: "34", id: "Anivia", image: { full: "Anivia.png" } },
        { key: "1", id: "Annie", image: { full: "Annie.png" } },
        { key: "523", id: "Aphelios", image: { full: "Aphelios.png" } },
        { key: "22", id: "Ashe", image: { full: "Ashe.png" } },
        { key: "136", id: "AurelionSol", image: { full: "AurelionSol.png" } },
        { key: "268", id: "Azir", image: { full: "Azir.png" } },
        { key: "432", id: "Bard", image: { full: "Bard.png" } },
        { key: "200", id: "Belveth", image: { full: "Belveth.png" } },
        { key: "53", id: "Blitzcrank", image: { full: "Blitzcrank.png" } },
        { key: "63", id: "Brand", image: { full: "Brand.png" } },
        { key: "201", id: "Braum", image: { full: "Braum.png" } },
        { key: "51", id: "Caitlyn", image: { full: "Caitlyn.png" } },
        { key: "164", id: "Camille", image: { full: "Camille.png" } },
      ];
      setupGame();
    }
  }

  function setupGame() {
    resetTimer();
    const settings = difficultySettings[currentDifficulty];
    selectedChampions = [...champions]
        .sort(() => 0.5 - Math.random())
        .slice(0, settings.pairs);

    totalPairsDisplay.textContent = settings.pairs;
    createBoard();
}

  function createBoard() {
    board.innerHTML = "";
    const settings = difficultySettings[currentDifficulty];

    board.style.gridTemplateColumns = `repeat(${settings.cols}, var(--card-size))`;

    document.documentElement.style.setProperty(
      "--card-size",
      settings.cardSize
    );

    let deck = [];
    selectedChampions.forEach((champion) => {
      deck.push({ ...champion, uniqueId: champion.key + "-1" });
      deck.push({ ...champion, uniqueId: champion.key + "-2" });
    });

    deck = deck.sort(() => Math.random() - 0.5);

    deck.forEach((champion) => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.id = champion.uniqueId;
      card.dataset.championKey = champion.key;

      const img = document.createElement("img");
      img.className = "champion-img";
      img.src = `https://ddragon.leagueoflegends.com/cdn/14.12.1/img/champion/${champion.image.full}`;
      img.alt = champion.id;

      card.appendChild(img);
      card.addEventListener("click", flipCard);
      board.appendChild(card);
    });

    cards = document.querySelectorAll(".card");
    moves = 0;
    pairsFound = 0;
    flippedCards = [];
    updateStats();
  }

  function flipCard() {
    if (!canFlip || this.classList.contains('flipped') || this.classList.contains('matched')) {
        return;
    }

    if (!timerStarted) {
        startTimer();
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
      card1.classList.add("matched");
      card2.classList.add("matched");
      pairsFound++;
      updateStats();
      flippedCards = [];
      canFlip = true;

      if (pairsFound === selectedChampions.length) {
        setTimeout(() => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            alert(`Parabéns! Você completou o jogo em ${moves} jogadas e ${mins}m${secs}s!`);
        }, 500);
    }
    } else {
      setTimeout(() => {
        card1.classList.remove("flipped");
        card2.classList.remove("flipped");
        flippedCards = [];
        canFlip = true;
      }, 1000);
    }
  }

  function updateStats() {
    movesDisplay.textContent = moves;
    pairsDisplay.textContent = pairsFound;
  }

  function setupDifficultyButtons() {
    const buttons = document.querySelectorAll(".difficulty-options button");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        currentDifficulty = button.dataset.difficulty;

        buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        setupGame();
      });
    });

    document
      .querySelector('.difficulty-options button[data-difficulty="medium"]')
      .classList.add("active");
  }

  restartButton.addEventListener("click", setupGame);

  setupDifficultyButtons();
  loadChampions();
});
