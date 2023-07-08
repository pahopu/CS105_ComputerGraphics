// Import Three.js library
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import {
	updateCurrentGeometry,
	updateCurrentMaterial,
	updateLight,
	updateCamera,
	updateAnimation,
	updateColor,
	updateToolBar,
} from "./update.js";
import {
	create_background_point,
	create_cube,
	set_transform,
	create_geometry,
	initDefault,
} from "./geometry.js";

// INIT GLOBAL VARIABLES
let scene, camera, renderer, clock, controls, transformControls;
let hasLight,
	point_light,
	point_light_helper,
	direct_light,
	direct_light_helper,
	spot_light,
	spot_light_helper,
	light_intensity,
	light_distance;
let fov, near, far;
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
	const arrowGeometry = new THREE.ConeGeometry(0.5, 1, 32);
	const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
	boxMesh = initDefault(boxMesh);

	meshObject.push(boxMesh);
}

function initLight() {
	light_intensity = 1;
	light_distance = 100;

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
	direct_light_helper = new THREE.DirectionalLightHelper(direct_light, 10);

	point_light = new THREE.PointLight(0xffffff, light_intensity, 100);
	point_light.position.set(5, 8, 5);
	point_light.castShadow = true;
	point_light.name = "Point Light";
	point_light.shadow.camera.top = 10;
	point_light.shadow.camera.bottom = -10;
	point_light.shadow.camera.left = -10;
	point_light.shadow.camera.right = 10;
	point_light.shadow.camera.near = 0.1;
	point_light.shadow.camera.far = 40;
	point_light.shadow.bias = 0.001;
	point_light.shadow.mapSize.width = 4096;
	point_light.shadow.mapSize.height = 4096;
	point_light_helper = new THREE.PointLightHelper(point_light, 0.5);

	spot_light = new THREE.SpotLight(0xffffff);
	spot_light.name = "Spot Light";
	spot_light.position.set(5, 8, 5);
	spot_light.castShadow = true;
	spot_light.shadow.camera.top = 10;
	spot_light.shadow.camera.bottom = -10;
	spot_light.shadow.camera.left = -10;
	spot_light.shadow.camera.right = 10;
	spot_light.shadow.camera.near = 0.1;
	spot_light.shadow.camera.far = 40;
	spot_light.shadow.bias = 0.001;
	spot_light.shadow.mapSize.width = 4096;
	spot_light.shadow.mapSize.height = 4096;

	spot_light_helper = new THREE.SpotLightHelper(spot_light);
	hasLight = false;
	window.hasLight = hasLight;
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

	fov = camera.fov;
	near = camera.near;
	far = camera.far;

	window.fov = fov;
	window.near = near;
	window.far = far;

	// Renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.shadowMap.enabled = true;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.update();

	document.getElementById("rendering").appendChild(renderer.domElement);

	initLight();

	// Lights
	const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
	hemiLight.position.set(0, 17, 0);
	// scene.add(hemiLight);

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
	let mode = { KeyT: "translate", KeyR: "rotate", KeyS: "scale" };

	if (!(event.code in mode)) return;

	let meshSelected = meshObject.find((obj) => obj.userData.isSelected === true);

	let transform_active = document.querySelector(".icon-tool.transform.active");
	let turn_off_transform = false;

	if (transform_active) {
		if (mode[event.code] === transform_active.name) {
			turn_off_transform = true;
		}
	}

	if (transform_active)
		transform_active.className = transform_active.className.replace(
			" active",
			""
		);

	if (!turn_off_transform) {
		transformControls.detach();
		transformControls.attach(meshSelected);
		meshSelected.userData.isTransform = true;
		let new_transform_active = document.querySelector(
			`.icon-tool.transform[name=${mode[event.code]}]`
		);
		new_transform_active.className += " active";
		switch (event.code) {
			case "KeyT":
				transformControls.setMode("translate");
				break;
			case "KeyR":
				transformControls.setMode("rotate");
				break;
			case "KeyS":
				transformControls.setMode("scale");
				break;
		}
	} else {
		transformControls.detach();
		meshSelected.userData.isTransform = false;
	}
}

document.querySelector(".icon-add-sub.add").addEventListener(
	"click",
	function (e) {
		let boxMesh = create_cube();
		boxMesh.position.x = THREE.MathUtils.randInt(0, 10);
		boxMesh.position.y = THREE.MathUtils.randInt(1, 5);

		meshObject.push(boxMesh);
		boxMesh = initDefault(boxMesh);

		if (meshObject.length === 1) {
			boxMesh.userData.isSelected = true;
		}
		scene.add(boxMesh);

		updateToolBar();
	},
	false
);

document.querySelector(".icon-add-sub.remove").addEventListener(
	"click",
	function (e) {
		transformControls.detach();
		let meshSelected = meshObject.find(
			(obj) => obj.userData.isSelected === true
		);

		if (meshObject.length > 0 && meshSelected) {
			meshObject = meshObject.filter((obj) => obj !== meshSelected);
			meshSelected = resetObj(meshSelected);

			if (meshObject.length === 1) {
				meshObject[0].userData.isSelected = true;
			}
			window.meshObject = meshObject;
		}

		updateToolBar();
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
			updateToolBar();
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
	obj.traverse(function (object) {
		if (object.isMesh) {
			object.geometry.dispose();
			object.material.dispose();
		}
	});
	scene.remove(obj);

	obj = null;
	return obj;
}

function importTexture(event) {
	const reader = new FileReader();
	reader.addEventListener("load", () => {
		localStorage.setItem("texture_uploaded", reader.result);
		const texture_option = document.querySelector(".sub-icon.material.texture");
		onClickSubToolObject(texture_option, 1);
	});
	reader.readAsDataURL(event.target.files[0]);
}

const onClickSubToolObject = (event, excludes = 0) => {
	if (event.target && event.target.className.includes("input-uploaded")) return;
	if (meshObject.length > 0) {
		let typeMesh, typeMaterial, event_type;
		let meshIndex = meshObject.findIndex(
			(obj) => obj.userData.isSelected === true
		);
		const old_object = meshObject[meshIndex].clone();
		let init_object = { ...meshObject[meshIndex].userData.init };

		if (!excludes) {
			event_type = event.target.className.includes(" geometry")
				? "geometry"
				: "material";
			if (event_type === "geometry") {
				typeMesh = event.target.alt;
				typeMaterial = meshObject[meshIndex].userData.typeMaterial;
			} else {
				typeMaterial = event.target.alt;
				typeMesh = meshObject[meshIndex].userData.type;
			}
		} else {
			event_type = "material";
			typeMesh = meshObject[meshIndex].userData.type;
			typeMaterial = "Texture Uploaded";
		}

		if (
			event_type === "material" &&
			typeMaterial === "Texture Uploaded" &&
			excludes === 0
		)
			return;

		let isTransform = meshObject[meshIndex].userData.isTransform;
		transformControls.detach();

		meshObject[meshIndex] = resetObj(meshObject[meshIndex]);
		meshObject[meshIndex] = create_geometry(typeMesh, typeMaterial);
		meshObject[meshIndex] = set_transform(meshObject[meshIndex], old_object);
		meshObject[meshIndex].userData.init = init_object;
		scene.add(meshObject[meshIndex]);
		if (isTransform) {
			transformControls.attach(meshObject[meshIndex]);
		}
	}
	updateToolBar();
};

function active_transform(event) {
	event.preventDefault();
	const icon = event.target;
	let meshSelected = meshObject.find((obj) => obj.userData.isSelected === true);

	if (meshObject.length > 0 && meshSelected) {
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
}

function onClickLightOption(event) {
	const light = event.target;

	const setting_light = ["Intensity", "Distance", "Translate Light"];
	slider[0].className = slider[0].className.replace(" active", "");
	slider[1].className = slider[1].className.replace(" active", "");

	if (!setting_light.some((el) => light.alt.includes(el))) {
		let old_color;
		if (window.currentLight) {
			old_color = window.currentLight.color.clone();
		}
		hasLight = false;
		scene.remove(point_light);
		scene.remove(point_light_helper);
		scene.remove(direct_light);
		scene.remove(direct_light_helper);
		scene.remove(spot_light);
		scene.remove(spot_light_helper);

		window.currentLight = null;

		light_option[light_option.length - 1].className = light_option[
			light_option.length - 1
		].className.replace(" active", "");
		transformControls.detach();

		if (!light.className.includes(" active")) {
			if (light.alt === "Directional Light") {
				scene.add(direct_light);
				scene.add(direct_light_helper);
				direct_light.intensity = light_intensity;
				direct_light.distance = light_distance;

				window.currentLight = direct_light;
			} else if (light.alt === "Point Light") {
				scene.add(point_light);
				scene.add(point_light_helper);
				point_light.intensity = light_intensity;
				point_light.distance = light_distance;

				window.currentLight = point_light;
			} else if (light.alt === "Spot Light") {
				scene.add(spot_light);
				scene.add(spot_light_helper);
				spot_light.intensity = light_intensity;
				spot_light.distance = light_distance;

				window.currentLight = spot_light;
			}
			hasLight = true;
		}
		window.hasLight = hasLight;
		if (window.currentLight !== null && old_color) {
			window.currentLight.color = old_color;
		}
	} else {
		if (hasLight) {
			light.className = light.className.replace(" not-active", "");
			if (!light.className.includes(" active")) {
				if (light.alt === "Translate Light") {
					transfrom_icon.forEach((icon) => {
						icon.className = icon.className.replace(" active", "");
					});

					transformControls.attach(window.currentLight);
					transformControls.setMode("translate");
				} else {
					let light_intensity = document.querySelector(
						"[class*='sub-icon light'][name='intensity']"
					);
					let light_distance = document.querySelector(
						"[class*='sub-icon light'][name='distance']"
					);

					light_intensity.className = light_intensity.className.replace(
						" active",
						""
					);
					light_distance.className = light_distance.className.replace(
						" active",
						""
					);
				}
				light.className += " active";
			} else {
				light.className = light.className.replace(" active", "");
				if (light.alt === "Translate Light") transformControls.detach();
				slider[0].className = slider[0].className.replace(" active", "");
				slider[1].className = slider[1].className.replace(" active", "");
			}
		}
	}

	updateLight();
	updateColor();
}

function onChangeAttrLight(event) {
	const attr = event.target;
	const setting_light = ["Intensity", "Distance", "Translate Light"];
	let light_attr_value = attr.value;
	if (attr.name === "intensity") {
		light_attr_value /= 10;
		light_intensity = light_attr_value;
	} else {
		light_distance = attr.value;
	}
	if (hasLight) {
		light_option.forEach((option) => {
			if (
				option.className.includes(" active") &&
				!setting_light.some((el) => option.alt.includes(el))
			) {
				let light = scene.getObjectByName(option.alt);
				light[attr.name] = light_attr_value;
				const slider_content = document.querySelector(
					`.wrapper.${attr.name} .slide-value`
				);

				slider_content.innerHTML = light_attr_value;
			}
		});
	}
}

function onChangeCameraProp(event) {
	const camera_option_active = document.querySelector(
		".sub-icon.camera.active"
	);
	const slider_content = document.querySelector(".wrapper.camera .slide-value");
	camera[camera_option_active.name] = parseInt(event.target.value);
	window[camera_option_active.name] = parseInt(event.target.value);
	slider_content.innerHTML = event.target.value;
	camera.updateProjectionMatrix();
}

function onClickCameraOption(event) {
	event.preventDefault();
	const icon_click = event.target;
	const current_active = document.querySelector(".sub-icon.camera.active");

	const sliderCamera = document.querySelector(".wrapper.camera");
	sliderCamera.className = sliderCamera.className.replace(" active", "");

	if (icon_click === current_active) {
		icon_click.className = icon_click.className.replace(" active", "");
	} else {
		if (current_active)
			current_active.className = current_active.className.replace(
				" active",
				""
			);
		icon_click.className += " active";

		updateCamera();
	}
}

function onClickAnimationOption(event, index) {
	event.preventDefault();
	let meshSelected = meshObject.find((obj) => obj.userData.isSelected === true);

	if (meshSelected) {
		meshSelected.userData.typeAni = 0;

		const ani_click = event.target;
		const current_active = document.querySelector(
			".subtool.animation-option .option.active"
		);

		if (ani_click === current_active) {
			ani_click.className = ani_click.className.replace(" active", "");
		} else {
			if (current_active)
				current_active.className = current_active.className.replace(
					" active",
					""
				);
			ani_click.className += " active";
			meshSelected.userData.typeAni = index;
			meshSelected.userData.start_scale_ani = meshSelected.scale.clone();
		}
	}

	updateAnimation();
}

function onChangeColor(event, index) {
	let meshSelected = meshObject.find((obj) => obj.userData.isSelected === true);
	let color = new THREE.Color(event.target.value);
	if (index === 0) {
		meshSelected.material.color = color;
	} else {
		window.currentLight.color = color;
	}
}

function onClickColorOption(event, index) {
	event.preventDefault();

	color_picker.forEach((color) => {
		color.className = color.className.replace(" active", "");
	});

	const option_click = event.target;
	const current_active = document.querySelector(".sub-icon.color.active");

	if (option_click === current_active) {
		option_click.className = option_click.className.replace(" active", "");
	} else {
		if (current_active)
			current_active.className = current_active.className.replace(
				" active",
				""
			);
		option_click.className += " active";
		color_picker[index].className += " active";
	}

	updateColor();
}

function onClickResetObject(event) {
	event.preventDefault();

	let meshIndex = meshObject.findIndex(
		(obj) => obj.userData.isSelected === true
	);

	let init_object = { ...meshObject[meshIndex].userData.init };

	let isTransform = meshObject[meshIndex].userData.isTransform;
	transformControls.detach();

	meshObject[meshIndex] = resetObj(meshObject[meshIndex]);

	meshObject[meshIndex] = create_geometry(
		init_object.type,
		init_object.typeMaterial
	);
	meshObject[meshIndex] = set_transform(
		meshObject[meshIndex],
		init_object,
		"reset"
	);
	meshObject[meshIndex].userData.init = init_object;
	meshObject[meshIndex].userData.isSelected = true;
	meshObject[meshIndex].userData.isTransform = isTransform;

	scene.add(meshObject[meshIndex]);

	if (isTransform) {
		transformControls.attach(meshObject[meshIndex]);
	}
	updateCurrentGeometry(meshObject);
	updateCurrentMaterial(meshObject);

	updateColor();
}

const transfrom_icon = document.querySelectorAll(".icon-tool.transform");

const geometry_option = document.querySelectorAll(".sub-icon.geometry");
geometry_option.forEach((option) => {
	option.addEventListener("click", onClickSubToolObject);
});

const texture_uploaded = document.querySelector("label input.input-uploaded");
texture_uploaded.addEventListener("change", importTexture);

const material_option = document.querySelectorAll(".sub-icon.material");

material_option.forEach((option) => {
	option.addEventListener("click", onClickSubToolObject);
});

const light_option = document.querySelectorAll(".sub-icon.light");
light_option.forEach((option) => {
	option.addEventListener("click", onClickLightOption);
});

const animation_option = document.querySelectorAll(
	".subtool.animation-option .option"
);
animation_option.forEach((option, index) => {
	option.addEventListener("click", (event) =>
		onClickAnimationOption(event, index + 1)
	);
});

const camera_option = document.querySelectorAll(".sub-icon.camera");
camera_option.forEach((option) => {
	option.addEventListener("click", onClickCameraOption, false);
});

const color_option = document.querySelectorAll(".sub-icon.color");
color_option.forEach((option, index) => {
	option.addEventListener(
		"click",
		(event) => onClickColorOption(event, index),
		false
	);
});

const color_picker = document.querySelectorAll(".color-picker");
color_picker.forEach((picker, index) =>
	picker.addEventListener("input", (e) => onChangeColor(e, index))
);

const tools = document.querySelectorAll(".icon-tool");
tools.forEach((tool, index) => {
	if (index < 3) tool.addEventListener("click", active_transform);
});

const slider = document.querySelectorAll(".wrapper");
slider.forEach((sli) => {
	if (sli.className.includes("camera")) {
		sli.addEventListener("input", onChangeCameraProp, false);
	} else {
		sli.addEventListener("input", onChangeAttrLight, false);
	}
});

const reset_icon = document.querySelector(".icon-reset");
reset_icon.addEventListener("click", onClickResetObject);

window.addEventListener("keydown", HandleKeyboard);

document
	.getElementById("rendering")
	.addEventListener("click", clickObject, false);

document
	.getElementById("rendering")
	.addEventListener("mousemove", hoverObject, false);

let time = Date.now();
function update() {
	const current_time = Date.now();
	const delta_time = current_time - time;
	time = current_time;

	const initialAngularVelocity = new THREE.Vector3(0.5, 0.5, 0.5);

	meshObject.forEach((obj) => {
		switch (obj.userData.typeAni) {
			case 0:
				break;
			case 1:
				obj.rotation.x += delta_time * 0.0005;
				obj.rotation.y += delta_time * 0.002;
				obj.rotation.z += delta_time * 0.001;
				break;
			case 2:
				obj.position.y = (Math.sin(Date.now() * 0.002) + 1.3) * 6;
				obj.rotation.y += delta_time * 0.002;
				obj.rotation.z += delta_time * 0.001;
				break;
			case 3:
				obj.userData.alpha_ani = Math.PI * 0.005 + obj.userData.alpha_ani;
				obj.position.x = Math.sin(obj.userData.alpha_ani) * 5;
				obj.position.z = Math.cos(obj.userData.alpha_ani) * 5;
				obj.rotation.y = Date.now() * 0.002;
				obj.rotation.z = Date.now() * 0.001;
				if (obj.userData.alpha_ani == 2 * Math.PI) obj.userData.alpha_ani = 0;
				break;
			case 4:
				let scale_unit = 0.005;
				let min_axis = Math.min(
					obj.userData.start_scale_ani.x,
					obj.userData.start_scale_ani.y,
					obj.userData.start_scale_ani.z
				);

				scale_unit = obj.userData.scale_ani * scale_unit;

				let scale_vector = new THREE.Vector3(
					(obj.userData.start_scale_ani.x / min_axis) * scale_unit,
					(obj.userData.start_scale_ani.y / min_axis) * scale_unit,
					(obj.userData.start_scale_ani.z / min_axis) * scale_unit
				);

				obj.scale.sub(scale_vector);

				if (
					obj.scale.x <= -obj.userData.start_scale_ani.x ||
					obj.scale.x >= obj.userData.start_scale_ani.x
				)
					obj.userData.scale_ani = -obj.userData.scale_ani;

				// Update the cube's rotation
				obj.rotation.x += initialAngularVelocity.x * delta_time * 0.001;
				obj.rotation.y += initialAngularVelocity.y * delta_time * 0.001;
				obj.rotation.z += initialAngularVelocity.z * delta_time * 0.001;
				break;
		}
	});
}

function animate() {
	update();
	requestAnimationFrame(animate);

	controls.update();

	renderer.render(scene, camera);
}

init();
animate();

export { meshObject };
