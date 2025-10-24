
import SagaScriptLogo from './sagascript-logo';

interface BackgroundLogoProps {
  opacity?: number;
  className?: string;
}

export default function BackgroundLogo({ 
  opacity = 0.03, 
  className = '' 
}: BackgroundLogoProps) {
  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-0 flex items-center justify-center ${className}`}
      style={{ opacity }}
    >
      <SagaScriptLogo 
        width={800} 
        height={480} 
        className="text-current"
      />
    </div>
  );
}