import bounceSoundData from "./bounce.base64";
import bounceSoundDown10Data from "./bounce.down10.base64";
import bounceSoundDown5Data from "./bounce.down5.base64";
import bounceSoundUp10Data from "./bounce.up10.base64";
import bounceSoundUp5Data from "./bounce.up5.base64";
import cheerSound1Data from "./cheer1.base64";
import cheerSound2Data from "./cheer2.base64";

const bounceSound = new Audio(bounceSoundData);
const bounceUp5Sound = new Audio(bounceSoundUp5Data);
const bounceUp10Sound = new Audio(bounceSoundUp10Data);
const bounceDown5Sound = new Audio(bounceSoundDown5Data);
const bounceDown10Sound = new Audio(bounceSoundDown10Data);

const cheerSound1 = new Audio(cheerSound1Data);
const cheerSound2 = new Audio(cheerSound2Data);

const cheerArray = [cheerSound1, cheerSound2];
const bounceArray = [bounceSound, bounceUp5Sound, bounceUp10Sound, bounceDown5Sound, bounceDown10Sound];

bounceArray.forEach((bounce: HTMLAudioElement) => {
  bounce.volume = 0.5;
});

export class AudioManager {

  constructor(private maxBallSpeed: number) {}

  public playCheer() {
    playRandomSound(cheerArray, 0.8);
  }

  public playBounce(ballSpeed: number) {
    playRandomSound(bounceArray, Math.max(ballSpeed / this.maxBallSpeed, 0.4));
  }
}

function playRandomSound(audioArray: HTMLAudioElement[], volume: number = 1) {
  const index = randInt(0, audioArray.length - 1);
  audioArray[index].volume = Math.min(volume, 1);
  audioArray[index].pause();
  audioArray[index].currentTime = 0;
  audioArray[index].play();
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
