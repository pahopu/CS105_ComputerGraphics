import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'

const model_path = 'static/mutant/model.fbx';
const anim_paths = [
    'static/mutant/idle.fbx',
    'static/mutant/walk.fbx',
    'static/mutant/run.fbx'
];

let model, skeleton, mixer, clock;
let scene, camera, renderer, stats, controls;

const crossFadeControls = [];

let actions = [];
let weights, settings, actionNum = 0;

let singleStepMode = false;
let sizeOfNextStep = 0;

init();

function init() {
    // Clock
    clock = new THREE.Clock()

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
    scene.background = new THREE.Color(0xa0a0a0);

    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(-8, 1.15, 7.5);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    // Stats
    stats = new Stats()
    document.body.appendChild(stats.dom);

    // Responsive
    window.addEventListener('resize', function () {
        var width = window.innerWidth;
        var height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

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
    dirLight.shadow.bias = 0.001
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);

    // Ground
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Load model
    const loader = new FBXLoader();
    loader.load(model_path, function (fbx) {
        // Scale and set position
        fbx.position.set(-6, 0, 5);
        fbx.scale.set(.01, .01, .01);

        // Model
        model = fbx;
        scene.add(model);

        model.traverse(function (object) {
            if (object.isMesh) object.castShadow = true;
        });

        // Skeleton
        skeleton = new THREE.SkeletonHelper(model);
        skeleton.visible = false;
        scene.add(skeleton);

        // Panel
        createPanel();

        // Mixer
        mixer = new THREE.AnimationMixer(model);

        // Animations
        anim_paths.forEach((path) => {
            loader.load(path, (animation) => {
                actions.push(mixer.clipAction(animation.animations[0]));
                actions[actionNum].play();
                if (path === anim_paths[1]) {
                    setWeight(actions[actionNum], 1);
                }
                else {
                    setWeight(actions[actionNum], 0);
                }
                actionNum++;
            });
        });

        // Action weights
        weights = Array(actionNum).fill(0);

        // Run
        animate();
    });
}

// Create panel to control
function createPanel() {
    const panel = new GUI({ width: 330 });

    const folder1 = panel.addFolder('Visibility');
    const folder2 = panel.addFolder('Activation/Deactivation');
    const folder3 = panel.addFolder('Pausing/Stepping');
    const folder4 = panel.addFolder('Crossfading');
    const folder5 = panel.addFolder('Blend Weights');
    const folder6 = panel.addFolder('General Speed');

    settings = {
        'show model': true,
        'show skeleton': false,
        'activate all': activateAllActions,
        'deactivate all': deactivateAllActions,
        'pause/continue': pauseContinue,
        'make single step': toSingleStepMode,
        'modify step size': 0.05,
        'from idle to walk': function () {
            prepareCrossFade(actions[0], actions[1], 0.5)
        },
        'from walk to run': function () {
            prepareCrossFade(actions[1], actions[2], 2.5)
        },
        'from run to walk': function () {
            prepareCrossFade(actions[2], actions[1], 5.0)
        },
        'from walk to idle': function () {
            prepareCrossFade(actions[1], actions[0], 1.0)
        },
        'use default duration': true,
        'set custom duration': 3.5,
        'modify idle weight': 0.0,
        'modify walk weight': 1.0,
        'modify run weight': 0.0,
        'modify time scale': 1.0
    };

    folder1.add(settings, 'show model').onChange(showModel);
    folder1.add(settings, 'show skeleton').onChange(showSkeleton);

    folder2.add(settings, 'activate all');
    folder2.add(settings, 'deactivate all');

    folder3.add(settings, 'pause/continue');
    folder3.add(settings, 'make single step');
    folder3.add(settings, 'modify step size', 0.01, 0.1, 0.001);

    crossFadeControls.push(folder4.add(settings, 'from idle to walk'));
    crossFadeControls.push(folder4.add(settings, 'from walk to run'));
    crossFadeControls.push(folder4.add(settings, 'from run to walk'));
    crossFadeControls.push(folder4.add(settings, 'from walk to idle'));

    folder4.add(settings, 'use default duration');
    folder4.add(settings, 'set custom duration', 0, 10, 0.01);

    folder5.add(settings, 'modify idle weight', 0.0, 1.0, 0.01).listen().onChange(function (weight) {
        setWeight(actions[0], weight);
    });
    folder5.add(settings, 'modify walk weight', 0.0, 1.0, 0.01).listen().onChange(function (weight) {
        setWeight(actions[1], weight);
    });
    folder5.add(settings, 'modify run weight', 0.0, 1.0, 0.01).listen().onChange(function (weight) {
        setWeight(actions[2], weight);
    });

    folder6.add(settings, 'modify time scale', 0.0, 1.5, 0.01).onChange(modifyTimeScale)
}

function showModel(visibility) {
    model.visible = visibility;
}

function showSkeleton(visibility) {
    skeleton.visible = visibility;
}

function activateAllActions() {
    setWeight(actions[0], settings['modify idle weight']);
    setWeight(actions[1], settings['modify walk weight']);
    setWeight(actions[2], settings['modify run weight']);

    actions.forEach((action) => {
        action.play();
    })
}

function deactivateAllActions() {
    actions.forEach((action) => {
        action.stop();
    })
}

function pauseContinue() {
    if (singleStepMode) {
        singleStepMode = false;
        unPauseAllActions();
    } else {
        if (actions[0].paused) {
            unPauseAllActions();
        } else {
            pauseAllActions();
        }
    }
}

function toSingleStepMode() {
    unPauseAllActions();
    singleStepMode = true;
    sizeOfNextStep = settings['modify step size'];
}

function pauseAllActions() {
    actions.forEach((action) => {
        action.paused = true;
    })
}

function unPauseAllActions() {
    actions.forEach((action) => {
        action.paused = false;
    })
}

function prepareCrossFade(startAction, endAction, defaultDuration) {
    const duration = setCrossFadeDuration(defaultDuration);

    singleStepMode = false;
    unPauseAllActions();

    if (startAction === actions[0]) {
        executeCrossFade(startAction, endAction, duration);
    } else {
        synchronizeCrossFade(startAction, endAction, duration);
    }
}

function setCrossFadeDuration(defaultDuration) {
    if (settings['use default duration']) {
        return defaultDuration;
    } else {
        return settings['set custom duration'];
    }

}

function synchronizeCrossFade(startAction, endAction, duration) {
    mixer.addEventListener('loop', onLoopFinished);
    function onLoopFinished(event) {
        if (event.action === startAction) {
            mixer.removeEventListener('loop', onLoopFinished);
            executeCrossFade(startAction, endAction, duration);
        }
    }
}

function executeCrossFade(startAction, endAction, duration) {
    setWeight(endAction, 1);
    endAction.time = 0;
    startAction.crossFadeTo(endAction, duration, true);
}

function modifyTimeScale(speed) {
    mixer.timeScale = speed;
}

function setWeight(action, weight) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
}

function updateWeightSliders() {
    settings['modify idle weight'] = weights[0];
    settings['modify walk weight'] = weights[1];
    settings['modify run weight'] = weights[2];
}

function updateCrossFadeControls() {
    if (weights[0] === 1 && weights[1] === 0 && weights[2] === 0) {
        crossFadeControls[0].enable();
        crossFadeControls[1].disable();
        crossFadeControls[2].disable();
        crossFadeControls[3].disable();
    }
    if (weights[0] === 0 && weights[1] === 1 && weights[2] === 0) {
        crossFadeControls[0].disable();
        crossFadeControls[1].enable();
        crossFadeControls[2].disable();
        crossFadeControls[3].enable();
    }
    if (weights[0] === 0 && weights[1] === 0 && weights[2] === 1) {
        crossFadeControls[0].disable();
        crossFadeControls[1].disable();
        crossFadeControls[2].enable();
        crossFadeControls[3].disable();
    }
}

function animate() {
    requestAnimationFrame(animate);

    for (let i = 0; i < actionNum; i++)
        weights[i] = actions[i].getEffectiveWeight();

    updateWeightSliders();

    updateCrossFadeControls();

    let mixerUpdateDelta = clock.getDelta();

    if (singleStepMode) {
        mixerUpdateDelta = sizeOfNextStep;
        sizeOfNextStep = 0;
    }

    mixer.update(mixerUpdateDelta);

    stats.update();

    renderer.render(scene, camera);
}