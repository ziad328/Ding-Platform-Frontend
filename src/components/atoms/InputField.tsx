import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps {
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  showPasswordToggle?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  name, 
  type = 'text', 
  placeholder, 
  value,
  onChange,
  onBlur,
  error,
  touched,
  showPasswordToggle = false 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div>
      <div className="relative">
        <input
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full px-3 py-2.5 text-sm sm:px-4 sm:text-base placeholder:text-neutral-500 font-normal border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            touched && error
              ? 'border-semantic-r-700 focus:ring-semantic-r-700'
              : 'border-neutral-w-400 focus:ring-primary-500 focus:border-transparent'
          }`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 sm:right-3 top-1/2 cursor-pointer -translate-y-1/2 text-neutral-b-400 hover:text-neutral-b-700 touch-manipulation"
          >
            {showPassword ? <Eye size={18} className="sm:w-5 sm:h-5" /> : <EyeOff size={18} className="sm:w-5 sm:h-5" />}
          </button>
        )}
      </div>
      {touched && error && (
        <div className="text-semantic-r-800 text-xs sm:text-sm mt-1">{error}</div>
      )}
    </div>
  );
};