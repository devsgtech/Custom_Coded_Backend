'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UploadedVideo extends Model {
    static associate(models) {
      // define associations here
      UploadedVideo.belongsTo(models.GeneratedCode, {
        foreignKey: 'code_id',
        as: 'code'
      });
    }
  }
  
  UploadedVideo.init({
    uploaded_video_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    uploaded_path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    code_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tbl_generated_code',
        key: 'code_id'
      }
    }
  }, {
    sequelize,
    modelName: 'UploadedVideo',
    tableName: 'tbl_uploaded_video',
    timestamps: false
  });

  return UploadedVideo;
}; 