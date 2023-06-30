import * as THREE from "three";
import { TeapotBufferGeometry } from "./TeapotBufferGeometry";

function initUserData(obj, type) {
	obj.userData.canjustify = true;
	obj.userData.isSelected = false;
	obj.userData.type = type;
	obj.userData.isTransform = false;
	obj.name = type + THREE.MathUtils.randInt(0, 100);

	return obj;
}

const material = new THREE.MeshNormalMaterial({
	transparent: true,
	opacity: 1,
});

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

function set_transform(obj, position, rotate, scale) {
	obj.position.copy(position);
	obj.rotation.copy(rotate);
	obj.scale.copy(scale);
	return obj;
}

function create_cube() {
	const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

	const cubeMesh = new THREE.Mesh(cubeGeometry, material);

	cubeMesh.position.y = 1;

	initUserData(cubeMesh, "Cube");

	return cubeMesh;
}

function create_sphere() {
	const geometry = new THREE.SphereGeometry(1, 32, 16);
	const sphere = new THREE.Mesh(geometry, material);

	sphere.position.y = 1;

	initUserData(sphere, "Sphere");

	return sphere;
}

function create_cone() {
	const geometry = new THREE.ConeGeometry(1, 2, 32);
	const cone = new THREE.Mesh(geometry, material);

	cone.position.y = 1;

	initUserData(cone, "Cone");

	return cone;
}

function create_cylinder() {
	const geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
	const cyclinder = new THREE.Mesh(geometry, material);

	cyclinder.position.y = 1;

	initUserData(cyclinder, "Cylinder");

	return cyclinder;
}

function create_torus() {
	const geometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
	const torus = new THREE.Mesh(geometry, material);

	torus.position.y = 1;

	initUserData(torus, "Torus");

	return torus;
}

function create_teapot() {
	const geometry = new TeapotBufferGeometry(1, 8);
	const teapot = new THREE.Mesh(geometry, material);

	teapot.position.y = 1;

	initUserData(teapot, "Teapot");

	return teapot;
}

export {
	create_background_point,
	set_transform,
	create_cube,
	create_sphere,
	create_cone,
	create_cylinder,
	create_torus,
	create_teapot,
};
