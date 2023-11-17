'use strict';
const { Model } = require('sequelize');
const bcrypt = require("bcryptjs");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // 1. Users 모델에서
      this.hasMany(models.Posts, { // 2. Posts 모델에게 1:N 관계 설정
        sourceKey: "userId", // 3. Users 모델의 userId 컬럼을
        foreignKey: "UserId" // 4. Posts 모델의 UserId 컬럼과 연결
      })
    }
  }
  Users.init({
    userId: {
      allowNull: false, // NOT NULL
      autoIncrement: true, // AUTO_INCREMENT
      primaryKey: true, // Primary Key (기본키)
      type: DataTypes.INTEGER
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Users',
  });

  Users.beforeCreate(async (user, options) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  })


  return Users;
};