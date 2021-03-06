/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import "@tensorflow/tfjs-backend-webgl";
import * as mpPose from "@mediapipe/pose";

import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
);

import * as posedetection from "@tensorflow-models/pose-detection";

import { Camera } from "./camera";
import { STATE, VIDEO_WIDTH, VIDEO_HEIGHT } from "./params";
import { setBackendAndEnvFlags } from "./util";

let detector, camera, stats;
let startInferenceTime,
  numInferences = 0;
let inferenceTimeSum = 0,
  lastPanelUpdate = 0;
let rafId;

let ballRightCaughtFlag = 1;
let ballLeftCaughtFlag = 1;
let xRightLocation; //initial location
let yRightLocation;
let xLeftLocation; //initial location
let yLeftLocation;
let radius = 10;

let numOfExplodedBall = 0;
let xLeftExploded1Location = 0; //initial location
let yLeftExploded1Location = 0;
let xLeftExploded2Location = 0; //initial location
let yLeftExploded2Location = 0;
let xLeftExploded3Location = 0; //initial location
let yLeftExploded3Location = 0;
let timeoutID;

async function createDetector() {
  switch (STATE.model) {
    case posedetection.SupportedModels.PoseNet:
      return posedetection.createDetector(STATE.model, {
        quantBytes: 4,
        architecture: "MobileNetV1",
        outputStride: 16,
        inputResolution: { width: 500, height: 500 },
        multiplier: 0.75,
      });
    case posedetection.SupportedModels.BlazePose:
      const runtime = STATE.backend.split("-")[0];
      if (runtime === "mediapipe") {
        return posedetection.createDetector(STATE.model, {
          runtime,
          modelType: STATE.modelConfig.type,
          solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`,
        });
      } else if (runtime === "tfjs") {
        return posedetection.createDetector(STATE.model, {
          runtime,
          modelType: STATE.modelConfig.type,
        });
      }
    case posedetection.SupportedModels.MoveNet:
      let modelType;
      if (STATE.modelConfig.type == "lightning") {
        modelType = posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING;
      } else if (STATE.modelConfig.type == "thunder") {
        modelType = posedetection.movenet.modelType.SINGLEPOSE_THUNDER;
      } else if (STATE.modelConfig.type == "multipose") {
        modelType = posedetection.movenet.modelType.MULTIPOSE_LIGHTNING;
      }
      const modelConfig = { modelType };

      if (STATE.modelConfig.customModel !== "") {
        modelConfig.modelUrl = STATE.modelConfig.customModel;
      }
      if (STATE.modelConfig.type === "multipose") {
        modelConfig.enableTracking = STATE.modelConfig.enableTracking;
      }
      return posedetection.createDetector(STATE.model, modelConfig);
  }
}

async function checkGuiUpdate() {
  if (STATE.isTargetFPSChanged || STATE.isSizeOptionChanged) {
    camera = await Camera.setupCamera(STATE.camera);
    STATE.isTargetFPSChanged = false;
    STATE.isSizeOptionChanged = false;
  }

  if (STATE.isModelChanged || STATE.isFlagChanged || STATE.isBackendChanged) {
    STATE.isModelChanged = true;

    window.cancelAnimationFrame(rafId);

    if (detector != null) {
      detector.dispose();
    }

    if (STATE.isFlagChanged || STATE.isBackendChanged) {
      await setBackendAndEnvFlags(STATE.flags, STATE.backend);
    }

    try {
      detector = await createDetector(STATE.model);
    } catch (error) {
      detector = null;
      alert(error);
    }

    STATE.isFlagChanged = false;
    STATE.isBackendChanged = false;
    STATE.isModelChanged = false;
  }
}

function beginEstimatePosesStats() {
  startInferenceTime = (performance || Date).now();
}

function endEstimatePosesStats() {
  const endInferenceTime = (performance || Date).now();
  inferenceTimeSum += endInferenceTime - startInferenceTime;
  ++numInferences;

  const panelUpdateMilliseconds = 1000;
  if (endInferenceTime - lastPanelUpdate >= panelUpdateMilliseconds) {
    const averageInferenceTime = inferenceTimeSum / numInferences;
    inferenceTimeSum = 0;
    numInferences = 0;
    lastPanelUpdate = endInferenceTime;
  }
}

async function renderResult() {
  if (camera.video.readyState < 2) {
    await new Promise((resolve) => {
      camera.video.onloadeddata = () => {
        resolve(video);
      };
    });
  }

  let poses = null;

  // Detector can be null if initialization failed (for example when loading
  // from a URL that does not exist).
  if (detector != null) {
    // FPS only counts the time it takes to finish estimatePoses.
    beginEstimatePosesStats();

    // Detectors can throw errors, for example when using custom URLs that
    // contain a model that doesn't provide the expected output.
    try {
      poses = await detector.estimatePoses(camera.video, {
        maxPoses: STATE.modelConfig.maxPoses,
        flipHorizontal: false,
      });
    } catch (error) {
      detector.dispose();
      detector = null;
      alert(error);
    }

    endEstimatePosesStats();
  }

  camera.drawCtx();

  let x_lWrist = -1;
  let y_lWrist = -1;
  let x_rWrist = -1;
  let y_rWrist = -1;

  // The null check makes sure the UI is not in the middle of changing to a
  // different model. If during model change, the result is from an old model,
  // which shouldn't be rendered.
  if (poses && poses.length > 0 && !STATE.isModelChanged) {
    camera.drawResults(poses);
    x_lWrist = poses[0].keypoints[9].x;
    y_lWrist = poses[0].keypoints[9].y;
    x_rWrist = poses[0].keypoints[10].x;
    y_rWrist = poses[0].keypoints[10].y;
  }

  //?????? ????????? location ??????
  //left
  if (ballLeftCaughtFlag == 1) {
    xLeftLocation = Math.random() * VIDEO_WIDTH;
    yLeftLocation = Math.random() * VIDEO_HEIGHT;

    timeoutID = setTimeout(setExplodedBall, 5000);
    ballLeftCaughtFlag = 0;
  }

  //right
  if (ballRightCaughtFlag == 1) {
    xRightLocation = Math.random() * VIDEO_WIDTH;
    yRightLocation = Math.random() * VIDEO_HEIGHT;

    ballRightCaughtFlag = 0;
  }

  if (numOfExplodedBall > 0) {
    camera.drawExplodedBall(
      xLeftExploded1Location,
      yLeftExploded1Location,
      radius
    );
    if (numOfExplodedBall > 1) {
      camera.drawExplodedBall(
        xLeftExploded2Location,
        yLeftExploded2Location,
        radius
      );
      if (numOfExplodedBall > 2) {
        camera.drawExplodedBall(
          xLeftExploded3Location,
          yLeftExploded3Location,
          radius
        );
      }
    }
  }

  //?????? ????????? ????????? ????????? ?????? ???????????? ?????? ??????.
  //left
  if (
    !ballInBoundary(x_lWrist, y_lWrist, xLeftLocation, yLeftLocation, radius)
  ) {
    camera.drawLeftBall(xLeftLocation, yLeftLocation, radius);
  } else {
    ballLeftCaughtFlag = 1;
    clearTimeout(timeoutID);
  }

  //?????? ????????? ????????? ????????? ?????? ???????????? ?????? ??????.
  //right
  if (
    !ballInBoundary(x_rWrist, y_rWrist, xRightLocation, yRightLocation, radius)
  ) {
    camera.drawRightBall(xRightLocation, yRightLocation, radius);
  } else {
    ballRightCaughtFlag = 1;
  }
}

function ballInBoundary(x_wrist, y_wrist, xLocation, yLocation, radius) {
  let xMin = xLocation - radius;
  let xMax = xLocation + radius;
  let yMin = yLocation - radius;
  let yMax = yLocation + radius;

  if (xMin < x_wrist && x_wrist < xMax && yMin < y_wrist && y_wrist < yMax)
    return true;
  return false;
}

function setExplodedBall() {
  console.log("setExplodedBall");
  if (numOfExplodedBall == 0) {
    camera.drawExplodedBall(xLeftLocation, yLeftLocation, radius);
    xLeftExploded1Location = xLeftLocation;
    yLeftExploded1Location = yLeftLocation;
    numOfExplodedBall++;
  } else if (numOfExplodedBall == 1) {
    camera.drawExplodedBall(xLeftLocation, yLeftLocation, radius);
    xLeftExploded2Location = xLeftLocation;
    yLeftExploded2Location = yLeftLocation;
    numOfExplodedBall++;
  } else if (numOfExplodedBall == 2) {
    camera.drawExplodedBall(xLeftLocation, yLeftLocation, radius);
    xLeftExploded3Location = xLeftLocation;
    yLeftExploded3Location = yLeftLocation;
    numOfExplodedBall++;
  }
  // explode ?????? ?????? ????????? ????????? ???????????? setTimeout ??????.
  ballLeftCaughtFlag = 1;
}

async function renderPrediction() {
  await checkGuiUpdate();

  if (!STATE.isModelChanged) {
    await renderResult();
  }

  rafId = requestAnimationFrame(renderPrediction);
}

async function app() {
  camera = await Camera.setupCamera(STATE.camera);

  await setBackendAndEnvFlags(STATE.flags, STATE.backend);

  detector = await createDetector();

  renderPrediction();

  // change the location of good tomato in 5sec
  setInterval(() => {
    xRightLocation = Math.random() * VIDEO_WIDTH;
    yRightLocation = Math.random() * VIDEO_HEIGHT;
  }, 5000);
}

app();
