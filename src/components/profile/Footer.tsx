
const Footer = () => {
    return (
        <footer className="p-3 sm:p-4 md:p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 text-xs text-neutral-b-500">
                <p>© 2023 DevCut. All rights reserved.</p>
                <div className="flex items-center gap-3 sm:gap-4">
                    <a href="#" className="hover:text-primary-600 transition-colors">About</a>
                    <a href="#" className="hover:text-primary-600 transition-colors">Help</a>
                    <a href="#" className="hover:text-primary-600 transition-colors">Privacy & Terms</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;