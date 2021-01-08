import init3D from '@/test-opt1.js';
// import {DropController} from '@/dropController.js';
import { checkEnv } from '@/checkEnv.js';

const el = document.getElementById('glFullscreen');
const dropZone = document.getElementsByClassName('dropzone')[0];

const loadpath = './assets/Argus 3.glb';
const baseUrl = './assets/backgrouds/';
const environments = [
    baseUrl + 'posx.jpg',
    baseUrl + 'negx.jpg',
    baseUrl + 'posy.jpg',
    baseUrl + 'negy.jpg',
    baseUrl + 'posz.jpg',
    baseUrl + 'negz.jpg'
];
const options = {
    el: el,
    loadUrl: loadpath,
    environment: environments,
    hdrUrl: './assets/backgrouds/royal_esplanade_1k.hdr'
};
const options1 = {
    el: el,
    loadUrl: loadpath,
    environment: environments,
    hdrUrl: './assets/backgrouds/oldWall.jpg'
};
const options2 = {
    el: el,
    loadUrl: loadpath,
    environment: environments,
    hdrUrl: './assets/backgrouds/test1.hdr'
};


// const drop = new DropController(dropZone, new init3D(options));
const envChecker = new checkEnv();

if (envChecker.isWebGLAvailable()) {

    console.log('Browser supports WebGL, 3D display goes on.');
    const init3d = new init3D(options2);
    init3d.loadModel();
} else {

    console.error('Seems your browser does not support WebGL, 3D display module shuts down');
}

// init3D('./assets/E2 TEST07.glb');
// init3D('./assets/test29.glb');
// init3D('bugatti');
