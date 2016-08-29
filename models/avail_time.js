"use strict";

module.exports = function(sequelize, DataTypes) {
    var Avail_time = sequelize.define("Avail_time", {
        start_time: {
            type: DataTypes.STRING(20),
            allowNull:false
        },
        duration: DataTypes.INTEGER(1),
        occupied: {
            type:DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
    return Avail_time;
};
// ,{
//     classMethods:{
//         associate: function(models){
//             Avail_time.hasOne(models.User);
//         }
//     }
// }