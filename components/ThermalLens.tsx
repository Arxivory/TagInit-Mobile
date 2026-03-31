import { CameraView } from "expo-camera";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, FeGaussianBlur, Filter, G, Rect } from "react-native-svg";
import { getColorForTemp } from "../utils/InferenceEngine";

interface Props {
  heatmap?: number[][];
  cameraRef: React.RefObject<CameraView | null>;
}

export const ThermalLens = ({ heatmap, cameraRef }: Props) => {
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
                strokeWidth={0}
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
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
        />
      </View>
      <Svg height="100%" width="100%" style={styles.svgOverlay}>
        {renderHeatmap()}
      </Svg>
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
  },
});
