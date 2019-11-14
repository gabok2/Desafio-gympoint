import Sequelize from 'sequelize';
import dbConfig from '../config/database';
import User from '../app/models/User';
import Students from '../app/models/Students';

const connection = new Sequelize(dbConfig);

User.init(connection);
Students.init(connection);

module.exports = connection;
