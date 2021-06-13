============================
> Readme for server side code. Not complete work nor supposed to be.

# Table of Contents

- [Backend](#backend)
	- [Routes](#routes)
- [Database](#database)
	- [Migrations](#migrations)
	- [Seeds](#seeds)
		- [Settings](#settings)


There are additional setup for server side. You must create .env file to root of backend and knexfile.js for root of the database. Help for creating *.env* can be found [here](#env) and creating *knexfile.js* from [here](#knexfile).

## Backend


### Routes

There are two route files, index.js for used routes and suggested.js for suggested routes (that may or may not be used).

##### .env

Create .env file on root of the backend with following structure:

```
PORT=
DB_USER=
DB_PASS=
DB_HOST=
DB_PORT=
DB_TYPE=
DB_DATABASE=
```

Fill the data with your own information.

## Database


### Migrations


### Seeds

Seed database with initial information, e.g. room and door id's.

#### Settings

Quick define amount of rooms (room grid) and amount of doors in single room.

##### knexfile.js


Create knexfile.js file on root of the backend with following structure:

```
module.exports = {
  development: {
    client: '',
    connection: {
      user: '',
      password: '',
      database: ''
    }
  },

  production: {
    client: '',
    connection: {
      port: ,
      host: "",
      database: ,
      user: ,
      password: 
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
```

Fill the data with your own information.