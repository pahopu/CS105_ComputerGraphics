import {
	updateCurrentGeometry,
	updateCurrentMaterial,
	updateLight,
	updateCamera,
	updateAnimation,
	updateColor,
	updateToolBar,
} from "./update";

import invert from "invert-color";

const tools = document.querySelectorAll(".icon-tool");
const icons_geometry = document.querySelectorAll(".sub-icon");

const icons_color = document.querySelectorAll(".sub-icon.color");

const color_picker = document.querySelectorAll("input[type='color']");
color_picker.forEach((el) => el.addEventListener("input", onChangeColor));

const add_sub_tool = document.querySelector(".tool-add-sub-option");
const add_sub_tool_main = add_sub_tool.querySelector(".icon-add-sub.main");
const add_sub_tool_add = add_sub_tool.querySelector(".icon-add-sub.add");
const add_sub_tool_remove = add_sub_tool.querySelector(".icon-add-sub.remove");

add_sub_tool_main.addEventListener("click", manage_add_sub_tool);
add_sub_tool_main.addEventListener("click", manage_add_sub_tool);

tools.forEach((tool, index) => {
	tool.addEventListener("mouseenter", showTooltip);
	tool.addEventListener("mouseleave", hideTooltip);
	if (index < 3) tool.addEventListener("click", selectTransfrom);
	else if (tool.className.includes("cl"))
		tool.addEventListener("click", onClickColorOption);
	else tool.addEventListener("click", selectTool);
});

icons_geometry.forEach((icon) => {
	icon.addEventListener("mouseenter", showTooltip);
	icon.addEventListener("mouseleave", hideTooltip);
});

icons_color.forEach((icon) => {
	icon.addEventListener("click", (e) => {
		if (e.target.className.includes(" active")) {
			hideTooltip();
		}
	});

	icon.addEventListener("mouseenter", (e) => {
		if (e.target.className.includes(" active")) {
			hideTooltip();
		}
	});
});

function manage_add_sub_tool(event) {
	let main_is_active = add_sub_tool_main.className.includes(" active");
	if (!main_is_active) {
		add_sub_tool_main.className += " active";
		active_add_sub_tool();
	} else {
		add_sub_tool_main.className = add_sub_tool_main.className.replace(
			" active",
			""
		);
		deactive_add_sub_tool();
	}
}

function active_add_sub_tool() {
	add_sub_tool_add.className += " active";
	add_sub_tool_remove.className += " active";
}

function deactive_add_sub_tool() {
	add_sub_tool_add.className = add_sub_tool_add.className.replace(
		" active",
		""
	);
	add_sub_tool_remove.className = add_sub_tool_remove.className.replace(
		" active",
		""
	);
}

function onChangeColor(event) {
	let color_value = event.target.offsetParent.children[1];
	color_value.innerHTML = event.target.value;
	color_value.style.color = invert(event.target.value, true);
}

function onClickColorOption(event) {
	event.preventDefault();

	const color_option = document.querySelector(".subtool.color-option");
	const color_picker = document.querySelectorAll(".color-picker");

	const camera_option = document.querySelector(".camera-option");
	const camera_tool = document.querySelector(".icon-tool.normal.cr");

	color_picker.forEach((picker) => {
		picker.className = picker.className.replace(" active", "");
	});

	color_option.className = color_option.className.replace(" active", "");

	if (!event.target.className.includes(" active")) {
		hideTooltip();
		camera_option.className = camera_option.className.replace(" active", "");
		camera_tool.className = camera_tool.className.replace(" active", "");
		updateCamera();
		event.target.className += " active";
		color_option.className += " active";
	} else {
		event.target.className = event.target.className.replace(" active", "");
	}

	updateColor();
}

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

	const color_tool = document.querySelector(".icon-tool.cl");
	const color_option = document.querySelector(".color-option");

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
			color_tool.className = color_tool.className.replace(" active", "");
			color_option.className = color_option.className.replace(" active", "");

			camera_option.className += " active";
			updateCamera();
			updateColor();
		} else if (icon.alt === "Animation") {
			animation_option.className += " active";
			updateAnimation();
		}
	}
}

function showTooltip(event) {
	const icon = event.target;
	const list_show = [" geometry", " material", " light", " camera", " color"];

	if (
		icon.className.includes(" active") &&
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

	const list_show = [" geometry", " material", " light", " camera", " color"];

	list_show.forEach(
		(el) => (tooltip.className = tooltip.className.replace(el, ""))
	);

	tooltip.style.opacity = 0;
	tooltip.style.visibility = "hidden";
}

// export { updateCurrentGeometry };
