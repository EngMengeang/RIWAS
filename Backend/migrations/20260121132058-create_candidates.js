'use strict';
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Candidates', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    profileId: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'Profiles', key: 'id' }, onDelete: 'CASCADE' },
    resumeUrl: { type: Sequelize.STRING },
    education: { type: Sequelize.JSONB },
    experience: { type: Sequelize.JSONB },
    summary: { type: Sequelize.TEXT },
    createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Candidates');
}
