import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { googleLoginUser, loginUser } from '../api/authApi';
import ErrorAlert from '../components/ErrorAlert';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { login } = useAuth();
  const navigate = useNavigate();

  const completeLogin = (payload) => {
    const token = payload.token;
    const userData = {
      name: payload.name,
      email: payload.email,
    };

    login(userData, token, payload.refreshToken);
    navigate('/');
  };

  const handleGoogleCredential = useCallback(
    async (credentialResponse) => {
      if (!credentialResponse?.credential) {
        setError('Google sign-in did not return a valid token.');
        return;
      }

      setError('');
      setLoading(true);

      try {
        const res = await googleLoginUser({ idToken: credentialResponse.credential });
        completeLogin(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [login, navigate]
  );

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      return;
    }

    let cancelled = false;

    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) {
        return;
      }

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
      });
    };

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return () => {
        cancelled = true;
      };
    }

    if (existingScript) {
      existingScript.addEventListener('load', renderGoogleButton);
      return () => {
        cancelled = true;
        existingScript.removeEventListener('load', renderGoogleButton);
      };
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    script.onerror = () => {
      if (!cancelled) {
        setError('Unable to load Google sign-in right now.');
      }
    };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [googleClientId, handleGoogleCredential]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      completeLogin(res.data.data);
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-8">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-zinc-900 dark:bg-black">
        <h1 className="mb-2 text-3xl font-bold text-slate-800 dark:text-slate-100">Welcome Back</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Login to continue ordering your favorite food.</p>

        <ErrorAlert message={error} />

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-orange-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-orange-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            <span className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
            <span>or</span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
          </div>

          {googleClientId ? (
            <div className="flex justify-center">
              <div ref={googleButtonRef} />
            </div>
          ) : (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Google sign-in is disabled. Set VITE_GOOGLE_CLIENT_ID in your frontend env.
            </p>
          )}
        </form>

        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
          New here?{' '}
          <Link to="/register" className="font-medium text-orange-600 hover:text-orange-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
