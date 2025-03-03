import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemoryGame from '../MemoryGame';

// Mock the image loading
jest.mock('../../public/images', () => ({
  card1: '/images/card1.png',
  card2: '/images/card2.png',
  card3: '/images/card3.png',
  card4: '/images/card4.png',
  card5: '/images/card5.png',
  card6: '/images/card6.png',
  card7: '/images/card7.png',
  card8: '/images/card8.png',
}));

describe('MemoryGame Component', () => {
  beforeEach(() => {
    // Reset timers before each test
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Clean up timers after each test
    jest.useRealTimers();
  });

  test('renders game setup panel initially', () => {
    render(<MemoryGame />);
    
    // Check for initial setup elements
    expect(screen.getByText('Memory Card Game')).toBeInTheDocument();
    expect(screen.getByText('Game Setup')).toBeInTheDocument();
    expect(screen.getByText('Start with Default Images')).toBeInTheDocument();
    expect(screen.getByText('Upload your own images (4-8 images)')).toBeInTheDocument();
  });

  test('starts game with default images', () => {
    render(<MemoryGame />);
    
    // Click start with default images
    fireEvent.click(screen.getByText('Start with Default Images'));
    
    // Check if game board is rendered
    expect(screen.getByText('Game Stats')).toBeInTheDocument();
    expect(screen.getByText('Time: 00:00')).toBeInTheDocument();
    
    // Check if cards are rendered (should be 16 cards - 8 pairs)
    const cards = screen.getAllByRole('img', { hidden: true });
    expect(cards).toHaveLength(16);
  });

  test('handles card flipping and matching', async () => {
    render(<MemoryGame />);
    
    // Start game
    fireEvent.click(screen.getByText('Start with Default Images'));
    
    // Get all cards
    const cards = screen.getAllByRole('img', { hidden: true });
    
    // Click first two cards
    fireEvent.click(cards[0].closest('.card'));
    fireEvent.click(cards[1].closest('.card'));
    
    // Check if moves counter increased
    expect(screen.getByText('Moves')).toBeInTheDocument();
    
    // Check if cards are flipped
    expect(cards[0].closest('.card')).toHaveClass('card-flipped');
    expect(cards[1].closest('.card')).toHaveClass('card-flipped');
  });

  test('handles custom image upload', () => {
    render(<MemoryGame />);
    
    // Create a mock file
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    // Get the file input
    const input = screen.getByLabelText(/upload your own images/i);
    
    // Simulate file upload
    fireEvent.change(input, { target: { files: [file] } });
    
    // Check if custom images button is enabled
    const customImagesButton = screen.getByText('Start with Custom Images');
    expect(customImagesButton).not.toBeDisabled();
  });

  test('resets game when reset button is clicked', () => {
    render(<MemoryGame />);
    
    // Start game
    fireEvent.click(screen.getByText('Start with Default Images'));
    
    // Click reset button
    fireEvent.click(screen.getByText('Reset Game'));
    
    // Check if game setup panel is shown again
    expect(screen.getByText('Game Setup')).toBeInTheDocument();
  });

  test('updates timer correctly', () => {
    render(<MemoryGame />);
    
    // Start game
    fireEvent.click(screen.getByText('Start with Default Images'));
    
    // Advance timers
    act(() => {
      jest.advanceTimersByTime(1000); // 1 second
    });
    
    // Check if timer updated
    expect(screen.getByText('Time: 00:01')).toBeInTheDocument();
  });

  test('shows game complete message when all cards are matched', () => {
    render(<MemoryGame />);
    
    // Start game
    fireEvent.click(screen.getByText('Start with Default Images'));
    
    // Mock all cards as matched
    act(() => {
      // This would need to be adjusted based on your actual implementation
      // You might need to mock the state or use a test-specific prop
    });
    
    // Check for game complete message
    expect(screen.getByText('Game Complete!')).toBeInTheDocument();
    expect(screen.getByText('Play Again')).toBeInTheDocument();
  });

  test('handles invalid image upload', () => {
    render(<MemoryGame />);
    
    // Get the file input
    const input = screen.getByLabelText(/upload your own images/i);
    
    // Try to start with custom images without uploading
    const customImagesButton = screen.getByText('Start with Custom Images');
    fireEvent.click(customImagesButton);
    
    // Check for alert message
    expect(screen.getByText('Please upload at least 4 images first')).toBeInTheDocument();
  });
}); 