xen.system.define('render', ['registry', 'iso', 'map', 'blockFactory'], function (registry, iso, map, blockFactory) {
    var moduleInitialized = false,
        render;
    var viewport = registry.viewport;
    var context = registry.context;
    var colors = [];
    var mapData;
    var sWidth = registry.get('sWidth');
    var altitudeScale = sWidth / 6;
    var isoWidth = registry.get('isoWidth');
    var isoHeight = registry.get('isoHeight');
    var canvasNodeCaches = [];
    var nodes = 0;




    //var canvas = document.createElement("canvas");
    //canvas.width = 32;//imgElement.offsetWidth;
    //canvas.height = 22;//imgElement.offsetHeight;
    //
    //var ctx = canvas.getContext("2d");
    //ctx.drawImage(imgElement,0,0);
    //
    //var imageData = ctx.getImageData(0, 0, 32, 22);
    //var imdata = imageData.data;
    //
    //// convert image to grayscale
    //var r,g,b,avg;
    //var alphas=[];
    //for(var p = 0, len = imdata.length; p < len; p+=4) {
    //    r = imdata[p];
    //    g = imdata[p+1];
    //    b = imdata[p+2];
    //
    //    if(tintColor === 'transparent') {
    //        alphas[p+3] = 0;
    //    } else {
    //        alphas[p+3] = imdata[p+3];
    //    }
    //
    //    avg = Math.floor((r+g+b)/3);
    //
    //    imdata[p] = imdata[p+1] = imdata[p+2] = avg;
    //}
    //
    //ctx.putImageData(imageData,0,0);
    //
    //// overlay filled rectangle using lighter composition
    //ctx.globalCompositeOperation = "lighter";
    //ctx.globalAlpha = 0.65;
    //ctx.fillStyle=tintColor;
    //ctx.fillRect(0,0,32,22);
    //
    //
    ////Replace alpha channel over remastered images
    //imageData = ctx.getImageData(0, 0, 32, 22);
    //imdata = imageData.data;
    //for(var p = 0, len = imdata.length; p < len; p+=4) {
    //    imdata[p+3] = alphas[p+3];
    //}
    //ctx.putImageData(imageData,0,0);
    //return canvas.toDataURL("image/png");

    render = function() {
        console.time('drawTime');
        mapData = map.getMapData();
        //console.log(mapData);
        var startColumn = registry.get('startColumn'),
            columnCount = registry.get('columnCount'),
            startRow = registry.get('startRow'),
            rowCount = registry.get('rowCount'),
            column, row;

        //Clear map for reflow
        context.clearRect (0, 0, viewport.width, viewport.height);
        context.fillStyle = '#000';
        context.fillRect (0, 0, viewport.width, viewport.height);

        //var multiply = 5*5;
        //var totalNodes = columnCount * rowCount;
        //var canvas = totalNodes / multiply;

        //canvas.width = 32;//imgElement.offsetWidth;
        //canvas.height = 22;//imgElement.offsetHeight;
        //var ctx = canvas.getContext("2d");
        //ctx.drawImage(imgElement,0,0);


        //if(canvasNodeCaches.length > 0) {
        //    var length = canvasNodeCaches.length;
        //    for(var i = 0; i < length; i++) {
        //        var cacheBuffer = Object.create({
        //            "canvas": document.createElement("canvas"),
        //            "context": this.canvas.getContext("2d")
        //        });
        //        cacheBuffer.canvas.width = 160;
        //        cacheBuffer.canvas.height =
        //        canvasNodeCaches[i] = cacheBuffer;//document.createElement("canvas");
        //    }
        //}


nodes = 0;
        // Start column, row iteration
            for (column = startColumn; column <= columnCount; column++) {
                for (row = startRow; row <= rowCount; row++) {
                    if(mapData[column][row] !== false) {
                        draw(mapData[column][row]);
                    }

                }
            }
        console.timeEnd('drawTime');

        //console.log(nodes);

nodes = 0;
        //console.log('Total: ' + nodes);

        //requestAnimationFrame(render());

        requestAnimationFrame(render);
    };

    locateBlockCoordinates = function(altitude, column, row){
        var coordinate;

        coordinate = iso.isoToScreen((column * isoWidth), -(altitude * altitudeScale), (-row * isoHeight));

        return {
            x:Math.round(coordinate.x),
            y:Math.round(coordinate.y)
        };
    };
    draw = function(nodeData) {
        //console.log(nodeData.column, nodeData.row, nodeData);
        if(nodeData.zAxis !== false) {

            nodeData.zAxis.forEach(function (node, key) {
                if (node.visible === false) {
                    return;
                }
                nodes++;
                var coordinates = this.locateBlockCoordinates(node.zValue, nodeData.column, nodeData.row);
                context.drawImage(blockFactory.block(node.block), coordinates.x, coordinates.y, sWidth, isoHeight);
            });
        }
        //console.log(nodeData);
    }

    return render;
});