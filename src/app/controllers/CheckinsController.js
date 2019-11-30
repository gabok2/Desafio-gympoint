import { startOfDay, addDays } from 'date-fns';
import { Op } from 'sequelize';

import Students from '../models/Students';
import Checkins from '../models/Checkins';
import Registration from '../models/Registrations';

class CheckinsController {
  async index(req, res) {
    const checkins = await Checkins.findAll({
      where: { student_id: req.params.id },
      attributes: ['id'],
      include: [
        {
          model: Students,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(checkins);
  }

  async store(req, res) {
    const student = await Students.findByPk(req.params.id);
    if (!student) {
      return res.status(400).json({ error: 'Student não existe' });
    }

    const verific = await Registration.findOne({
      where: {
        student_id: req.params.id,
      },
    });

    if (!verific) {
      return res.status(401).json({ error: 'Você não tem uma matricula' });
    }

    // Pega o dia de hoje ai add um número de dias escolhido no caso ali é 7
    const checkValidation = addDays(new Date(), 7);

    // Faz uma contagem do dia de hoje até  o número de dia escolhido
    const checks = await Checkins.findAndCountAll({
      where: {
        student_id: req.params.id,
        // Pega o intervalo entre o dia de hoje até o dia escolhido
        created_at: {
          [Op.between]: [startOfDay(new Date()), checkValidation],
        },
      },
    });

    if (checks.count > 4) {
      return res.json({ error: 'Não pode fazer mais check' });
    }

    const { id } = req.params;

    const checkins = await Checkins.create({
      student_id: id,
    });

    return res.json(checkins);
  }
}

export default new CheckinsController();
