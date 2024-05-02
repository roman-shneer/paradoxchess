import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "GLTFLoader";
import { FontLoader } from "FontLoader";

//define(['three'], function (THREE) {

function resizeRendererToDisplaySize(renderer) {
  const canvas = window.renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;

  if (needResize) {
    window.renderer.setSize(width, height, false);
  }
  return needResize;
}

function requestRenderIfNotRequested() {
  if (typeof renderRequested == "undefined") {
    var renderRequested = true;
    window.renderer.setAnimationLoop(GAME.render);
  }
}

function onTouchDown() {
  this.mouse.x =
    (this.touch_position.clientX / window.renderer.domElement.clientWidth) * 2 -
    1;
  this.mouse.y =
    -(this.touch_position.clientY / window.renderer.domElement.clientHeight) *
      2 +
    1;
  GAME.raycaster.setFromCamera(this.mouse, GAME.camera);

  var intersects = GAME.raycaster.intersectObjects(this.scene.children, true);

  for (var i in intersects) {
    if (
      intersects[i].object.type == "Mesh" ||
      intersects[i].object.type == "Scene"
    ) {
      if (typeof intersects[i].object.callback == "function") {
        intersects[i].object.callback(intersects[i].object);
        break;
      }
    }
  }
}

function onDocumentMouseDown(event) {
  if (event.target.id != "canvas") return;
  event.preventDefault();
  //GAME.stop_rotation();
  GAME.mouse.x =
    (event.clientX / window.renderer.domElement.clientWidth) * 2 - 1;
  GAME.mouse.y =
    -(event.clientY / window.renderer.domElement.clientHeight) * 2 + 1;
  GAME.raycaster.setFromCamera(GAME.mouse, GAME.camera);

  var intersects = GAME.raycaster.intersectObjects(GAME.scene.children, true);

  for (var i in intersects) {
    if (
      intersects[i].object.type == "Mesh" ||
      intersects[i].object.type == "Scene"
    ) {
      if (typeof intersects[i].object.callback == "function") {
        intersects[i].object.callback(intersects[i].object);
        break;
      }
    }
  }
}

function threeRenderMain() {
  for (let a in GAME.animationsObjects) {
    let mesh = GAME.animationsObjects[a];
    if (mesh.userData.clock && mesh.userData.mixer) {
      mesh.userData.mixer.update(mesh.userData.clock.getDelta());
      if (mesh.animationAction.isRunning() == false) {
        delete GAME.animationsObjects[a];
        mesh.end_callback(mesh);
      }
    }
  }
}

function animateMain() {
  requestAnimationFrame(animateMain);
  threeRenderMain();
}
var GAME;
class ParadoxChess {
  active_status = true;
  linesByCube = {};
  touch_status = null;
  models = [];
  userOptions = null;
  userId = null;
  tour = null;
  avatar = null;
  figure_models = {
    king: {
      rotation: [0, 0, 0],
      path: "/models/chess_piece_king/scene.gltf",
      scale: 0.0025,
      pos: [0, 0.5, 0],
    },
    pawn: {
      rotation: [0, 0, 0],
      path: "/models/chess_pawn/scene.gltf",
      scale: 0.15,
      pos: [0, 0.5, 0],
    },
    elephant: {
      rotation: [0, 0, 0],
      path: "/models/elephant/scene.gltf",
      scale: 0.11,
      pos: [0, 0.5, 0],
    },
    queen: {
      rotation: [0, 0, 0],
      path: "/models/queen_chess/scene.gltf",
      scale: 1.6,
      pos: [0, 0.5, 0],
    },
    knight: {
      rotation: [0, -1.6, 0],
      path: "/models/peter_ganine_classic_knight/scene.gltf",
      scale: 0.015,
      pos: [0, 0.5, 0],
    },
    castle: {
      rotation: [0, 0, 0],
      path: "/models/castle/scene.gltf",
      scale: 0.0075,
      pos: [0, 0.45, 0],
    },
  };

  constructor() {
    this.animationsObjects = [];
    GAME = this;
    this.initHandlers();
  }

  initHandlers() {
    document.addEventListener("send2game", (e) => {
      this[e.detail.name](e.detail);
    });
  }

  init(args) {
    const info = args.info;
    this.models = args.models;
    this.users = args.users;
    this.userId = args.userId;
    this.markers = [];

    new FontLoader().load("/fonts/helvetiker_regular.typeface.json", (font) => {
      this.font = font;
      this.draw_world(args);
      this.draw_map();
      this.draw_info({ message: info, color: "#FF0000" });
      this.switchTourHandle();
    });
  }

  draw_world(args) {
    const cube_size = args.cube_size;
    const world = args.world;
    window.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      physicallyCorrectLights: true,
      preserveDrawingBuffer: true,
    });

    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 25;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    switch (parseInt(cube_size)) {
      case 4:
      case 5:
        this.corrector = -2.5;
        this.realCubeSize = 4;
        break;
      case 6:
        this.corrector = -3.5;
        this.realCubeSize = 6;
        break;
    }

    this.controls = new OrbitControls(this.camera, args.canvas);

    this.controls.maxDistance = 13;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    this.scene = new THREE.Scene();
    this.scene.add(this.camera);
    this.scene.background = new THREE.Color("black");
    this.scene.position.set(0, 0, 0);

    this.camera.lookAt(this.scene.position); // the origin

    this.addLight(-1, 2, 4);
    this.addLight(1, -1, -2);
    if (["4", "41", "42"].includes(cube_size) == false) {
      this.addLight(-4, -4, 4);
      this.addLight(4, -4, -4);
    }

    {
      var material = new THREE.LineBasicMaterial({
        color: args.lineColor,
        opacity: 0.2,
        transparent: true,
        linewidth: 1,
      });
      var world_expected = {};
      for (let x = 1; x < 7; x++)
        for (let y = 1; y < 7; y++)
          for (let z = 1; z < 7; z++) world_expected[x + ":" + y + ":" + z] = 0;
      for (let w in world) {
        delete world_expected[world[w]];
        this.dcube(world[w], material);
      }
    }

    this.create_users(args.userId, args.users);
    this.render();
    requestRenderIfNotRequested();
    this.controls.addEventListener("change", requestRenderIfNotRequested);
    window.addEventListener("resize", requestRenderIfNotRequested);
    window.addEventListener("click", onDocumentMouseDown, false);

    var el = document.getElementById("canvas");
    el.addEventListener(
      "touchstart",
      (event) => {
        this.touch_status = 1;
        this.touch_position = event.touches[0];
      },
      false
    );
    el.addEventListener(
      "touchend",
      (event) => {
        this.touch_status = 0;

        if (this.touch_status != 2) onTouchDown(event);
      },
      false
    );
    el.addEventListener(
      "touchmove",
      () => {
        this.touch_status = 2;
      },
      false
    );
  }

  debug(data) {
    this.send2({ action: "debug", data: data });
  }

  draw_map() {
    var models = this.models;
    for (var id in models) {
      if (models[id].cube_number != 0) {
        this.load_figure(
          id,
          models[id].figure,
          models[id].cube_number,
          this.getUserColor(models[id].uid),
          models[id].dir
        );
      }
    }

    this.camera.position.set(0, 0, this.realCubeSize * 1.5);
    //
    this.camera.updateProjectionMatrix();
  }

  recenterMap(world) {
    let allCoords = [[], [], []];
    for (let w in world) {
      let cube = world[w].split(":");
      for (let i = 0; i < 3; i++) {
        allCoords[i].push(cube[i]);
      }
    }
    let cameraPos = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      let d = Math.max(...allCoords[i]) - Math.min(...allCoords[i]);
      cameraPos[i] = d;
    }

    this.camera.position.set(cameraPos[0], cameraPos[1], cameraPos[2]);
    this.camera.updateProjectionMatrix();
  }

  mark_slave(color, cube_number) {
    var coord = cube_number.split(":");
    color = new THREE.Color(color);
    const material = new THREE.MeshBasicMaterial({
      color,
      opacity: 0.2,
      fog: true,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    //this.scene.add(cube);
    this.scene.add(cube);
    for (var i = 0; i < 3; i++) {
      coord[i] = Number(coord[i]) + this.corrector;
    }
    cube.position.set(coord[0], coord[1], coord[2]);
    return cube;
  }

  select_green_slave(args) {
    const cube_number = args.cube_number;
    this.clearMarkedCubes(); //deactivate all markers
    this.showUnselect();

    if (this.userId == this.tour) {
      this.markers.push(this.mark("green", cube_number, 2));
    } else {
      this.markers.push(this.mark_slave("green", cube_number));
    }
    this.refresh();

    if (typeof args.callback == "function") {
      args.callback();
    }
  }

  reload_figures(args) {
    const data = args.data;
    for (var m in data.map.models) {
      if (data.map.models[m].cube_number != this.models[m].cube_number) {
        if (data.map.models[m].cube_number != 0)
          this.load_figure(
            m,
            data.map.models[m].figure,
            data.map.models[m].cube_number,
            this.getUserColor(data.map.models[m].uid),
            data.map.models[m].dir
          );
      }
    }
    this.refresh();
  }

  select_figure_and_mark(args) {
    const markers = args.markers;
    const callback = args.callback;
    this.clearMarkedCubes();

    this.showUnselect();
    for (var m in markers) {
      if (markers[m].color == "blue") {
        this.active_cube = markers[m].cube_number;
      }
      if (this.tour == this.userId) {
        this.markers.push(
          this.mark(markers[m].color, markers[m].cube_number, markers[m].flag)
        );
      } else {
        this.markers.push(
          this.mark_slave(markers[m].color, markers[m].cube_number)
        );
      }
    }

    this.refresh();
    if (typeof callback == "function") callback();
  }

  getModel(it, what) {
    const models = this.models;
    for (var m in models) {
      if (what == "cube" && it == models[m].cube_number) {
        return models[m];
      }
      if (what == "id" && it == models[m].id) {
        return models[m];
      }
    }
    return null;
  }

  move_figure(args) {
    const data = args.data;
    var from_model = this.getModel(data.active_model, "id");
    if (from_model == null) return;
    var to_model = this.getModel(data.kill_model, "id");

    this.write_to_log({
      from_uid: from_model.uid,
      from_figure: from_model.figure,
      from_color: this.getUserColor(from_model.uid),
      from: data.from,
      to: data.to,
      to_uid: to_model != null ? to_model.uid : null,
      to_figure: to_model != null ? to_model.figure : null,
      to_color: to_model != null ? this.getUserColor(to_model.uid) : null,
    });
    this.animate_move(from_model, to_model, {
      from: data.from.split(":"),
      to: data.to.split(":"),
    });

    this.refresh();
  }

  draw_line(material, x1, y1, z1, x2, y2, z2) {
    x1 += this.corrector - 0.5;
    y1 += this.corrector - 0.5;
    z1 += this.corrector - 0.5;
    x2 += this.corrector - 0.5;
    y2 += this.corrector - 0.5;
    z2 += this.corrector - 0.5;

    var geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([x1, y1, z1, x2, y2, z2]);
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    var line = new THREE.Line(geometry, material);
    line.v1 = [x1, y1, z1];
    line.v2 = [x2, y2, z2];
    return line;
  }

  rand(num) {
    return (Math.random() > 0.5 ? -1 : 1) * num;
  }

  flyCube(args) {
    const cube = args.cube;
    for (let c in this.linesByCube[cube]) {
      let line = this.linesByCube[cube][c];
      let track = new THREE.VectorKeyframeTrack(
        ".position",
        [0, 40],
        [
          line.position.x,
          line.position.y,
          line.position.z,
          line.position.x,
          line.position.y - 100,
          line.position.z,
        ]
      );

      let pos = [0, 0, 0];
      if (Math.random() > 0.5) pos[0] = Math.random() > 0.5 ? 1 : -1;

      pos[1] = -1;
      if (Math.random() > 0.5) pos[2] = Math.random() > 0.5 ? 1 : -1;

      const vector = new THREE.Vector3(pos[0], pos[1], pos[2]);
      var qInitial = new THREE.Quaternion().setFromAxisAngle(vector, 0);

      var qFinal = new THREE.Quaternion().setFromAxisAngle(vector, Math.PI);
      var qFinal2 = new THREE.Quaternion().setFromAxisAngle(
        vector,
        Math.PI * 2
      );
      var quaternionKF = new THREE.QuaternionKeyframeTrack(
        ".quaternion",
        [0, 15, 30],
        [
          qInitial.x,
          qInitial.y,
          qInitial.z,
          qInitial.w,
          qFinal.x,
          qFinal.y,
          qFinal.z,
          qFinal.w,
          qFinal2.x,
          qFinal2.y,
          qFinal2.z,
          qFinal2.w,
        ]
      );

      this.animateSingular(line, [track, quaternionKF], 45, (line) => {
        this.scene.remove(line);
      });
    }
  }

  addLine(cube, line) {
    this.linesByCube[cube].push(line);
    this.scene.add(line);
  }

  dcube(cube, material) {
    let arg = cube.split(":");
    var x = parseInt(arg[0]);
    var y = parseInt(arg[1]);
    var z = parseInt(arg[2]);

    if (typeof this.linesByCube[cube] == "undefined") {
      this.linesByCube[cube] = [];
    }

    this.addLine(cube, this.draw_line(material, x, y, z, x + 1, y, z));
    this.addLine(cube, this.draw_line(material, x, y, z, x, y + 1, z));
    this.addLine(cube, this.draw_line(material, x, y + 1, z, x + 1, y + 1, z));
    this.addLine(cube, this.draw_line(material, x + 1, y, z, x + 1, y + 1, z));
    this.addLine(cube, this.draw_line(material, x, y, z, x, y, z + 1));

    this.addLine(cube, this.draw_line(material, x, y, z + 1, x + 1, y, z + 1));
    this.addLine(cube, this.draw_line(material, x, y, z + 1, x, y + 1, z + 1));
    this.addLine(
      cube,
      this.draw_line(material, x, y + 1, z + 1, x + 1, y + 1, z + 1)
    );
    this.addLine(
      cube,
      this.draw_line(material, x + 1, y, z + 1, x + 1, y + 1, z + 1)
    );
    this.addLine(cube, this.draw_line(material, x + 1, y, z, x + 1, y, z + 1));
    this.addLine(
      cube,
      this.draw_line(material, x + 1, y + 1, z, x + 1, y + 1, z + 1)
    );
    this.addLine(cube, this.draw_line(material, x, y + 1, z, x, y + 1, z + 1));
  }

  load_figure(id, figure, cube_number, color, dir) {
    var rotation = [...this.figure_models[figure].rotation];
    var pos = [...this.figure_models[figure].pos];
    if (dir == 1) {
      if (figure == "king") {
        rotation[1] = 3.3;
      }
      if (figure == "elephant") {
        rotation[1] = 3.3;
      }
      if (figure == "knight") {
        rotation[1] = 1.6;
      }
    }
    color = new THREE.Color(color);
    var coord = cube_number.split(":");
    var loader = new GLTFLoader();

    loader.load(
      this.figure_models[figure].path,
      (gltf) => {
        var cube = gltf.scene;

        cube.traverse((o) => {
          if (o.isMesh) {
            o.material.color = color;
            o.material.opacity = 0.4;
            o.callback = () => {
              this.figure_clicked(o.cube_id, o.cube_number); //send to normal UI
            };
            o.cube_number = cube_number;
            o.cube_id = id;
          }
        });
        cube.matrixAutoUpdate = true;
        cube.cube_number = cube_number;
        cube.cube_id = id;
        cube.figure = figure;
        cube.scale.set(
          this.figure_models[figure].scale,
          this.figure_models[figure].scale,
          this.figure_models[figure].scale
        );
        for (var i = 0; i < 3; i++) {
          coord[i] = coord[i] - pos[i] + this.corrector;
        }
        cube.position.set(coord[0], coord[1], coord[2]);
        cube.rotation.set(rotation[0], rotation[1], rotation[2]);

        this.scene.add(cube);
        this.models[id].model = cube;

        this.refresh();
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }

  animateSingular(mesh, tracks, duration, end_callback) {
    mesh.userData.mixer = new THREE.AnimationMixer(mesh);
    const animationClip = new THREE.AnimationClip(null, duration, tracks);
    mesh.animationAction = mesh.userData.mixer.clipAction(animationClip);
    mesh.animationAction.setLoop(THREE.LoopOnce);
    mesh.animationAction.clampWhenFinished = true;
    mesh.animationAction.play();

    mesh.userData.clock = new THREE.Clock();
    mesh.end_callback = end_callback;

    this.animationsObjects.push(mesh);

    if (typeof this.animateMainOnce == "undefined") {
      this.animateMainOnce = true;
      animateMain();
    }
  }

  attack(to_model) {
    to_model.cube_number = 0;
    to_model.model.traverse((o) => {
      if (o.isMesh) {
        o.cube_number = 0;
      }
    });
    var mesh = to_model.model;
    let track = new THREE.VectorKeyframeTrack(
      ".position",
      [0, 100],
      [
        mesh.position.x,
        mesh.position.y,
        mesh.position.z,
        mesh.position.x,
        mesh.position.y - 270,
        mesh.position.z,
      ]
    );

    var xAxis = new THREE.Vector3(1, 0, 0);
    var qInitial = new THREE.Quaternion().setFromAxisAngle(xAxis, 0);
    var qFinal = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI);
    var qFinal2 = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI * 2);
    var quaternionKF = new THREE.QuaternionKeyframeTrack(
      ".quaternion",
      [0, 6, 12],
      [
        qInitial.x,
        qInitial.y,
        qInitial.z,
        qInitial.w,
        qFinal.x,
        qFinal.y,
        qFinal.z,
        qFinal.w,
        qFinal2.x,
        qFinal2.y,
        qFinal2.z,
        qFinal2.w,
      ]
    );

    this.animateSingular(mesh, [track, quaternionKF], 1000, () => {
      this.scene.remove(to_model.model);
    });
  }

  animate_move(from_model, to_model, args) {
    var from = args.from;
    var to = args.to;

    var figure = this.figure_models[from_model.figure];
    for (var i = 0; i < 3; i++) {
      to[i] = parseInt(to[i]) - figure.pos[i] + this.corrector;
      from[i] = parseInt(from[i]) - figure.pos[i] + this.corrector;
    }
    var mesh = from_model.model;
    let track = new THREE.VectorKeyframeTrack(
      ".position",
      [0, 0.8],
      [from[0], from[1], from[2], to[0], to[1], to[2]]
    );
    mesh.afterData = { to: to, from: from, from_model: from_model };
    if (typeof to_model != "undefined" && to_model != null) {
      mesh.afterData["to_model"] = to_model;
    }
    this.animateSingular(mesh, [track], 1, () => {
      //stop animation bof
      let data = mesh.afterData;
      data.from_model.cube_number = data.to.join(":");
      mesh.traverse((o) => {
        if (o.isMesh) {
          o.cube_number = data.to.join(":");
        }
      });
      this.clearMarkedCubes();
      this.switchTourHandle();
      if (typeof data.to_model != "undefined" && data.to_model != null) {
        this.attack(data.to_model);
      }
    });
  }

  showUnselect() {
    this.send2ui({
      name: "game_menu",
      method: "updateUnselectShow",
      value: 1,
    });
  }
  hideUnselect() {
    this.send2ui({
      name: "game_menu",
      method: "updateUnselectShow",
      value: 0,
    });
  }

  clearMarkedCubes(callback) {
    this.hideUnselect();

    for (let m in this.markers) this.scene.remove(this.markers[m]);

    this.refresh();
    if (typeof callback == "function") callback();
  }

  refresh() {
    if (typeof window.renderer != "undefined") {
      window.renderer.render(this.scene, this.camera);
    } else this.camera.updateProjectionMatrix();
  }

  render() {
    var renderRequested = undefined;
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }

    window.renderer.render(GAME.scene, GAME.camera);
  }

  addLight(...pos) {
    const color = 0xffffff;
    const intensity = 0.6;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(...pos);
    if (this.lights == undefined) this.lights = [];
    this.lights.push(light);
    this.camera.add(light);
  }

  //////MAIN FUNC

  send2(data) {
    document.dispatchEvent(
      new CustomEvent("send2", {
        detail: data,
        bubbles: true,
        cancelable: false,
      })
    );
  }

  send2ui(data) {
    document.dispatchEvent(
      new CustomEvent("send2ui", {
        detail: data,
        bubbles: true,
        cancelable: false,
      })
    );
  }

  /////////UI?////////////
  select_figure(cube_id) {
    var models = this.models;

    if (this.userId != this.tour) {
      console.log("Wait your tour");
      return;
    }

    if (
      typeof models[cube_id] != "undefined" &&
      models[cube_id].uid == this.userId
    ) {
      this.showUnselect();

      this.send2({ action: "select_figure", model_id: cube_id });
    } else {
      console.log("not found in map", cube_id, models[cube_id], this.userId);
    }
  }
  mark_white_space(color, cube_number) {
    color = new THREE.Color(color);
    const material = new THREE.MeshBasicMaterial({
      color,
      opacity: 1,
      fog: true,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    this.scene.add(cube);
    let coord = cube_number.split(":");
    for (let c in coord) {
      coord[c] = Number(coord[c]) + this.corrector;
    }
    cube.position.set(coord[0], coord[1], coord[2]);
    return cube;
  }

  callbackSelectGreen(cube_number) {
    this.clearMarkedCubes(); //deactivate all markers
    this.send2({ action: "select_green", cube_number: cube_number });
    this.send2ui({
      name: "WaitingClock",
      method: "hide",
    });
    this.showUnselect();
  }

  mark(color, cube_number, flag) {
    color = new THREE.Color(color);
    const material = new THREE.MeshBasicMaterial({
      color,
      opacity: 0.2,
      fog: true,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    cube.matrixAutoUpdate = true;
    cube.cube_number = cube_number;
    //selected yellow sector - sector start be green

    if (flag == 1) {
      cube.callback = (a) => {
        this.callbackSelectGreen(a.cube_number);
      };
    }
    //clicked green sector - action start
    if (flag == 2)
      cube.callback = (a) => {
        this.send2({ action: "move", action_cube: a.cube_number });
      };
    //this.scene.add(cube);
    this.scene.add(cube);
    var coord = cube_number.split(":");

    for (var i = 0; i < 3; i++) {
      coord[i] = Number(coord[i]) + this.corrector;
    }
    cube.position.set(coord[0], coord[1], coord[2]);

    if (color == "blue") {
      this.object_light = new THREE.PointLight(0xffffff, 3, 3, 3, 2);
      this.object_light.matrixAutoUpdate = true;
      this.scene.add(this.object_light);
      this.object_light.position.set(coord[0] - 2, coord[1] - 2, coord[2] - 2);
    }
    return cube;
  }

  write_to_log(args) {
    this.send2ui({
      name: "Log",
      method: "add",
      value: args,
    });
  }

  figure_clicked(cube_id, cube_number) {
    var model = this.getModel(cube_number, "cube");
    if (typeof model != "undefined" && model.cube_number != 0) {
      this.select_figure(cube_id);
    }
  }

  draw_info(args) {
    const message = args.message;
    const color = args.color;
    if (typeof message == "undefined") return null;
    if (message.length == 0) return null;

    if (typeof this.info != "undefined") {
      if (this.info.myMessage == message) return null;
      else {
        this.camera.remove(this.info);
        delete this.info;
      }
    }

    this.info = this.get_text(message, 0.3, 0.5, color, 0.5);
    this.info.myMessage = this.info;
    this.lastMessage = this.info;

    this.camera.add(this.info);
    this.startPosition = [14.5, -3, -4];
    this.endPosition = [-3, -3, -4];
    let track = new THREE.VectorKeyframeTrack(
      ".position",
      [0, 3],
      [
        this.startPosition[0],
        this.startPosition[1],
        this.startPosition[2],
        this.endPosition[0],
        this.endPosition[1],
        this.endPosition[2],
      ]
    );
    this.animateSingular(this.info, [track], 3, (info) => {
      setTimeout(
        (info) => {
          this.camera.remove(info);
          this.refresh();
        },
        15000,
        info
      );
    });
    return this.info;
  }

  get_text(message, height, width, color, opacity) {
    var color = color != undefined ? new THREE.Color(color) : 0x006699;
    let xMid;
    let shapes = this.font.generateShapes(message, height, width);
    let geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();
    let material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
      side: THREE.DoubleSide,
      style: "regular",
    });

    let textShape = new THREE.BufferGeometry();
    textShape.copy(geometry);
    let mesh = new THREE.Mesh(textShape, material);
    return mesh;
  }

  get_image(photo, w, h, color, opacity) {
    var geometry = new THREE.BoxGeometry(w, h, 0.01);
    geometry.computeBoundingBox();

    color = new THREE.Color(color);

    var material = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(photo),
      opacity: opacity,
      color: color,
      transparent: true,
    });
    return new THREE.Mesh(geometry, material);
  }

  userCor(showUsersCount) {
    var y = this.realCubeSize;

    switch (showUsersCount) {
      case 1:
        var cor = [{ x: 2, y: 8, z: -16 }];
        break;
      case 2:
        var cor = [
          { x: -4, y: 8, z: -16 },
          { x: 6, y: 8, z: -16 },
        ];
        break;
      case 3:
        var cor = [
          { x: -10, y: 8, z: -16 },
          { x: 0, y: 8, z: -16 },
          { x: 10, y: 8, z: -16 },
        ];
        break;
    }

    return cor;
  }
  switchTourHandle() {
    if (typeof this.avatar != "undefined") {
      for (var uid in this.avatar) {
        var actualOpacity = this.tour.toString() == uid.toString() ? 0.8 : 0.2;
        if (this.avatar[uid].material.opacity != actualOpacity) {
          this.avatar[uid].material.opacity = actualOpacity;
        }
      }
      this.refresh();
      if (
        this.tour.toString() != this.userId.toString() &&
        typeof this.info_tour != "undefined"
      ) {
        this.camera.remove(this.info_tour);
        this.refresh();
        delete this.info_tour;
      }
    }
  }

  //draw avatars
  create_users(userId, users) {
    //z = -3;
    var cor = this.userCor(Object.keys(users).length - 1);

    var i = 0;
    this.avatar = {};
    for (var uid in users) {
      if (userId != uid) {
        this.avatar[uid] = this.get_image(
          "/images/ghost.png",
          4,
          7,
          this.getUserColor(uid),
          this.tour == uid ? 0.8 : 0.2
        );
        this.avatar[uid].position.set(cor[i].x, cor[i].y, cor[i].z);
        this.camera.add(this.avatar[uid]);

        i++;
      }
    }
  }

  finish_game(args) {
    //GAME.draw_info(message);
    const message = args.message;
    const world = args.world;
    this.fixed_texts = [this.get_text(message, 0.5, 0.5, "#FFFFFF", 1)];
    this.camera.add(this.fixed_texts[0]);
    this.fixed_texts[0].position.set(-2, 1, -2);

    setTimeout(() => {
      for (let w in world) {
        this.flyCube({ cube: world[w] });
      }
    }, 2000);
    setTimeout(() => {
      for (let li in this.lights) {
        this.lights[li].intensity -= 0.005;
        this.refresh();
        if (this.lights[li].intensity < 0) {
          last_time = true;
        }
      }
    }, 4000);
    setTimeout(() => {
      for (let li in this.lights) {
        this.camera.remove(this.lights[li]);
      }
      for (let id in this.models) this.scene.remove(this.models[id].model);
      this.refresh();
      for (let a in this.avatar) {
        this.camera.remove(this.avatar[a]);
      }
      this.refresh();
    }, 10000);
  }

  getUserOptions() {
    if (this.userOptions != null) {
      return this.userOptions;
    }
    const userOptions = localStorage.getItem("user_options");
    this.defaultPlayersColors = ["#7F00FF", "#00FF55", "#FF552A", "#557FFF"];

    if (userOptions == null) {
      this.userOptions = {
        theme: "0",
        nosound: false,
        vr: false,
        colors: this.defaultPlayersColors,
        line_color: "#0000FF",
      };
      localStorage.setItem("user_options", JSON.stringify(this.userOptions));
    } else {
      this.userOptions = JSON.parse(userOptions);
    }
    return this.userOptions;
  }

  setUserOptions(userOptions) {
    this.userOptions = userOptions;
    localStorage.setItem("user_options", JSON.stringify(this.userOptions));
  }

  getUserColor(uid) {
    return this.userOptions.colors[
      Object.keys(this.users).indexOf(uid.toString())
    ];
  }

  setUserId(uid) {
    this.userId = uid;
  }
  getUserId() {
    return this.userId;
  }

  setTour(uid) {
    this.tour = uid;
  }
  getTour() {
    return this.tour;
  }
}

export default ParadoxChess;
