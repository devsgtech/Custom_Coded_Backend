'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UploadedAttachment extends Model {
    static associate(models) {
      // define associations here if needed
      UploadedAttachment.belongsTo(models.GeneratedCode, {
        foreignKey: 'code_id',
        as: 'code'
      });
    }
  }
  
  UploadedAttachment.init({
    uploded_video_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    uploded_path: {
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
    },
    audio: {
      type: DataTypes.STRING,
      allowNull: true
    },
    images: {
      type: DataTypes.STRING,
      allowNull: true
    },
    background_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    columns_remarks: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'UploadedAttachment',
    tableName: 'tbl_uploaded_attachments',
    timestamps: false
  });

  return UploadedAttachment;
}; 