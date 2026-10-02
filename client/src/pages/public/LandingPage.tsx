import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const dashboardPath = user ? `/${user.role.toLowerCase()}` : '/influencer';

  return (
    <div className="min-h-screen bg-background text-main-text">
      {/* Light Top Public Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md px-6 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white font-headline font-bold text-base shadow-subtle">
            CF
          </div>
          <span className="font-headline font-extrabold text-xl tracking-tight text-primary">
            CreatorFlow
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-secondary-text">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#creators" className="hover:text-primary transition-colors">For Creators</a>
          <a href="#brands" className="hover:text-primary transition-colors">For Brands</a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <Link to={dashboardPath}>
                <Button variant="primary" size="sm">
                  Dashboard ({user.name})
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="accent" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-light px-3.5 py-1 text-xs font-semibold text-accent uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">sparkles</span>
          Unified Collaboration Platform
        </div>

        <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary tracking-tight leading-tight">
          Where Top Creators and Elite Brands Build High-Impact Campaigns
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-secondary-text leading-relaxed">
          Streamline discovery, contracts, deliverable tracking, and milestone payouts
          in one cohesive, beautifully designed workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          {isAuthenticated && user ? (
            <Link to={dashboardPath}>
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Go to {user.role === 'INFLUENCER' ? 'Creator' : user.role === 'BRAND' ? 'Brand' : 'Admin'} Dashboard
                <span className="material-symbols-outlined ml-2 text-[18px]">arrow_forward</span>
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                  <span className="material-symbols-outlined ml-2 text-[18px]">arrow_forward</span>
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Sign In to Account
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-primary">
            Designed for Precision and Clarity
          </h2>
          <p className="text-sm text-secondary-text">
            One unified light aesthetic across all roles, built for modern creator commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverEffect>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-light text-accent mb-2">
                <span className="material-symbols-outlined text-[20px]">explore</span>
              </div>
              <CardTitle>AI Match Discovery</CardTitle>
              <CardDescription>
                Find campaign opportunities matched precisely to your niche and engagement metrics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card hoverEffect>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-light text-accent mb-2">
                <span className="material-symbols-outlined text-[20px]">handshake</span>
              </div>
              <CardTitle>Milestone Collaborations</CardTitle>
              <CardDescription>
                Clear deliverable timelines, draft approvals, and escrow-backed payment releases.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card hoverEffect>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-light text-accent mb-2">
                <span className="material-symbols-outlined text-[20px]">monitoring</span>
              </div>
              <CardTitle>Real-Time Intelligence</CardTitle>
              <CardDescription>
                Track campaign ROI, follower demographics, and submission progress without spreadsheets.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8 px-6 text-center text-xs text-secondary-text">
        <p>© 2026 CreatorFlow Inc. All rights reserved. Built with the approved unified light design system.</p>
      </footer>
    </div>
  );
};
