'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GeneratedCode extends Model {
    static associate(models) {
      // define associations here
      GeneratedCode.hasMany(models.UploadedVideo, {
        foreignKey: 'code_id',
        as: 'videos'
      });
    }
  }
  
  GeneratedCode.init({
    code_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    generated_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'GeneratedCode',
    tableName: 'tbl_generated_code',
    timestamps: false
  });

  return GeneratedCode;
}; 