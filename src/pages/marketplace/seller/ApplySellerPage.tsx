import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useApplySellerMutation } from '../../../store/slices/marketplace/marketplaceApi';

// ─── Types ──────────────────────────────────────────────────────────────────

interface FormValues {
  // Step 1
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  country: string;
  // Step 2
  idCardNumber: string;
  commercialRegNumber: string;
  bankAccountNumber: string;
  bankCardNumber: string;
  bankCardExpiry: string;
  bankCardHolderName: string;
  // Steps 3-5
  idCardFrontImage: File | null;
  idCardBackImage: File | null;
  sellerFaceImage: File | null;
}

// ─── Yup Schemas (per step) ─────────────────────────────────────────────────

const fileSchema = (label: string) =>
  Yup.mixed<File>()
    .required(`${label} is required`)
    .test('fileType', 'Only image files are allowed', (v) =>
      v instanceof File ? v.type.startsWith('image/') : false
    )
    .test('fileSize', 'File must be under 5 MB', (v) =>
      v instanceof File ? v.size <= 5 * 1024 * 1024 : false
    );

const stepSchemas = [
  // Step 1
  Yup.object({
    fullName: Yup.string().min(3, 'Minimum 3 characters').required('Required'),
    phoneNumber: Yup.string()
      .matches(/^\+?[0-9]{7,15}$/, 'Invalid phone number')
      .required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    address: Yup.string().required('Required'),
    city: Yup.string().required('Required'),
    country: Yup.string().required('Required'),
  }),
  // Step 2
  Yup.object({
    idCardNumber: Yup.string().required('Required'),
    commercialRegNumber: Yup.string().required('Required'),
    bankAccountNumber: Yup.string()
      .matches(/^\d{8,}$/, 'Must be at least 8 digits')
      .required('Required'),
    bankCardNumber: Yup.string()
      .matches(/^\d{16}$/, 'Must be exactly 16 digits')
      .required('Required'),
    bankCardExpiry: Yup.string()
      .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Must be MM/YY format')
      .required('Required'),
    bankCardHolderName: Yup.string().required('Required'),
  }),
  // Step 3
  Yup.object({ idCardFrontImage: fileSchema('ID card front image') }),
  // Step 4
  Yup.object({ idCardBackImage: fileSchema('ID card back image') }),
  // Step 5
  Yup.object({ sellerFaceImage: fileSchema('Seller face image') }),
];

// ─── Step metadata ───────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Personal Info' },
  { label: 'Financial' },
  { label: 'ID Front' },
  { label: 'ID Back' },
  { label: 'Face Photo' },
];

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${done ? 'bg-primary-600 dark:bg-primary-500 text-white' : active ? 'bg-primary-600 dark:bg-primary-500 text-white ring-4 ring-primary-200 dark:ring-primary-900' : 'bg-neutral-b-100 dark:bg-neutral-b-800 text-neutral-b-400 dark:text-dark-text-muted'}`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium whitespace-nowrap
                  ${active ? 'text-primary-600 dark:text-primary-400' : done ? 'text-neutral-b-600 dark:text-dark-text-secondary' : 'text-neutral-b-400 dark:text-dark-text-muted'}`}
              >
                {step.label}
              </span>
            </div>
            {i < total - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all ${i < current ? 'bg-primary-600 dark:bg-primary-500' : 'bg-neutral-b-200 dark:bg-neutral-b-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Text Field Component ────────────────────────────────────────────────────

function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const inputClass =
    'w-full px-4 py-2.5 rounded-xl text-sm ' +
    'bg-white dark:bg-neutral-b-700 ' +
    'border border-neutral-b-200 dark:border-neutral-b-600 ' +
    'text-neutral-b-900 dark:text-dark-text-primary ' +
    'placeholder-neutral-b-400 dark:placeholder-neutral-b-500 ' +
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ' +
    'transition-all';

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Field id={name} name={name} type={type} placeholder={placeholder} className={inputClass} />
      <ErrorMessage name={name} render={(msg) => <p className="mt-1 text-xs text-red-500">{msg}</p>} />
    </div>
  );
}

// ─── Image Upload Field ──────────────────────────────────────────────────────

function ImageUploadField({
  label,
  name,
  value,
  setFieldValue,
  error,
  touched,
}: {
  label: string;
  name: string;
  value: File | null;
  setFieldValue: (field: string, val: File | null) => void;
  error?: string;
  touched?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (file && file.type.startsWith('image/')) {
        setFieldValue(name, file);
      }
    },
    [name, setFieldValue]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const preview = value ? URL.createObjectURL(value) : null;

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary mb-1.5">
        {label} <span className="text-red-500">*</span>
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center min-h-[200px] overflow-hidden
          ${isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : touched && error ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-neutral-b-300 dark:border-neutral-b-600 bg-neutral-b-50 dark:bg-neutral-b-800 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10'}`}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain max-h-56"
            onLoad={() => URL.revokeObjectURL(preview)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-neutral-b-100 dark:bg-neutral-b-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-neutral-b-400 dark:text-dark-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary">
              Drop image here or <span className="text-primary-600 dark:text-primary-400">browse</span>
            </p>
            <p className="text-xs text-neutral-b-400 dark:text-dark-text-muted">PNG, JPG, WEBP · max 5 MB</p>
          </div>
        )}

        {/* Replace button if already selected */}
        {preview && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-lg">Change image</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {touched && error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Step Content ────────────────────────────────────────────────────────────

function StepContent({
  step,
  values,
  errors,
  touched,
  setFieldValue,
}: {
  step: number;
  values: FormValues;
  errors: Partial<Record<keyof FormValues, string>>;
  touched: Partial<Record<keyof FormValues, boolean>>;
  setFieldValue: (field: string, value: unknown) => void;
}) {
  if (step === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <FormField label="Full Name" name="fullName" placeholder="John Doe" required />
        </div>
        <FormField label="Phone Number" name="phoneNumber" placeholder="+1 555 000 0000" required />
        <FormField label="Email" name="email" type="email" placeholder="you@email.com" required />
        <div className="sm:col-span-2">
          <FormField label="Address" name="address" placeholder="123 Main St" required />
        </div>
        <FormField label="City" name="city" placeholder="New York" required />
        <FormField label="Country" name="country" placeholder="United States" required />
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="ID Card Number" name="idCardNumber" placeholder="A12345678" required />
        <FormField label="Commercial Reg. Number" name="commercialRegNumber" placeholder="CR-0001234" required />
        <div className="sm:col-span-2">
          <FormField label="Bank Account Number" name="bankAccountNumber" placeholder="00000000" required />
        </div>
        <FormField label="Card Number" name="bankCardNumber" placeholder="1234567890123456" required />
        <FormField label="Card Expiry" name="bankCardExpiry" placeholder="MM/YY" required />
        <div className="sm:col-span-2">
          <FormField label="Card Holder Name" name="bankCardHolderName" placeholder="JOHN DOE" required />
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <ImageUploadField
        label="ID Card — Front Side"
        name="idCardFrontImage"
        value={values.idCardFrontImage}
        setFieldValue={setFieldValue}
        error={errors.idCardFrontImage as string}
        touched={touched.idCardFrontImage}
      />
    );
  }

  if (step === 3) {
    return (
      <ImageUploadField
        label="ID Card — Back Side"
        name="idCardBackImage"
        value={values.idCardBackImage}
        setFieldValue={setFieldValue}
        error={errors.idCardBackImage as string}
        touched={touched.idCardBackImage}
      />
    );
  }

  return (
    <ImageUploadField
      label="Seller Face Photo"
      name="sellerFaceImage"
      value={values.sellerFaceImage}
      setFieldValue={setFieldValue}
      error={errors.sellerFaceImage as string}
      touched={touched.sellerFaceImage}
    />
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const initialValues: FormValues = {
  fullName: '', phoneNumber: '', email: '', address: '', city: '', country: '',
  idCardNumber: '', commercialRegNumber: '', bankAccountNumber: '',
  bankCardNumber: '', bankCardExpiry: '', bankCardHolderName: '',
  idCardFrontImage: null, idCardBackImage: null, sellerFaceImage: null,
};

function ApplySellerPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const [applySellerMutation] = useApplySellerMutation();

  const handleSubmit = async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    if (step < STEPS.length - 1) return;

    helpers.setSubmitting(true);
    try {
      const fd = new FormData();
      (Object.keys(values) as (keyof FormValues)[]).forEach((key) => {
        const v = values[key];
        if (typeof v === 'string') fd.append(key, v);
      });
      if (values.idCardFrontImage) fd.append('idCardFrontImage', values.idCardFrontImage);
      if (values.idCardBackImage)  fd.append('idCardBackImage',  values.idCardBackImage);
      if (values.sellerFaceImage)  fd.append('sellerFaceImage',  values.sellerFaceImage);

      await applySellerMutation(fd).unwrap();
      toast.success("Application submitted! We'll review it shortly.");
      navigate('/marketplace/seller', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as any)?.data?.message ??
        (err instanceof Error ? err.message : 'Submission failed. Please try again.');
      toast.error(msg);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary">
              Seller Application
            </h1>
            <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mt-0.5">
              Complete all steps to submit your application.
            </p>
          </div>
          <Link
            to="/marketplace/seller"
            className="text-xs text-neutral-b-500 dark:text-dark-text-muted hover:text-neutral-b-800 dark:hover:text-dark-text-primary transition-colors shrink-0"
          >
            ← Back
          </Link>
        </div>

        <StepIndicator current={step} total={STEPS.length} />

        <Formik
          initialValues={initialValues}
          validationSchema={stepSchemas[step]}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur={true}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue, validateForm, setTouched }) => (
            <Form>
              <div className="bg-white dark:bg-neutral-b-800 rounded-2xl p-6 border border-neutral-b-200 dark:border-neutral-b-700 shadow-sm mb-6">
                <h2 className="text-base font-semibold text-neutral-b-900 dark:text-dark-text-primary mb-4">
                  Step {step + 1} — {STEPS[step].label}
                </h2>

                <StepContent
                  step={step}
                  values={values}
                  errors={errors as Partial<Record<keyof FormValues, string>>}
                  touched={touched as Partial<Record<keyof FormValues, boolean>>}
                  setFieldValue={setFieldValue}
                />
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-3">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold
                      border border-neutral-b-200 dark:border-neutral-b-600
                      text-neutral-b-700 dark:text-dark-text-secondary
                      hover:bg-neutral-b-50 dark:hover:bg-neutral-b-700
                      transition-colors"
                  >
                    Back
                  </button>
                )}

                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={async () => {
                      // Touch all current-step fields so errors appear
                      const currentSchema = stepSchemas[step];
                      const fields = Object.keys(currentSchema.fields);
                      const touchedFields = Object.fromEntries(fields.map((k) => [k, true]));
                      await setTouched({ ...touched, ...touchedFields }, false);

                      const errs = await validateForm();
                      const stepFieldKeys = Object.keys(currentSchema.fields);
                      const hasError = stepFieldKeys.some((k) => k in errs);
                      if (!hasError) setStep((s) => s + 1);
                    }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white
                      bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 active:bg-primary-800
                      transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white
                      bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 active:bg-primary-800
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Submitting…
                      </span>
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                )}
              </div>

              {/* Step progress text */}
              <p className="text-center text-xs text-neutral-b-400 dark:text-dark-text-muted mt-4">
                Step {step + 1} of {STEPS.length}
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default ApplySellerPage;
