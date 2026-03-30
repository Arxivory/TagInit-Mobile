import { THERMAL_THEME } from "../constants/theme";

export interface InferenceResult {
  temperatureMap: number[][];
  maxTemp: number;
  minTemp: number;
  hazardLevel: "LOW" | "MEDIUM" | "CRITICAL";
}

const normalizeFrame = (frameData: any) => {
  return frameData;
};

export const runThermalInference = async (
  rawFrame: any,
): Promise<InferenceResult> => {
  const baseTemp = 32 + Math.random() * 8;

  const maxTemp = Math.min(baseTemp + 5, 55);
  const minTemp = baseTemp - 2;

  return {
    temperatureMap: [[baseTemp]],
    maxTemp,
    minTemp,
    hazardLevel: maxTemp > 40 ? "CRITICAL" : "MEDIUM",
  };
};

export const getColorForTemp = (temp: number): string => {
  if (temp > 45) return THERMAL_THEME.accent;
  if (temp > 35) return "#FFAA00";
  return "#0000FF";
};

export const captureThermalSnapshot = (
  stats: any,
  location: string,
  material: string,
) => {
  const snapshot = {
    id: `TAG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    coordinates: location,
    material_context: material,
    thermal_data: stats,
  };

  console.log("SNAPSHOT SAVED:", snapshot);
  alert(`Snapshot Saved for ${location}`);
  return snapshot;
};
