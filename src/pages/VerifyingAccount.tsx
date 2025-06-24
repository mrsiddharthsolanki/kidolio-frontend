import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function VerifyingAccount() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [status, setStatus] = useState("pending");
  const [timer, setTimer] = useState(120); // 2 minutes
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      setTimer((t) => t - 10);
      try {
        const res = await api.get("/user/me");
        if (res.data.verified) {
          setStatus("verified");
          clearInterval(interval);
          setTimeout(() => navigate("/dashboard"), 1000);
        }
      } catch (err) {
        // Log error for debugging
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Polling verification error:', err);
        }
      }
    }, 10000); // poll every 10s
    const timeout = setTimeout(() => {
      setStatus("timeout");
      clearInterval(interval);
    }, 120000); // 2 min
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  const handleTryAgain = async () => {
    if (!user || !user.email) {
      // Just clear and go to signup
      localStorage.removeItem('kidolio-token');
      localStorage.removeItem('kidolio-user');
      if (typeof logout === 'function') logout();
      navigate('/auth/official-signup');
      return;
    }
    setDeleting(true);
    try {
      await api.post('/delete-unverified-user', { email: user.email });
    } catch (err) {
      // Log error for debugging
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Delete unverified user error:', err);
      }
    }
    localStorage.removeItem('kidolio-token');
    localStorage.removeItem('kidolio-user');
    if (typeof logout === 'function') logout();
    setDeleting(false);
    navigate('/auth/official-signup');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mb-6"></div>
      <h2 className="text-2xl font-bold mb-2">Verifying your account…</h2>
      {status === "pending" && <p className="text-gray-600">This may take up to 2 minutes. Please do not close this window.</p>}
      {status === "verified" && <p className="text-green-600">Your account is verified! Redirecting…</p>}
      {status === "timeout" && (
        <div className="flex flex-col items-center">
          <p className="text-red-600 mb-4">You are not verified. Please try again or re-upload your documents.</p>
          <button
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-60"
            onClick={handleTryAgain}
            disabled={deleting}
          >
            {deleting ? 'Cleaning up…' : 'Try Again'}
          </button>
        </div>
      )}
    </div>
  );
}
