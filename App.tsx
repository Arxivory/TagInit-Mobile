import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker"; // New Import
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

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

  const processImageInference = async (uri: string) => {
    setIsAnalyzing(true);
    try {
      const result = await runThermalInference(uri, material, location);
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
    } catch (e) {
      console.error(e);
      Alert.alert("Analysis Failed", "Check server connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

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
      await processImageInference(photo.uri);
    } catch (e) {
      Alert.alert("Camera Error", "Failed to capture image.");
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Gallery access is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      await processImageInference(result.assets[0].uri);
    }
  };

  const getRecommendation = () => {
    const temp = parseFloat(stats.max);
    if (material === "ASPHALT" && temp > 45)
      return "Significant Heat Island risk. Recommend permeable paving.";
    if (material === "G.I. SHEET" || (material === "GI_SHEET" && temp > 40))
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
          isAnalyzing && { opacity: 0.6 },
        ]}
        onPress={toggleMode}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <ActivityIndicator color="white" size="large" />
        ) : (
          <Ionicons
            name={capturedImage ? "refresh" : "aperture"}
            size={38}
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

      {capturedImage && !isAnalyzing && (
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
        <DataDrawer
          activeMaterial={material}
          setMaterial={setMaterial}
          onUpload={pickImage}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: { position: "absolute", top: 60, left: 20, right: 20 },
  fab: {
    position: "absolute",
    bottom: 130,
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 100,
  },
  fabCapture: {
    backgroundColor: "#FF4500",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  fabReset: {
    backgroundColor: "#222",
    borderColor: "#FF4500",
    borderWidth: 2,
  },
  insightCard: {
    position: "absolute",
    bottom: 140,
    left: 20,
    right: 20,
    backgroundColor: "rgba(15, 15, 15, 0.95)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 69, 0, 0.4)",
    shadowColor: "#FF4500",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  insightRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  insightTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  insightBody: {
    color: "#bbb",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 15,
  },
  statsRow: { flexDirection: "row", gap: 25 },
  statLabel: { color: "#777", fontSize: 12 },
  statVal: { color: "white", fontWeight: "bold" },
});
