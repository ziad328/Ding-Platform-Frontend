import { useFormik } from 'formik';
import * as Yup from 'yup';
import { InputField } from '../../components/atoms/InputField';
import googleSvg from '../../assets/Google.svg';
import email from '../../assets/Email.svg';
import logo from '../../assets/Logo.svg';
import { NavLink } from 'react-router-dom';

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

  const handleFormSubmit = async (values: SignInFormValues) => {
    // Example: await signInUser(values);
    console.log('Form submitted:', values);
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
    console.log('Log in with Email');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-w-50">
      {/* Logo */}
      <div className="w-full pt-6 px-4">
        <div className="flex items-center justify-center gap-2">
          <img src={logo} alt="Ding Logo" className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="text-lg sm:text-xl font-extrabold text-primary-800">Ding</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-md bg-neutral-w-900 rounded-lg shadow-xl p-5 sm:p-6 md:p-8">

          {/* OAuth Buttons */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <button
              onClick={handleGoogleSignIn}
              className="w-full text-sm sm:text-base font-normal cursor-pointer flex items-center justify-center gap-2 bg-neutral-w-900 border border-neutral-w-400 rounded-md py-2.5 px-4 text-neutral-b-500 hover:bg-neutral-w-200 active:bg-neutral-w-300 transition-colors touch-manipulation"
            >
              <img src={googleSvg} alt="Google" className="w-4 h-4 sm:w-5 sm:h-5" />
              Log in with Google
            </button>

            <button
              onClick={handleEmailLogin}
              className="w-full text-sm sm:text-base font-normal cursor-pointer flex items-center justify-center gap-2 bg-neutral-w-900 border border-neutral-w-400 rounded-md py-2.5 px-4 text-neutral-b-500 hover:bg-neutral-w-200 active:bg-neutral-w-300 transition-colors touch-manipulation"
            >
              <img src={email} alt="Email" className="w-4 h-4 sm:w-5 sm:h-5" />
              Log in with Email
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8 sm:mb-10 md:mb-12">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-w-300"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 font-medium bg-neutral-w-900 text-neutral-b-500">OR</span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-5">
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
          <div className="text-right mb-8 sm:mb-10 md:mb-12">
            <NavLink to="/auth/forgot-password" className="text-xs sm:text-sm font-medium text-neutral-b-600 hover:text-primary-700 hover:underline">
              Forget Password?
            </NavLink>
          </div>

          <button
            type="button"
            onClick={() => formik.handleSubmit()}
            disabled={formik.isSubmitting}
            className="w-full mb-6 sm:mb-8 cursor-pointer bg-primary-700 text-white text-sm sm:text-base rounded-md py-2.5 font-medium hover:bg-primary-800 active:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {formik.isSubmitting ? 'Logging in...' : 'Log in'}
          </button>

          {/* Footer */}
          <div className="mb-6 text-center text-xs sm:text-sm font-medium text-neutral-b-600">
            Don't have an account?{' '}
            <NavLink to="/auth/Signup" className="text-primary-700 hover:underline">
              Sign up
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}