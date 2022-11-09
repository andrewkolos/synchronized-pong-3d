# synchronized-pong-3d

Fun 3d pong game with xinput support.

![Game](https://i.imgur.com/RWVrfvU.png)

## Play locally vs the CPU

```
npm i
npm run build
npm start
```

Open a browser to localhost:8080.
Move your paddle with WASD and rotate it with Q/E. You can also use a gamepad, using the two control sticks.

## Simulate playing over a high-latency internet connection (janky/unfinished)

```
npm run build:network-demo
npm run start:network-demo
```

Control the other paddle with UHJK.
