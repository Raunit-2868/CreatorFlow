import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = React.useState<'INFLUENCER' | 'BRAND'>('INFLUENCER');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/${role.toLowerCase()}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white font-headline font-bold text-lg shadow-subtle">
              CF
            </div>
            <span className="font-headline font-extrabold text-2xl tracking-tight text-primary">
              CreatorFlow
            </span>
          </Link>
          <p className="text-sm text-secondary-text">Join the platform as a Creator or Brand</p>
        </div>

        <Card className="shadow-dropdown border-border">
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>Select your account type to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dual Role Selector Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setRole('INFLUENCER')}
                  className={`cursor-pointer rounded-lg border p-4 text-center transition-all ${
                    role === 'INFLUENCER'
                      ? 'border-accent bg-accent-light/50 ring-1 ring-accent'
                      : 'border-border bg-surface hover:bg-surface-hover'
                  }`}
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-accent mb-2">
                    <span className="material-symbols-outlined text-[22px]">person</span>
                  </div>
                  <div className="text-sm font-bold text-primary">I'm a Creator</div>
                  <div className="text-xs text-secondary-text mt-0.5">Find campaigns & brand deals</div>
                </div>

                <div
                  onClick={() => setRole('BRAND')}
                  className={`cursor-pointer rounded-lg border p-4 text-center transition-all ${
                    role === 'BRAND'
                      ? 'border-accent bg-accent-light/50 ring-1 ring-accent'
                      : 'border-border bg-surface hover:bg-surface-hover'
                  }`}
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-accent mb-2">
                    <span className="material-symbols-outlined text-[22px]">corporate_fare</span>
                  </div>
                  <div className="text-sm font-bold text-primary">I'm a Brand</div>
                  <div className="text-xs text-secondary-text mt-0.5">Hire creators & run campaigns</div>
                </div>
              </div>

              <Input
                label={role === 'INFLUENCER' ? 'Full Name' : 'Company / Brand Name'}
                type="text"
                id="name"
                placeholder={role === 'INFLUENCER' ? 'Jordan Davis' : 'Acme Apparel'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                id="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Create Password"
                type="password"
                id="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" size="md" className="w-full mt-2">
                Create {role === 'INFLUENCER' ? 'Creator' : 'Brand'} Account
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-xs text-secondary-text">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent ml-1 hover:underline">
              Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
