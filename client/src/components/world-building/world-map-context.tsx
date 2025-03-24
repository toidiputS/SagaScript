
import React, { createContext, useContext, useState } from 'react';

interface MapGenerationResult {
  id: string;
  imageUrl: string;
  prompt: string;
  description: string;
  style: string;
  artStyle: string;
  createdAt: string;
}

interface WorldMapContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  generatedMap: MapGenerationResult | null;
  setGeneratedMap: (map: MapGenerationResult | null) => void;
}

const WorldMapContext = createContext<WorldMapContextType>({
  isLoading: false,
  setIsLoading: () => {},
  generatedMap: null,
  setGeneratedMap: () => {},
});

export const WorldMapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMap, setGeneratedMap] = useState<MapGenerationResult | null>(null);

  return (
    <WorldMapContext.Provider value={{ isLoading, setIsLoading, generatedMap, setGeneratedMap }}>
      {children}
    </WorldMapContext.Provider>
  );
};

export const useWorldMap = () => useContext(WorldMapContext);

// Export these for direct use if needed
export const { isLoading, setIsLoading, generatedMap, setGeneratedMap } = useWorldMap();
