import {join} from "path";

var model = {};

model.init = function (sequelize) {
    model.Track = sequelize.import(join(__dirname, "model/Track"));
    this.init = function () {
    };
};

export default model;
