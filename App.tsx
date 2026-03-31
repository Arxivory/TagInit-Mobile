import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";

import { DataDrawer } from "./components/DataDrawer";
import { TelemetryHeader } from "./components/TelemetryHeader";
import { ThermalLens } from "./components/ThermalLens";
import {
  captureThermalSnapshot,
  runThermalInference,
} from "./utils/InferenceEngine";
import { getDummyThermalStats } from "./utils/physicsUtils";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [stats, setStats] = useState(getDummyThermalStats());
  const [location, setLocation] = useState("Locating...");
  const [material, setMaterial] = useState("ASPHALT");

  const [heatmap, setHeatmap] = useState<number[][] | undefined>(undefined);

  const cameraRef = useRef<CameraView>(null);

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

  const handleSnapshot = async () => {
    if (!cameraRef.current) {
      Alert.alert("Error", "Camera not ready");
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
      });

      if (photo) {
        const result = await runThermalInference(photo.uri, material, location);

        if (result) {
          setHeatmap(result.temperatureMap);
          setStats((prevStats) => ({
            current: result.maxTemp.toString(),
            previous: prevStats.current,
            max: result.maxTemp.toString(),
            min: result.minTemp.toString(),
            variance: (result.maxTemp - result.minTemp).toFixed(2),
          }));

          captureThermalSnapshot(result, location, material);
        } else {
          Alert.alert(
            "Connection Error",
            "Could not reach the ML server. Check your IP!",
          );
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Snapshot Failed", "Check your Python terminal for errors.");
    }
  };

  if (!permission?.granted)
    return <ActivityIndicator style={StyleSheet.absoluteFill} />;

  return (
    <View style={styles.container}>
      <ThermalLens heatmap={heatmap} cameraRef={cameraRef} />

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
