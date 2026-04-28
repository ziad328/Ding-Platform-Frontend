import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  useGetSellerProfileQuery,
  useUpdateSellerProfileMutation,
} from '../../../store/slices/marketplace/marketplaceApi';
import SellerDashboardNav from '../../../components/marketplace/SellerDashboardNav';
import StatusBadge from '../../../components/marketplace/StatusBadge';

function SellerProfilePage() {
  const { data, isLoading } = useGetSellerProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateSellerProfileMutation();

  const profile = data?.data;

  const [form, setForm] = useState({
    businessName: '',
    phoneNumber: '',
    city: '',
  });

  // Sync form once profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        businessName: profile.businessName,
        phoneNumber: profile.phoneNumber,
        city: profile.city,
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(form).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Update failed. Please try again.');
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
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary mb-6">
          Seller Portal
        </h1>

        <SellerDashboardNav />

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-neutral-b-100 dark:bg-neutral-b-800 rounded-xl w-1/3" />
            <div className="h-40 bg-neutral-b-100 dark:bg-neutral-b-800 rounded-2xl" />
          </div>
        ) : (
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-semibold text-neutral-b-900 dark:text-dark-text-primary">
                Business Profile
              </h2>
              {profile && <StatusBadge status={profile.status} />}
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-neutral-b-800 rounded-2xl p-6 border border-neutral-b-200 dark:border-neutral-b-700 shadow-sm space-y-5"
            >
              <div>
                <label
                  htmlFor="businessName"
                  className="block text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary mb-1.5"
                >
                  Business Name
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  value={form.businessName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary mb-1.5"
                >
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary mb-1.5"
                >
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-6 rounded-xl font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-150"
              >
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerProfilePage;
