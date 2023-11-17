'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // 1. Posts 모델에서
      this.belongsTo(models.Users, { // 2. Users 모델에게 N:1 관계를 설정
        targetKey: "userId", // 3. Users 모델의 userId 컬럼을
        foreignKey: "UserId" // 4. Posts 모델의 UserId 컬럼과 연결
      })
    }
  }
  Posts.init({
    postId: {
      allowNull: false, // NOT NULL
      autoIncrement: true, // AUTO_INCREMENT
      primaryKey: true, // Primary Key (기본키)
      type: DataTypes.INTEGER
    },
    UserId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    title: {
      allowNull: false,
      type: DataTypes.STRING
    },
    content: {
      allowNull: false,
      type: DataTypes.STRING
    },
    state: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    modelName: 'Posts',
  });
  return Posts;
};