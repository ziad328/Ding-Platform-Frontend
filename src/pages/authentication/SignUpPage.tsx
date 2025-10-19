import { useFormik } from 'formik';
import * as Yup from 'yup';
import { InputField } from '../../components/atoms/InputField';
import googleSvg from '../../assets/Google.svg';
import email from '../../assets/Email.svg';
import logo from '../../assets/Logo.svg';
import { NavLink } from 'react-router-dom';

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

  const handleFormSubmit = async (values: SignUpFormValues) => {
    // Example: await signUpUser(values);
    console.log('Form submitted:', values);
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
              Sign up with Google
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
                  className="peer w-4 h-4 sm:w-5 sm:h-5 mt-0.5 sm:mt-1 appearance-none border-2 border-neutral-w-400 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 checked:bg-primary-700 checked:border-primary-700 touch-manipulation"
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
              <label htmlFor="agreedToTerms" className="text-sm sm:text-base font-normal text-neutral-b-500 cursor-pointer leading-relaxed">
                I agree to the Terms and Privacy Policy.
              </label>
            </div>
            {formik.touched.agreedToTerms && formik.errors.agreedToTerms && (
              <div className="text-semantic-r-800 text-xs sm:text-sm mt-1">{formik.errors.agreedToTerms}</div>
            )}
          </div>

          <button
            type="button"
            onClick={() => formik.handleSubmit()}
            disabled={formik.isSubmitting}
            className="w-full mb-6 sm:mb-8 cursor-pointer bg-primary-700 text-white text-sm sm:text-base rounded-md py-2.5 font-medium hover:bg-primary-800 active:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {formik.isSubmitting ? 'Signing up...' : 'Continue'}
          </button>

          {/* Footer */}
          <div className="mb-6 sm:mb-8 text-center text-xs sm:text-sm font-medium text-neutral-b-600">
            Have an account?{' '}
            <NavLink to="/auth/Signin" className="text-primary-700 hover:underline">
              Log In
            </NavLink>
          </div>
        </div>
      </div>
    </div>  
  );
}