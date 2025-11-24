import { useFormik } from 'formik';
import * as Yup from 'yup';
import { InputField } from '../../components/atoms/InputField';
import { Logo } from '../../components/atoms/Logo';
import googleSvg from '../../assets/Google.svg';
import email from '../../assets/Email.svg';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLoginUserMutation } from '../../store/slices/auth/authApi';
import { enqueueSnackbar } from 'notistack';

// Types
interface SignInFormValues {
  email: string;
  password: string;
}

// Validation Schema
const signInSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

export default function SignInPage() {
  const navigate = useNavigate();

  const [loginUser] = useLoginUserMutation();

  const handleFormSubmit = async (values: SignInFormValues) => {
    try {
      const response = await loginUser(values).unwrap();
      if (response.code === 200 && response.data) {
        enqueueSnackbar('Login successful!', { variant: 'success' });
        navigate('/');
      }
    } catch (err) {
      enqueueSnackbar((err as any)?.data?.message || (err as any)?.data, {
        variant: 'error',
      });
    }
  };

  const formik = useFormik<SignInFormValues>({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: signInSchema,
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

  const handleGoogleSignIn = () => {
    console.log('Log in with Google');
  };

  const handleEmailLogin = () => {
    navigate('/auth/email-login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-w-50 dark:bg-dark-bg-primary">
      {/* Logo */}
      <div className="w-full pt-6 px-4">
        <div className="flex items-center justify-center">
          <Logo />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-md bg-neutral-w-900 dark:bg-dark-bg-secondary rounded-lg shadow-xl p-5 sm:p-6 md:p-8">

          {/* Title */}
          <h1 className="auth-title text-3xl sm:text-4xl text-primary-700 dark:text-primary-400 text-center mt-8 mb-16">
            Unlock Your World
          </h1>

          {/* Form Fields */}
          <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4">
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

            <InputField
              name="password"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.password}
              touched={formik.touched.password}
              showPasswordToggle
            />
          </div>

          {/* Forget Password Link */}
          <div className="text-right mb-10">
            <NavLink to="/auth/forgot-password" className="text-xs sm:text-sm font-medium text-neutral-b-600 dark:text-dark-text-secondary hover:text-primary-700 dark:hover:text-primary-400 hover:underline">
              Forget Password?
            </NavLink>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => formik.handleSubmit()}
            disabled={formik.isSubmitting}
            className="w-full mb-4 cursor-pointer bg-primary-700 dark:bg-primary-600 text-white text-sm sm:text-base rounded-md py-2.5 font-medium hover:bg-primary-800 dark:hover:bg-primary-700 active:bg-primary-900 dark:active:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex items-center justify-center gap-2"
          >
            {formik.isSubmitting && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {formik.isSubmitting ? 'Logging in...' : 'Log in'}
          </button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-w-300 dark:border-dark-border"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 font-medium bg-neutral-w-900 dark:bg-dark-bg-secondary text-neutral-b-500 dark:text-dark-text-muted">OR</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="flex gap-4 mb-12">
            <button
              onClick={handleGoogleSignIn}
              className="flex-1 cursor-pointer flex items-center justify-center bg-white dark:bg-dark-bg-primary border border-neutral-w-400 dark:border-dark-border rounded-lg py-3 px-4 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary active:bg-neutral-w-300 dark:active:bg-dark-border transition-colors touch-manipulation"
            >
              <img src={googleSvg} alt="Google" className="w-5 h-5" />
            </button>

            <button
              onClick={handleEmailLogin}
              className="flex-1 cursor-pointer flex items-center justify-center bg-white dark:bg-dark-bg-primary border border-neutral-w-400 dark:border-dark-border rounded-lg py-3 px-4 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary active:bg-neutral-w-300 dark:active:bg-dark-border transition-colors touch-manipulation"
            >
              <img src={email} alt="Email" className="w-5 h-5" />
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs sm:text-sm font-medium text-neutral-b-600 dark:text-dark-text-secondary">
            Don't have an account?{' '}
            <NavLink to="/auth/Signup" className="text-primary-700 dark:text-primary-400 hover:underline">
              Sign up
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}