import * as THREE from "three";
import { TeapotBufferGeometry } from "./TeapotBufferGeometry";

function initUserData(obj, type, typeMaterial) {
	obj.userData.canjustify = true;
	obj.userData.isSelected = false;
	obj.userData.type = type;
	obj.userData.typeMaterial = typeMaterial;
	obj.userData.isTransform = false;
	obj.userData.typeAni = 0;
	obj.userData.alpha_ani = 0;
	obj.userData.scale_ani = 1;
	obj.userData.texture_src = null;

	obj.userData.start_scale_ani = obj.scale.clone();
	obj.castShadow = true;
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

function set_transform(obj, old_object) {
	const props = ["position", "rotation", "scale"];

	props.forEach((prop) => obj[prop].copy(old_object[prop].clone()));

	obj.material.color = old_object.material.color.clone();

	obj.userData = {
		...obj.userData,
		isSelected: old_object.userData.isSelected,
		isTransform: old_object.userData.isTransform,
		typeAni: old_object.userData.typeAni,
		alpha_ani: old_object.userData.alpha_ani,
		scale_ani: old_object.userData.scale_ani,
		start_scale_ani: old_object.userData.start_scale_ani,
	};

	return obj;
}

function get_material(geometry, typeMaterial) {
	let obj;
	let material;
	switch (typeMaterial) {
		case "Solid":
			material = new THREE.MeshBasicMaterial({
				color: "#F5F5F5",
				transparent: true,
				opacity: 1,
			});
			obj = new THREE.Mesh(geometry, material);
			break;
		case "Point":
			material = new THREE.PointsMaterial({
				transparent: true,
				opacity: 1,
				size: 0.2,
			});
			obj = new THREE.Points(geometry, material);
			break;
		case "Line":
			material = new THREE.LineBasicMaterial({ transparent: true, opacity: 1 });
			obj = new THREE.Line(geometry, material);
			break;
		case "Normal":
			material = new THREE.MeshNormalMaterial({
				transparent: true,
				opacity: 1,
			});
			obj = new THREE.Mesh(geometry, material);
			break;
		case "Phong":
			material = new THREE.MeshPhongMaterial({
				side: THREE.DoubleSide,
				transparent: true,
				opacity: 1,
			});
			obj = new THREE.Mesh(geometry, material);
			break;
		case "Texture Uploaded":
			let userImageURL = localStorage.getItem("texture_uploaded");
			var loader = new THREE.TextureLoader();
			loader.setCrossOrigin("");
			var texture = loader.load(userImageURL);
			material = new THREE.MeshStandardMaterial({
				map: texture,
				transparent: true,
				opacity: 1,
			});
			obj = new THREE.Mesh(geometry, material);
			break;
	}
	return obj;
}

function create_cube(typeMaterial = "Solid") {
	const cubeGeometry = new THREE.BoxGeometry(3, 3, 3, 10, 10, 10);
	const cubeMesh = get_material(cubeGeometry, typeMaterial);

	cubeMesh.position.y = 3;

	initUserData(cubeMesh, "Cube", typeMaterial);

	return cubeMesh;
}

function create_sphere(typeMaterial = "Solid") {
	const geometry = new THREE.SphereGeometry(3, 32, 32);
	const sphere = get_material(geometry, typeMaterial);

	sphere.position.y = 3;

	initUserData(sphere, "Sphere", typeMaterial);

	return sphere;
}

function create_cone(typeMaterial = "Solid") {
	const geometry = new THREE.ConeGeometry(3, 3, 32, 16);
	const cone = get_material(geometry, typeMaterial);

	cone.position.y = 3;

	initUserData(cone, "Cone", typeMaterial);

	return cone;
}

function create_cylinder(typeMaterial = "Solid") {
	const geometry = new THREE.CylinderGeometry(3, 3, 6, 32, 16);
	const cyclinder = get_material(geometry, typeMaterial);

	cyclinder.position.y = 3;

	initUserData(cyclinder, "Cylinder", typeMaterial);

	return cyclinder;
}

function create_torus(typeMaterial = "Solid") {
	const geometry = new THREE.TorusGeometry(3, 1, 16, 48);
	const torus = get_material(geometry, typeMaterial);

	torus.position.y = 3;

	initUserData(torus, "Torus", typeMaterial);

	return torus;
}

function create_teapot(typeMaterial = "Solid") {
	const geometry = new TeapotBufferGeometry(3, 8);
	const teapot = get_material(geometry, typeMaterial);

	teapot.position.y = 3;
	initUserData(teapot, "Teapot", typeMaterial);
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
