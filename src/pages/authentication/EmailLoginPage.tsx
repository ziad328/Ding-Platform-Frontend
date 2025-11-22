import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { InputField } from '../../components/atoms/InputField';
import { SuccessAlert } from '../../components/atoms/SuccessAlert';
import { Logo } from '../../components/atoms/Logo';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// Types
interface EmailLoginFormValues {
  email: string;
}

// Validation Schema
const emailLoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required')
});

export default function EmailLoginPage() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFormSubmit = async (values: EmailLoginFormValues) => {
    // Example: await sendLoginLink(values);
    console.log('Form submitted:', values);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Show success state
    setIsSuccess(true);
  };

  const formik = useFormik<EmailLoginFormValues>({
    initialValues: {
      email: ''
    },
    validationSchema: emailLoginSchema,
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
          {!isSuccess && (
            <button
              onClick={() => navigate(-1)}
              className="absolute left-0 flex items-center gap-1 text-neutral-b-600 dark:text-dark-text-secondary hover:text-primary-700 dark:hover:text-primary-500 transition-colors cursor-pointer touch-manipulation"
            >
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base font-medium">Back</span>
            </button>
          )}

          <Logo />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-md bg-neutral-w-900 dark:bg-dark-bg-secondary rounded-lg shadow-xl p-5 sm:p-6 md:p-8">

          {!isSuccess ? (
            // Email Form
            <>
              {/* Title */}
              <h1 className="text-xl font-bold text-center text-primary-700 dark:text-primary-400 pt-8 mb-4 sm:mb-5">
                Enter your email
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm text-center text-neutral-b-500 dark:text-dark-text-muted mb-8 sm:mb-10 md:mb-12 px-2">
                We'll send a secure link for instant access to your account.
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
                className="w-full cursor-pointer bg-primary-700 dark:bg-primary-600 text-white text-sm sm:text-base rounded-md mb-12 py-2.5 font-medium hover:bg-primary-800 dark:hover:bg-primary-700 active:bg-primary-900 dark:active:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                {formik.isSubmitting ? 'Sending...' : 'Send link'}
              </button>
            </>
          ) : (
            // Success State
            <SuccessAlert
              title="Check your inbox!"
              description="Simply open your inbox and click the link to access your account. No passwords required!"
            />
          )}
        </div>
      </div>
    </div>
  );
}