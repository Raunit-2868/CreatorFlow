import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('CreatorFlow Frontend Application Shell Tests', () => {
  it('renders landing page on root route without crashing', () => {
    render(<App />);
    const brandTitles = screen.getAllByText(/CreatorFlow/i);
    expect(brandTitles.length).toBeGreaterThan(0);
    expect(screen.getByText(/Where Top Creators and Elite Brands Build High-Impact Campaigns/i)).toBeInTheDocument();
  });

  it('renders sign in and registration CTAs', () => {
    render(<App />);
    const signInButtons = screen.getAllByRole('button', { name: /Sign In/i });
    expect(signInButtons.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
  });
});
