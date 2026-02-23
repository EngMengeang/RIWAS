'use strict';
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Recruiters', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    profileId: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'Profiles', key: 'id' }, onDelete: 'CASCADE' },
    department: { type: Sequelize.STRING },
    positionTitle: { type: Sequelize.STRING },
    workEmail: { type: Sequelize.STRING },
    phoneExtension: { type: Sequelize.STRING },
    notes: { type: Sequelize.TEXT },
    createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Recruiters');
}
