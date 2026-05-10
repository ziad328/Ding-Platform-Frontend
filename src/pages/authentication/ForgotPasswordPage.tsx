import { useFormik } from 'formik';
import * as Yup from 'yup';
import { InputField } from '../../components/atoms/InputField';
import { Logo } from '../../components/atoms/Logo';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useForgotPasswordMutation } from '../../store/slices/auth/authApi';
import { toast } from 'sonner';

// Types
interface ForgotPasswordFormValues {
  email: string;
}

// Validation Schema
const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required')
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [forgotPassword] = useForgotPasswordMutation();

  const handleFormSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotPassword({ email: values.email }).unwrap();
      toast.success('Password reset OTP sent to your email');
      // Navigate to OTP verification page with email
      navigate('/auth/verfiy-otp', { state: { email: values.email, type: 'forgot-password' } });
    } catch (error) {
      toast.error((error as any)?.data?.message || 'Failed to send reset OTP');
    }
  };

  const formik = useFormik<ForgotPasswordFormValues>({
    initialValues: {
      email: ''
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await handleFormSubmit(values);
      } catch (error) {
        console.error('Submission error:', error);
      } finally {
        setSubmitting(false);
      }
    }
  });

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
        <div className="w-full max-w-md bg-neutral-w-900 dark:bg-dark-bg-secondary rounded-lg shadow-xl p-5 sm:p-6 md:p-8">
          {/* Title */}
          <h1 className="text-xl font-bold text-center text-primary-700 dark:text-primary-400 pt-8 mb-4 sm:mb-5">
            Forgot password
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-center text-neutral-b-500 dark:text-dark-text-muted mb-8 sm:mb-10 md:mb-12 px-2">
            Enter your email to reset your password and access your account.
          </p>

          {/* Form Fields */}
          <div className="mb-8">
            <InputField
              name="email"
              type="email"
              placeholder="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.email}
              touched={formik.touched.email}
            />
          </div>

          <button
            type="button"
            onClick={() => formik.handleSubmit()}
            disabled={formik.isSubmitting || !formik.isValid}
            className="w-full cursor-pointer bg-primary-700 dark:bg-primary-600 text-white text-sm sm:text-base rounded-md mb-12 py-2.5 font-medium hover:bg-primary-800 dark:hover:bg-primary-700 active:bg-primary-900 dark:active:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex items-center justify-center gap-2"
          >
            {formik.isSubmitting && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {formik.isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
        </div>
      </div>
    </div>
  );
}