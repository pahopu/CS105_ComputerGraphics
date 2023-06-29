// Import Three.js library
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { updateCurrentGeometry } from "./update.js";
import {
	create_background_point,
	create_cube,
	create_sphere,
	create_cone,
	set_transform,
} from "./geometry.js";

// INIT GLOBAL VARIABLES
let scene, camera, renderer, clock, controls, transformControls;
let panel_gui = null;
let isDragging = false;
let arrowMesh;

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

	const arrowGeometry = new THREE.ConeGeometry(0.5, 1, 32);
	const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);

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
		boxMesh.position.x = THREE.MathUtils.randInt(0, 10);
		boxMesh.position.y = THREE.MathUtils.randInt(1, 5);

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

function clickObject(event) {
	event.preventDefault();
	SetMousePosition(event);
	raycaster.setFromCamera(mouse, camera);

	const intersect = raycaster.intersectObjects(meshObject, true);

	if (intersect.length > 0) {
		var object = intersect[0].object;
		if (object.userData.isSelected === false) {
			let isTransform = false;
			meshObject.forEach((obj, index) => {
				meshObject[index].userData.isSelected = false;
				if (meshObject[index].userData.isTransform === true) {
					meshObject[index].userData.isTransform = false;
					transformControls.detach();
					isTransform = true;
				}
			});

			object.userData.isSelected = true;
			object.userData.isTransform = isTransform;
			if (isTransform) {
				transformControls.attach(object);
			}
			updateCurrentGeometry(meshObject);
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
	let isTransform = meshObject[meshIndex].userData.isTransform;
	if (isTransform) {
		transformControls.detach();
	}
	if (meshObject[meshIndex].userData.type === typeMesh) return;
	let current_position = meshObject[meshIndex].position;
	let current_rotate = meshObject[meshIndex].rotation;
	let current_scale = meshObject[meshIndex].scale;
	resetObj(meshObject[meshIndex]);
	switch (typeMesh) {
		case "Cube":
			meshObject[meshIndex] = create_cube();
			break;
		case "Sphere":
			meshObject[meshIndex] = create_sphere();
			break;
		case "Cone":
			meshObject[meshIndex] = create_cone();
			break;
	}
	meshObject[meshIndex] = set_transform(
		meshObject[meshIndex],
		current_position,
		current_rotate,
		current_scale
	);
	meshObject[meshIndex].userData.isSelected = true;
	scene.add(meshObject[meshIndex]);
	if (isTransform) {
		meshObject[meshIndex].userData.isTransform = true;
		transformControls.attach(meshObject[meshIndex]);
	}
	updateCurrentGeometry(meshObject);
};

function active_transform(event) {
	event.preventDefault();
	const icon = event.target;
	let meshSelected = meshObject.find((obj) => obj.userData.isSelected === true);
	if (!icon.className.includes(" active")) {
		transformControls.attach(meshSelected);
		meshSelected.userData.isTransform = true;
	} else {
		transformControls.detach();
		meshSelected.userData.isTransform = false;
	}
	if (icon.alt === "Translate") {
		transformControls.setMode("translate");
	} else if (icon.alt === "Rotate") {
		transformControls.setMode("rotate");
	} else if (icon.alt === "Scale") {
		transformControls.setMode("scale");
	}
}

const geometry_option = document.querySelectorAll(".geometry-option");
geometry_option.forEach((option) => {
	option.addEventListener("click", onClickGeometry);
});

const tools = document.querySelectorAll(".icon-tool");
tools.forEach((tool, index) => {
	if (index < 3) tool.addEventListener("click", active_transform);
});

window.addEventListener("keydown", HandleKeyboard);

document
	.getElementById("rendering")
	.addEventListener("click", clickObject, false);

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
