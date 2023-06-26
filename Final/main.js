// Import Three.js library
import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

// INIT GLOBAL VARIABLES
let scene, camera, renderer, clock, controls, transformControls;
let panel_gui = null;
let isDragging = false;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let meshObject = [];

function createGUI() {
	if (panel_gui) {
		panel_gui.__folders = {};
		panel_gui.__controllers = [];
	}
	createPanel();
}

function createPanel() {
	panel_gui = new GUI({ width: 330 });
}

function create_box() {
	const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
	const boxMaterial = new THREE.MeshNormalMaterial({
		transparent: true,
		opacity: 1,
	});
	const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

	boxMesh.position.y = 1;
	boxMesh.userData.canjustify = true;
	boxMesh.userData.isSelected = false;

	return boxMesh;
}

function create_background_point() {
	const vertices = [];
	const num_points = 30000;
	for (let i = 0; i < num_points; i++) {
		const x = THREE.MathUtils.randFloatSpread(2000);
		const y = THREE.MathUtils.randFloatSpread(2000);
		const z = THREE.MathUtils.randFloatSpread(2000);

		vertices.push(x, y, z);
	}

	const background_geometry = new THREE.BufferGeometry();
	background_geometry.setAttribute(
		"position",
		new THREE.Float32BufferAttribute(vertices, 3)
	);

	const background_material = new THREE.PointsMaterial({ color: 0x888888 });
	const background_points = new THREE.Points(
		background_geometry,
		background_material
	);
	return background_points;
}

function initObjects() {
	let boxMesh = create_box();
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
		const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
		const boxMaterial = new THREE.MeshNormalMaterial({
			transparent: true,
			opacity: 1,
		});
		const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

		boxMesh.position.x = 2;
		boxMesh.position.y = 1;
		boxMesh.userData.canjustify = true;
		boxMesh.userData.isSelected = false;

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
			object.userData.isSelected = false;
		}
	} else {
		transformControls.detach();
		for (let obj in meshObject) {
			meshObject[obj].userData.isSelected = false;
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

window.addEventListener("keydown", HandleKeyboard);

document
	.getElementById("rendering")
	.addEventListener("click", transformObject, false);

document
	.getElementById("rendering")
	.addEventListener("mousemove", hoverObject, false);

const tools = document.querySelectorAll(".icon-tool");

tools.forEach((tool) => {
	tool.addEventListener("mouseenter", showTooltip);
	tool.addEventListener("mouseleave", hideTooltip);
});

function showTooltip(event) {
	const icon = event.target;
	const tooltip = document.getElementsByClassName("tool-tip")[0];

	tooltip.innerHTML = icon.alt;

	const iconRect = icon.getBoundingClientRect();

	const tooltipRect = tooltip.getBoundingClientRect();

	console.log(iconRect);
	console.log(tooltipRect);

	tooltip.style.top = iconRect.top + "px";
	tooltip.style.opacity = 1;

	// Set the tooltip content based on the icon tool
	// tooltip.textContent = icon.alt;

	// // Calculate the position of the tooltip
	// const iconRect = icon.getBoundingClientRect();
	// const tooltipRect = tooltip.getBoundingClientRect();
	// const iconCenterX = iconRect.left + iconRect.width / 2;
	// const tooltipLeft = iconCenterX - tooltipRect.width / 2;

	// // Position the tooltip beside the icon tool
	// tooltip.style.right = `${tooltipLeft}px`;
	// tooltip.style.top = `${iconRect.top - tooltipRect.height}px`;

	// // Show the tooltip
	// tooltip.style.opacity = "1";
}

function hideTooltip(event) {
	// const tooltip = event.target.nextElementSibling;
	// tooltip.style.opacity = "0";
	const tooltip = document.getElementsByClassName("tool-tip")[0];

	tooltip.style.opacity = 0;
}

function animate() {
	requestAnimationFrame(animate);

	controls.update();

	renderer.render(scene, camera);
}

init();
animate();
