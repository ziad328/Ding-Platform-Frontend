import { useFormik } from 'formik';
import * as Yup from 'yup';
import { InputField } from '../../components/atoms/InputField';
import { Logo } from '../../components/atoms/Logo';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResetPasswordMutation } from '../../store/slices/auth/authApi';
import { toast } from 'sonner';

// Types
interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

// Validation Schema
const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required')
});

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [resetPassword] = useResetPasswordMutation();

  // Get email from navigation state
  const email = location.state?.email;

  const handleFormSubmit = async (values: ResetPasswordFormValues) => {
    if (!email) {
      toast.error('Email not found. Please try the forgot password process again.');
      navigate('/auth/forgot-password');
      return;
    }

    try {
      await resetPassword({
        email,
        newPassword: values.newPassword
      }).unwrap();

      toast.success('Password reset successfully!');

      navigate('/auth/signin');
    } catch (error) {
      toast.error((error as any)?.data?.message || 'Failed to reset password');
    }
  };

  const formik = useFormik<ResetPasswordFormValues>({
    initialValues: {
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: resetPasswordSchema,
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
      {/* Logo */}
      <div className="w-full py-4 px-4 sm:py-6">
        <div className="flex items-center justify-center">
          <Logo />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-md bg-neutral-w-900 dark:bg-dark-bg-secondary rounded-lg shadow-xl p-5 sm:p-6 md:p-8">

          {/* Title */}
          <h1 className="text-xl font-medium text-center text-primary-700 dark:text-primary-400 pt-8 mb-8 sm:mb-10 md:mb-16">
            Reset Password
          </h1>

          {/* Form Fields */}
          <div className="space-y-3 sm:space-y-4 mb-8">
            <InputField
              name="newPassword"
              placeholder="New password"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.newPassword}
              touched={formik.touched.newPassword}
              showPasswordToggle
            />

            <InputField
              name="confirmPassword"
              placeholder="Confirm password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.confirmPassword}
              touched={formik.touched.confirmPassword}
              showPasswordToggle
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
            {formik.isSubmitting ? 'Resetting...' : 'Reset password'}
          </button>
        </div>
      </div>
    </div>
  );
}