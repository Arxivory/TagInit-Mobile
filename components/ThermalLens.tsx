import { CameraView } from "expo-camera";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

export const ThermalLens = () => {
  return (
    <View style={styles.container}>
      <View style={styles.cameraWrapper}>
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      </View>

      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="innerHeat" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor="#FF4D00" stopOpacity="0.7" />
            <Stop offset="1" stopColor="#FF4D00" stopOpacity="0" />
          </RadialGradient>

          <RadialGradient id="outerGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor="#FFAA00" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#0000FF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x="5%" y="15%" width="90%" height="60%" fill="url(#outerGlow)" />

        <Rect x="20%" y="25%" width="60%" height="40%" fill="url(#innerHeat)" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  cameraWrapper: {
    flex: 1,
    transform: [{ scale: 1.25 }],
  },
});
