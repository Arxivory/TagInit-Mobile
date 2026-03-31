import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { THERMAL_THEME } from "../constants/theme";

export const DataDrawer = ({
  onSnapshot,
  activeMaterial,
  setMaterial,
}: any) => {
  const materials = ["ASPHALT", "GI_SHEET", "VEGETATION"];

  return (
    <View style={styles.drawer}>
      <Text style={styles.title}>MATERIAL EMISSIVITY (ε)</Text>
      <View style={styles.buttonRow}>
        {materials.map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setMaterial(m)}
            style={[styles.chip, activeMaterial === m && styles.activeChip]}
          >
            <Text style={styles.chipText}>{m}</Text>
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
    backgroundColor: "#111",
    padding: 25,
    borderTopLeftRadius: 20,
  },
  title: {
    color: THERMAL_THEME.accent,
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  chip: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#333",
  },
  activeChip: { borderColor: THERMAL_THEME.accent, backgroundColor: "#331100" },
  chipText: { color: "#fff", fontSize: 10 },
  snapshotBtn: {
    backgroundColor: THERMAL_THEME.accent,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  snapshotText: { color: "#fff", fontWeight: "bold", letterSpacing: 1 },
});
