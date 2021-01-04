import {
    Scene,
    PerspectiveCamera,
    HemisphereLight,
    Box3,
    Vector3,
    DirectionalLight,
    UnsignedByteType,
    WebGLRenderer,
    sRGBEncoding,
    RGBFormat,
    PMREMGenerator,
    CubeTextureLoader,
    AmbientLight,
    ACESFilmicToneMapping,
    SphereBufferGeometry,
    MeshStandardMaterial,

    Mesh
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// todo: use draco?
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export default class init3D {

    constructor (opts) {

        if (!opts) {

            throw new Error(`cannot read options of ${opts}`);

        }
        this.options = opts;

        // path to gltf
        this.loadUrl = opts.loadUrl;

        // canvas mount point
        this.el = opts.el;
        this.envMap = {};
        this.lights = [];
        this.environment = opts.environment;
        this.IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        this.actionStates = {}; // for playing clips, not used yet

        // only used for render configure
        this.renderConfig = {
            environment: true, // 注意和 backgroud 的区别，env 是物体是否反射背景
            background: false, // background 是是否显示场景背景

            envMapType: 'hdr',
            hemiLight: true,
            ambientLight: true,
            directLight: true,
            hemiColor: 0xFFFFFF,
            hemiGroundColor: 0x444444,
            hemiIntensity: 2,
            ambientColor: 0xFFFFFF,
            ambientIntensity: 0.3,
            directColor: 0xFFFFFF,
            directIntensity: 2.5, // 0.8 * Math.PI,
            addLights: true,
            camera: 'default', // camera config, not used yet
            clip: false, // play clips, not used yet
            grid: false // grid viewing, not used yet
        };

        this.preConfig();

    }

    preConfig () {

        // create scene
        this.scene = new Scene();

        // perspective camera setting
        // FOV means field of view
        const FOV = 0.8 * 180 / Math.PI;
        // set default fov, aspect, near, far to camera
        this.camera = new PerspectiveCamera(FOV, this.el.clientWidth / this.el.clientHeight, 0.01, 1000);
        this.scene.add(this.camera);

        // renderer
        const renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.physicallyCorrectLights = true;
        renderer.outputEncoding = sRGBEncoding;
        renderer.setClearColor(0xcccccc);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(this.el.clientWidth, this.el.clientHeight);
        this.renderer = renderer;

        // PGB to LGB
        renderer.toneMapping = ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;

        // animate
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
        window.addEventListener('resize', this.resize.bind(this), false);

        // control
        const controls = new OrbitControls(this.camera, renderer.domElement);
        controls.autoRotate = false;
        controls.autoRotateSpeed = -10;
        controls.screenSpacePanning = true;
        this.controls = controls;

        // for rgbe encoding
        this.pmremGenerator = new PMREMGenerator(this.renderer);
        this.pmremGenerator.compileEquirectangularShader();

        // lights
        this.addLights();

        // enviroment
        this.updateEnvironment();

        this.el.appendChild(this.renderer.domElement);

    }

    resize () {

        const { clientHeight, clientWidth } = this.el.parentElement;

        this.camera.aspect = clientWidth / clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(clientWidth, clientHeight);

    }

    addLights () {

        const { hemiLight, ambientLight, directLight } = this.renderConfig;
        if (hemiLight) {

            // A light source positioned directly above the scene, with color fading from the sky color to the ground color.
            // 半球光源，无法投射阴影。可以很好的模拟户外光照效果
            // 默认光源位置： (0, 1, 0)
            // const { hemiColor, hemiGroundColor, hemiIntensity } = this.renderConfig;
            // const hemiLight = new HemisphereLight(hemiColor, hemiGroundColor, hemiIntensity);
            const hemiLight = new HemisphereLight();
            hemiLight.name = 'hemi _light';
            hemiLight.position.set(0, 200, 0);
            this.scene.add(hemiLight);
            this.lights.push(hemiLight);

        }

        if (ambientLight) {

            // This light globally illuminates all objects in the scene equally.
            // 会均匀的照亮场景中的所有物体。
            // 不能用来投射阴影，因为没有方向。
            const { ambientColor, ambientIntensity } = this.renderConfig;
            const ambiLight = new AmbientLight(ambientColor, ambientIntensity);
            ambiLight.name = 'ambient_light';
            this.camera.add(ambiLight);
            this.lights.push(ambiLight);

        }

        if (directLight) {

            // A light that gets emitted in a specific direction.
            // This light will behave as though it is infinitely far away
            // and the rays produced from it are all parallel.
            // The common use case for this is to simulate daylight;
            // the sun is far enough away that its position can be considered
            // to be infinite, and all light rays coming from it are parallel.
            // 平行光， 用来模拟日光等
            const { directColor, directIntensity } = this.renderConfig;
            const dirLight = new DirectionalLight(directColor, directIntensity);
            dirLight.name = 'main_light';
            dirLight.position.set(0.5, 0, 0.866); // ~60º
            this.camera.add(dirLight);
            this.lights.push(dirLight);

        }

    }

    updateEnvironment () {

        if (!this.environment) {

            throw new Error('cannot find environment, please check!');

        }
        const { envMapType, environment, background } = this.renderConfig;
        if (envMapType === 'cube') {

            // env and envMap
            const cubeTexture = new CubeTextureLoader().load(this.environment);
            cubeTexture.format = RGBFormat;
            this.envMap = cubeTexture;

            if (environment) {

                this.scene.environment = cubeTexture;

            }
            if (background) {

                this.scene.background = cubeTexture;

            }

            const geometry = new SphereBufferGeometry(400.0, 48, 24);
            const material = new MeshStandardMaterial({
                metalness: 0,
                roughness: 1
            });
            const mesh = new Mesh(geometry, material);
            this.scene.add(mesh);

        } else if (envMapType === 'hdr') {

            const hdr = this.options.hdrUrl;

            this.getCubeMapTexture(hdr).then(({ envMap }) => {

                this.envMap = envMap;
                this.scene.environment = envMap;
                this.scene.background = envMap;
                const geometry = new SphereBufferGeometry(400.0, 48, 24);
                const material = new MeshStandardMaterial({
                    metalness: 1,
                    roughness: 0
                });
                const mesh = new Mesh(geometry, material);
                this.scene.add(mesh);
                this.renderer.render(this.scene, this.camera);

            });

        } else {

            throw new Error(`cannot recognize envMapType of ${envMapType}`);

        }

    }

    getCubeMapTexture (path) {

        // no envmap
        if (!path) return Promise.resolve({ envMap: null });

        return new Promise((resolve, reject) => {

            // hdr need to be preprocessed with PMREMGenerator
            new RGBELoader()
                .setDataType(UnsignedByteType)
                .load(path, (texture) => {

                    const envMap = this.pmremGenerator.fromEquirectangular(texture).texture;
                    texture.dispose();
                    this.pmremGenerator.dispose();

                    resolve({ envMap });

                }, undefined, reject);

        });

    }

    animate () {

        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);

    }

    loadModel () {

        const loader = new GLTFLoader();
        loader.load(
            this.loadUrl,
            (gltf) => {

                const scene = gltf.scene || gltf.scenes[0];
                const clips = gltf.animations || []; // animations set by model itself, do nothing yet

                if (!scene) {

                    // Valid, but not supported by this viewer.
                    throw new Error(
                        'This model contains no scene, and cannot be viewed here. However,' +
                            ' it may contain individual 3D resources.'
                    );

                }

                this.setContent(scene, clips);

            });

    }

    setContent (object, clips) {

        // create an axis-aligned bounding box(AABB)
        const box = new Box3().setFromObject(object);
        const size = box.getSize(new Vector3()).length();
        const center = box.getCenter(new Vector3());
        console.log(size);
        console.log(center);

        // reset the orbit control
        this.controls.reset();

        // have the object being put exactly at the origin
        object.position.x += (object.position.x - center.x);
        object.position.y += (object.position.y - center.y);
        object.position.z += (object.position.z - center.z);

        // restrict the zoom range based on aabb of the scene
        // this.controls.minDistance = size;
        this.controls.maxDistance = size * 10;
        this.camera.near = size / 100;
        this.camera.far = size * 100;
        this.camera.updateProjectionMatrix();

        this.camera.position.copy(center);
        this.camera.position.x += size / 2.0;
        this.camera.position.y += size / 5.0;
        this.camera.position.z += size / 2.0;
        this.camera.lookAt(center);

        this.controls.enabled = true;
        this.controls.saveState();

        // add env map
        object.traverse((node) => {

            if (node.material && (node.material.isMeshStandardMaterial ||
                                  (node.material.isShaderMaterial && node.material.envMap !== undefined))) {

                node.material.envMap = this.envMap;
                node.material.envMapIntensity = 2;

            }

        });

        this.scene.add(object);
        this.content = object;

    }

}
