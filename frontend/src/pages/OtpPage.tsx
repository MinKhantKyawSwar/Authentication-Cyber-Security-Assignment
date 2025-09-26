import React, { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setCredentials } from '@/features/auth/authSlice';
import { useVerifyOtpMutation } from '@/features/auth/authApi';
import Header from '@/components/Header';

const OtpPage: React.FC = () => {
  const [params] = useSearchParams();
  const emailParam = params.get('email') || sessionStorage.getItem('pendingEmail') || '';
  const [email] = useState(emailParam);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();

  const code = otpDigits.join('');

  const handleVerify = async () => {
    try {
      const res = await verifyOtp({ email, code }).unwrap();
      dispatch(
        setCredentials({
          user: res.user,
          token: res.accessToken,
        }),
      );
      localStorage.setItem('auth', JSON.stringify({ user: res.user, token: res.accessToken }));
      navigate('/');
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Invalid or expired OTP');
    }
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && inputsRef.current[index - 1]) {
      const prev = index - 1;
      const next = [...otpDigits];
      next[prev] = '';
      setOtpDigits(next);
      inputsRef.current[prev]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' && inputsRef.current[index - 1]) inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && inputsRef.current[index + 1]) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = text.split('');
    while (next.length < 6) next.push('');
    setOtpDigits(next);
    const lastIndex = Math.min(text.length, 5);
    inputsRef.current[lastIndex]?.focus();
    e.preventDefault();
  };

  const handleBack = () => {
    navigate('/login');
  };

  const handleResend = async () => {
    try {
      await fetch('http://localhost:4000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // eslint-disable-next-line no-alert
      alert('OTP resent');
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-md mx-auto px-4 pt-10">
        <button onClick={handleBack} className="text-white mb-4 hover:underline">← Back to login</button>
        <div className="bg-[#2A2633] p-6 rounded-md w-full">
          <h1 className="text-white text-xl mb-2">Enter OTP</h1>
          <p className="text-gray-400 text-sm mb-4">We sent a 6-digit code to {email || 'your email'}.</p>
          {/* Email comes from navigation state/query; hidden from user */}
          <div className="flex items-center justify-between gap-2 mb-4">
            {otpDigits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={d}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-white text-xl rounded-md bg-[#1C1825] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#9C6CFE]"
              />
            ))}
          </div>
          <button onClick={handleVerify} disabled={isLoading || code.length !== 6} className="w-full py-2 rounded bg-[#9C6CFE] text-white disabled:opacity-60">Verify</button>
          <div className="flex items-center justify-between mt-4">
            <span className="text-gray-400 text-sm">Didn't get the code?</span>
            <button onClick={handleResend} className="text-[#9C6CFE] text-sm hover:underline">Resend</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;


