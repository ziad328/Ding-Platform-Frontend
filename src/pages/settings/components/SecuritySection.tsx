import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useUpdatePasswordMutation } from '../../../store/slices/settings/settingsApi';

const schema = Yup.object({
  oldPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Must be at least 8 characters')
    .max(64, 'Cannot exceed 64 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: Yup.string()
    .required('Please confirm your new password')
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match'),
});

interface PasswordFieldProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  visible: boolean;
  onToggle: () => void;
}

function PasswordField({ id, name, label, placeholder, visible, onToggle }: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Field
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder ?? '••••••••'}
          autoComplete={name === 'oldPassword' ? 'current-password' : 'new-password'}
          className="w-full pr-10 pl-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2
            bg-white dark:bg-dark-bg-primary text-neutral-b-900 dark:text-dark-text-primary
            placeholder:text-neutral-b-300 dark:placeholder:text-dark-text-muted
            border-neutral-w-400 dark:border-dark-border focus:ring-primary-500
            transition-all duration-150"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-neutral-b-400 dark:text-dark-text-muted hover:text-neutral-b-700 dark:hover:text-dark-text-secondary transition-colors"
        >
          {visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>
      <ErrorMessage
        name={name}
        render={(msg) => (
          <p role="alert" className="mt-1 text-xs text-semantic-r-900 dark:text-red-400">
            {msg}
          </p>
        )}
      />
    </div>
  );
}

function SecuritySection() {
  const [visibility, setVisibility] = useState({ old: false, new_: false, confirm: false });
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  const toggle = (key: keyof typeof visibility) =>
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <section
      aria-labelledby="security-heading"
      className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-neutral-w-400 dark:border-dark-border p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-1">
        <Lock size={18} className="text-primary-500" />
        <h2 id="security-heading" className="text-lg font-semibold text-neutral-b-800 dark:text-dark-text-primary">
          Security
        </h2>
      </div>
      <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mb-6">
        Update your password to keep your account secure.
      </p>

      <Formik
        initialValues={{ oldPassword: '', newPassword: '', confirmPassword: '' }}
        validationSchema={schema}
        onSubmit={async (values, { resetForm }) => {
          try {
            await updatePassword({
              oldPassword: values.oldPassword,
              newPassword: values.newPassword,
            }).unwrap();
            resetForm();
            toast.success('Password updated — please refresh and sign in again.', {
              duration: 6000,
            });
          } catch (err: any) {
            const msg = err?.data?.message ?? 'Failed to update password. Please try again.';
            toast.error(msg);
          }
        }}
      >
        {({ isSubmitting, dirty }) => (
          <Form noValidate className="space-y-4">
            <PasswordField
              id="old-password"
              name="oldPassword"
              label="Current Password"
              visible={visibility.old}
              onToggle={() => toggle('old')}
            />
            <PasswordField
              id="new-password"
              name="newPassword"
              label="New Password"
              visible={visibility.new_}
              onToggle={() => toggle('new_')}
            />
            <PasswordField
              id="confirm-password"
              name="confirmPassword"
              label="Confirm New Password"
              visible={visibility.confirm}
              onToggle={() => toggle('confirm')}
            />

            {/* Password requirements hint */}
            <ul className="text-xs text-neutral-b-400 dark:text-dark-text-muted space-y-0.5 list-disc list-inside">
              <li>At least 8 characters</li>
              <li>One uppercase letter, one lowercase letter</li>
              <li>One number and one special character</li>
            </ul>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isLoading || !dirty}
                id="change-password-submit"
                className="px-6 py-2.5 text-sm font-medium rounded-xl text-white bg-primary-500 hover:bg-primary-600
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none
                  focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                {isSubmitting || isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating…
                  </span>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
}

export default SecuritySection;
