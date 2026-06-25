"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { clearIntroSeen, requestIntroReplay } from "@/lib/intro-storage";

interface IntroContextValue {
  introActive: boolean;
  setIntroActive: (active: boolean) => void;
  replayIntro: () => void;
  replayToken: number;
}

const IntroContext = createContext<IntroContextValue>({
  introActive: false,
  setIntroActive: () => {},
  replayIntro: () => {},
  replayToken: 0,
});

export function IntroProvider({ children }: { children: ReactNode }) {
  const [introActive, setIntroActive] = useState(false);
  const [replayToken, setReplayToken] = useState(0);

  const replayIntro = useCallback(() => {
    clearIntroSeen();
    requestIntroReplay();
    setReplayToken((t) => t + 1);
  }, []);

  return (
    <IntroContext.Provider value={{ introActive, setIntroActive, replayIntro, replayToken }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  return useContext(IntroContext);
}
