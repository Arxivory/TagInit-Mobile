import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [heatmap, setHeatmap] = useState<number[][] | undefined>(undefined);
  const cameraRef = useRef<CameraView>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const toggleMode = () => {
    if (capturedImage) {
      setCapturedImage(null);
      setHeatmap(undefined);
    } else {
      handleSnapshot();
    }
  };

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

      setCapturedImage(photo.uri);
      setIsAnalyzing(true);

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
          Alert.alert("Connection Error", "Check your Python terminal.");
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Snapshot Failed", "Check hardware connections.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRecommendation = () => {
    const temp = parseFloat(stats.max);
    if (material === "ASPHALT" && temp > 45)
      return "Significant Heat Island risk. Recommend permeable paving.";
    if (material === "G.I. SHEET" && temp > 40)
      return "High conduction. Consider reflective coating (Cool Roof).";
    if (temp < 35) return "Optimal thermal profile for this surface material.";
    return "Analyzing thermal patterns for urban mitigation...";
  };

  if (!permission?.granted)
    return <ActivityIndicator style={StyleSheet.absoluteFill} />;

  return (
    <View style={styles.container}>
      <ThermalLens
        heatmap={heatmap}
        cameraRef={cameraRef}
        capturedImage={capturedImage}
      />

      <TouchableOpacity
        style={[
          styles.fab,
          capturedImage ? styles.fabReset : styles.fabCapture,
          isAnalyzing && { opacity: 0.8 },
        ]}
        onPress={toggleMode}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <ActivityIndicator color="white" size="large" />
        ) : (
          <Ionicons
            name={capturedImage ? "refresh" : "aperture"}
            size={35}
            color="white"
          />
        )}
      </TouchableOpacity>

      <View style={styles.overlay}>
        <TelemetryHeader
          district="Makati City"
          temp={stats.current}
          wbgt={(parseFloat(stats.current) * 0.95).toFixed(1)}
        />
      </View>

      {capturedImage && (
        <View style={styles.insightCard}>
          <View style={styles.insightRow}>
            <Ionicons name="analytics" size={20} color="#FF4500" />
            <Text style={styles.insightTitle}>
              Analysis: {material.replace("_", " ")}
            </Text>
          </View>
          <Text style={styles.insightBody}>{getRecommendation()}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>
              Max: <Text style={styles.statVal}>{stats.max}°C</Text>
            </Text>
            <Text style={styles.statLabel}>
              Min: <Text style={styles.statVal}>{stats.min}°C</Text>
            </Text>
          </View>
        </View>
      )}

      {!capturedImage && (
        <DataDrawer activeMaterial={material} setMaterial={setMaterial} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: { position: "absolute", top: 60, left: 20, right: 20 },
  fab: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 10,
  },
  fabCapture: {
    backgroundColor: "#FF4500",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.2)",
  },
  fabReset: {
    backgroundColor: "#333",
    borderColor: "#FF4500",
    borderWidth: 2,
  },
  insightCard: {
    position: "absolute",
    bottom: 140,
    left: 20,
    right: 20,
    backgroundColor: "rgba(20, 20, 20, 0.9)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 69, 0, 0.3)",
  },
  insightRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  insightTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  insightBody: {
    color: "#ccc",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  statsRow: { flexDirection: "row", justifyContent: "flex-start", gap: 20 },
  statLabel: { color: "#888", fontSize: 12 },
  statVal: { color: "white", fontWeight: "bold" },
});
