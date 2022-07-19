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
import * as posedetection from "@tensorflow-models/pose-detection";
import * as scatter from "scatter-gl";

import * as params from "./params";
import { isMobile } from "./util";

// These anchor points allow the pose pointcloud to resize according to its
// position in the input.
const ANCHOR_POINTS = [
  [0, 0, 0],
  [0, 1, 0],
  [-1, 0, 0],
  [-1, -1, 0],
];

// #ffffff - White
// #800000 - Maroon
// #469990 - Malachite
// #e6194b - Crimson
// #42d4f4 - Picton Blue
// #fabed4 - Cupid
// #aaffc3 - Mint Green
// #9a6324 - Kumera
// #000075 - Navy Blue
// #f58231 - Jaffa
// #4363d8 - Royal Blue
// #ffd8b1 - Caramel
// #dcbeff - Mauve
// #808000 - Olive
// #ffe119 - Candlelight
// #911eb4 - Seance
// #bfef45 - Inchworm
// #f032e6 - Razzle Dazzle Rose
// #3cb44b - Chateau Green
// #a9a9a9 - Silver Chalice
const COLOR_PALETTE = [
  "#ffffff",
  "#800000",
  "#469990",
  "#e6194b",
  "#42d4f4",
  "#fabed4",
  "#aaffc3",
  "#9a6324",
  "#000075",
  "#f58231",
  "#4363d8",
  "#ffd8b1",
  "#dcbeff",
  "#808000",
  "#ffe119",
  "#911eb4",
  "#bfef45",
  "#f032e6",
  "#3cb44b",
  "#a9a9a9",
];

export class Camera {
  constructor() {
    this.video = document.getElementById("video");
    this.canvas = document.getElementById("output");
    this.ctx = this.canvas.getContext("2d");
    this.scatterGLEl = document.querySelector("#scatter-gl-container");
    this.scatterGL = new scatter.ScatterGL(this.scatterGLEl, {
      rotateOnStart: true,
      selectEnabled: false,
      styles: { polyline: { defaultOpacity: 1, deselectedOpacity: 1 } },
    });
    this.scatterGLHasInitialized = false;
    this.redTomato = new Image(); // Image constructor
    this.redTomato.src =
      "https://uc2c5410c616c44bc9fb4291271b.previews.dropboxusercontent.com/p/thumb/ABm7Tgt4D4iLTPuvA29yXw_rCJ5aZilnfJ4mYgjJ2RzFTUQHxE4pV9DPVsUz9iXVDHoeWJWnWHjW1GzdYi3CqcsgwKAFobXXO8R0uH687pFZIN853ywmF7eciTZ4e5RMRmOASGB_VjNxJUuvcgXqXSFeq-d-5QGBBsxM7NWhzVxjHlAns0FvsuY6dUDE3lZD53pCEXR1VtkAisfNjFdnldXyoPtIw2U5XbZGi-Do6lCvlYAXe1JrhCb8EkRWg8btURts6LYmoOX7pO6hlKOjtOqRiETc9JfP7cLUpWvRUl6aTd_Sf6apvVcngDizBxY1fZpyUF31mZZwc0OLluH_HJsEb03AVd4T16wAC70KqQo3PcILk7hYrfkEJm_kztU1xxssbVRKYY5Ad_1clmFlVoDBHxqztYQsoLd4VrCfKJvpiQ/p.png";
    this.greenTomato = new Image(); // Image constructor
    this.greenTomato.src =
      "https://uc4cf3af0a5cd5c4221ea2b84a25.previews.dropboxusercontent.com/p/thumb/ABmZ1E-zfVZYS2qTvPRHmzEuogxzhFW_Y0vfys0Zv4muY59S14dSmtDv_8_3a8jOoos0lO1IpgBg5BSD0Hs26X_p4FS23f2Epv1ST2ipjCatkHC4aA6_xHY7Nlb64QWFIs-6jXqSdooL7Q5TkRVGiZpgD3ikoeQ6Tk5YYO9H5WnIHmhMl_r5AaUjGxqJVkAtBDr91JLCvwOwJ6smm4dO9eZ_3OSB3iPMhY-NtrpPYKKE9aHvTkIx_uz6ytagc2QcA7Mg2Van3i-6v5KjlkKzs4mzuBcBA4FTXaQbLO5qdL-QiMLALk8l30LtNiPtVbg38tmg5dNGlSHMfimmxn8D20hOHxDBQYEouWeyjPVZ4YhD6QLceEfpBPwRM69cjkYs-EUoCvJbpaqHIqXqq75TzQ6v1d3d-_YVPLS-4YZvrhlVKA/p.png";
    this.explodedTomato = new Image(); // Image constructor
    this.explodedTomato.src =
      "https://uc3e943e4f9f814655e32ee6122e.previews.dropboxusercontent.com/p/thumb/ABlGdeddDtS9UU2ba42ycjwIT0TVAXQ0EbTUne3OqmANo6QWM6LlcZ1o4_GVYRXSVaOICSPvZ28XJJms80dIDXevBa0y-r1Svhg0LXf9NNw2LggHY6tBwLwyHe-8tbqMEwLcz8SxfJjWuxb6wAftlKyOidv78nHihEeKYsQ8mENHu_pdM52hFBvsS2DoJCF15MXdyT2wpwK17qhDb01TNtjKfsy1-5-7ZXBVTo8QU4GZddQRhtecbxwdDCQf45yZeSTdXIFrBNls7nzPF7VhCWUd1kwB_wOEJxq-exIa_mZk0Xc3SUDj0LBHeMd_q4MVA_lYMJCxCDdFi1lPcYdcIxJnGkFDTVYD88y5aFxYJrRw55apRpi3yvEjbJbVpt-y9a61ni3sCE5RkfCAuvwPQjHSNBjbLC8fSyIPRGfb5GX5Zw/p.png";
    this.glove = new Image(); // Image constructor
    this.glove.src =
      "https://ucd4dac90a51e685033c57771cf2.previews.dropboxusercontent.com/p/thumb/ABkBrLkROTDchp4-yS5qZgh1BAc_b-XbQggLYmQWfZX8XjyXpX_EbfCJcchy5_TSZcp_r2hVarj-QdM1z-OR7PS4iKRLFzuiHx6LEAKKO7wvvuUfQ5WlPGrlK1DhcnnaEjGD5-ZEuhDJk-qtvr62v2rOIDVOU0lblgCyqbUQIJ2vNc4a6UzLsCLCjdGC1TV0A6pkaaWViK38MOWvEOHqLqPE0uX5sRN5qhSatg-zWK3NJJVxYPns09OKOkpvkng-sn_7raKKfn9vCB5L79Mm6e9c0EELJwIGphCEX1tWZcM55UDcRJuAZW_XmXhrmgQ8HAqEzxyASKtJdlunIU56MTroqJMgLgfk5MjTeYL-jmGgG95tYZEqIAMIv3tDCpgu8Z9EaL5Qxcf0lWjiSd5Xi9mG2wdfQ-jnbIRNQwpScL1amQ/p.png";
    this.knife = new Image(); // Image constructor
    this.knife.src =
      "https://uc357ab0f3e1f51096eddd8e48ed.previews.dropboxusercontent.com/p/thumb/ABkZfbo2oBLij8vHkHe9Ws-LUKmGaHP3u2-NUGyPKJElxeRml7-imddrHge0mc-zZPlrkKM-JdDkT3bptamAnGR4l_qmqV8WG4g8CyvZxlFpbq2kW0OV9XyM5-NS4TgsYH1oPLp6bW33VhATG0NNc9YffigeVOCHDWmkXBK0wknY7yHv11OUXNIgxZhNrXbAfUGVyRStoljn6xAAQ8kdqvwf_743v8XIBPyaEyJjVuo5FVZmAFf1JsVdwUgDxQ-LUkVVRF1uM9tX8bDqPadUusoWeosEQEEqoHHllRsGatC7N_x5iGeszXYurDfrcBzKMeNQvrSNYImvV55jrsGVNKUnH4HcABdZJUzmdwlmdfJRi3V7Wt5e6EicxzdWVE0l7QpZl-H69JzG1FOCWr6DShkM7ssQzlYBOhNhkxDqczQEfg/p.png";
    this.handsize = 80;
  }

  /**
   * Initiate a Camera instance and wait for the camera stream to be ready.
   * @param cameraParam From app `STATE.camera`.
   */
  static async setupCamera(cameraParam) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        "Browser API navigator.mediaDevices.getUserMedia not available"
      );
    }

    const { targetFPS, sizeOption } = cameraParam;
    const $size = params.VIDEO_SIZE[sizeOption];
    const videoConfig = {
      audio: false,
      video: {
        facingMode: "user",
        // Only setting the video to a specified size for large screen, on
        // mobile devices accept the default size.
        width: isMobile()
          ? params.VIDEO_SIZE["360 X 270"].width
          : params.VIDEO_WIDTH, //[added]
        height: isMobile()
          ? params.VIDEO_SIZE["360 X 270"].height
          : params.VIDEO_HEIGHT,
        frameRate: {
          ideal: targetFPS,
        },
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);

    const camera = new Camera();
    camera.video.srcObject = stream;

    await new Promise((resolve) => {
      camera.video.onloadedmetadata = () => {
        resolve(video);
      };
    });

    camera.video.play();

    const videoWidth = camera.video.videoWidth;
    const videoHeight = camera.video.videoHeight;
    // Must set below two lines, otherwise video element doesn't show.
    camera.video.width = videoWidth;
    camera.video.height = videoHeight;

    camera.canvas.width = videoWidth;
    camera.canvas.height = videoHeight;
    const canvasContainer = document.querySelector(".canvas-wrapper");
    canvasContainer.style = `width: ${videoWidth}px; height: ${videoHeight}px`;

    // Because the image from camera is mirrored, need to flip horizontally.
    camera.ctx.translate(camera.video.videoWidth, 0);
    camera.ctx.scale(-1, 1);

    camera.scatterGLEl.style = `width: ${videoWidth}px; height: ${videoHeight}px;`;
    camera.scatterGL.resize();

    camera.scatterGLEl.style.display = params.STATE.modelConfig.render3D
      ? "inline-block"
      : "none";

    return camera;
  }

  drawCtx() {
    this.ctx.drawImage(
      this.video,
      0,
      0,
      this.video.videoWidth,
      this.video.videoHeight
    );
  }

  clearCtx() {
    this.ctx.clearRect(0, 0, this.video.videoWidth, this.video.videoHeight);
  }

  /**
   * Draw the keypoints and skeleton on the video.
   * @param poses A list of poses to render.
   */
  drawResults(poses) {
    for (const pose of poses) {
      this.drawResult(pose);
    }
  }

  /**
   * Draw the keypoints and skeleton on the video.
   * @param pose A pose with keypoints to render.
   */
  drawResult(pose) {
    if (pose.keypoints != null) {
      this.drawKeypoints(pose.keypoints);
      this.drawSkeleton(pose.keypoints, pose.id);
    }
    if (pose.keypoints3D != null && params.STATE.modelConfig.render3D) {
      this.drawKeypoints3D(pose.keypoints3D);
    }
  }

  /**
   * Draw ball for right wrist on canvas
   */
  drawRightBall(xLocation, yLocation, radius) {
    // this.ctx.fillStyle = "Red";
    // this.ctx.strokeStyle = "White";
    // // this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

    // const circle = new Path2D();
    // circle.arc(xLocation, yLocation, radius * 2, 0, 2 * Math.PI);
    // this.ctx.fill(circle);
    // this.ctx.stroke(circle);
    this.ctx.drawImage(this.redTomato, xLocation, yLocation, radius, radius);
  }

  /**
   * Draw ball for left wrist on canvas
   */
  drawLeftBall(xLocation, yLocation, radius) {
    // this.ctx.fillStyle = "Blue";
    // this.ctx.strokeStyle = "White";
    // // this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

    // const circle2 = new Path2D();
    // circle2.arc(xLocation, yLocation, radius * 2, 0, 2 * Math.PI);
    // this.ctx.fill(circle2);
    // this.ctx.stroke(circle2);
    this.ctx.drawImage(this.greenTomato, xLocation, yLocation, radius, radius);
  }

  /**
   * Draw exploded ball on canvas
   */
  drawExplodedBall(xLocation, yLocation, radius) {
    // this.ctx.fillStyle = "Yellow";
    // this.ctx.strokeStyle = "White";
    // // this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

    // const circle2 = new Path2D();
    // circle2.arc(xLocation, yLocation, radius * 2, 0, 2 * Math.PI);
    // this.ctx.fill(circle2);
    // this.ctx.stroke(circle2);
    this.ctx.drawImage(
      this.explodedTomato,
      xLocation,
      yLocation,
      radius * 2,
      radius * 2
    );
  }

  /**
   * Draw exploded ball on canvas
   */
  drawLeftHand(xLocation, yLocation) {
    // this.ctx.fillStyle = "Blue";
    // this.ctx.strokeStyle = "White";
    // // this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

    // const circle3 = new Path2D();
    // circle3.arc(xLocation, yLocation, 5 * 2, 0, 2 * Math.PI);
    // this.ctx.fill(circle3);
    // this.ctx.stroke(circle3);
    this.ctx.drawImage(
      this.knife,
      xLocation,
      yLocation,
      this.handsize,
      this.handsize
    );
  }

  /**
   * Draw exploded ball on canvas
   */
  drawRightHand(xLocation, yLocation) {
    // this.ctx.fillStyle = "Red";
    // this.ctx.strokeStyle = "White";
    // // this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

    // const circle4 = new Path2D();
    // circle4.arc(xLocation, yLocation, 5 * 2, 0, 2 * Math.PI);
    // this.ctx.fill(circle4);
    // this.ctx.stroke(circle4);
    this.ctx.drawImage(
      this.glove,
      xLocation,
      yLocation,
      this.handsize,
      this.handsize
    );
  }

  /**
   * Draw the keypoints on the video.
   * @param keypoints A list of keypoints.
   */
  drawKeypoints(keypoints) {
    const keypointInd = posedetection.util.getKeypointIndexBySide(
      params.STATE.model
    );
    this.ctx.fillStyle = "Red";
    // this.ctx.strokeStyle = "White";
    this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

    for (const i of keypointInd.middle) {
      this.drawKeypoint(keypoints[i]);
    }

    this.ctx.fillStyle = "Green";
    for (const i of keypointInd.left) {
      this.drawKeypoint(keypoints[i]);
    }

    this.ctx.fillStyle = "Orange";
    for (const i of keypointInd.right) {
      this.drawKeypoint(keypoints[i]);
    }
  }

  drawKeypoint(keypoint) {
    // If score is null, just show the keypoint.
    const score = keypoint.score != null ? keypoint.score : 1;
    const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;

    if (score >= scoreThreshold) {
      const circle = new Path2D();
      circle.arc(keypoint.x, keypoint.y, params.DEFAULT_RADIUS, 0, 2 * Math.PI);
      this.ctx.fill(circle);
      this.ctx.stroke(circle);
    }
  }

  /**
   * Draw the skeleton of a body on the video.
   * @param keypoints A list of keypoints.
   */
  drawSkeleton(keypoints, poseId) {
    // Each poseId is mapped to a color in the color palette.
    const color =
      params.STATE.modelConfig.enableTracking && poseId != null
        ? COLOR_PALETTE[poseId % 20]
        : "White";
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

    posedetection.util
      .getAdjacentPairs(params.STATE.model)
      .forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];

        // If score is null, just show the keypoint.
        const score1 = kp1.score != null ? kp1.score : 1;
        const score2 = kp2.score != null ? kp2.score : 1;
        const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;

        if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
          this.ctx.beginPath();
          this.ctx.moveTo(kp1.x, kp1.y);
          this.ctx.lineTo(kp2.x, kp2.y);
          this.ctx.stroke();
        }
      });
  }

  drawKeypoints3D(keypoints) {
    const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;
    const pointsData = keypoints.map((keypoint) => [
      -keypoint.x,
      -keypoint.y,
      -keypoint.z,
    ]);

    const dataset = new scatter.ScatterGL.Dataset([
      ...pointsData,
      ...ANCHOR_POINTS,
    ]);

    const keypointInd = posedetection.util.getKeypointIndexBySide(
      params.STATE.model
    );
    this.scatterGL.setPointColorer((i) => {
      if (keypoints[i] == null || keypoints[i].score < scoreThreshold) {
        // hide anchor points and low-confident points.
        return "#ffffff";
      }
      if (i === 0) {
        return "#ff0000" /* Red */;
      }
      if (keypointInd.left.indexOf(i) > -1) {
        return "#00ff00" /* Green */;
      }
      if (keypointInd.right.indexOf(i) > -1) {
        return "#ffa500" /* Orange */;
      }
    });

    if (!this.scatterGLHasInitialized) {
      this.scatterGL.render(dataset);
    } else {
      this.scatterGL.updateDataset(dataset);
    }
    const connections = posedetection.util.getAdjacentPairs(params.STATE.model);
    const sequences = connections.map((pair) => ({ indices: pair }));
    this.scatterGL.setSequences(sequences);
    this.scatterGLHasInitialized = true;
  }
}
