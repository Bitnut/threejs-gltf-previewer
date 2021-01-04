import init3D from '@/test-opt.js';

const el = document.getElementById('glFullscreen');
const loadpath = './assets/test35.glb';
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

const init3d = new init3D(options);
init3d.loadModel();

// init3D('./assets/E2 TEST07.glb');
// init3D('./assets/test29.glb');
// init3D('bugatti');
