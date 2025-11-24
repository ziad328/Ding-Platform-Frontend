import { Check } from 'lucide-react';

interface SuccessAlertProps {
  title: string;
  description: string;
}

export const SuccessAlert: React.FC<SuccessAlertProps> = ({ title, description }) => {
  return (
    <div className="animate-fadeIn">
      {/* Success Icon */}
      <div className="flex justify-center pt-8 mb-6 sm:mb-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-semantic-g-100 dark:bg-semantic-g-900/30 flex items-center justify-center animate-scaleIn">
          <Check size={28} className="sm:w-8 sm:h-8 text-semantic-g-800 dark:text-semantic-g-700 animate-checkmark" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-center text-primary-700 dark:text-primary-400 mb-4 sm:mb-5">
        {title}
      </h1>

      {/* Description */}
      <p className="text-xs sm:text-sm text-center text-neutral-b-500 dark:text-dark-text-muted mb-12 sm:mb-16 md:mb-20 px-2">
        {description}
      </p>
    </div>
  );
};