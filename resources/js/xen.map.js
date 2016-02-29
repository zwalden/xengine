xen.system.define('map', ['registry'], function (registry) {
    var moduleInitialized = false;
    var mapData = [];

    var fetchZAxisContainer = function(column, row) {
        if(mapData[column] === undefined || mapData[column][row] === undefined) {
            return false;
        }
        var zAxisContainer = [];
        var zAxis = mapData[column][row].zAxis;
        for (var i = 0, length = zAxis.length; i < length; i++) {
            zAxisContainer[i] = zAxis[i].zValue;
        }
        return zAxisContainer;
    };

    //@TODO: change to class, fetch highest value from array
    var fetchHighestArrayZAxis = function(zAxisContainer) {
        var len = zAxisContainer.length, max = -Infinity;
        while (len--) {
            if (zAxisContainer[len] > max) {
                max = zAxisContainer[len];
            }
        }
        return max;
    };
    var fetchHighestNodeZAxis = function(zAxisContainer) {
        var len = zAxisContainer.length, max = -Infinity;
        while (len--) {
            if (zAxisContainer[len].zValue > max) {
                max = zAxisContainer[len].zValue;
            }
        }
        return max;
    };

    var fetchLowestNodeZAxis = function(zAxisContainer) {
        var len = zAxisContainer.length, min = Infinity;
        while (len--) {
            if (zAxisContainer[len].zValue < min) {
                min = zAxisContainer[len].zValue;
            }
        }
        return min;
    };

    var fetchNodeNeighborsZAxis = function(column, row) {
        return Object.create({
            "row": fetchZAxisContainer(column, row + 1),
            "column": fetchZAxisContainer(column + 1, row),
            "columnRow": fetchZAxisContainer(column + 1, row + 1)
        });
    };

    //look for block labels
    var nextHigherZAxisSibling = function(zAxis, zAxisContainer) {
        var len = zAxisContainer.length, max = -Infinity;
        while (len--) {
            if (zAxisContainer[len] > zAxis) {
                return zAxisContainer[len];
            }
        }
        return false;
    };

    var generateNode = function(column, row) {

        if(mapData[column] === undefined) {
            mapData[column] = [];
        }
        if(mapData[column][row] === undefined) {
            mapData[column][row] = [];
        }
    };

    var exampleNode = function(column, row) {
        generateNode(column, row);

        return Object.create({
            "column": column,
            "row": row,
            "zAxis": [
                {"zValue": 0, "block": 'darker-green', "visible": false, "processed": false},
                {"zValue": 1, "block": 'green', "visible": false, "processed": false},
                {"zValue": 2, "block": 'white', "visible": false, "processed": false},
                {"zValue": 3, "block": 'black', "visible": false, "processed": false},
                //{"zValue": 14, "block": 'transparent', "visible": false, "processed": false},
            ]
        });
    };

    var isColumnNodeVisible = function(current, nZAxisContainer) {
        var top = fetchHighestNodeZAxis(nZAxisContainer);
        var visible = false;
        nZAxisContainer.forEach(function (zAxis, key) {
            if (current.zValue >= zAxis && current.zValue >= top && current.processed === false) {
                visible = true;
            } else {
                visible = false;
            }
            return;
        });
        return visible;
    };

    var isRowNodeVisible = function(current, nZAxisContainer) {
        var top = fetchHighestNodeZAxis(nZAxisContainer);
        var visible = false;
        nZAxisContainer.forEach(function (zAxis, key) {
            if (current.zValue >= zAxis && current.zValue >= top && current.processed === false) {
                visible = true;
            } else {
                visible = false;
            }
            return;
        });
        return visible;
    };

    var isNodeOuterEdge = function(neighboringColumn, neighboringRow) {
        if(neighboringColumn === false || neighboringRow === false) {
            return true;
        } else {
            return false;
        }
    };

    var isColumnRowVisible = function(nodeBlock, current, nZAxisContainer, remainder, nodeBlockVisibilityQueue) {
        if(nZAxisContainer !== false) {
            var highestAdjacentNodeZAxis = fetchHighestArrayZAxis(nZAxisContainer);
            if(current.zValue > highestAdjacentNodeZAxis) {
                resolveAdjacentZAxisCulling(nodeBlock, current, remainder, nodeBlockVisibilityQueue);
                return true;
                }
        }
        return false;
    };

    var resolveAdjacentZAxisCulling = function(nodeBlock, current, remainder, nodeBlockVisibilityQueue){
        if(remainder !== 0) {
            for(var r = 1; r <= remainder; r++) {
                if (nodeBlockVisibilityQueue[nodeBlock.column - r] === undefined) nodeBlockVisibilityQueue[nodeBlock.column - r] = [];
                if (nodeBlockVisibilityQueue[nodeBlock.column - r][nodeBlock.row - r] === undefined) nodeBlockVisibilityQueue[nodeBlock.column - r][nodeBlock.row - r] = current.zValue;
            }
        }
    };

    var resolveVisibility = function(nodeBlock, current, nodeBlockVisibilityQueue) {
        //current.visible = true;return;
        if(current.zValue === nodeBlock.topZValue) {
            //draw as long as nothing else is obstructing from columnRow
            //because nodes below can be higher, thusly rendering top rows behind it nonvisible
            current.visible = true;
            return;
        } else {
            var nColumn = nodeBlock.neighbors.column;
            var nRow = nodeBlock.neighbors.row;
            var nColumnRow = nodeBlock.neighbors.columnRow;
            var zSibling = nextHigherZAxisSibling(current.zValue, nodeBlock.zAxisContainer);
            var remainder = Math.round(zSibling / 4); //is 14 special modifer?

            //console.log(remainder);

            if(isNodeOuterEdge(nColumn, nRow)) {
                current.visible = true;
                resolveAdjacentZAxisCulling(nodeBlock, current, remainder, nodeBlockVisibilityQueue);
                return;
            }
            //do we need a rowcolumnvisible? top left articles as opposed to top right
            if(isColumnRowVisible(nodeBlock, current, nColumnRow, remainder, nodeBlockVisibilityQueue)) {
                current.visible = true;
                return;
            }
            if(isColumnNodeVisible(current, nColumn)) {
                current.visible = true;
                return;
            }
            if(isRowNodeVisible(current, nRow)) {
                current.visible = true;
                return;
            }
        }
    };

    var processWorldNodeData = function() {
        var columns = registry.get('columns');
        var rows = registry.get('rows');
        var nodeBlockVisibilityQueue = [];
        var nodeBlock;

        for (var column = columns; column >= 0; --column) {
            for (var row = rows; row >= 0; --row) {

                nodeBlock = exampleNode(column, row);
                mapData[column][row] = nodeBlock;

                nodeBlock.zAxisContainer = fetchZAxisContainer(column, row);
                nodeBlock.topZValue = fetchHighestNodeZAxis(nodeBlock.zAxis);
                nodeBlock.neighbors = fetchNodeNeighborsZAxis(column, row);

                for (var index = nodeBlock.zAxis.length - 1; index >= 0; --index) {
                    var current = nodeBlock.zAxis[index];

                    resolveVisibility(nodeBlock, current, nodeBlockVisibilityQueue);

                    if(nodeBlockVisibilityQueue[column] !== undefined && nodeBlockVisibilityQueue[column][row] !== undefined) {

                        //@TODO: this will require sorted by highest
                        if(nodeBlock.zAxis[(nodeBlock.zAxis.length - 1)] !== undefined
                            && nodeBlockVisibilityQueue[column][row] <= current.zValue
                        )
                        {
                            current.visible = true;
                        }
                    }
                }

            }
        }

    };


    return {
        getMapData: function() {
            //if(mapData.length === 0) {
                processWorldNodeData();
            //}
            return mapData;
        }
    }

});