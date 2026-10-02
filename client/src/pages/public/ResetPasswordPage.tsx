import * as React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const [token, setToken] = React.useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to reset password');
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
          <p className="text-sm text-secondary-text">Security Management</p>
        </div>

        <Card className="shadow-dropdown border-border">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter your reset token and new password</CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="error" className="mb-4">
                {errorMessage}
              </Alert>
            )}

            {success ? (
              <div className="space-y-3">
                <Alert variant="success">
                  Your password has been successfully reset! Redirecting to sign in...
                </Alert>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Go to Sign In Now
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Reset Token"
                  type="text"
                  id="token"
                  placeholder="Enter or paste reset token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  id="newPassword"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full mt-2"
                  isLoading={isLoading}
                >
                  Update Password
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="justify-center text-xs text-secondary-text">
            Remember your credentials?{' '}
            <Link to="/login" className="font-semibold text-accent ml-1 hover:underline">
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
