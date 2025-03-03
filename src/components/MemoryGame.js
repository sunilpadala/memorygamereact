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

  // Load default images from public/images directory
  useEffect(() => {
    const loadDefaultImages = () => {
      try {
        // Get all image files from the public/images directory
        const imageContext = require.context('../../public/images', false, /\.(png|jpe?g|svg)$/);
        const imageList = imageContext.keys().map(key => {
          // Remove the './' prefix and get the filename
          const fileName = key.replace('./', '');
          return `/images/${fileName}`;
        });
        
        // Sort the images to ensure consistent order
        imageList.sort();
        
        // If we have images, use them, otherwise use fallback
        if (imageList.length > 0) {
          setDefaultImages(imageList);
        } else {
          console.warn('No images found in public/images directory');
          setDefaultImages([
            '/images/placeholder1.jpg',
            '/images/placeholder2.jpg',
            '/images/placeholder3.jpg',
            '/images/placeholder4.jpg',
            '/images/placeholder5.jpg',
            '/images/placeholder6.jpg',
            '/images/placeholder7.jpg',
            '/images/placeholder8.jpg',
          ]);
        }
      } catch (error) {
        console.error('Error loading default images:', error);
        // Fallback to placeholder images if loading fails
        setDefaultImages([
          '/images/placeholder1.jpg',
          '/images/placeholder2.jpg',
          '/images/placeholder3.jpg',
          '/images/placeholder4.jpg',
          '/images/placeholder5.jpg',
          '/images/placeholder6.jpg',
          '/images/placeholder7.jpg',
          '/images/placeholder8.jpg',
        ]);
      }
    };

    loadDefaultImages();
  }, []);

  // Initialize game
  const initializeGame = (images) => {
    // Create pairs of cards
    const cardPairs = [...images, ...images].map((image, index) => ({
      id: index,
      image,
      isFlipped: false,
      isMatched: false
    }));
    
    // Shuffle cards
    const shuffledCards = shuffleArray(cardPairs);
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
                {cards.map(card => (
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
                        />
                      </div>
                    </div>
                  </div>
                ))}
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