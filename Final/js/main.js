// Import Three.js library
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import {
	updateCurrentGeometry,
	updateCurrentMaterial,
	updateLight,
} from "./update.js";
import {
	create_background_point,
	create_cube,
	create_sphere,
	create_cone,
	set_transform,
	create_cylinder,
	create_torus,
	create_teapot,
} from "./geometry.js";

// INIT GLOBAL VARIABLES
let scene, camera, renderer, clock, controls, transformControls;
let point_light, point_light_helper, direct_light;
let panel_gui = null;
let isDragging = false;
let arrowMesh;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let meshObject = [];
window.meshObject = meshObject;

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
	window.scene = scene;

	// scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
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
	camera.position.set(10, 7, 20);
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
	// scene.add(hemiLight);

	direct_light = new THREE.DirectionalLight(0xffffff);
	direct_light.position.set(6, 17, 20);
	direct_light.castShadow = true;
	direct_light.shadow.camera.top = 10;
	direct_light.shadow.camera.bottom = -10;
	direct_light.shadow.camera.left = -10;
	direct_light.shadow.camera.right = 10;
	direct_light.shadow.camera.near = 0.1;
	direct_light.shadow.camera.far = 40;
	direct_light.shadow.bias = 0.001;
	direct_light.shadow.mapSize.width = 4096;
	direct_light.shadow.mapSize.height = 4096;
	direct_light.name = "Directional Light";

	point_light = new THREE.PointLight(0xffffff, 1, 100);
	point_light.position.set(5, 8, 5);
	point_light.name = "Point Light";
	point_light_helper = new THREE.PointLightHelper(point_light, 0.5);

	// Ground
	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry(100, 100),
		new THREE.MeshPhongMaterial({ color: "#2D3750", depthWrite: false })
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
			updateCurrentMaterial(meshObject);
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
		if (object.userData.isSelected === false) {
			object.material.opacity = 0.5;
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

const onClickSubToolObject = (event) => {
	let typeMesh, typeMaterial;
	let meshIndex = meshObject.findIndex(
		(obj) => obj.userData.isSelected === true
	);
	const event_type = event.target.className.includes(" geometry")
		? "geometry"
		: "material";
	if (event_type === "geometry") {
		typeMesh = event.target.alt;
		typeMaterial = meshObject[meshIndex].userData.typeMaterial;
	} else {
		typeMaterial = event.target.alt;
		typeMesh = meshObject[meshIndex].userData.type;
	}

	let isTransform = meshObject[meshIndex].userData.isTransform;
	if (isTransform) transformControls.detach();
	let current_position = meshObject[meshIndex].position;
	let current_rotate = meshObject[meshIndex].rotation;
	let current_scale = meshObject[meshIndex].scale;

	resetObj(meshObject[meshIndex]);

	switch (typeMesh) {
		case "Cube":
			meshObject[meshIndex] = create_cube(typeMaterial);
			break;
		case "Sphere":
			meshObject[meshIndex] = create_sphere(typeMaterial);
			break;
		case "Cone":
			meshObject[meshIndex] = create_cone(typeMaterial);
			break;
		case "Cylinder":
			meshObject[meshIndex] = create_cylinder(typeMaterial);
			break;
		case "Torus":
			meshObject[meshIndex] = create_torus(typeMaterial);
			break;
		case "Teapot":
			meshObject[meshIndex] = create_teapot(typeMaterial);
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
	updateCurrentMaterial(meshObject);
};

function active_transform(event) {
	event.preventDefault();
	const icon = event.target;
	let meshSelected = meshObject.find((obj) => obj.userData.isSelected === true);
	if (!icon.className.includes(" active")) {
		transformControls.attach(meshSelected);
		meshSelected.userData.isTransform = true;
		updateLight(true);
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

function onClickLightOption(event) {
	const light = event.target;

	if (light.alt !== "Translate Light") {
		scene.remove(point_light);
		scene.remove(point_light_helper);
		scene.remove(direct_light);

		if (!light.className.includes(" active")) {
			if (light.alt === "Directional Light") {
				scene.add(direct_light);
			} else if (light.alt === "Point Light") {
				scene.add(point_light);
				scene.add(point_light_helper);
			}
		}
	} else {
		if (
			scene.getObjectByName("Point Light") &&
			!light.className.includes(" active")
		) {
			transfrom_icon.forEach((icon) => {
				icon.className = icon.className.replace(" active", "");
			});
			transformControls.attach(point_light);
			light.className += " active";
		} else {
			light.className = light.className.replace(" active", "");
			transformControls.detach();
		}
	}

	updateLight();
}

const transfrom_icon = document.querySelectorAll(".icon-tool.transform");

const geometry_option = document.querySelectorAll(".geometry-option");
geometry_option.forEach((option) => {
	option.addEventListener("click", onClickSubToolObject);
});

const material_option = document.querySelectorAll(".material-option");
material_option.forEach((option) => {
	option.addEventListener("click", onClickSubToolObject);
});

const light_option = document.querySelectorAll(".sub-icon.light");
light_option.forEach((option) => {
	option.addEventListener("click", onClickLightOption);
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
