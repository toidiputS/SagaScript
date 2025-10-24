

interface SagaScriptLogoProps {
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export default function SagaScriptLogo({ 
  className = '', 
  width = 400, 
  height = 240,
  alt = "SagaScript Life Logo"
}: SagaScriptLogoProps) {
  return (
    <img 
      src="/sagascript-logo.svg?v=3"
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{ 
        maxWidth: '100%', 
        height: 'auto',
        objectFit: 'contain'
      }}
    />
  );
}

// Compact version for small spaces
export function SagaScriptLogoCompact({ 
  className = '', 
  size = 32 
}: { 
  className?: string; 
  size?: number; 
}) {
  return (
    <img 
      src="/sagascript-logo.svg?v=3"
      alt="SagaScript Life"
      width={size}
      height={size * 0.6} // Maintain aspect ratio
      className={className}
      style={{ 
        maxWidth: '100%', 
        height: 'auto',
        objectFit: 'contain'
      }}
    />
  );
}