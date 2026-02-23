module.exports = {
  development: {
    username: "postgres",
    password: "1234",
    database: "riwas_db",
    host: "127.0.0.1",
    port: 5432,
    dialect: "postgres"
  },
  test: {
    username: "postgres",
    password: "1234",
    database: "riwas_test",
    host: "127.0.0.1",
    port: 5432,
    dialect: "postgres"
  },
  production: {
    username: "postgres",
    password: "1234",
    database: "riwas_prod",
    host: "127.0.0.1",
    port: 5432,
    dialect: "postgres"
  }
};
