import logoSvg from '../../assets/Logo.svg';
import { Link } from 'react-router-dom';

interface LogoProps {
  disableLink?: boolean;
  expanded?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ disableLink, expanded }) => {
  const showText = expanded === undefined || expanded;

  const content = (
    <div className="flex items-center gap-3 overflow-hidden">
      <img src={logoSvg} alt="Ding Logo" className="w-8 h-8 shrink-0" />
      <span
        style={{
          opacity: showText ? 1 : 0,
          maxWidth: showText ? '120px' : '0px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          transition: 'opacity 140ms ease, max-width 160ms ease',
        }}
        className="text-xl font-extrabold text-primary-800 dark:text-primary-400"
      >
        Ding
      </span>
    </div>
  );

  if (disableLink) return <div>{content}</div>;
  return <Link to="/">{content}</Link>;
};