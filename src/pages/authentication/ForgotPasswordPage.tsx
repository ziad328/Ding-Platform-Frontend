import { useFormik } from 'formik';
import * as Yup from 'yup';
import { InputField } from '../../components/atoms/InputField';
import logo from '../../assets/Logo.svg';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

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

  const handleFormSubmit = async (values: ForgotPasswordFormValues) => {
    // Example: await sendResetLink(values);
    console.log('Form submitted:', values);
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
          
          <div className="flex items-center gap-2">
            <img src={logo} alt="Ding Logo" className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="text-lg sm:text-xl font-extrabold text-primary-800">Ding</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-md bg-neutral-w-900 rounded-lg shadow-xl p-5 sm:p-6 md:p-8">
          
          {/* Title */}
          <h1 className="text-xl font-bold text-center text-primary-700 pt-8 mb-4 sm:mb-5">
            Forgot password
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-center text-neutral-b-500 mb-8 sm:mb-10 md:mb-12 px-2">
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
            disabled={formik.isSubmitting}
            className="w-full cursor-pointer bg-primary-700 text-white text-sm sm:text-base rounded-md mb-12 py-2.5 font-medium hover:bg-primary-800 active:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {formik.isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
        </div>
      </div>
    </div>
  );
}