xen.system.define('iso', ['registry'], function (registry) {
    var moduleInitialized = false,
        viewport = registry.viewport,
        isoWidth,
        isoHeight,
        dimension,
        theta, alpha,
        _sinTheta, _cosTheta,
        _sinAlpha, _cosAlpha;

    theta = 30;
    alpha = 45;

    theta *= Math.PI/180;
    alpha *= Math.PI/180;

    _sinTheta = Math.sin(theta);
    _cosTheta = Math.cos(theta);
    _sinAlpha = Math.sin(alpha);
    _cosAlpha = Math.sin(alpha);

    var isoDimension = function(scrX,scrY) {
        var z, x;

        z = ((scrX / _cosAlpha) - (scrY / (_sinAlpha * _sinTheta))) * (1 / ((_cosAlpha / _sinAlpha) + (_sinAlpha / _cosAlpha)));
        x = (1 / _cosAlpha) * (scrX - z * _sinAlpha);

        return {
            x: x,
            y: 0,
            z: z
        };
    };
    var screenToCoordinate = function(x, y) {

        var isoWidth = registry.get('isoWidth'),
            isoHeight = registry.get('isoHeight'),
            dimension = registry.get('dimension'),
            coordinate, column, row;

        coordinate = screenToIso(x,y);
        column = Math.floor(coordinate.x / isoWidth);
        // the z coordinate is never positive...
        // unless you're on the top right side of the diamond
        if(coordinate.z < 0) {
            row = Math.floor(Math.abs(coordinate.z / isoHeight));
        } else {
            coordinate.z += dimension;//90.50966799187809; // this is the isometric z distance between squares
            row = -(Math.floor(coordinate.z / isoHeight));
        }
        return {
            row: row,
            column: column
        };

    };

    var screenToIso = function(scrX,scrY) {
        var mapPosition = registry.get('position'),
            z, x;

        scrX -= (viewport.width / 2) - (mapPosition.x);
        scrY += mapPosition.y;

        z = ((scrX / _cosAlpha) - (scrY / (_sinAlpha * _sinTheta))) * (1 / ((_cosAlpha / _sinAlpha) + (_sinAlpha / _cosAlpha)));
        x = (1 / _cosAlpha) * (scrX - z * _sinAlpha);

        return {
            x: x,
            y: 0,
            z: z
        };
    };

    var setBoundaries = function() {

        var columns = registry.get('columns'),
            rows = registry.get('rows'),
            startColumn, startRow, columnCount, rowCount;

        startColumn = screenToCoordinate(1, 1).column;
        startRow = screenToCoordinate(viewport.width, 1).row;
        columnCount = screenToCoordinate(viewport.width, viewport.height).column + 1;
        rowCount = screenToCoordinate(1, viewport.height).row + 1;

        registry.set('startColumn', (startColumn < 0) ? 0 : startColumn);
        registry.set('startRow', (startRow < 0) ? 0 : startRow);
        registry.set('columnCount', (columnCount > columns) ? columns : columnCount);
        registry.set('rowCount', (rowCount > rows) ? rows : rowCount);


    };

    (function(){
        var blockWidth = registry.get('desiredWidth');
        var dimension = isoDimension(blockWidth,0).x;
        registry.set('dimension', dimension);
        registry.set('isoHeight', dimension);
        registry.set('isoWidth', dimension);
        setBoundaries();
    }());

    return {
        isoToScreen: function(xpp,ypp,zpp) {
            var mapPosition = registry.get('position'),
                yp, xp, zp, x, y;

            yp = ypp;
            xp = (xpp * _cosAlpha) + (zpp * _sinAlpha);
            zp = (zpp * _cosAlpha) - (xpp * _sinAlpha);

            x = xp;
            y = (yp * _cosTheta) - (zp * _sinTheta);

            x += (viewport.width / 2) - mapPosition.x;
            y -= mapPosition.y;

            return {
                x: x,
                y: y,
                z: 0
            };
        },

        sortObjects: function() {
            var unsortedObjects, i,
                j, nsi,
                si, added, unsortedCount, sortedCount;

            unsortedObjects = xen.map.sortedObjects;

            xen.map.sortedObjects = [];

            for (i = 0, unsortedCount = unsortedObjects.length; i < unsortedCount; i++) {
                nsi = unsortedObjects[i];
                added = false;

                for(j = 0, sortedCount = xen.map.sortedObjects.length; j < sortedCount; j++) {

                    si = xen.map.sortedObjects[j];

                    if(nsi.column <= (si.column + (si.columnCount - 1)) && nsi.row <= (si.row + (si.rowCount - 1))) {
                        xen.map.sortedObjects.splice(j, 0, nsi);
                        added = true;
                        break;
                    };
                };

                if(added === false) {
                    xen.map.sortedObjects.push(nsi);
                };

            };
        }
    };

});