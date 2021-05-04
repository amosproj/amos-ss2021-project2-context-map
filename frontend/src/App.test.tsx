import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import RandomNumberGeneratorFake from '../cypress/fixtures/RandomNumberGeneratorFake';

test('renders hello world with number form DI', () => {
  // Arrange
  const value = 2;
  const rnd = new RandomNumberGeneratorFake(value);

  // Act
  render(<App rnd={rnd} />);

  // Assert
  const linkElement = screen.getByText(new RegExp(`Hello world ${value}`, 'i'));
  expect(linkElement).toBeInTheDocument();
});