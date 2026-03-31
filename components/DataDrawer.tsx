import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { THERMAL_THEME } from "../constants/theme";

export const DataDrawer = ({ activeMaterial, setMaterial, onUpload }: any) => {
  const materials = ["ASPHALT", "GI_SHEET", "VEGETATION"];

  return (
    <View style={styles.drawer}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>MATERIAL EMISSIVITY (ε)</Text>

        <TouchableOpacity style={styles.uploadBtn} onPress={onUpload}>
          <Ionicons
            name="image-outline"
            size={16}
            color={THERMAL_THEME.accent}
          />
          <Text style={styles.uploadText}>UPLOAD</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        {materials.map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setMaterial(m)}
            style={[styles.chip, activeMaterial === m && styles.activeChip]}
          >
            <Text style={styles.chipText}>{m.replace("_", " ")}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(18, 18, 18, 0.95)",
    padding: 25,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: THERMAL_THEME.accent,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 69, 0, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 69, 0, 0.3)",
  },
  uploadText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 6,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#333",
    minWidth: "30%",
    alignItems: "center",
  },
  activeChip: {
    borderColor: THERMAL_THEME.accent,
    backgroundColor: "rgba(255, 69, 0, 0.15)",
  },
  chipText: { color: "#fff", fontSize: 11, fontWeight: "500" },
});
