
import { useState, useEffect } from 'react';

const backgrounds = [
  { id: 'bronze', url: '/backgrounds/bronze.jpg', name: 'Bronze Age' },
  { id: 'clay', url: '/backgrounds/clay.jpg', name: 'Sculptural' },
  { id: 'spooky', url: '/backgrounds/spooky.jpg', name: 'Spooky' },
  { id: 'scifi', url: '/backgrounds/scifi.jpg', name: 'Sci-Fi' },
  { id: 'epic', url: '/backgrounds/epic.jpg', name: 'Epic' }
];

export function BackgroundSwitcher() {
  const [currentBg, setCurrentBg] = useState(backgrounds[0].id);

  useEffect(() => {
    document.body.style.backgroundImage = `url(${backgrounds.find(bg => bg.id === currentBg)?.url})`;
    return () => {
      document.body.style.backgroundImage = '';
    };
  }, [currentBg]);

  return (
    <div className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
      <div className="flex gap-2">
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            onClick={() => setCurrentBg(bg.id)}
            className={`w-8 h-8 rounded-full border-2 ${
              currentBg === bg.id ? 'border-primary' : 'border-transparent'
            }`}
            style={{ backgroundImage: `url(${bg.url})`, backgroundSize: 'cover' }}
            title={bg.name}
          />
        ))}
      </div>
    </div>
  );
}
