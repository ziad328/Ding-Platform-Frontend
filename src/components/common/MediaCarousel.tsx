import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface MediaFile {
    id: string;
    file: File;
    preview: string;
    type: 'image' | 'video';
}

interface MediaCarouselProps {
    mediaFiles: MediaFile[];
    onRemove: (index: number) => void;
}

const MediaCarousel = ({ mediaFiles, onRemove }: MediaCarouselProps) => {
    const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);

    // Wrap index to handle circular navigation
    const paginate = (newDirection: number) => {
        const newIndex = (currentIndex + newDirection + mediaFiles.length) % mediaFiles.length;
        setCurrentIndex([newIndex, newDirection]);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                paginate(-1);
            } else if (e.key === 'ArrowRight') {
                paginate(1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, mediaFiles.length]);

    // Reset to first slide if current index is out of bounds
    useEffect(() => {
        if (currentIndex >= mediaFiles.length && mediaFiles.length > 0) {
            setCurrentIndex([0, 0]);
        }
    }, [mediaFiles.length, currentIndex]);

    // Safety checks
    if (mediaFiles.length === 0) return null;
    if (currentIndex >= mediaFiles.length) return null;

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    return (
        <div className="w-full mb-3">
            {/* Carousel Container */}
            <div className="relative w-full aspect-video bg-neutral-w-200 dark:bg-dark-bg-tertiary rounded-lg overflow-hidden">
                {/* Media Display */}
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={mediaFiles[currentIndex].id}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: 'spring', stiffness: 300, damping: 30 },
                            opacity: { duration: 0.1 },
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(_, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);

                            if (swipe < -swipeConfidenceThreshold) {
                                paginate(1);
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate(-1);
                            }
                        }}
                        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
                    >
                        {mediaFiles[currentIndex].type === 'video' ? (
                            <video
                                src={mediaFiles[currentIndex].preview}
                                className="w-full h-full object-contain"
                                controls
                            />
                        ) : (
                            <img
                                src={mediaFiles[currentIndex].preview}
                                alt={`Media ${currentIndex + 1}`}
                                className="w-full h-full object-contain select-none"
                                draggable={false}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows - Only show if more than 1 item */}
                {mediaFiles.length > 1 && (
                    <>
                        <button
                            onClick={() => paginate(-1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 dark:bg-dark-bg-primary/90 hover:bg-white dark:hover:bg-dark-bg-primary rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
                            aria-label="Previous media"
                        >
                            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-b-900 dark:text-dark-text-primary" />
                        </button>
                        <button
                            onClick={() => paginate(1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 dark:bg-dark-bg-primary/90 hover:bg-white dark:hover:bg-dark-bg-primary rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
                            aria-label="Next media"
                        >
                            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-b-900 dark:text-dark-text-primary" />
                        </button>
                    </>
                )}

                {/* Remove Button */}
                <button
                    onClick={() => onRemove(currentIndex)}
                    className="absolute top-2 right-2 w-8 h-8 sm:w-9 sm:h-9 bg-semantic-r-700/90 dark:bg-semantic-r-800/90 hover:bg-semantic-r-800 dark:hover:bg-semantic-r-900 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
                    aria-label="Remove media"
                >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>

                {/* Media Counter */}
                <div className="hidden sm:block absolute top-2 left-2 bg-neutral-b-900/80 dark:bg-dark-bg-primary/80 rounded-full px-3 py-1.5 z-10">
                    <span className="text-xs text-white font-medium">
                        {currentIndex + 1} / {mediaFiles.length}
                    </span>
                </div>
            </div>

            {/* Pagination Dots */}
            {mediaFiles.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                    {mediaFiles.map((media, index) => (
                        <motion.button
                            key={media.id}
                            onClick={() => setCurrentIndex([index, index > currentIndex ? 1 : -1])}
                            className={`rounded-full transition-all ${index === currentIndex
                                ? 'bg-primary-600 dark:bg-primary-500'
                                : 'bg-neutral-w-400 dark:bg-dark-border hover:bg-neutral-w-500 dark:hover:bg-dark-text-muted'
                                }`}
                            animate={{
                                width: index === currentIndex ? 24 : 8,
                                height: 8,
                            }}
                            transition={{ duration: 0.3 }}
                            aria-label={`Go to media ${index + 1}`}
                            aria-current={index === currentIndex ? 'true' : 'false'}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MediaCarousel;
