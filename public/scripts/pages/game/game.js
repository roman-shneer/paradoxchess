
import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { GLTFLoader } from 'GLTFLoader';
import { FontLoader } from 'FontLoader';

	//define(['three'], function (THREE) {


	function resizeRendererToDisplaySize(renderer) {

		const canvas = window.renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;


		if (needResize) {
			window.renderer.setSize(width, height, false);
		}

		//GAME.stop_rotation();
		return needResize;
	}
	function requestRenderIfNotRequested() {
		//if (!renderRequested) {
		if (typeof renderRequested == 'undefined') {

			var renderRequested = true;
			//requestAnimationFrame(GAME.render);
			window.renderer.setAnimationLoop(window.GAME.render)
		}
	}

	function onTouchDown(event) {

		window.mouse.x = (window.touch_position.clientX / window.renderer.domElement.clientWidth) * 2 - 1;
		window.mouse.y = - (window.touch_position.clientY / window.renderer.domElement.clientHeight) * 2 + 1;
		window.raycaster.setFromCamera(window.mouse, window.camera);

		var intersects = window.raycaster.intersectObjects(window.scene.children, true);

		for (var i in intersects) {

			if ((intersects[i].object.type == 'Mesh') || (intersects[i].object.type == 'Scene')) {
				if (typeof intersects[i].object.callback == 'function') {
					intersects[i].object.callback();
					break;
				}
			} else {

			}
		}
		//GAME.stop_rotation();
	}

	function onDocumentMouseDown(event) {

		if (event.target.id != 'canvas') return;
		event.preventDefault();
		//GAME.stop_rotation();
		window.mouse.x = (event.clientX / window.renderer.domElement.clientWidth) * 2 - 1;
		window.mouse.y = - (event.clientY / window.renderer.domElement.clientHeight) * 2 + 1;
		window.raycaster.setFromCamera(window.mouse, window.camera);

		var intersects = window.raycaster.intersectObjects(window.scene.children, true);

		for (var i in intersects) {

			if ((intersects[i].object.type == 'Mesh') || (intersects[i].object.type == 'Scene')) {
				if (typeof intersects[i].object.callback == 'function') {
					intersects[i].object.callback();
					break;
				}
			} else {

			}
		}

	}

	function threeRenderMain() {
		for (let a in window.animationsObjects) {
			let mesh = window.animationsObjects[a];
			if (mesh.userData.clock && mesh.userData.mixer) {
				mesh.userData.mixer.update(mesh.userData.clock.getDelta());
				if (mesh.animationAction.isRunning() == false) {
					delete window.animationsObjects[a];
					mesh.end_callback(mesh);
				}
			}
		

		}

	};
	function animateMain() {
		window.animation_id = requestAnimationFrame(animateMain);
		//threeRender2();
		threeRenderMain();
	}
	class ParadoxChess {
	
	
		active_status = true;
		linesByCube = {};
	
	
	
		figure_models = {
			'king': {
				rotation: [0, 0, 0],
				path: '/models/chess_piece_king/scene.gltf',
				scale: 0.0025,
				pos: [0, 0.5, 0]
			},
			'pawn': {
				rotation: [0, 0, 0],
				path: '/models/chess_pawn/scene.gltf',
				scale: 0.15,
				pos: [0, 0.5, 0]
			},
			'elephant': {
				rotation: [0, 0, 0],
				path: '/models/elephant/scene.gltf',
				scale: 0.11,
				pos: [0, 0.5, 0]
			},
			'queen': {
				rotation: [0, 0, 0],
				path: '/models/queen_chess/scene.gltf',
				scale: 1.6,
				pos: [0, 0.5, 0]
			},
			'knight': {
				rotation: [0, -1.6, 0],
				path: '/models/peter_ganine_classic_knight/scene.gltf',
				scale: 0.015,
				pos: [0, 0.5, 0]
			},
			'castle': {
				rotation: [0, 0, 0],
				path: '/models/castle/scene.gltf',
				scale: 0.0075,
				pos: [0, 0.45, 0]
			}
		};
		constructor() {
		
			window.animationsObjects = [];
			window.methId = 0;
		}
		init(cube_size, world, info) {
			window.markers = [];
			window.animation_ids = [];
			var loader = new FontLoader();
		
			loader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
				window.font = font;
				this.draw_world(cube_size, world);
				this.draw_map();
				this.draw_info(info, '#FF0000');
				this.switchTourHandle();
			});
		}

		draw_world(cube_size, world) {
			const canvas = window.Game_UI.Parent.canvasRef.current;
			window.renderer = new THREE.WebGLRenderer({ 'canvas': canvas, 'physicallyCorrectLights': true, 'preserveDrawingBuffer': true });

			const fov = 75;
			const aspect = 2;  // the canvas default
			const near = 0.1;
			const far = 25;
			window.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
			window.raycaster = new THREE.Raycaster();
			window.mouse = new THREE.Vector2();
			window.cube_size = cube_size;

			switch (parseInt(cube_size)) {
				case 4:
				case 41:
				case 42:
				case 5:
					this.corrector = -2.5;
					window.realCubeSize = 4;
					break;
				case 6:
				case 61:
				case 62:
					this.corrector = -3.5;
					window.realCubeSize = 6;
					break;
				case 8:
					this.corrector = -4.5;
					window.realCubeSize = 8;
					break;
			}

			window.controls = new OrbitControls(window.camera, canvas);
	
	

			window.controls.maxDistance = 13;
			//window.controls.autoRotate=true;
			window.controls.target.set(0, 0, 0);
			window.controls.update();

			window.scene = new THREE.Scene();
			window.scene.add(window.camera);
			window.scene.background = new THREE.Color('black');
			window.scene.position.set(0, 0, 0);

			window.camera.lookAt(window.scene.position); // the origin

			this.addLight(-1, 2, 4);
			this.addLight(1, -1, -2);
			if (['4', '41', '42'].includes(cube_size) == false) {
				this.addLight(-4, -4, 4);
				this.addLight(4, -4, -4);
			}

			{
			
				var material = new THREE.LineBasicMaterial({ color: window.Game_UI.game_options.state.user_options.line_color, opacity: 0.2, transparent: true, linewidth: 1 });
				var world_expected = {};
				for (let x = 1; x < 7; x++)for (let y = 1; y < 7; y++)for (let z = 1; z < 7; z++) world_expected[x + ':' + y + ':' + z] = 0;
				for (let w in world) {
					delete world_expected[world[w]];
					this.dcube(world[w], material);
				}
				//muar

				if (cube_size == 61) {
					for (let coord in world_expected) {
						this.mark_white_space('black', coord);
					}
				}
			}
		
		
			this.create_users(window.Game_UI.user_id, window.Game_UI.users);
			this.render();
			requestRenderIfNotRequested();
			controls.addEventListener('change', requestRenderIfNotRequested);
			window.addEventListener('resize', requestRenderIfNotRequested);
			window.addEventListener('click', onDocumentMouseDown, false);

			var el = document.getElementById("canvas");
			el.addEventListener("touchstart", function (event) {

				window.touch_status = 1;
				window.touch_position = event.touches[0];
			}, false);
			el.addEventListener("touchend", function (event) {
				window.touch_status = 0;

				if (window.touch_status != 2)
					onTouchDown(event);
			}, false);
			el.addEventListener("touchmove", function () {
				window.touch_status = 2;
			}, false);
	
		}

		debug(data) {
			send2({ 'action': 'debug', 'data': data });
		}

		draw_map() {
			var models = Game_UI.models;
			for (var id in models) {
				if (models[id].cube_number != 0) {
					this.load_figure(id, models[id].figure, models[id].cube_number, Game_UI.user_color(models[id].uid), models[id].dir);
				}
			}
		
			window.camera.position.set(0, 0, window.realCubeSize * 1.5);
			//
			window.camera.updateProjectionMatrix();
		}

		recenterMap(world) {
			let allCoords = [[], [], []];
			for (let w in world) {
				let cube = world[w].split(':');
				for (let i = 0; i < 3; i++) {
					allCoords[i].push(cube[i]);
				}
			}
			let cameraPos = [0, 0, 0];
			for (let i = 0; i < 3; i++) {
				let d = Math.max(...allCoords[i]) - Math.min(...allCoords[i]);
				cameraPos[i] = d;
			}
		
			window.camera.position.set(cameraPos[0], cameraPos[1], cameraPos[2]);
			window.camera.updateProjectionMatrix();
		}

	


		mark_slave(color, cube_number) {

			var coord = cube_number.split(':');
			color = new THREE.Color(color);
			const material = new THREE.MeshBasicMaterial({
				color,
				opacity: 0.2,
				fog: true,
				transparent: true,
				side: THREE.DoubleSide,
			});
			const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
			//window.scene.add(cube);
			window.scene.add(cube);
			for (var i = 0; i < 3; i++) {
				coord[i] = Number(coord[i]) + this.corrector;
			}
			cube.position.set(coord[0], coord[1], coord[2]);
			return cube;
		}

		select_green_slave(data, cube_number, callback) {
			this.clear_marked_cubes();//deactivate all markers
			window.Game_UI.game_menu.state.unselect_show = 1;
			window.Game_UI.game_menu.setState(window.Game_UI.game_menu.state);
			if (window.Game_UI.user_id == window.Game_UI.tour)
				window.markers.push(this.mark('green', cube_number, 2));
			else
				window.markers.push(this.mark_slave('green', cube_number));
			this.refresh();
		
			if (typeof callback == 'function')
				callback();
		}

		reload_figures(data) {
			for (var m in data.map.models) {
				if (data.map.models[m].cube_number != window.Game_UI.models[m].cube_number) {
					window.grouo_dynamic.remove(window.Game_UI.models[m].model);
					if (data.map.models[m].cube_number != 0)
						this.load_figure(m, data.map.models[m].figure, data.map.models[m].cube_number, window.Game_UI.user_color(data.map.models[m].uid), data.map.models[m].dir);
				}
			}
			this.refresh();
		}

		select_figure_and_mark(data, markers, callback) {
			this.clear_marked_cubes();

			window.Game_UI.game_menu.state.unselect_show = 1;
			window.Game_UI.game_menu.setState(window.Game_UI.game_menu.state);
			for (var m in markers) {
				if (markers[m].color == 'blue') window.active_cube = markers[m].cube_number;

				if (window.Game_UI.tour == window.Game_UI.user_id)
					window.markers.push(this.mark(markers[m].color, markers[m].cube_number, markers[m].flag));
				else
					window.markers.push(this.mark_slave(markers[m].color, markers[m].cube_number));
			}

			this.refresh();
			if (typeof callback == 'function')
				callback();
		}

		get_model(it, what) {
			for (var m in window.Game_UI.models) {
				if ((what == 'cube') && (it == window.Game_UI.models[m].cube_number))
					return window.Game_UI.models[m];
				if ((what == 'id') && (it == window.Game_UI.models[m].id))
					return window.Game_UI.models[m];
			}
			return null;
		}

		move_figure(data) {

			var from_model = this.get_model(data.active_model, 'id');
			if (from_model == null) return;
			var to_model = this.get_model(data.kill_model, 'id');
		
			this.write_to_log({
				'from_uid': from_model.uid,
				'from_figure': from_model.figure,
				'from_color': window.Game_UI.user_color(from_model.uid),
				'from': data.from,
				'to': data.to,
				'to_uid': (to_model != null) ? to_model.uid : null,
				'to_figure': (to_model != null) ? to_model.figure : null,
				'to_color': (to_model != null) ? window.Game_UI.user_color(to_model.uid) : null,
			});
			this.animate_move(from_model, to_model, {
				'from': data.from.split(':'),
				'to': data.to.split(':'),
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
			geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

			var line = new THREE.Line(geometry, material);
			line.v1 = [x1, y1, z1];
			line.v2 = [x2, y2, z2];
			return line;

		}

		rand(num) {
			return ((Math.random() > 0.5) ? -1 : 1) * num;
		}

		flyCube(cube) {
			if (typeof window.flyIntVal == 'undefined')
				window.flyIntVal = [];
			for (let c in this.linesByCube[cube]) {
			
				let line = this.linesByCube[cube][c];
				let track = new THREE.VectorKeyframeTrack(
					'.position',
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
				if (Math.random() > 0.5) pos[0] = (Math.random() > 0.5) ? 1 : -1;
			
				pos[1] = -1;
				if (Math.random() > 0.5) pos[2] = (Math.random() > 0.5) ? 1 : -1;
			
				const vector = new THREE.Vector3(pos[0], pos[1], pos[2]);
				var qInitial = new THREE.Quaternion().setFromAxisAngle(vector, 0);
		
				var qFinal = new THREE.Quaternion().setFromAxisAngle(vector, Math.PI);
				var qFinal2 = new THREE.Quaternion().setFromAxisAngle(vector, Math.PI * 2);
				var quaternionKF = new THREE.QuaternionKeyframeTrack('.quaternion', [0, 15, 30], [qInitial.x, qInitial.y, qInitial.z, qInitial.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w, qFinal2.x, qFinal2.y, qFinal2.z, qFinal2.w]);
			
				this.animateSingular(line, [track, quaternionKF], 45, (line) => {
					window.scene.remove(line);
				});
			}
		
		}

		addLine(cube, line) {
			this.linesByCube[cube].push(line);
			window.scene.add(line);
		}
	
		dcube(cube, material) {
			let arg = cube.split(':');
			var x = parseInt(arg[0]);
			var y = parseInt(arg[1]);
			var z = parseInt(arg[2]);
		
			if (window.cubes == undefined) window.cubes = [];
			if (typeof this.linesByCube[cube] == 'undefined') this.linesByCube[cube] = [];
			//new 	
		
			this.addLine(cube, this.draw_line(material, x, y, z, (x + 1), y, z));
			this.addLine(cube, this.draw_line(material, x, y, z, x, (y + 1), z));
			this.addLine(cube, this.draw_line(material, x, (y + 1), z, (x + 1), (y + 1), z));
			this.addLine(cube, this.draw_line(material, (x + 1), (y), z, (x + 1), (y + 1), z));
			this.addLine(cube, this.draw_line(material, x, y, z, (x), y, (z + 1)));

			this.addLine(cube, this.draw_line(material, x, y, (z + 1), (x + 1), y, (z + 1)));
			this.addLine(cube, this.draw_line(material, x, y, (z + 1), x, (y + 1), (z + 1)));
			this.addLine(cube, this.draw_line(material, x, (y + 1), (z + 1), (x + 1), (y + 1), (z + 1)));
			this.addLine(cube, this.draw_line(material, (x + 1), (y), (z + 1), (x + 1), (y + 1), (z + 1)));
			this.addLine(cube, this.draw_line(material, (x + 1), y, z, (x + 1), y, (z + 1)));
			this.addLine(cube, this.draw_line(material, (x + 1), (y + 1), z, (x + 1), (y + 1), (z + 1)));
			this.addLine(cube, this.draw_line(material, (x), (y + 1), z, (x), (y + 1), (z + 1)));
		}

		load_figure(id, figure, cube_number, color, dir) {

			var rotation = [...this.figure_models[figure].rotation];
			var pos = [...this.figure_models[figure].pos];
			if (dir == 1) {

				if (figure == 'king') {
					rotation[1] = 3.3;
				}
				if (figure == 'elephant') {
					rotation[1] = 3.3;
				}
				if (figure == 'knight') {
					rotation[1] = 1.6;
				}
			}
			color = new THREE.Color(color);
			var coord = cube_number.split(':');
			var loader = new GLTFLoader();

			loader.load(this.figure_models[figure].path, (gltf) => {
				var cube = gltf.scene;

				cube.traverse((o) => {
					if (o.isMesh) {
						o.material.color = color;
						o.material.opacity = 0.4;
						o.callback = (function () {
							window.GAME.figure_clicked(this.cube_id, this.cube_number); //send to normal UI
						});
						o.cube_number = cube_number;
						o.cube_id = id;
					}
				});
				cube.matrixAutoUpdate = true;
				cube.cube_number = cube_number;
				cube.cube_id = id;
				cube.figure = figure;
				cube.scale.set(this.figure_models[figure].scale, this.figure_models[figure].scale, this.figure_models[figure].scale);
				for (var i = 0; i < 3; i++) {
					coord[i] = coord[i] - pos[i] + this.corrector;
				}
				cube.position.set(coord[0], coord[1], coord[2]);
				cube.rotation.set(rotation[0], rotation[1], rotation[2]);
			
				window.scene.add(cube);
				window.Game_UI.models[id].model = cube;

				this.refresh();
			}, undefined, function (error) { console.error(error); });
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
		
			window.animationsObjects.push(mesh);
		
			if (typeof window.animateMainOnce == 'undefined') {
				window.animateMainOnce = true;
				animateMain();
			}
		}

		attack(to_model) {
			to_model.cube_number = 0;
			to_model.model.traverse((o) => { if (o.isMesh) { o.cube_number = 0; } });
			var mesh = to_model.model;
			let track = new THREE.VectorKeyframeTrack(
				'.position',
				[0, 100],
				[
					mesh.position.x,
					mesh.position.y,
					mesh.position.z,
					mesh.position.x,
					mesh.position.y - 270,
					mesh.position.z
				]
			);
		
			var xAxis = new THREE.Vector3(1, 0, 0);
			var qInitial = new THREE.Quaternion().setFromAxisAngle(xAxis, 0);
			var qFinal = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI);
			var qFinal2 = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI * 2);
			var quaternionKF = new THREE.QuaternionKeyframeTrack('.quaternion', [0, 6, 12], [qInitial.x, qInitial.y, qInitial.z, qInitial.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w, qFinal2.x, qFinal2.y, qFinal2.z, qFinal2.w]);
		
			this.animateSingular(mesh, [track, quaternionKF], 1000, () => {
				window.scene.remove(to_model.model);
			});
		}

		animate_move(from_model, to_model, args) {
			window.animation_run = true;
			var from = args.from;
			var to = args.to;

			var figure = this.figure_models[from_model.figure];
			for (var i = 0; i < 3; i++) {
				to[i] = parseInt(to[i]) - figure.pos[i] + this.corrector;
				from[i] = parseInt(from[i]) - figure.pos[i] + this.corrector;
			}
			var mesh = from_model.model;
			let track = new THREE.VectorKeyframeTrack(
				'.position',
				[0, 0.8],
				[
					from[0],
					from[1],
					from[2],
					to[0],
					to[1],
					to[2],
				]
			);
			mesh.afterData = { 'to': to, 'from': from, 'from_model': from_model };
			if ((typeof to_model != 'undefined') && (to_model != null)) {
				mesh.afterData['to_model'] = to_model
			}
			this.animateSingular(mesh, [track], 1, () => {
				//stop animation bof
				let data = mesh.afterData;
				data.from_model.cube_number = data.to.join(':');
				mesh.traverse((o) => { if (o.isMesh) { o.cube_number = data.to.join(':'); } });
				this.clear_marked_cubes();
				this.switchTourHandle();
				if ((typeof data.to_model != 'undefined') && (data.to_model != null)) {
					this.attack(data.to_model);
				}
			});
		}

		clear_marked_cubes(callback) {
			window.Game_UI.game_menu.state.unselect_show = 0;
			window.Game_UI.game_menu.setState(window.Game_UI.game_menu.state);

			for (let m in window.markers)
				window.scene.remove(window.markers[m]);

			this.refresh();
			if (typeof callback == 'function')
				callback();
		}

		refresh() {
			if (typeof window.renderer != 'undefined') {
				window.renderer.render(window.scene, window.camera);
			} else
				window.camera.updateProjectionMatrix();
		}

		render() {
			var renderRequested = undefined;
			if (resizeRendererToDisplaySize(renderer)) {
				const canvas = renderer.domElement;
				window.camera.aspect = canvas.clientWidth / canvas.clientHeight;
				window.camera.updateProjectionMatrix();
			}
	
			window.renderer.render(window.scene, window.camera);
		}

		addLight(...pos) {
			const color = 0xFFFFFF;
			const intensity = 0.6;
			const light = new THREE.DirectionalLight(color, intensity);
			light.position.set(...pos);
			if (window.lights == undefined) window.lights = [];
			window.lights.push(light);
			window.camera.add(light);
		}

		//////MAIN FUNC 

		/////////UI?////////////
		select_figure(cube_id) {
			var models = window.Game_UI.models;

			if (window.Game_UI.user_id != window.Game_UI.tour) {
				console.log('Wait your tour');
				return;
			}

			if ((typeof models[cube_id] != 'undefined') && (models[cube_id].uid == window.Game_UI.user_id)) {
				window.Game_UI.game_menu.state.unselect_show = 1;
				window.Game_UI.game_menu.setState(window.Game_UI.game_menu.state);

				send2({ 'action': 'select_figure', 'model_id': cube_id });

			} else {
				console.log('not found in map', cube_id, models[cube_id], window.Game_UI.user_id);
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
			window.scene.add(cube);
			let coord = cube_number.split(':');
			for (let c in coord) {
				coord[c] = Number(coord[c]) + this.corrector;
			}
			cube.position.set(coord[0], coord[1], coord[2]);
			return cube;
		}
		callbackSelectGreen(cube_number) {
			this.clear_marked_cubes();//deactivate all markers
			send2({ 'action': 'select_green', 'cube_number': cube_number });
			window.Game_UI.WaitingClock.setState({ 'show': 0 });

			window.Game_UI.game_menu.state.unselect_show = 1;
			window.Game_UI.game_menu.setState(window.Game_UI.game_menu.state);
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
				cube.callback = function () {
					window.GAME.callbackSelectGreen(this.cube_number);
				};
			}
			//clicked green sector - action start
			if (flag == 2)
				cube.callback = function () {
					send2({ 'action': 'move', 'action_cube': this.cube_number });
				};
			//window.scene.add(cube);
			window.scene.add(cube);
			var coord = cube_number.split(':');

			for (var i = 0; i < 3; i++) {
				coord[i] = Number(coord[i]) + this.corrector;
			}
			cube.position.set(coord[0], coord[1], coord[2]);

			if (color == 'blue') {
				window.object_light = new THREE.PointLight(0xffffff, 3, 3, 3, 2);
				window.object_light.matrixAutoUpdate = true;
				window.scene.add(window.object_light)
				window.object_light.position.set((coord[0] - 2), coord[1] - 2, coord[2] - 2);
			}
			return cube;
		}

		write_to_log(args) {
			window.Game_UI.Log.add(args);
		}


		figure_clicked(cube_id, cube_number) {
			var model = this.get_model(cube_number, 'cube');
			if ((typeof model != 'undefined') && (model.cube_number != 0)) {
				this.select_figure(cube_id);
			}
		}

		draw_info(message, color) {
			if (typeof message == 'undefined') return null;
			if (message.length == 0) return null;

			if (typeof this.info != 'undefined') {

				if (this.info.myMessage == message) return null;
				else {
					window.camera.remove(this.info);
					delete this.info;
				}
			}

			this.info = this.get_text(message, 0.3, 0.5, color, 0.5);
			this.info.myMessage = this.info;
			this.lastMessage = this.info;
		
			window.camera.add(this.info);
			this.startPosition = [14.5, -3, -4];
			this.endPosition = [-3, -3, -4];
			let track = new THREE.VectorKeyframeTrack(
				'.position',
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
				setTimeout((info) => {
					window.camera.remove(info);
					this.refresh();
				}, 15000, info);
			});
			return this.info;
		}

		get_text(message, height, width, color, opacity) {

			var color = (color != undefined) ? new THREE.Color(color) : 0x006699;
			let xMid;
			let shapes = window.font.generateShapes(message, height, width);
			let geometry = new THREE.ShapeGeometry(shapes);
			geometry.computeBoundingBox();
			let material = new THREE.MeshBasicMaterial({
				color: color,
				transparent: true,
				opacity: opacity,
				side: THREE.DoubleSide,
				style: "regular"
			});
			//xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
			
			let textShape = new THREE.BufferGeometry();
			console.log(geometry, textShape);
			//textShape.fromGeometry(geometry); depricated!!!!
			textShape.copy(geometry);
			let mesh = new THREE.Mesh(textShape, material);
			return mesh;
		}

		get_image(photo, w, h, color, opacity) {
			var geometry = new THREE.BoxGeometry(w, h, 0.01);
			geometry.computeBoundingBox();

			color = new THREE.Color(color);
			//geometry.translate(0, y, x );
			var material = new THREE.MeshBasicMaterial({
				map: new THREE.TextureLoader().load(photo),
				opacity: opacity,
				color: color,
				transparent: true
			});
			return new THREE.Mesh(geometry, material);
		}
		userCor(showUsersCount) {
			var y = window.realCubeSize;

			switch (showUsersCount) {
				case 1:
					var cor = [{ x: 2, y: 8, z: -16 }];
					break;
				case 2:
					var cor = [{ x: -4, y: 8, z: -16 }, { x: 6, y: 8, z: -16 }];
					break;
				case 3:
					var cor = [{ x: -10, y: 8, z: -16 }, { x: 0, y: 8, z: -16 }, { x: 10, y: 8, z: -16 }];
					break;
			}

			return cor;
		}
		switchTourHandle() {
			if (typeof window.avatar != 'undefined') {

				for (var uid in window.avatar) {

					var actualOpacity = (window.Game_UI.tour.toString() == uid.toString()) ? 0.8 : 0.2;
					if (window.avatar[uid].material.opacity != actualOpacity) {
						window.avatar[uid].material.opacity = actualOpacity;
					}
				}
				this.refresh();
				if (window.Game_UI.tour.toString() == window.Game_UI.user_id) {
				
					//GAME.info_tour = GAME.draw_info(window.Game_UI.lang._is_your_tour, Game_UI.user_color(window.Game_UI.tour));
				} else if (typeof this.info_tour != 'undefined') {
					window.camera.remove(this.info_tour);
					this.refresh();
					delete this.info_tour;
				}

			}
		}


		//draw avatars
		create_users(user_id, users) {

			//z = -3;
			var cor = this.userCor(Object.keys(users).length - 1);

			var i = 0;
			window.avatar = {};
			for (var uid in users) {
				if (user_id != uid) {
					window.avatar[uid] = this.get_image('/images/ghost.png', 4, 7, window.Game_UI.user_color(uid), ((window.Game_UI.tour == uid) ? 0.8 : 0.2));
					window.avatar[uid].position.set(cor[i].x, cor[i].y, cor[i].z);
					window.camera.add(window.avatar[uid]);
				
					i++;
				}
			}

		}

		finish_game(message, world) {
			//GAME.draw_info(message);

			this.fixed_texts = [this.get_text(message, 0.5, 0.5, '#FFFFFF', 1)];
			window.camera.add(this.fixed_texts[0]);
			this.fixed_texts[0].position.set(-2, 1, -2);
		
			setTimeout(() => {
				for (let w in world) {
					this.flyCube(world[w]);
				}
			}, 2000);
			setTimeout(() => {
				for (let li in window.lights) {
					window.lights[li].intensity -= 0.005;
					this.refresh();
					if (window.lights[li].intensity < 0) {
						last_time = true;
					}
				}
			}, 4000);
			setTimeout(() => {
				for (let li in window.lights) {
					window.camera.remove(window.lights[li]);
				}
				for (let id in window.Game_UI.models)
					window.scene.remove(window.Game_UI.models[id].model);
				this.refresh();
				for (let a in window.avatar) {
					window.camera.remove(window.avatar[a]);
				}
				this.refresh();
			}, 10000);
			/*
			var nightComing = setInterval( () => {
				var last_time = false;
				for (l in window.lights) {
					window.lights[l].intensity -= 0.005;
					this.refresh();
					if (window.lights[l].intensity < 0) {
						last_time = true;
					}
				}
				if (last_time) {
	
					for (var l in window.lights) {
						window.camera.remove(window.lights);
					}
					for (var id in window.Game_UI.models)
						window.scene.remove(window.Game_UI.models[id].model);
						this.refresh();				
					for (var a in window.avatar) {
						window.camera.remove(window.avatar[a]);
					}
					this.refresh();
					clearInterval(nightComing);
					redirect("/");
				}
			}, 10);*/

		}
	}
	


export default ParadoxChess;