import {init3D} from './test.js';

class Init3DController {

    /**
     * @param  {object} opts - 配置对象，包括加载图标和渲染模型的 element.
     * @param  {string} resLocation - 模型资源路径.
     */
    constructor(opts) {

        this.options = opts;
        this.el = opts.el;
        this.location = opts.resLocation;

        

        // viewer
        this.viewer = new init3D(this.el);

        this.load();

    }
    load (fileMap) {
        let rootFile;
        let rootPath;
        Array.from(fileMap).forEach(([path, file]) => {
            if (file.name.match(/\.(gltf|glb)$/)) {
                rootFile = file;
                rootPath = path.replace(file.name, '');
            }
        });

        if (!rootFile) {
            this.onError('No .gltf or .glb asset found.');
            return;
        }

        this.view(rootFile, rootPath, fileMap);
    }

    view (fileURL, rootPath, fileMap) {

        const viewer = this.createViewer();
        if (typeof fileURL !== 'string') {
            this.onError('Should pass string type resourse URL');
            return;
        }

        viewer.load(fileURL, rootPath, fileMap)
            .catch(
                (e) => {
                    this.onError(e);
                }
            );
    }
    createViewer () {
        this.viewerEl = document.createElement('div');
        this.viewerEl.classList.add('viewer');
        this.viewer = new Viewer(this.viewerEl, this.options);
        return this.viewer;
    }


    // 错误处理
    onError(error) {
        let message = (error||{}).message || error.toString();
        if (message.match(/ProgressEvent/)) {
            message = 'Unable to retrieve file. Please check!';
        } else if (message.match(/Unexpected token/)) {
            message = `Unable to parse file content. Verify that this file is valid. Error: "${message}"`;
        } else if (error && error.target && error.target instanceof Image) {
            message = 'Missing texture: ' + error.target.src.split('/').pop();
        }
        console.error(error);
    }
}
