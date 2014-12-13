var TasksContants = require('../constants/tasks');

function removeTask(app, payload, callback) {
    app.emit(TasksContants.DESTROY_START, payload);

    app.getService('TasksService').remove(payload, function(error, removed) {
        if (error) {
            app.emit(TasksContants.DESTROY_ERROR, error);
            return callback && callback(error);
        }

        app.emit(TasksContants.DESTROY_SUCCESS, removed);
        callback && callback(null, removed);
    });
}

module.exports = removeTask;