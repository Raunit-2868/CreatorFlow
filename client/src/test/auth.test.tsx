import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('Frontend Authentication UI & Flow Tests (Phase 2)', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('renders landing page with Sign In and Get Started when unauthenticated', () => {
    render(<App />);
    const signInButtons = screen.getAllByRole('button', { name: /Sign In/i });
    expect(signInButtons.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
  });

  it('navigates to /login and renders the Sign In form', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument();
  });

  it('navigates to /register and renders the Registration form with role options', () => {
    window.history.pushState({}, '', '/register');
    render(<App />);
    expect(screen.getByText(/Create Your Account/i)).toBeInTheDocument();
    expect(screen.getByText(/I'm a Creator/i)).toBeInTheDocument();
    expect(screen.getByText(/I'm a Brand/i)).toBeInTheDocument();
  });

  it('navigates to /forgot-password and renders account recovery form', () => {
    window.history.pushState({}, '', '/forgot-password');
    render(<App />);
    expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Registered Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
  });

  it('navigates to /reset-password and renders new password inputs', () => {
    window.history.pushState({}, '', '/reset-password?token=sample-test-token');
    render(<App />);
    expect(screen.getByText(/Reset Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reset Token/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated user accessing protected route to /login', () => {
    window.history.pushState({}, '', '/influencer');
    render(<App />);
    // Since user is unauthenticated, ProtectedRoute redirects to /login
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
  });
});
