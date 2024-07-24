import "react-native-reanimated";
import React, { useState } from "react";
import { StyleSheet, Text, View, Dimensions, ViewStyle, TextStyle } from "react-native";
import {
  Camera,
  useFrameProcessor,
  Frame,
  useCameraPermission,
  useCameraDevice,
  runAtTargetFps,
} from "react-native-vision-camera";
import roboflowDetect, {Box} from "./roboflowDetect";
import { runOnJS } from "react-native-reanimated";

export default function App() {
  const device = useCameraDevice('back');
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [fps, setFps] = useState<number>(0);
  const windowWidth = Dimensions.get("screen").width;
  const windowHeight = Dimensions.get("screen").height;
  let lastRunTime = Date.now();

  const { hasPermission, requestPermission } = useCameraPermission()

  const updateBboxes = (bs: Box[]) => {
    setFps(1 / ((Date.now() - lastRunTime) / 1000));
    setBoxes(bs);
    lastRunTime = Date.now();
  };

  const frameProcessor = useFrameProcessor((frame: Frame) => {
    "worklet";
    
    const detectAndProcess = async () => {
      console.log("Processing frame");
      // const [boxes, width, height] = await roboflowDetect(frame);
      
      // const processedBoxes: Box[] = boxes.slice(0, 1).map((box) => {
      //   const xCrop = width * (windowHeight / height);
      //   const cropAdjustment = (xCrop - windowWidth) / 2;
        
      //   return {
      //     ...box,
      //     x: box.x * (windowHeight / height) - cropAdjustment,
      //     y: box.y * (windowHeight / height),
      //     width: box.width * (windowHeight / height),
      //     height: box.height * (windowHeight / height)
      //   };
      // });
  
      // runOnJS(updateBboxes)(processedBoxes);
      // console.log(`Detections in Frame: ${JSON.stringify(processedBoxes)}`);
    };

    runAtTargetFps(10, detectAndProcess);
  }, []);

  if (device == null || !hasPermission) return <Text>Hello World</Text>;

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={StyleSheet.absoluteFill}
        frameProcessor={frameProcessor}
        device={device}
        isActive={true}
      />
      <View style={StyleSheet.absoluteFill as ViewStyle}>
          {boxes != undefined &&
            boxes.length > 0 &&
            boxes.map((box, index) => (
              <View
                key={index}
                style={{
                  borderColor: `rgb(${box.color[0]},${box.color[1]},${box.color[2]})`,
                  borderWidth: 2,
                  borderStyle: "solid",
                  width: box.width,
                  height: box.height,
                  left: box.x - box.width / 2,
                  top: box.y - box.height / 2,
                  backgroundColor: "rgba(255, 255, 255, 0)",
                  position: "absolute",
                  zIndex: 10,
                } as ViewStyle}
              >
                <Text
                  style={{
                    color: `rgb(${box.color[0]},${box.color[1]},${box.color[2]})`,
                  } as TextStyle}
                >
                  {box.class} {Math.round(box.confidence * 100) / 100}
                </Text>
              </View>
            ))}
          <Text style={{ marginTop: 60, marginLeft: 16 } as TextStyle}>
            FPS: {Math.round(fps)}
          </Text>
        </View>
    </View>
  );
}