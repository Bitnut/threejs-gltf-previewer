export class DropController {


    constructor (el, renderer) {

        this.el = el;
        this.renderer = renderer;
        this.fileInputEl = this.el.querySelector('#file-input');
        debugger;
        el.ondragenter = (e) => {e.preventDefault();};
        el.ondragover = (e) => {this.onDragOver(e);};
        el.ondragleave = () => {
            this.el.innerHTML = '拖放 glb 格式的文件或者 gltf 文件夹至此';
        };
        el.ondrop = (e) => {this.onDrop(e);};
        this.fileInputEl.addEventListener('change', (e) => this.onSelect(e));
    }

    onDragOver(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

    }

    onSelect(e) {

    }

    onDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        let entries;
        if (e.dataTransfer.items) {
            entries = [].slice.call(e.dataTransfer.items)
                .map((item) => item.webkitGetAsEntry());
        }

        console.log(entries);

        const tmp = {
            loadUrl: entries[0].fullPath
        };

        this.renderer.updateConfig(tmp);
        this.renderer.loadModel();

        if (!entries) {
            this.fail(''
                      + 'Required drag-and-drop APIs are not supported in this browser. '
                      + 'Please try Chrome, Firefox, Microsoft Edge, or Opera.'
                     );
        }
    }



}
