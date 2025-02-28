"use client";

import { createContext, useContext, useState } from "react";

interface HoverContextType {
  hoveredHost: string | null;
  setHoveredHost: (host: string | null) => void;
}

const HoverContext = createContext<HoverContextType>({
  hoveredHost: null,
  setHoveredHost: () => {},
});

export function HoverProvider({ children }: { children: React.ReactNode }) {
  const [hoveredHost, setHoveredHost] = useState<string | null>(null);

  return (
    <HoverContext.Provider value={{ hoveredHost, setHoveredHost }}>
      {children}
    </HoverContext.Provider>
  );
}

export function useHover() {
  return useContext(HoverContext);
}
