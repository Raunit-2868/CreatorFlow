import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = React.useState('creator@example.com');
  const [password, setPassword] = React.useState('password123');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = await login(email, password);
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(`/${user.role.toLowerCase()}`, { replace: true });
      }
    } catch (err) {
      setError((err as Error).message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
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
            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

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

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-secondary-text cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-border text-primary" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="font-semibold text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Sign In
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
