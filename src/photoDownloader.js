import Phaser, { Game } from 'phaser';



class photoDownloader extends Phaser.Scene
{
    constructor ()
    {   
        super();
        Phaser.Scene.call(this, { key: 'downloadPhoto' });
        
    }
    preload ()
    {
        
    }
    create(){


        var key = "photo" + this.game.photoIndex;
        var img = this.add.image(400,300,key).setScale(1.5);
        var canvas;

        function exportCanvasAsPNG(id, fileName, dataUrl) {
            var canvasElement = document.getElementById(id);
            var MIME_TYPE = "image/png";
            var imgURL = dataUrl;
            var dlLink = document.createElement('a');
            dlLink.download = fileName;
            dlLink.href = imgURL;
            dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);

        }
        var self = this;
        this.renderer.snapshot(function (image) {   
            //console.log(image);
            exportCanvasAsPNG(canvas, 'snapshot', image.src);
            self.scene.start("scene_Gallery")
        });      
    }
    update(){
    }

}
export {photoDownloader};