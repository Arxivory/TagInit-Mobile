import { CameraView } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, FeGaussianBlur, Filter, G, Rect } from "react-native-svg";
import { THERMAL_THEME } from "../constants/theme";
import { getColorForTemp } from "../utils/InferenceEngine";

interface Props {
  heatmap?: number[][];
  cameraRef: React.RefObject<CameraView | null>;
  capturedImage?: string | null;
}

export const ThermalLens = ({ heatmap, cameraRef, capturedImage }: Props) => {
  const renderHeatmap = () => {
    if (!heatmap || heatmap.length === 0) return null;

    const rows = heatmap.length;
    const cols = heatmap[0].length;
    const cellW = 100 / cols;
    const cellH = 100 / rows;

    return (
      <>
        <Defs>
          <Filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
            <FeGaussianBlur in="SourceGraphic" stdDeviation="14" />
          </Filter>
        </Defs>

        <G filter="url(#blurFilter)">
          {heatmap.flatMap((row, i) =>
            row.map((temp, j) => (
              <Rect
                key={`thermal-${i}-${j}`}
                x={`${j * cellW}%`}
                y={`${i * cellH}%`}
                width={`${cellW}%`}
                height={`${cellH}%`}
                fill={getColorForTemp(temp)}
                opacity={0.6}
              />
            )),
          )}
        </G>
      </>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={styles.cameraWrapper}>
        {capturedImage ? (
          <Image
            source={{ uri: capturedImage }}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="back"
          />
        )}
      </View>

      <Svg height="100%" width="100%" style={styles.svgOverlay}>
        {renderHeatmap()}

        <G x="50%" y="50%">
          <Rect
            x="-10"
            y="-0.5"
            width="20"
            height="1"
            fill="white"
            opacity={0.6}
          />
          <Rect
            x="-0.5"
            y="-10"
            width="1"
            height="20"
            fill="white"
            opacity={0.6}
          />
        </G>
      </Svg>

      <View style={styles.legendContainer}>
        <Text style={styles.legendText}>55°C</Text>
        <LinearGradient
          colors={[THERMAL_THEME.accent, "#FFAA00", "#0000FF"]}
          style={styles.legendBar}
        />
        <Text style={styles.legendText}>30°C</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  svgOverlay: {
    position: "absolute",
    top: "15%",
    left: "5%",
    width: "90%",
    height: "60%",
  },
  cameraWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  legendContainer: {
    position: "absolute",
    right: 20,
    top: "20%",
    height: "50%",
    width: 40,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingVertical: 10,
    borderRadius: 20,
  },
  legendBar: {
    width: 8,
    flex: 1,
    marginVertical: 8,
    borderRadius: 4,
  },
  legendText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
