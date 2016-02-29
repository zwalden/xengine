xen.system.define('map', ['registry'], function (registry) {
    var moduleInitialized = false;
    var mapData = [];

    var fetchNodeBlockNeighborsZAxis = function(column, row) {

        return Object.create({
            column: fetchNodeBlockZAxis(column + 1, row),
            row: fetchNodeBlockZAxis(column, row + 1),
            columnRow: fetchNodeBlockZAxis(column + 1, row + 1)
        });

    }

    var fetchNodeBlockZAxis = function(column, row) {

        var nodeBlock = fetchNodeBlock(column, row);
        var nodeBlockAxis = [];

        if(nodeBlock !== undefined) {
            nodeBlock.z.forEach(function(n) {
                nodeBlockAxis.push(n.zAxis);
            });
            return nodeBlockAxis;
        }

        return undefined;

    };


    var generateNodeBlock = function(column, row) {
        if (mapData[column] === undefined) {
            mapData[column] = [];
        }

        if (mapData[column][row] === undefined) {
            mapData[column][row] = [];
        }
    };

    var fetchNodeBlock = function(column, row) {
        if(mapData[column] !== undefined && mapData[column][row] !== undefined) {
            //@TODO: problems?
            return mapData[column][row];
        } else {
            return undefined;
        }
    };

    var fetchLowestZAxis = function(zAxisContainer) {
        var len = arr.length, min = Infinity;
        while (len--) {
            if (zAxisContainer[len].zAxis < min) {
                min = zAxisContainer[len].zAxis;
            }
        }
        return min;
    };

    var fetchTopZAxis = function(zAxisContainer) {
        var len = zAxisContainer.length, max = -Infinity;
        while (len--) {
            if (zAxisContainer[len].zAxis > max) {
                max = zAxisContainer[len].zAxis;
            }
        }
        return max;
    };

    var determineTopNodeBlockVisibility = function(zAxis, neighbor) {

        var nColumn = neighbor.column;
        var nRow = neighbor.row;
        var nColumnRow = neighbor.columnRow;

        //research greater than 3, not === -1
        if(nColumn !== undefined && nColumn.indexOf(zAxis + 3) === -1
            && nRow !== undefined && nRow.indexOf(zAxis + 3) === -1
            || nColumnRow !== undefined && nColumnRow.indexOf(zAxis + 3) === -1 // is this one needed?
        ) {
            return true;
        } else if(nColumn === undefined && nRow === undefined
            || nColumn !== undefined && nRow === undefined
            || nRow !== undefined && nColumn === undefined
        ) {
            return true;
        }

        return false;
    };

    //@TODO stop for execution when satisfied (use "labeled blocks" to be even smarter?)

    var nextHigherZSibling = function(zAxis, zAxisContainer) {
        //console.log(zAxis, zAxisContainer);
        var len = zAxisContainer.length, max = -Infinity;
        var sibling = Object.create(null);
        while (len--) {
            if (zAxisContainer[len] > zAxis) {
                sibling.index = len;
                sibling.zAxis = zAxisContainer[len];
                break;
            }
        }
        return sibling;
    };


    var exampleBlock = function(column, row) {
        if(column === 9 && row === 10)

            return Object.create({
                column: column, row: row, z:
                    [
                        {zAxis: 0, block: 'green', visible: false},
                        {zAxis: 1, block: 'pink', visible: false},
                        //{zAxis: 11, block: 'red', visible: false},
                        //{zAxis: 5, block: 'green', visible: false}
                    ]
            });
        if (
            column === 10 && row === 10 || column === 10 && row === 11 || column === 10 && row === 12
            || column === 9 && row === 11 || column === 9 && row === 12
            || column === 8 && row === 10 || column === 8 && row === 11 || column === 8 && row === 12
            || column === 7 && row === 10 || column === 7 && row === 11 || column === 7 && row === 12

        ) {
            return Object.create({
                column: column, row: row, z:
                    [{zAxis: 0, block: 'blue', visible: false},
                        {zAxis: 1, block: 'darker-green', visible: false},
                        //{zAxis: 7, block: 'green', visible: false}
                    ]
            });
        }
        return Object.create({
            column: column, row: row, z: (function () {
                return [
                    {zAxis: 0, block: 'darker-green', visible: false},
                    {zAxis: 1, block: 'green', visible: false},
                    {zAxis: 2, block: 'transparent', visible: false},
                    //{zAxis: 10, block: 'black', visible: false},
                    {zAxis: 60, block: 'transparent', visible: false}
                ]
            }())
        });
    };

    var determineMiddleNodeBlockVisibility = function(nodeBlock, current, neighbors, nodeBlockVisibilityQueue) {

        var column = nodeBlock.column;
        var row = nodeBlock.row;
        var zAxisContainer = nodeBlock.zAxisIndexes;

        if(
            neighbors.column !== undefined && neighbors.column.indexOf(current.zAxis + 1) === -1 ||
            neighbors.row !== undefined && neighbors.row.indexOf(current.zAxis + 1) === -1 ||
                /* KEEP THIS FOR WEIRD ARTICLE FRAGMENTS IF IT OCCURS */
            mapData[column + 1] !== undefined && mapData[column + 1][row + 1] !== undefined ||
            mapData[column + 1] === undefined ||
            mapData[column + 1] !== undefined && mapData[column + 1][row + 1] === undefined
        ) {
            var zSibling = nextHigherZSibling(current.zAxis, zAxisContainer);
            var remainder = Math.floor(zSibling.zAxis / 5);
            if(neighbors.columnRow !== undefined) {
                var hit = false;
                neighbors.columnRow.forEach(function(zAxis) {
                    if(current.zAxis < zAxis) {
                        hit = true;
                    }
                });
                if(hit === false) {
                    if(remainder !== 0) {
                        for(var r = 1; r <= remainder; r++) {
                            if (nodeBlockVisibilityQueue[column - r] === undefined) nodeBlockVisibilityQueue[column - r] = [];
                            if (nodeBlockVisibilityQueue[column - r][row - r] === undefined) nodeBlockVisibilityQueue[column - r][row - r] = current.zAxis;
                        }
                    }
                    return true;
                }

            } else {
                if(remainder !== 0) {
                    for(var r = 1; r <= remainder; r++) {
                        if (nodeBlockVisibilityQueue[column - r] === undefined) nodeBlockVisibilityQueue[column - r] = [];
                        if (nodeBlockVisibilityQueue[column - r][row - r] === undefined) nodeBlockVisibilityQueue[column - r][row - r] = current.zAxis;
                    }
                }
                return true;
            }
        }
        return false;
    };

    var determineNodeBlockVisibility = function(nodeBlock, current, nodeBlockVisibilityQueue) {
        if(nodeBlockVisibilityQueue.length >0) {
            //console.log(nodeBlockVisibilityQueue);
        }
        //console.log(nodeBlockVisibilityQueue.length > 0);
        var visible = false;
        var topZAxis = nodeBlock.topZAxis;
        var neighbors = nodeBlock.zNeighbors;

        if(current.zAxis === topZAxis) {
            visible = determineTopNodeBlockVisibility(current.zAxis, neighbors);
        } else {
            visible = determineMiddleNodeBlockVisibility(nodeBlock, current, neighbors, nodeBlockVisibilityQueue);
        }
        return visible;
    };

    var fetchWorldData = function(){

        var columns = registry.get('columns');
        var rows = registry.get('rows');
        var column;
        var row;
        var nodeBlockVisibilityQueue = [];
        var neighborsZAxis;
        var nodeBlock;

        for (column = columns; column >= 0; column--) {
            for (row = rows; row >= 0; row--) {

                generateNodeBlock(column, row);
                nodeBlock = fetchNodeBlock(column, row);
                if(nodeBlock.length === 0) {
                    nodeBlock = exampleBlock(column, row);
                }
                mapData[column][row] = nodeBlock;

                nodeBlock.zAxisIndexes = fetchNodeBlockZAxis(column, row);
                nodeBlock.zNeighbors = fetchNodeBlockNeighborsZAxis(column, row);
                nodeBlock.topZAxis = fetchTopZAxis(nodeBlock.z);
                var nodeZAxisCount;
                var current;
                //console.log(topNodeBlockZAxis);
                for (nodeZAxisCount = nodeBlock.z.length - 1; nodeZAxisCount >= 0; --nodeZAxisCount) {
                    current = nodeBlock.z[nodeZAxisCount];
                    current.visible = determineNodeBlockVisibility(nodeBlock, current, nodeBlockVisibilityQueue);

                    if(nodeBlockVisibilityQueue[column] !== undefined && nodeBlockVisibilityQueue[column][row] !== undefined) {

                        //@TODO: this will require sorted by highest
                        if(nodeBlock.z[(nodeBlock.z.length - 1)] !== undefined
                            && nodeBlockVisibilityQueue[column][row] <= current.zAxis
                        )
                        {
                            current.visible = true;
                        }
                    }
                }

                //scrolling out, just double the size of square & block bumps XD
            }
        }
    };

    return {
        getModuleState: function(){
            return moduleInitialized;
        },
        getMapData: function(){
            if(mapData.length < 1) {
                fetchWorldData();
            }
            return mapData;
        }
    }
});
/* Lake in map

 //if(alt == 4
 //    && (row > 10 && column > 4)
 //    && (row < 20 && column < 15)
 //) {
 //
 //    mapData[alt][column][row] = 'blue';
 //
 //} else {
 */
/* Randomized map

 mapData[column][row] = (function() {
 var nodeData = Object.create(null);
 nodeData = {
 block: (function(){
 var arr = ['dark-green','darker-green','green', false];
 var len = arr.length;
 var rnd = Math.floor(Math.random()*len);
 return arr[rnd];
 }()),
 column: column,
 row: row,
 z: (function(){
 return [0, 1, (Math.round( Math.random() * (6 - 2) + 2))]
 }())
 }
 return nodeData;
 }());


 */