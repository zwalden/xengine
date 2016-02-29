xen.system.define('blockFactory', ['registry'], function (registry) {
    var moduleInitialized = false,
        blockCount = 0, blocksLoaded = 0,
        block = Object.create(null);

    (function(model, presets) {
        var i, presets = [
            {"colorTitle": "white", "hex": "#ffffff"},
            {"colorTitle": "red", "hex": "#ba0000"},
            {"colorTitle": "blue", "hex": "#468ddc"},
            {"colorTitle": "green", "hex": "#4ddc46"},
            {"colorTitle": "dark-green", "hex": "#32b52b"},
            {"colorTitle": "darker-green", "hex": "#23931e"},
            {"colorTitle": "pink", "hex": "#dc46c2"},
            {"colorTitle": "transparent", "hex": "transparent"}
        ],  presetCount, model = 'resources/img/tile-black.png';


        block.black = new Image();
        block.black.src = model;
        block.black.onload = function(){

            for(i = 0, presetCount = presets.length; i < presetCount; i++) {
                var colorTitle = presets[i].colorTitle;
                block[colorTitle] = new Image();
                block[colorTitle].src = tintBlock(block.black, presets[i].hex);
                block[colorTitle].onload = onLoadAsset();
            }
        }
    }());

    var onLoadAsset = function() {
        blocksLoaded++;
        if(blocksLoaded >= blockCount) {
            moduleInitialized = true;
        }
    };

    var tintBlock = function (imgElement, tintColor)  {
        // create hidden canvas (using image dimensions)
        var canvas = document.createElement("canvas");
        canvas.width = 32;//imgElement.offsetWidth;
        canvas.height = 22;//imgElement.offsetHeight;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(imgElement,0,0);

        var imageData = ctx.getImageData(0, 0, 32, 22);
        var imdata = imageData.data;

        // convert image to grayscale
        var r,g,b,avg;
        var alphas=[];
        for(var p = 0, len = imdata.length; p < len; p+=4) {
            r = imdata[p];
            g = imdata[p+1];
            b = imdata[p+2];

            if(tintColor === 'transparent') {
                alphas[p+3] = 0;
            } else {
                alphas[p+3] = imdata[p+3];
            }

            avg = Math.floor((r+g+b)/3);

            imdata[p] = imdata[p+1] = imdata[p+2] = avg;
        }

        ctx.putImageData(imageData,0,0);

        // overlay filled rectangle using lighter composition
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.65;
        ctx.fillStyle=tintColor;
        ctx.fillRect(0,0,32,22);


        //Replace alpha channel over remastered images
        imageData = ctx.getImageData(0, 0, 32, 22);
        imdata = imageData.data;
        for(var p = 0, len = imdata.length; p < len; p+=4) {
            imdata[p+3] = alphas[p+3];
        }
        ctx.putImageData(imageData,0,0);
        return canvas.toDataURL("image/png");
    };

    return {
        getModuleState: function(){
            return moduleInitialized;
        },
        "blocks": function(){
            return block;
        },
        "block": function(colorTitle) {
            return block[colorTitle];
        }
        //"initialize": function(callback) {
        //    var presets = [
        //        {"colorTitle": "red", "hex": "#ba0000"},
        //        {"colorTitle": "blue", "hex": "#468ddc"},
        //        {"colorTitle": "green", "hex": "#4ddc46"},
        //        {"colorTitle": "pink", "hex": "#dc46c2"}
        //    ],  model = 'resources/img/tile-black.png';
        //
        //    loadAssets(presets, model, callback);
        //
        //}

    }
});