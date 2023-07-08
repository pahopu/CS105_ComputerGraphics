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

function initDefault(obj) {
	obj.userData.init = {
		...obj.userData,
		position: obj.position.clone(),
		rotation: obj.rotation.clone(),
		scale: obj.scale.clone(),
		color: obj.material.color.clone(),
	};

	return obj;
}

function set_transform(obj, old_object, _case = "change") {
	const props = ["position", "rotation", "scale"];

	if (_case === "change") {
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
	} else {
		props.forEach((prop) => {
			let prop_value = old_object[prop];
			obj[prop].copy(prop_value);
		});
		obj.material.color = old_object.color;
		obj.userData = {
			...obj.userData,
			isSelected: old_object.isSelected,
			isTransform: old_object.isTransform,
			typeAni: old_object.typeAni,
			alpha_ani: old_object.alpha_ani,
			scale_ani: old_object.scale_ani,
			start_scale_ani: old_object.start_scale_ani,
		};
	}

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

function getTube(size) {
	class CustomSinCurve extends THREE.Curve {
		constructor(scale = 1) {
			super();

			this.scale = scale;
		}

		getPoint(t, optionalTarget = new THREE.Vector3()) {
			const tx = t * 3 - 1.5;
			const ty = Math.sin(2 * Math.PI * t);
			const tz = 0;

			return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
		}
	}

	return new CustomSinCurve(size);
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

function create_torus_knot(typeMaterial = "Solid") {
	const geometry = new THREE.TorusKnotGeometry(2, 0.6, 100, 16);
	const torus_knot = get_material(geometry, typeMaterial);

	torus_knot.position.y = 3;

	initUserData(torus_knot, "Torus Knot", typeMaterial);

	return torus_knot;
}

function create_teapot(typeMaterial = "Solid") {
	const geometry = new TeapotBufferGeometry(3, 8);
	const teapot = get_material(geometry, typeMaterial);

	teapot.position.y = 3;
	initUserData(teapot, "Teapot", typeMaterial);
	return teapot;
}

function create_tube(typeMaterial) {
	const geometry = new THREE.TubeGeometry(getTube(3), 40, 1, 16, false);
	const tube = get_material(geometry, typeMaterial);
	tube.position.y = 3;
	initUserData(tube, "Tube", typeMaterial);
	return tube;
}

function create_octahedron(typeMaterial) {
	const geometry = new THREE.OctahedronGeometry(3, 0);
	const octahedron = get_material(geometry, typeMaterial);
	octahedron.position.y = 3;
	initUserData(octahedron, "Octahedron", typeMaterial);
	return octahedron;
}

function create_tetrahedron(typeMaterial) {
	const geometry = new THREE.TetrahedronGeometry(3, 0);
	const tetrahedron = get_material(geometry, typeMaterial);
	tetrahedron.position.y = 3;
	initUserData(tetrahedron, "Tetrahedron", typeMaterial);
	return tetrahedron;
}

function create_dodecahedron(typeMaterial) {
	const geometry = new THREE.DodecahedronGeometry(3, 0);
	const dodecahedron = get_material(geometry, typeMaterial);
	dodecahedron.position.y = 3;
	initUserData(dodecahedron, "Dodecahedron", typeMaterial);
	return dodecahedron;
}

function create_icosahedron(typeMaterial) {
	const geometry = new THREE.IcosahedronGeometry(3, 0);
	const icosahedron = get_material(geometry, typeMaterial);
	icosahedron.position.y = 3;
	initUserData(icosahedron, "Icosahedron", typeMaterial);
	return icosahedron;
}

function create_heart(typeMaterial) {
	const unit_scale = 0.1;
	const x = -10 * unit_scale,
		y = -10 * unit_scale;
	var heartShape = new THREE.Shape();
	heartShape.moveTo(x + 5 * unit_scale, y + 5 * unit_scale);
	heartShape.bezierCurveTo(
		x + 5 * unit_scale,
		y + 5 * unit_scale,
		x + 4 * unit_scale,
		y,
		x,
		y
	);
	heartShape.bezierCurveTo(
		x - 6 * unit_scale,
		y,
		x - 6 * unit_scale,
		y + 7 * unit_scale,
		x - 6 * unit_scale,
		y + 7 * unit_scale
	);
	heartShape.bezierCurveTo(
		x - 6 * unit_scale,
		y + 11 * unit_scale,
		x - 3 * unit_scale,
		y + 15.4 * unit_scale,
		x + 5 * unit_scale,
		y + 19 * unit_scale
	);
	heartShape.bezierCurveTo(
		x + 12 * unit_scale,
		y + 15.4 * unit_scale,
		x + 16 * unit_scale,
		y + 11 * unit_scale,
		x + 16 * unit_scale,
		y + 7 * unit_scale
	);
	heartShape.bezierCurveTo(
		x + 16 * unit_scale,
		y + 7 * unit_scale,
		x + 16 * unit_scale,
		y,
		x + 10 * unit_scale,
		y
	);
	heartShape.bezierCurveTo(
		x + 7 * unit_scale,
		y,
		x + 5 * unit_scale,
		y + 5 * unit_scale,
		x + 5 * unit_scale,
		y + 5 * unit_scale
	);

	const extrudeSettings = {
		depth: 0.2,
		bevelEnabled: true,
		bevelSegments: 8,
		steps: 2,
		bevelSize: 0.2,
		bevelThickness: 0.2,
	};

	const geometryHeart = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
	let heart = get_material(geometryHeart, typeMaterial);

	heart.position.y = 3;
	initUserData(heart, "Heart", typeMaterial);
	return heart;
}

function create_geometry(typeMesh, typeMaterial) {
	let obj;
	switch (typeMesh) {
		case "Cube":
			obj = create_cube(typeMaterial);
			break;
		case "Sphere":
			obj = create_sphere(typeMaterial);
			break;
		case "Cone":
			obj = create_cone(typeMaterial);
			break;
		case "Cylinder":
			obj = create_cylinder(typeMaterial);
			break;
		case "Torus":
			obj = create_torus(typeMaterial);
			break;
		case "Teapot":
			obj = create_teapot(typeMaterial);
			break;
		case "Torus Knot":
			obj = create_torus_knot(typeMaterial);
			break;
		case "Tube":
			obj = create_tube(typeMaterial);
			break;
		case "Tetrahedron":
			obj = create_tetrahedron(typeMaterial);
			break;
		case "Octahedron":
			obj = create_octahedron(typeMaterial);
			break;
		case "Dodecahedron":
			obj = create_dodecahedron(typeMaterial);
			break;
		case "Icosahedron":
			obj = create_icosahedron(typeMaterial);
			break;
		case "Heart":
			obj = create_heart(typeMaterial);
			break;
	}
	return obj;
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
	create_geometry,
	initDefault,
};
