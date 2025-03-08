import React, { useState, useEffect, useRef } from 'react';
import './MemoryGame.css'; // Import the CSS file we just created

const MemoryGame = () => {
  // Game state
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [customImages, setCustomImages] = useState([]);
  const [defaultImages, setDefaultImages] = useState([]);
  const timerRef = useRef(null);

  // Helper function to get correct image path
  const getImagePath = (imageName) => {
    // Check if we're on GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    // If on GitHub Pages, use the repo name, otherwise use PUBLIC_URL
    const basePath = isGitHubPages ? '/memorygamereact' : process.env.PUBLIC_URL;
    const fullPath = `${basePath}/images/${imageName}`;
    console.log('Image path details:', {
      isGitHubPages,
      basePath,
      imageName,
      fullPath,
      hostname: window.location.hostname,
      publicUrl: process.env.PUBLIC_URL
    });
    return fullPath;
  };

  // List of image filenames
  const imageNames = [
    'euonymus-europaeus-8353310_1280.jpg',
    'fruit-8773085_1280.jpg',
    'grapes-5889697_1280.jpg',
    'healthy-5146826_1280.jpg',
    'onions-1397037_1280.jpg',
    'pumpkin-1637320_1280.jpg',
    'raspberries-7313700_1280.jpg',
    'salad-2756467_1280.jpg',
    'tomato-5011851_1280.jpg',
    'vegetable-market-337971_1280.jpg'
  ];

  // Set default images on component mount
  useEffect(() => {
    const paths = imageNames.map(name => getImagePath(name));
    console.log('Setting default images:', paths);
    setDefaultImages(paths);
  }, []);

  // Initialize game
  const initializeGame = (images) => {
    console.log('Initializing game with images:', images);
    // Create pairs of cards
    const cardPairs = [...images, ...images].map((image, index) => {
      console.log(`Creating card ${index} with image:`, image);
      return {
        id: index,
        image,
        isFlipped: false,
        isMatched: false
      };
    });
    
    // Shuffle cards
    const shuffledCards = shuffleArray(cardPairs);
    console.log('Shuffled cards:', shuffledCards);
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setMoves(0);
    setTime(0);
    setGameStarted(true);
    
    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
  };

  // Shuffle array function
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Handle card click
  const handleCardClick = (id) => {
    // Don't allow click if already matched or two cards are flipped
    if (matched.includes(id) || flipped.length === 2) return;
    
    // Don't allow clicking the same card twice
    if (flipped.length === 1 && flipped[0] === id) return;
    
    // Add card to flipped array
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    
    // Check for match if two cards are flipped
    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);
      
      if (firstCard.image === secondCard.image) {
        // Match found
        setMatched([...matched, firstId, secondId]);
        setScore(score + 10);
        setFlipped([]);
      } else {
        // No match
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length < 4) {
      alert("Please upload at least 4 images for a good game experience");
      return;
    }
    
    // Only take the first 8 images if more are uploaded
    const selectedFiles = files.slice(0, 8);
    
    const imageUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setCustomImages(imageUrls);
  };

  // Start game with default images
  const startWithDefaultImages = () => {
    console.log('Starting game with default images:', defaultImages);
    initializeGame(defaultImages);
  };

  // Start game with custom images
  const startWithCustomImages = () => {
    if (customImages.length < 4) {
      alert("Please upload at least 4 images first");
      return;
    }
    initializeGame(customImages);
  };

  // Reset game
  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCards([]);
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
  };

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Check if game is completed
  useEffect(() => {
    if (gameStarted && matched.length === cards.length && cards.length > 0) {
      clearInterval(timerRef.current);
    }
  }, [matched, cards, gameStarted]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="game-container">
      <h1 className="game-title">Memory Card Game</h1>
      
      {!gameStarted ? (
        <div className="setup-panel">
          <h2>Game Setup</h2>
          
          <div className="file-input-container">
            <label className="file-input-label">Upload your own images (4-8 images)</label>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImageUpload}
              className="file-input"
            />
            {customImages.length > 0 && (
              <div className="mt-2 text-sm">
                {customImages.length} images selected
              </div>
            )}
          </div>
          
          <div className="button-container">
            <button 
              onClick={startWithDefaultImages}
              className="button button-primary"
            >
              Start with Default Images
            </button>
            <button 
              onClick={startWithCustomImages}
              className={`button ${customImages.length >= 4 ? 'button-success' : 'button-disabled'}`}
              disabled={customImages.length < 4}
            >
              Start with Custom Images
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="game-header">
            <div className="timer">
              Time: {formatTime(time)}
            </div>
            <div>
              <button 
                onClick={resetGame}
                className="button button-danger"
              >
                Reset Game
              </button>
            </div>
          </div>
          
          <div className="game-layout">
            <div className="game-board">
              <div className="card-grid">
                {cards.map(card => {
                  console.log('Rendering card:', card);
                  return (
                    <div 
                      key={card.id} 
                      className={`card ${flipped.includes(card.id) ? 'card-flipped' : ''} ${matched.includes(card.id) ? 'card-matched' : ''}`}
                      onClick={() => handleCardClick(card.id)}
                    >
                      <div className="card-inner">
                        <div className="card-front"></div>
                        <div className="card-back">
                          <img 
                            src={card.image} 
                            alt="Card"
                            className="card-image"
                            onError={(e) => {
                              console.error(`Error loading image: ${card.image}`);
                              console.error('Full URL:', window.location.origin + card.image);
                              console.error('Error details:', e);
                            }}
                            onLoad={() => console.log(`Successfully loaded image: ${card.image}`)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="stats-panel">
              <h2 className="stats-title">Game Stats</h2>
              <div>
                <div className="stat-item">
                  <p className="stat-label">Score</p>
                  <p className="stat-value stat-score">{score}</p>
                </div>
                <div className="stat-item">
                  <p className="stat-label">Moves</p>
                  <p className="stat-value stat-moves">{moves}</p>
                </div>
                <div className="stat-item">
                  <p className="stat-label">Matches</p>
                  <p className="stat-value stat-matches">{matched.length / 2} / {cards.length / 2}</p>
                </div>
                
                {matched.length === cards.length && cards.length > 0 && (
                  <div className="game-complete">
                    <span className="game-complete-emoji">🎉</span>
                    <p className="game-complete-title">Game Complete!</p>
                    <p className="game-complete-stats">Final Score: {score}</p>
                    <p className="game-complete-stats">Time: {formatTime(time)}</p>
                    <p className="game-complete-stats">Moves: {moves}</p>
                    <button 
                      className="play-again-button"
                      onClick={resetGame}
                    >
                      Play Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;