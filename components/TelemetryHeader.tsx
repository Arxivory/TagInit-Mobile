import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { THERMAL_THEME } from "../constants/theme";

interface TelemetryProps {
  district: string;
  temp: string;
  wbgt: string;
}

export const TelemetryHeader = ({ district, temp, wbgt }: TelemetryProps) => (
  <View style={styles.container}>
    <Text style={styles.label}>LOCATION: {district.toUpperCase()}</Text>
    <View style={styles.dataRow}>
      <View>
        <Text style={styles.subLabel}>SURFACE</Text>
        <Text style={styles.temp}>{temp}°C</Text>
      </View>
      <View style={styles.divider} />
      <View>
        <Text style={styles.subLabel}>WBGT INDEX</Text>
        <Text style={styles.wbgt}>{wbgt}°C</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  label: { color: "#999", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  dataRow: { flexDirection: "row", marginTop: 10, alignItems: "center" },
  subLabel: { color: "#666", fontSize: 9, fontWeight: "700" },
  temp: { color: "#FFF", fontSize: 24, fontWeight: "700" },
  wbgt: { color: THERMAL_THEME.accent, fontSize: 24, fontWeight: "700" },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#333",
    marginHorizontal: 20,
  },
});
