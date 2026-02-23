"use strict";

import bcryptjs from "bcryptjs";
import { USER_ROLES } from "../config/constants.js";

export default {
  async up(queryInterface, Sequelize) {
    const password = await bcryptjs.hash("password123", 10);

    return queryInterface.bulkInsert("Users", [
      {
        id: Sequelize.literal("gen_random_uuid()"),
        email: "YanghaiPov@gmail.com",
        password: password,
        firstName: "Yanghai",
        lastName: "Pov",
        role: USER_ROLES.RECRUITER,
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        email: "candidate@gmail.com",
        password: password,
        firstName: "John",
        lastName: "Doe",
        role: USER_ROLES.CANDIDATE,
        isVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Users", null, {});
  },
};
