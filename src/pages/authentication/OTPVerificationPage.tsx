import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Logo } from '../../components/atoms/Logo';

export default function OTPVerificationPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(59);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const email = "anorouzi.work@gmail.com"; // This would come from props or route state - just for testing

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

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
    if (value && index < 3) {
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
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 4) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 3);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 4) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Verifying OTP:', otpCode);
      // Navigate to success or home page after verification
      // navigate('/');
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Resending OTP');
      setTimeLeft(59);
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error('Resend error:', error);
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen flex flex-col bg-neutral-w-50">
      {/* Header with Back Button and Logo */}
      <div className="w-full py-4 px-4 sm:py-6">
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 flex items-center gap-1 text-neutral-b-600 hover:text-primary-700 transition-colors cursor-pointer touch-manipulation"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base font-medium">Back</span>
          </button>
          
          <Logo />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-md bg-neutral-w-900 rounded-lg shadow-xl p-5 sm:p-6 md:p-8">
          
          {/* Title */}
          <h1 className="text-xl font-bold text-center text-primary-700 pt-8 mb-4 sm:mb-5">
            Enter verification code
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-center text-neutral-b-500 mb-8 sm:mb-10 px-2">
            Code sent to {email}
          </p>

          {/* OTP Input */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
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
                className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors border-neutral-w-400"
              />
            ))}
          </div>

          {/* Resend Timer */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            {timeLeft > 0 ? (
              <span className="text-xs sm:text-sm text-neutral-b-500">
                Resend in{' '}
                <span className="font-medium text-primary-700">
                  {formatTime(timeLeft)}
                </span>
              </span>
            ) : (
              <button
                onClick={handleResend}
                className="text-xs sm:text-sm text-primary-700 font-medium hover:underline cursor-pointer touch-manipulation"
              >
                Resend code
              </button>
            )}
          </div>

          {/* Verify Button */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={!isComplete || isSubmitting}
            className="w-full cursor-pointer bg-primary-700 text-white text-sm sm:text-base rounded-md mb-12 py-2.5 font-medium hover:bg-primary-800 active:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
}