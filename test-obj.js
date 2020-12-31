import * as THREE from 'three';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let container;
let camera;
let renderer;
let scene;
const loadpath = './common/assets/hand_painted_treasure_chest/scene.gltf';

export default function (realPath) {

    init(realPath);
    animate();

}

function init (realPath = loadpath) {

    container = document.querySelector('.scene');

    // create scene
    scene = new THREE.Scene();

    // filed of view
    const fov = 35;
    const aspect = container.clientWidth / container.clientHeight;
    const near = 0.1;
    const far = 10000;

    // const ambient = new THREE.AmbientLight(0x404040, 1);
    // scene.add(ambient);

    // const light = new THREE.DirectionalLight(0x808080, 5);
    // light.position.set(10, 10, 30);
    // scene.add(light);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 200, 100);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.camera.left = -120;
    dirLight.shadow.camera.right = 120;
    scene.add(dirLight);

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    window.addEventListener('resize', throttle(resizeWindow));

    // camera setup
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    camera.position.set(0, 3, 30);
    controls.update();

    container.appendChild(renderer.domElement);

    const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    // load model
    new MTLLoader().load(`./common/assets/${realPath}.mtl`, function (materials) {

        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(`./common/assets/${realPath}.obj`, function (object) {

            scene.add(object);
            _reportProgress({ detail: { text: 'Loading complete: ' + realPath } });
            console.log('Loading complete: ' + realPath);

        });

    });

}

function _reportProgress (event) {

    let output = '';
    if (event.detail !== null && event.detail !== undefined && event.detail.text) {

        output = event.detail.text;

    }

    console.log('Progress: ' + output);
    document.getElementById('feedback').innerHTML = output;

};

function animate () {

    requestAnimationFrame(animate);
    renderer.render(scene, camera);

}

function resizeWindow () {

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);

}

function throttle (fn, wait = 200) {

    let timer = null;
    return function () {

        if (timer === null) {

            timer = setTimeout(() => {

                fn.apply(this);
                timer = null;

            }, wait);

        }

    };

}
