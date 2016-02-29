xen.system.define('registry', [], function () {
    var moduleInitialized = false;
    var viewport = document.getElementById('viewport');
    var context = viewport.getContext('2d');
    var setting = Object.create(null);

    /* Map */
    /* Settings */

    setting.rows = 100;
    setting.columns = 100;
    setting.startColumn = 0;
    setting.startRow = 0;
    setting.columnCount = 0;
    setting.rowCount = 0;
    setting.position = { y: 0, x: 0 };
    setting.drag = { x: 0, y: 0 };
    setting.isoWidth = 0;
    setting.isoHeight = 0;
    setting.sWidth = 32;
    setting.sHeight = 21;
    setting.desiredWidth = 32;
    setting.dimension = 0;

    viewport.width = document.body.clientWidth;
    viewport.height = document.body.clientHeight;

    return {
        set: function(name, value) {
            setting[name] = value;
        },
        get: function(name) {
            return setting[name];
        },
        viewport: viewport,
        context: context

    }
});