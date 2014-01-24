var model = {};

model.init = function (sequelize) {
    model.Track = sequelize["import"](__dirname + "/model/Track");
    this.init = function () {
    };
};

module.exports = model;
