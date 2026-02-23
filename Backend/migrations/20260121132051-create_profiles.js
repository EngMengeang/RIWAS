'use strict';
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Profiles', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    userId: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
    fullName: { type: Sequelize.STRING },
    phone: { type: Sequelize.STRING },
    bio: { type: Sequelize.TEXT },
    avatarUrl: { type: Sequelize.STRING },
    headline: { type: Sequelize.STRING },
    about: { type: Sequelize.TEXT },
    experience: { type: Sequelize.INTEGER },
    websiteUrl: { type: Sequelize.STRING },
    github: { type: Sequelize.STRING },
    linkedin: { type: Sequelize.STRING },
    twitter: { type: Sequelize.STRING },
    views: { type: Sequelize.INTEGER, defaultValue: 0 },
    role: { type: Sequelize.ENUM('CANDIDATE','RECRUITER'), allowNull: false },
    createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Profiles');
}
