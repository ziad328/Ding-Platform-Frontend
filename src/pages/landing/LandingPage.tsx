import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../../components/landing/LandingNavbar';
import HeroSection from '../../components/landing/HeroSection';
import FeaturesGrid from '../../components/landing/FeaturesGrid';
import LandingFooter from '../../components/landing/LandingFooter';
import { useDarkMode } from '../../hook/useDarkMode';

function LandingPage() {
    const navigate = useNavigate();

    // Initialize dark mode
    useDarkMode();

    const handleGetStarted = () => {
        navigate('/auth/signup');
    };

    const handleLearnMore = () => {
        // Scroll to features section
        const featuresSection = document.querySelector('section:nth-of-type(2)');
        featuresSection?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-neutral-w-200 dark:bg-dark-bg-primary">
            <LandingNavbar />
            <HeroSection onGetStarted={handleGetStarted} onLearnMore={handleLearnMore} />
            <FeaturesGrid />
            <LandingFooter />
        </div>
    );
}

export default LandingPage;
