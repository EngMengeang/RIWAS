'use strict';
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Users', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    email: { type: Sequelize.STRING, allowNull: false, unique: true },
    password: { type: Sequelize.STRING, allowNull: false },
    firstName: { type: Sequelize.STRING, allowNull: false },
    lastName: { type: Sequelize.STRING, allowNull: false },
    phoneNumber: { type: Sequelize.STRING },
    profilePicture: { type: Sequelize.STRING },
    coverImage: { type: Sequelize.STRING },
    profilePicturePublicId: { type: Sequelize.STRING },
    coverImagePublicId: { type: Sequelize.STRING },
    role: { type: Sequelize.ENUM('CANDIDATE','RECRUITER'), defaultValue: 'CANDIDATE' },
    bio: { type: Sequelize.TEXT },
    location: { type: Sequelize.STRING },
    isVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
    isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
    lastLogin: { type: Sequelize.DATE },
    createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Users');
}
