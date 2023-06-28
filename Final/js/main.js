// Import Three.js library
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { updateCurrentGeometry } from "./update.js";
import {
	create_background_point,
	create_cube,
	create_sphere,
} from "./geometry.js";

// INIT GLOBAL VARIABLES
let scene, camera, renderer, clock, controls, transformControls;
let panel_gui = null;
let isDragging = false;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let meshObject = [];

function initObjects() {
	let boxMesh = create_cube();
	if (meshObject.length === 0) {
		boxMesh.userData.isSelected = true;
	}
	meshObject.push(boxMesh);
}

function init() {
	// Clock
	clock = new THREE.Clock();

	// Scene
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
	scene.background = new THREE.Color(0x000000);

	var background_points = create_background_point();
	scene.add(background_points);

	// Camera
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);
	camera.position.set(-8, 1.15, 7.5);
	camera.lookAt(0, 0, 0);

	// Renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.shadowMap.enabled = true;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.update();

	document.getElementById("rendering").appendChild(renderer.domElement);

	// Responsive

	// Lights
	const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
	hemiLight.position.set(0, 17, 0);
	scene.add(hemiLight);

	const dirLight = new THREE.DirectionalLight(0xffffff);
	dirLight.position.set(6, 17, 20);
	dirLight.castShadow = true;
	dirLight.shadow.camera.top = 10;
	dirLight.shadow.camera.bottom = -10;
	dirLight.shadow.camera.left = -10;
	dirLight.shadow.camera.right = 10;
	dirLight.shadow.camera.near = 0.1;
	dirLight.shadow.camera.far = 40;
	dirLight.shadow.bias = 0.001;
	dirLight.shadow.mapSize.width = 4096;
	dirLight.shadow.mapSize.height = 4096;
	scene.add(dirLight);

	// Ground
	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry(100, 100),
		new THREE.MeshPhongMaterial({ color: 0x000000, depthWrite: false })
	);
	plane.rotation.x = -Math.PI / 2;
	plane.receiveShadow = true;

	const gridSize = 100;
	const gridDivisions = 100;
	const gridHelper = new THREE.GridHelper(
		gridSize,
		gridDivisions,
		0x808080,
		0x808080
	);

	gridHelper.rotation.x = plane.rotation.x;
	plane.add(gridHelper);

	scene.add(plane);

	transformControls = new TransformControls(camera, renderer.domElement);
	transformControls.setMode("translate");

	transformControls.addEventListener("dragging-changed", function (event) {
		controls.enabled = !event.value;
	});

	scene.add(transformControls);

	initObjects();

	for (var i = 0; i < meshObject.length; i++) {
		scene.add(meshObject[i]);
	}
}

window.addEventListener(
	"resize",
	function () {
		var width = window.innerWidth;
		var height = window.innerHeight;
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	},
	false
);

function HandleKeyboard(event) {
	switch (event.code) {
		case "KeyG":
			transformControls.setMode("translate");
			break;
		case "KeyR":
			transformControls.setMode("rotate");
			break;
		case "KeyS":
			transformControls.setMode("scale");
			break;
	}
}

document.getElementsByClassName("btn-add")[0].addEventListener(
	"click",
	function (e) {
		const boxMesh = create_cube();
		boxMesh.position.x = 2;

		meshObject.push(boxMesh);
		scene.add(boxMesh);
	},
	false
);

function SetMousePosition(event) {
	var canvasBounds = renderer.domElement.getBoundingClientRect();
	let left_event = event.clientX - canvasBounds.left;
	let canvas_width = canvasBounds.right - canvasBounds.left;

	let top_event = event.clientY - canvasBounds.top;
	let canvas_height = canvasBounds.bottom - canvasBounds.top;

	mouse.x = (left_event / canvas_width) * 2 - 1;
	mouse.y = -(top_event / canvas_height) * 2 + 1;
}

function transformObject(event) {
	event.preventDefault();
	SetMousePosition(event);
	raycaster.setFromCamera(mouse, camera);

	const intersect = raycaster.intersectObjects(meshObject, true);

	if (intersect.length > 0) {
		var object = intersect[0].object;
		if (object.userData.canjustify) {
			transformControls.attach(object);
			object.userData.isSelected = true;
		} else {
			transformControls.detach();
			if (meshObject.length > 1) object.userData.isSelected = false;
		}
	} else {
		transformControls.detach();
		if (meshObject.length > 1) {
			for (let obj in meshObject) {
				meshObject[obj].userData.isSelected = false;
			}
		}
	}
}

function hoverObject(event) {
	event.preventDefault();

	SetMousePosition(event);
	raycaster.setFromCamera(mouse, camera);

	const intersect = raycaster.intersectObjects(meshObject, true);

	if (intersect.length > 0) {
		var object = intersect[0].object;
		if (object.userData.canjustify && object.userData.isSelected == false) {
			object.material.opacity = 0.5;
		} else {
			object.material.opacity = 1;
		}
	} else {
		for (let obj in meshObject) {
			meshObject[obj].material.opacity = 1;
		}
	}
}

function resetObj(obj) {
	scene.remove(obj);
	obj.traverse(function (object) {
		if (object.isMesh) {
			object.geometry.dispose();
			object.material.dispose();
		}
	});
	obj = null;
}

const onClickGeometry = (event) => {
	const typeMesh = event.target.alt;
	let meshIndex = meshObject.findIndex(
		(obj) => obj.userData.isSelected === true
	);
	let current_position = meshObject[meshIndex].position;
	if (typeMesh === "Cube") {
		if (meshObject[meshIndex].userData.type === "Cube") return;
		resetObj(meshObject[meshIndex]);
		meshObject[meshIndex] = create_cube(current_position);
		meshObject[meshIndex].userData.isSelected = true;
		scene.add(meshObject[meshIndex]);
	} else if (typeMesh === "Sphere") {
		if (meshObject[meshIndex].userData.type === "Sphere") return;
		resetObj(meshObject[meshIndex]);
		meshObject[meshIndex] = create_sphere(current_position);
		meshObject[meshIndex].userData.isSelected = true;
		scene.add(meshObject[meshIndex]);
	}
	updateCurrentGeometry(meshObject);
};

const geometry_option = document.querySelectorAll(".geometry-option");
geometry_option.forEach((option) => {
	option.addEventListener("click", onClickGeometry);
});

window.addEventListener("keydown", HandleKeyboard);

document
	.getElementById("rendering")
	.addEventListener("click", transformObject, false);

document
	.getElementById("rendering")
	.addEventListener("mousemove", hoverObject, false);

function animate() {
	requestAnimationFrame(animate);

	controls.update();

	renderer.render(scene, camera);
}

init();
animate();

export { meshObject };
