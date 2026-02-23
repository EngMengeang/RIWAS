### install dependencies
```
npm install 

```
### Create database 
#### Use Postgres SQL 

```
-- Development 
CREATE DATABASE riwas_db; 

-- Test
CREATE DATABASE riwas_test;

-- Production
CREATE DATABASE riwas_prod;

```

### Run Migrations 

#### Development (What WE need to do right now)
```
npx sequelize-cli db:migrate --env development
```

###  Production 

```
npx sequelize-cli db:migrate --env production
```
### Run Seeders for testing insert data 

#### Development

```
npx sequelize-cli db:seed:all --env development

```

### Start Server
```
npm run dev 

```
### Create migrations (Optional)
```
npx sequelize-cli migration:generate --name create_users
npx sequelize-cli migration:generate --name create_profiles
npx sequelize-cli migration:generate --name create_candidates
npx sequelize-cli migration:generate --name create_recruiters
npx sequelize-cli migration:generate --name create_job_postings
npx sequelize-cli migration:generate --name create_job_applications
npx sequelize-cli migration:generate --name create_interview_schedules
npx sequelize-cli migration:generate --name create_interview_feedbacks
npx sequelize-cli migration:generate --name create_application_workflows
npx sequelize-cli migration:generate --name create_application_status_histories
npx sequelize-cli migration:generate --name create_categories
npx sequelize-cli migration:generate --name create_skills
npx sequelize-cli migration:generate --name create_user_skills
npx sequelize-cli migration:generate --name create_score_attributes
npx sequelize-cli migration:generate --name create_matrix_scores
npx sequelize-cli db:migrate

```