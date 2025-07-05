import { useEffect, useRef } from 'react';

interface BoltBadgeProps {
  referralId?: string;
}

export function BoltBadge({ referralId = 'os72mi' }: BoltBadgeProps) {
  const badgeRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Add event listener for animation end
    const badge = badgeRef.current;
    if (badge) {
      const handleAnimationEnd = () => {
        badge.classList.add('animated');
      };
      
      badge.addEventListener('animationend', handleAnimationEnd);
      
      return () => {
        badge.removeEventListener('animationend', handleAnimationEnd);
      };
    }
  }, []);

  return (
    <div className="fixed top-4 left-4 z-50">
      <a 
        href={`https://bolt.new/?rid=${referralId}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block transition-all duration-300 hover:shadow-2xl"
      >
        <img 
          ref={badgeRef}
          src="https://storage.bolt.army/white_circle_360x360.png" 
          alt="Built with Bolt.new badge" 
          className="w-20 h-20 md:w-28 md:h-28 rounded-full shadow-lg bolt-badge bolt-badge-intro"
        />
      </a>
    </div>
  );
} 