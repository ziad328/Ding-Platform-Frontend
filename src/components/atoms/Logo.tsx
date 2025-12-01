import logoSvg from '../../assets/Logo.svg';
import { Link } from 'react-router-dom';

export const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src={logoSvg} alt="Ding Logo" className="w-7 h-7 sm:w-8 sm:h-8" />
      <span className="text-lg sm:text-xl font-extrabold text-primary-800 dark:text-primary-400">Ding</span>
    </Link>
  );
};