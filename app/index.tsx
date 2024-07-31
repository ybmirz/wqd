import "react-native-reanimated";
import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, Text, View, Dimensions, ViewStyle, TextStyle, ScrollView, ImageBase } from "react-native";
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
import { Worklets, useSharedValue } from "react-native-worklets-core";
import SplashScreen from "react-native-splash-screen";

export default function App() {
  const device = useCameraDevice('back');
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [fps, setFps] = useState<number>(0);
  const [lastRunTime, setLastRunTime] = useState<number>(Date.now());
  const [detectionLog, setDetectionLog] = useState<string[]>([]);
  const [currentFrameBuffer, setCurrentFrame] = useState<ArrayBuffer>();
  const windowWidth = Dimensions.get("screen").width;
  const windowHeight = Dimensions.get("screen").height;
  

  const { hasPermission, requestPermission } = useCameraPermission()

  // Put the code in useEffect
  useEffect(() => {
    SplashScreen.hide();
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission])

  const generateRandomBox = useCallback((): Box => {
    console.log("Generating box")
    const x = Math.random() * windowWidth;
    const y = Math.random() * windowHeight;
    const width = Math.random() * (windowWidth / 4) + 50;
    const height = Math.random() * (windowHeight / 4) + 50;

    const classes = ["Water", "Trash", "Fish"];
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    
    return {
      x,
      y,
      width,
      height,
      class: randomClass,
      confidence: Math.random(),
      color: [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256)
      ]
    };
  }, [windowWidth, windowHeight]);

  // Worklet to run on Javascript
  const runJS = Worklets.createRunOnJS( (framedata:string)=>{
      // The initial tests 
      setFps((fps) => fps + 1)
      setBoxes((boxes) => [generateRandomBox()]);
      const currTime = Date.now();
      setLastRunTime((currentTime) => currTime);
      setDetectionLog(prevLog => {
                  const updatedLog = ["Current Frame: "+ framedata];
                  return updatedLog.slice(0, 5); // Keep only the last 5 entries
                });
      

      // The Roboflow Detect
      // try{
      //   roboflowDetect(frameBuffer).then(
      //     (detectedBoxes) => {
      //       // set the boxes with detected boxes
      //       setBoxes(detectedBoxes);
        
      //       // Add Detection Logs
      //       if (detectedBoxes.length > 0) {
      //         const newLogEntries = detectedBoxes.map(box => `Detected: ${box.class} (${Math.round(box.confidence * 100)}%)`);
      //         setDetectionLog(prevLog => {
      //           const updatedLog = [...newLogEntries, ...prevLog.filter(entry => entry !== "No water detected")];
      //           return updatedLog.slice(0, 5); // Keep only the last 5 entries
      //         });
      //       } else {
      //         setDetectionLog(prevLog => {
      //           if (!prevLog.includes("No water detected")) {
      //             return ["No water detected", ...prevLog].slice(0, 5);
      //           }
      //           return prevLog;
      //         });
      //       }
      //     }
      //   )
      // } catch(error) {
      //   console.error("Error in Processing Frame: ", error)
      // }
  })

  // Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
  
  const frameProcessor = useFrameProcessor((frame: Frame) => {
    "worklet";
    const buffer = frame.toArrayBuffer()
    const image = arrayBufferToBase64(buffer)
    const detectAndProcess = async () => {
      console.log("Processing frame" + fps); 
      runJS(image)
    };
    runAtTargetFps(10, detectAndProcess);
  },  [generateRandomBox, lastRunTime, fps, currentFrameBuffer]);

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
          {/* The Logging box */}
          <View style={styles.logContainer}>
            <ScrollView>
              {detectionLog.map((log, index) => (
                <Text key={index} style={styles.logText}>{log}</Text>
              ))}
            </ScrollView>
          </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 10,
    maxHeight: 150,
  },
  logText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
});