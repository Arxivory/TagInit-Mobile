export const calculateWBGT = (temp: number, humidity: number = 0.7): number => {
  return 0.7 * temp * humidity + 0.2 * temp + 0.1 * temp;
};

export const getDummyThermalStats = () => {
  const base = 31 + Math.random() * 6;
  return {
    current: base.toFixed(1),
    max: (base + 3.5).toFixed(1),
    min: (base - 1.2).toFixed(1),
    variance: (Math.random() * 0.5).toFixed(2),
  };
};

export const MATERIAL_EMISSIVITY = {
  ASPHALT: 0.93,
  GI_SHEET: 0.28,
  VEGETATION: 0.98,
};

export const adjustTempByMaterial = (
  rawTemp: number,
  material: keyof typeof MATERIAL_EMISSIVITY,
) => {
  const epsilon = MATERIAL_EMISSIVITY[material];
  return rawTemp * (1 / epsilon) * 0.9;
};
