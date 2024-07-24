import { Camera } from 'expo-camera';
import React, { useState, useEffect, useRef} from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, SafeAreaView, ScrollView } from 'react-native';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
import { ExpoWebGLRenderingContext } from 'expo-gl';
import { CameraType } from 'expo-camera/build/Camera.types';

const AUTO_RENDER = true;

export default function App() {
  const cameraRef = useRef(null);
  const [tfReady, setTfReady] = useState(false);
  const [fps, setFps] = useState(0);
  const [cameraType, setCameraType] = useState<CameraType>(
    Camera.Constants.Type.front
  );
  // const [permission, requestPermission] = useCameraPermissions();
  const [logs, setLogs] = useState<string[]>([]);

  // tensor camera
  const TensorCamera = cameraWithTensors(Camera);

  useEffect(() => {
    addLog("No water detected");

    async function prepare(){
      // Camera permission
      await Camera.requestCameraPermissionsAsync();
      // Wait for tfjs to initialize the backend.
      await tf.ready();
       // Ready!
       setTfReady(true);
    }
  }, []);

  // if (!permission) {
  //   // Camera permissions are still loading.
  //   return <View />;
  // }

  // if (!permission.granted) {
  //   // Camera permissions are not granted yet.
  //   return (
  //     <View style={styles.container}>
  //       <Text style={styles.message}>We need your permission to show the camera</Text>
  //       <Button onPress={requestPermission} title="grant permission" />
  //     </View>
  //   );
  // }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Placeholder function for adding log entries
  function addLog(message: string) {
    setLogs(currentLogs => [...currentLogs, message]);
  }

  const handleCameraStream = async (
    images: IterableIterator<tf.Tensor3D>,
    updatePreview: () => void,
    gl: ExpoWebGLRenderingContext
  ) => {
    const loop = async () => {
      // Get the tensor and run pose detection.
      const imageTensor = images.next().value as tf.Tensor3D;
      addLog("No water detected");
    
    };

    loop();
  };

  // Inference
  async function performInference(imageBase64: string) {
      // ROBOFLOW API KEY AND MODEL
    const ROBOFLOW_API_KEY = "aAmRoIr6DYAhhaxWxTBV";
    const ROBOFLOW_MODEL = "YOUR_MODEL_NAME/VERSION";
    const ROBOFLOW_SIZE = 416;
    const ROBOFLOW_API_URL = `https://detect.roboflow.com/${ROBOFLOW_MODEL}?api_key=${ROBOFLOW_API_KEY}&name=image.jpg&size=${ROBOFLOW_SIZE}`;
    try {
      const response = await fetch(ROBOFLOW_API_URL, {
        method: 'POST',
        body: imageBase64,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Inference error:', error);
      return null;
    }
  }


  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Water Quality Detection</Text>
      </View>

      {/* Camera Feed */}
      <View style={styles.cameraContainer}>
        <TensorCamera
          // Standard Camera props
          style={styles.camera}
          facing={facing}
          // Tensor related props
          resizeHeight={200}
          resizeWidth={152}
          resizeDepth={3}
          onReady={handleCameraStream}
          autorender={true} useCustomShadersToResize={false} cameraTextureWidth={0} cameraTextureHeight={0}        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </TensorCamera>
        {/* <CameraView
          style={styles.camera}
          facing={facing}
          on
          
          >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView> */}
      </View>

      {/* Logging Text Field */}
      <View style={styles.logContainer}>
        <ScrollView>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  appBar: {
    backgroundColor: '#4a90e2',
    padding: 16,
    alignItems: 'center',
  },
  appBarTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  cameraContainer: {
    flex: 2,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  logContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  logText: {
    fontSize: 14,
    marginBottom: 4,
  },
});

