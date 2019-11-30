import Sequelize from 'sequelize';
import dbConfig from '../config/database';

import User from '../app/models/User';
import Student from '../app/models/Students';
import Registration from '../app/models/Registrations';
import Plan from '../app/models/Plans';
import Help from '../app/models/Help_orders';
import Checkin from '../app/models/Checkins';

const connection = new Sequelize(dbConfig);

User.init(connection);
Student.init(connection);
Registration.init(connection);
Plan.init(connection);
Help.init(connection);
Checkin.init(connection);

Registration.associate(connection.models);
Help.associate(connection.models);
Checkin.associate(connection.models);
