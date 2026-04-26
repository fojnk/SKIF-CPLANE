import { createContext, useContext } from "react";

export type SmartEdgeGraphBox = {
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

export interface SmartEdgeDebugContextValue {
  enabled: boolean;
  graphBox: SmartEdgeGraphBox;
  setGraphBox: (next: SmartEdgeGraphBox) => void;
}

export const SmartEdgeDebugContext = createContext<SmartEdgeDebugContextValue>({
  enabled: false,
  graphBox: null,
  setGraphBox: () => {
    // Do nothing
  },
});

export const useSmartEdgeDebug = (): SmartEdgeDebugContextValue => {
  return useContext(SmartEdgeDebugContext);
};
