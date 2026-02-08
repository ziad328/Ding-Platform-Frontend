import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Logo } from '../../components/atoms/Logo';
import { useVerifyEmailOtpMutation, useResendEmailOtpMutation, useVerifyForgotPasswordOtpMutation, useResendForgotPasswordOtpMutation } from '../../store/slices/auth/authApi';
import { enqueueSnackbar } from 'notistack';

export default function OTPVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifyEmailOtp] = useVerifyEmailOtpMutation();
  const [resendEmailOtp] = useResendEmailOtpMutation();
  const [verifyForgotPasswordOtp] = useVerifyForgotPasswordOtpMutation();
  const [resendForgotPasswordOtp] = useResendForgotPasswordOtpMutation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(59);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email and type from navigation state
  const email = location.state?.email;
  const verificationType = location.state?.type || 'email'; // 'email' or 'forgot-password'

  useEffect(() => {
    // Redirect to signup if no email provided
    if (!email) {
      navigate('/auth/signup');
      return;
    }

    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email, navigate]);

  useEffect(() => {
    // Timer countdown
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    setIsSubmitting(true);
    try {
      let response;
      if (verificationType === 'forgot-password') {
        response = await verifyForgotPasswordOtp({ email, otp: otpCode }).unwrap();
        console.log(response);
        if (response.code === 200 && response.data) {
          enqueueSnackbar(response.data.message || 'OTP verified successfully!', { variant: 'success' });
          navigate('/auth/reset-password', { state: { email } });
        }
      } else {
        response = await verifyEmailOtp({ email, otp: otpCode }).unwrap();
        if (response.code === 200 && response.data && response.data.accessToken) {
          enqueueSnackbar('Email verified successfully!', { variant: 'success' });
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      enqueueSnackbar((error as any)?.data?.message || (error as any)?.data || 'Verification failed', {
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0 || isResending) return;

    setIsResending(true);
    try {
      if (verificationType === 'forgot-password') {
        await resendForgotPasswordOtp({ email }).unwrap();
      } else {
        await resendEmailOtp({ email }).unwrap();
      }
      setTimeLeft(59);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      enqueueSnackbar('Code sent successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Resend error:', error);
      enqueueSnackbar((error as any)?.data.data?.message || (error as any)?.data.data, {
        variant: 'error',
      });
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen flex flex-col bg-neutral-w-50 dark:bg-dark-bg-primary">
      {/* Header with Back Button and Logo */}
      <div className="w-full py-4 px-4 sm:py-6">
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 flex items-center gap-1 text-neutral-b-600 dark:text-dark-text-secondary hover:text-primary-700 dark:hover:text-primary-500 transition-colors cursor-pointer touch-manipulation"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base font-medium">Back</span>
          </button>

          <Logo />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-md bg-neutral-w-900 dark:bg-dark-bg-secondary rounded-lg shadow-xl p-4 sm:p-6 md:p-8">

          {/* Title */}
          <h1 className="text-xl font-bold text-center text-primary-700 dark:text-primary-400 pt-8 mb-4 sm:mb-5">
            {verificationType === 'forgot-password' ? 'Enter reset code' : 'Enter verification code'}
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-center text-neutral-b-500 dark:text-dark-text-muted mb-8 sm:mb-10 px-2">
            {verificationType === 'forgot-password'
              ? `Password reset code sent to ${email}`
              : `Code sent to ${email}`
            }
          </p>

          {/* OTP Input */}
          <div className="flex justify-center gap-1 sm:gap-2 md:gap-3 mb-6 sm:mb-8 max-w-full">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 text-center text-sm sm:text-lg md:text-xl font-semibold border-2 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors border-neutral-w-400 dark:border-dark-border dark:bg-dark-bg-primary dark:text-dark-text-primary shrink-0"
              />
            ))}
          </div>

          {/* Resend Timer */}
          <div className="text-center mb-6 sm:mb-10 md:mb-12">
            {timeLeft > 0 ? (
              <span className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted">
                Resend in{' '}
                <span className="font-medium text-primary-700 dark:text-primary-400">
                  {formatTime(timeLeft)}
                </span>
              </span>
            ) : (
              <button
                onClick={timeLeft > 0 || isResending ? undefined : handleResend}
                disabled={timeLeft > 0 || isResending}
                className={`text-xs sm:text-sm font-medium touch-manipulation flex items-center justify-center gap-2 min-w-[100px] mx-auto ${timeLeft > 0 || isResending
                    ? 'text-neutral-b-400 cursor-not-allowed'
                    : 'text-primary-700 dark:text-primary-400 hover:underline cursor-pointer'
                  }`}
              >
                {isResending && (
                  <svg className="animate-spin h-3 w-3 text-neutral-b-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span className="whitespace-nowrap">
                  {isResending ? 'Sending...' : 'Resend code'}
                </span>
              </button>
            )}
          </div>

          {/* Verify Button */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={!isComplete || isSubmitting}
            className="w-full cursor-pointer bg-primary-700 dark:bg-primary-600 text-white text-sm sm:text-base rounded-md mb-8 sm:mb-12 py-2.5 font-medium hover:bg-primary-800 dark:hover:bg-primary-700 active:bg-primary-900 dark:active:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
}