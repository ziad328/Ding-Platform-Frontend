import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useApplySellerMutation } from '../../../store/slices/marketplace/marketplaceApi';

function ApplySellerPage() {
  const navigate = useNavigate();
  const [applySeller, { isLoading }] = useApplySellerMutation();

  const [form, setForm] = useState({
    businessName: '',
    phoneNumber: '',
    city: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.businessName.trim() || !form.phoneNumber.trim() || !form.city.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('businessName', form.businessName.trim());
    formData.append('phoneNumber', form.phoneNumber.trim());
    formData.append('city', form.city.trim());

    try {
      await applySeller(formData).unwrap();
      toast.success('Application submitted! We\'ll review it shortly.');
      navigate('/marketplace/seller', { replace: true });
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Submission failed. Please try again.');
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl text-sm ' +
    'bg-white dark:bg-neutral-b-700 ' +
    'border border-neutral-b-200 dark:border-neutral-b-600 ' +
    'text-neutral-b-900 dark:text-dark-text-primary ' +
    'placeholder-neutral-b-400 dark:placeholder-neutral-b-500 ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ' +
    'transition-all';

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary">
              Apply to Become a Seller
            </h1>
            <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mt-1">
              Fill in your business details to submit your application.
            </p>
          </div>
          <Link
            to="/marketplace/seller"
            className="text-xs text-neutral-b-500 dark:text-dark-text-muted hover:text-neutral-b-800 dark:hover:text-dark-text-primary transition-colors shrink-0"
          >
            ← Back
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-neutral-b-800 rounded-2xl p-6 border border-neutral-b-200 dark:border-neutral-b-700 shadow-sm space-y-5"
        >
          {/* Business Name */}
          <div>
            <label
              htmlFor="businessName"
              className="block text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary mb-1.5"
            >
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              placeholder="e.g. Acme Electronics"
              value={form.businessName}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary mb-1.5"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="e.g. +1 555 000 0000"
              value={form.phoneNumber}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary mb-1.5"
            >
              City <span className="text-red-500">*</span>
            </label>
            <input
              id="city"
              name="city"
              type="text"
              placeholder="e.g. New York"
              value={form.city}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 rounded-xl font-semibold text-white
              bg-blue-600 hover:bg-blue-700 active:bg-blue-800
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-150"
          >
            {isLoading ? 'Submitting…' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ApplySellerPage;
