import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [demoToken, setDemoToken] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await forgotPassword(email);
      setSuccessMessage(res.message);
      if (res.resetToken) {
        setDemoToken(res.resetToken);
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to request password reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white font-headline font-bold text-lg shadow-subtle">
              CF
            </div>
            <span className="font-headline font-extrabold text-2xl tracking-tight text-primary">
              CreatorFlow
            </span>
          </Link>
          <p className="text-sm text-secondary-text">Account Recovery</p>
        </div>

        <Card className="shadow-dropdown border-border">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you instructions to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="error" className="mb-4">
                {errorMessage}
              </Alert>
            )}

            {successMessage ? (
              <div className="space-y-4">
                <Alert variant="success">{successMessage}</Alert>
                {demoToken && (
                  <div className="rounded-md border border-accent/30 bg-accent-light p-3 text-xs space-y-2">
                    <div className="font-semibold text-primary">Development Reset Token:</div>
                    <code className="block bg-surface p-2 rounded text-[11px] font-mono break-all border border-border">
                      {demoToken}
                    </code>
                    <Button
                      variant="accent"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/reset-password?token=${demoToken}`)}
                    >
                      Proceed to Reset Form
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Registered Email Address"
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full mt-2"
                  isLoading={isLoading}
                >
                  Send Reset Link
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="justify-center text-xs text-secondary-text">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-accent ml-1 hover:underline">
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
