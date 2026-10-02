import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('creator@example.com');
  const [password, setPassword] = React.useState('password123');
  const [role, setRole] = React.useState<'INFLUENCER' | 'BRAND' | 'ADMIN'>('INFLUENCER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect based on selected preview role
    navigate(`/${role.toLowerCase()}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white font-headline font-bold text-lg shadow-subtle">
              CF
            </div>
            <span className="font-headline font-extrabold text-2xl tracking-tight text-primary">
              CreatorFlow
            </span>
          </Link>
          <p className="text-sm text-secondary-text">Sign in to your account</p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-dropdown border-border">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* Demo Portal Role Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider">
                  Select Portal Role (Preview)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['INFLUENCER', 'BRAND', 'ADMIN'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`rounded-md py-1.5 text-xs font-semibold transition-colors border ${
                        role === r
                          ? 'bg-primary text-white border-primary shadow-subtle'
                          : 'bg-surface text-secondary-text border-border hover:bg-surface-hover'
                      }`}
                    >
                      {r === 'INFLUENCER' ? 'Creator' : r === 'BRAND' ? 'Brand' : 'Admin'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-secondary-text cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-border text-primary" />
                  Remember me
                </label>
                <a href="#forgot" className="font-semibold text-accent hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full mt-2">
                Sign In to {role === 'INFLUENCER' ? 'Creator' : role === 'BRAND' ? 'Brand' : 'Admin'} Portal
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-xs text-secondary-text">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-accent ml-1 hover:underline">
              Create account
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
