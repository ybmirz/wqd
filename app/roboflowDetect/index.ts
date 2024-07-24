import { Frame } from 'react-native-vision-camera';
import axios from 'axios';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
  color: [number, number, number];
}

const API_KEY = "aAmRoIr6DYAhhaxWxTBV";
const MODEL_ID = "water-quality-prediction";
const MODEL_VERSION = "1";
const API_URL = `https://detect.roboflow.com/${MODEL_ID}/${MODEL_VERSION}`;

const roboflowDetect = async (frame: Frame): Promise<[Box[], number, number]> => {
  try {
    // Assuming frame.data is already in a format we can use (like base64)
    // const imageData = frame.data;

    const response = await axios.post(API_URL, frame, {
      params: { api_key: API_KEY },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const boxes: Box[] = response.data.predictions.map((pred: { x: any; y: any; width: any; height: any; class: any; confidence: any; }) => ({
      x: pred.x,
      y: pred.y,
      width: pred.width,
      height: pred.height,
      class: pred.class,
      confidence: pred.confidence,
      color: [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256)
      ]
    }));

    return [boxes, frame.width, frame.height];
  } catch (error) {
    console.error('Error in Roboflow detection:', error);
    return [[], frame.width, frame.height];
  }
};

export default roboflowDetect;
export type { Box };