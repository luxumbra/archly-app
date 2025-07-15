import React from 'react';


interface YoreLoaderProps {
  progress?: number;
  size?: number;
  showProgress?: boolean;
  className?: string;
}

const YoreLoader = ({
  progress = 0,
  size = 120,
  showProgress = true,
  className = ""
}: YoreLoaderProps) => {
  // Yore brand colors
  const colors = {
    primary: '#374151', // Dark gray
    accent: '#eab308', // Golden yellow
    light: '#f8fafc', // Light gray
      earth: '#92400e', // Earth brown
    copy: '#7A8EC4', // Blue-gray
  };

  // Calculate animation values based on progress (0-100)
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  // Animate compass needle rotation (0-360 degrees)
  const needleRotation = (normalizedProgress / 100) * 360;

  // Animate archaeological layers being "excavated" (revealed from bottom)
  const layerOffset = (100 - normalizedProgress) / 100 * 60;

  // Animate discovery pulse
  const pulseOpacity = Math.sin((normalizedProgress / 100) * Math.PI * 4) * 0.3 + 0.7;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          className="transform"
        >
          {/* Outer circle - represents archaeological site boundary */}
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke={colors.primary}
            strokeWidth="2"
            strokeDasharray="8 4"
            opacity="0.3"
            style={{
              transform: 'rotate(0deg)',
              transformOrigin: '60px 60px',
              animation: 'spin 20s linear infinite'
            }}
          />

          {/* Archaeological layers (revealed as progress increases) */}
          <g className="archaeological-layers">
            {/* Layer 1 - Modern/Recent */}
            <rect
              x="25"
              y={20 + layerOffset * 0.2}
              width="70"
              height="12"
              fill={colors.light}
              opacity={normalizedProgress > 20 ? 0.8 : 0.3}
              rx="2"
            />

            {/* Layer 2 - Medieval */}
            <rect
              x="25"
              y={35 + layerOffset * 0.4}
              width="70"
              height="12"
              fill={colors.earth}
              opacity={normalizedProgress > 40 ? 0.8 : 0.3}
              rx="2"
            />

            {/* Layer 3 - Roman */}
            <rect
              x="25"
              y={50 + layerOffset * 0.6}
              width="70"
              height="12"
              fill={colors.accent}
              opacity={normalizedProgress > 60 ? 0.8 : 0.3}
              rx="2"
            />

            {/* Layer 4 - Prehistoric */}
            <rect
              x="25"
              y={65 + layerOffset * 0.8}
              width="70"
              height="12"
              fill={colors.primary}
              opacity={normalizedProgress > 80 ? 0.8 : 0.3}
              rx="2"
            />
          </g>

          {/* Central compass/location pin */}
          <g className="compass-container">
            {/* Compass rose background */}
            <circle
              cx="60"
              cy="60"
              r="20"
              fill={colors.primary}
              opacity="0.1"
            />

            {/* Compass directions */}
            <g stroke={colors.primary} strokeWidth="1" opacity="0.4">
              <line x1="60" y1="45" x2="60" y2="50" /> {/* N */}
              <line x1="75" y1="60" x2="70" y2="60" /> {/* E */}
              <line x1="60" y1="75" x2="60" y2="70" /> {/* S */}
              <line x1="45" y1="60" x2="50" y2="60" /> {/* W */}
            </g>

            {/* Location pin shape */}
            <path
              d="M60,45 C65,45 69,49 69,54 C69,59 60,70 60,70 C60,70 51,59 51,54 C51,49 55,45 60,45 Z"
              fill={colors.accent}
              stroke={colors.primary}
              strokeWidth="2"
              style={{
                opacity: pulseOpacity
              }}
            />

            {/* Compass needle - rotates with progress */}
            <g
              style={{
                transform: `rotate(${needleRotation}deg)`,
                transformOrigin: '60px 60px',
                transition: 'transform 0.3s ease-out'
              }}
            >
              <path
                d="M60,50 L62,60 L60,65 L58,60 Z"
                fill={colors.accent}
                stroke={colors.primary}
                strokeWidth="1"
              />
              <circle
                cx="60"
                cy="60"
                r="2"
                fill={colors.primary}
              />
            </g>
          </g>

          {/* Discovery animation - radiating circles */}
          {normalizedProgress > 0 && (
            <g className="discovery-animation">
              <circle
                cx="60"
                cy="60"
                r={15 + (normalizedProgress / 100) * 10}
                fill="none"
                stroke={colors.accent}
                strokeWidth="1"
                opacity={0.6 - (normalizedProgress / 100) * 0.4}
              />
              <circle
                cx="60"
                cy="60"
                r={10 + (normalizedProgress / 100) * 15}
                fill="none"
                stroke={colors.accent}
                strokeWidth="0.5"
                opacity={0.4 - (normalizedProgress / 100) * 0.3}
              />
            </g>
          )}

          {/* Progress indicator dots around the edge */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30) * (Math.PI / 180);
            const x = Math.round((60 + 45 * Math.cos(angle - Math.PI / 2)) * 1000) / 1000;
            const y = Math.round((60 + 45 * Math.sin(angle - Math.PI / 2)) * 1000) / 1000;
            const isActive = (normalizedProgress / 100) * 12 > i;

            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                fill={isActive ? colors.accent : colors.primary}
                opacity={isActive ? 1 : 0.3}
                style={{
                  transition: 'all 0.3s ease-out'
                }}
              />
            );
          })}
        </svg>

        {/* CSS animations */}
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      {/* Progress text */}
      {showProgress && (
        <div className="mt-4 text-center">
          <div
            className="text-lg font-light text-gray-300"
            style={{ color: colors.copy }}
          >
            {normalizedProgress < 25 && "Discovering sites..."}
            {normalizedProgress >= 25 && normalizedProgress < 50 && "Analyzing data..."}
            {normalizedProgress >= 50 && normalizedProgress < 75 && "Loading history..."}
            {normalizedProgress >= 75 && normalizedProgress < 100 && "Almost ready..."}
            {normalizedProgress >= 100 && "Complete!"}
          </div>
          <div
            className="text-sm text-gray-300 mt-1"
            style={{ color: colors.copy, opacity: 0.7 }}
          >
            {Math.round(normalizedProgress)}%
          </div>
        </div>
      )}
    </div>
  );
};

// Demo component showing different states
const YoreLoaderDemo = () => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Yore Loading Component
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Animated demo */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Animated Demo</h3>
            <YoreLoader progress={progress} size={150} />
          </div>

          {/* Static examples */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Static Examples</h3>
            <div className="grid grid-cols-2 gap-4">
              <YoreLoader progress={25} size={80} showProgress={false} />
              <YoreLoader progress={50} size={80} showProgress={false} />
              <YoreLoader progress={75} size={80} showProgress={false} />
              <YoreLoader progress={100} size={80} showProgress={false} />
            </div>
          </div>
        </div>

        {/* Usage example */}
        <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
          <h3 className="text-lg font-medium mb-4">Usage</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<YoreLoader
  progress={loadingProgress}
  size={120}
  showProgress={true}
  className="my-custom-class"
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};


export { YoreLoader, YoreLoaderDemo };
export type { YoreLoaderProps };