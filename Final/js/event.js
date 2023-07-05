import {
	updateCurrentGeometry,
	updateCurrentMaterial,
	updateLight,
	updateCamera,
	updateAnimation,
} from "./update";

const tools = document.querySelectorAll(".icon-tool");
const icons_geometry = document.querySelectorAll(".sub-icon");

tools.forEach((tool, index) => {
	tool.addEventListener("mouseenter", showTooltip);
	tool.addEventListener("mouseleave", hideTooltip);
	if (index < 3) tool.addEventListener("click", selectTransfrom);
	else tool.addEventListener("click", selectTool);
});

icons_geometry.forEach((icon) => {
	icon.addEventListener("mouseenter", showTooltip);
	icon.addEventListener("mouseleave", hideTooltip);
});

function selectTransfrom(event) {
	var current = document.getElementsByClassName("icon-tool transform active");
	const icon = event.target;
	let flag = false;
	if (current.length > 0) {
		if (current[0] === icon) flag = true;
		current[0].className = current[0].className.replace(" active", "");
	}
	if (!flag) {
		hideTooltip();
		icon.className += " active";
	}
}

function selectTool(event) {
	var current = document.getElementsByClassName("icon-tool normal active");
	const icon = event.target;
	let flag = false;

	const geometry_option = document.getElementsByClassName("geometry-option")[0];
	const material_option = document.getElementsByClassName("material-option")[0];
	const light_option = document.getElementsByClassName("light-option")[0];
	const camera_option = document.getElementsByClassName("camera-option")[0];
	const animation_option =
		document.getElementsByClassName("animation-option")[0];

	geometry_option.className = geometry_option.className.replace(" active", "");
	material_option.className = material_option.className.replace(" active", "");
	light_option.className = light_option.className.replace(" active", "");
	camera_option.className = camera_option.className.replace(" active", "");
	animation_option.className = animation_option.className.replace(
		" active",
		""
	);

	const slider = document.querySelectorAll(".wrapper");

	slider.forEach((sli) => {
		sli.className = sli.className.replace(" active", "");
	});

	if (current.length > 0) {
		if (current[0] === icon) flag = true;
		current[0].className = current[0].className.replace(" active", "");
	}

	if (!flag) {
		hideTooltip();

		icon.className += " active";
		if (icon.alt === "Geometry") {
			geometry_option.className += " active";
			updateCurrentGeometry(window.meshObject);
		} else if (icon.alt === "Material") {
			material_option.className += " active";
			updateCurrentMaterial(window.meshObject);
		} else if (icon.alt === "Light") {
			light_option.className += " active";
			updateLight();
		} else if (icon.alt === "Camera") {
			camera_option.className += " active";
			updateCamera();
		} else if (icon.alt === "Animation") {
			animation_option.className += " active";
			updateAnimation();
		}
	}
}

function showTooltip(event) {
	const icon = event.target;
	const list_show = [" geometry", " material", " light", " camera"];

	if (
		icon.className.includes("active") &&
		!list_show.some((el) => icon.className.includes(el))
	)
		return;
	const tooltip = document.getElementsByClassName("tool-tip")[0];

	tooltip.innerHTML = icon.alt;

	const iconRect = icon.getBoundingClientRect();

	list_show.some((el) => {
		tooltip.className = tooltip.className.replace(el, "");
		if (icon.className.includes(el)) {
			tooltip.className += el;
			return;
		}
	});

	tooltip.style.top = iconRect.top + "px";
	tooltip.style.opacity = 1;
	tooltip.style.visibility = "visible";
}

function hideTooltip(event) {
	const tooltip = document.getElementsByClassName("tool-tip")[0];

	tooltip.className = tooltip.className.replace(" geometry", "");
	tooltip.className = tooltip.className.replace(" material", "");
	tooltip.className = tooltip.className.replace(" light", "");

	tooltip.style.opacity = 0;
	tooltip.style.visibility = "hidden";
}

// export { updateCurrentGeometry };
