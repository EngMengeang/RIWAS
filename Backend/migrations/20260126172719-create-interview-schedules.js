'use strict';
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('InterviewSchedules', {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
      allowNull: false,
    },
    application_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'JobApplications', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    scheduled_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Recruiters', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    interview_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    meeting_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'rescheduled'),
      defaultValue: 'scheduled',
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('NOW()'),
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('NOW()'),
      allowNull: false,
    },
  });

  // Optional: add an index on scheduled_by for faster recruiter queries
  await queryInterface.addIndex('InterviewSchedules', ['scheduled_by']);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('InterviewSchedules');
}
