import * as THREE from "three";

function initUserData(obj, type) {
	obj.userData.canjustify = true;
	obj.userData.isSelected = false;
	obj.userData.type = type;
	obj.userData.isTransform = false;
	obj.name = type + THREE.MathUtils.randInt(0, 100);

	return obj;
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

function create_cube(position = null) {
	const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
	const cubeMaterial = new THREE.MeshNormalMaterial({
		transparent: true,
		opacity: 1,
	});
	const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);

	if (position === null) cubeMesh.position.y = 1;
	else cubeMesh.position.copy(position);

	initUserData(cubeMesh, "Cube");

	return cubeMesh;
}

function create_sphere(position = null) {
	const geometry = new THREE.SphereGeometry(1, 32, 16);
	const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
	const sphere = new THREE.Mesh(geometry, material);

	if (position === null) sphere.position.y = 1;
	else sphere.position.copy(position);
	initUserData(sphere, "Sphere");

	return sphere;
}

export { create_background_point, create_cube, create_sphere };
