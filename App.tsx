import { useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { DataDrawer } from "./components/DataDrawer";
import { TelemetryHeader } from "./components/TelemetryHeader";
import { ThermalLens } from "./components/ThermalLens";
import { captureThermalSnapshot } from "./utils/InferenceEngine";
import { getDummyThermalStats } from "./utils/physicsUtils";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [stats, setStats] = useState(getDummyThermalStats());
  const [location, setLocation] = useState("Locating...");
  const [material, setMaterial] = useState("ASPHALT");

  useEffect(() => {
    if (!permission?.granted) requestPermission();

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(
          `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`,
        );
      }
    })();
  }, [permission]);

  const handleSnapshot = () => {
    captureThermalSnapshot(stats, location, material);
  };

  if (!permission?.granted)
    return <ActivityIndicator style={StyleSheet.absoluteFill} />;

  return (
    <View style={styles.container}>
      <ThermalLens />

      <View style={styles.overlay}>
        <TelemetryHeader
          district="Makati City"
          temp={stats.current}
          wbgt={(parseFloat(stats.current) * 0.95).toFixed(1)}
        />
      </View>

      <DataDrawer
        onSnapshot={handleSnapshot}
        activeMaterial={material}
        setMaterial={setMaterial}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: { position: "absolute", top: 60, left: 20, right: 20 },
});
