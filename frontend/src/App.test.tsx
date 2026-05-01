import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from './App';

vi.mock('./services/photographyApi', () => ({
  PhotographyApiService: {
    getPhotoCategories: vi.fn().mockResolvedValue([]),
  },
}));

test('renders the portfolio app shell', () => {
  render(<App />);
  expect(screen.getByText(/Loading Kyle's Portfolio/i)).toBeInTheDocument();
});
