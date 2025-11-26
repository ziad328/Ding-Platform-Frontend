import { useFormik } from 'formik';
import * as Yup from 'yup';
import { InputField } from '../../components/atoms/InputField';
import { Logo } from '../../components/atoms/Logo';
import googleSvg from '../../assets/Google.svg';
import email from '../../assets/Email.svg';
import { NavLink, useNavigate } from 'react-router-dom';
import { useRegisterUserMutation } from '../../store/slices/auth/authApi';
import { enqueueSnackbar } from 'notistack';

// Types
interface SignUpFormValues {
  name: string;
  email: string;
  username: string;
  password: string;
  agreedToTerms: boolean;
}

// Validation Schema
const signUpSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  agreedToTerms: Yup.boolean()
    .oneOf([true], 'Required')
    .required('Required')
});

export default function SignUpPage() {
  const navigate = useNavigate();

  const [registerUser] = useRegisterUserMutation()

  const handleFormSubmit = async (values: SignUpFormValues) => {
    try {
      const { email, name, password } = values;
      const response = await registerUser({ email, name, password }).unwrap();
      console.log("register response", response);
      if (response.code === 200 && response.data && response.data.accessToken) {
        enqueueSnackbar('Registration successful!', { variant: 'success' });
      }
      navigate('/auth/verfiy-otp', { state: { email: values.email } });
    } catch (error) {
      const errorData = error as any;
      if (errorData?.status === 409) {
        console.log("errorData", errorData);
        enqueueSnackbar(errorData?.data?.message || 'this email is already exist', {
          variant: 'error',
        });
      } else {
        enqueueSnackbar(errorData?.data?.message || 'Registration failed', {
          variant: 'error',
        });
      }
    }
  };

  const formik = useFormik<SignUpFormValues>({
    initialValues: {
      name: '',
      email: '',
      username: '',
      password: '',
      agreedToTerms: false
    },
    validationSchema: signUpSchema,
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
    console.log('Sign in with Google');
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
            Create Your World
          </h1>

          {/* Form Fields */}
          <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
            <InputField
              name="name"
              placeholder="Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.name}
              touched={formik.touched.name}
            />

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
              name="username"
              placeholder="Username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.username}
              touched={formik.touched.username}
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

          {/* Terms checkbox */}
          <div className='mb-10 sm:mb-12 md:mb-14'>
            <div className="flex items-start gap-2">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  id="agreedToTerms"
                  checked={formik.values.agreedToTerms}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="peer w-4 h-4 sm:w-5 sm:h-5 mt-0.5 sm:mt-1 appearance-none border-2 border-neutral-w-400 dark:border-dark-border rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 checked:bg-primary-700 dark:checked:bg-primary-600 checked:border-primary-700 dark:checked:border-primary-600 touch-manipulation"
                />
                <svg
                  className="absolute w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0 sm:mt-0.5 pointer-events-none hidden peer-checked:block text-white left-1"
                  viewBox="0 0 13 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                </svg>
              </div>
              <label htmlFor="agreedToTerms" className="text-sm sm:text-base font-normal text-neutral-b-500 dark:text-dark-text-muted cursor-pointer leading-relaxed">
                I agree to the Terms and Privacy Policy.
              </label>
            </div>
            {formik.touched.agreedToTerms && formik.errors.agreedToTerms && (
              <div className="text-semantic-r-800 dark:text-semantic-r-700 text-xs sm:text-sm mt-1">{formik.errors.agreedToTerms}</div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => formik.handleSubmit()}
            disabled={formik.isSubmitting || !formik.isValid}
            className="w-full mb-4 cursor-pointer bg-primary-700 dark:bg-primary-600 text-white text-sm sm:text-base rounded-md py-2.5 font-medium hover:bg-primary-800 dark:hover:bg-primary-700 active:bg-primary-900 dark:active:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex items-center justify-center gap-2"
          >
            {formik.isSubmitting && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {formik.isSubmitting ? 'Signing up...' : 'Continue'}
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
            Have an account?{' '}
            <NavLink to="/auth/Signin" className="text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-500 hover:underline">
              Log In
            </NavLink>
          </div>

        </div>
      </div>
    </div>
  );
}