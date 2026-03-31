import { THERMAL_THEME } from "../constants/theme";

export interface InferenceResult {
  temperatureMap: number[][];
  maxTemp: number;
  minTemp: number;
  hazardLevel: "LOW" | "MEDIUM" | "CRITICAL";
}

const SERVER_URL = `${process.env.EXPO_PUBLIC_API_URL}/infer`;

export const runThermalInference = async (
  imageUri: string,
  material: string,
  gps: string,
): Promise<InferenceResult | null> => {
  const formData = new FormData();

  formData.append("image", {
    uri: imageUri,
    name: "thermal_frame.jpg",
    type: "image/jpeg",
  } as any);

  formData.append("material", material);
  formData.append("gps", gps);

  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    return {
      temperatureMap: data.heatmap,
      maxTemp: data.metadata.max_temp,
      minTemp: data.metadata.min_temp,
      hazardLevel: data.metadata.max_temp > 40 ? "CRITICAL" : "MEDIUM",
    };
  } catch (error) {
    console.error("Cloud Inference Failed:", error);
    return null;
  }
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
  return snapshot;
};
