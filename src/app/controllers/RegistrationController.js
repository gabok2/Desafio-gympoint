import * as Yup from 'yup';
import { isBefore, parseISO, addMonths } from 'date-fns';
import Registrations from '../models/Registrations';
import Students from '../models/Students';
import Plans from '../models/Plans';
import RegistrationMail from '../jobs/RegistrationMail';
import Queue from '../../lib/Queue';

class RegistrationController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const registration = await Registrations.findAll({
      order: ['start_date'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Students,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },

        {
          model: Plans,
          as: 'plan',
          attributes: ['title'],
        },
      ],
    });

    return res.json(registration);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const plan = await Plans.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan não existe' });
    }

    const student = await Students.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student não existe' });
    }

    // Pega a data escolhida pelo usuário
    const start = parseISO(start_date);

    // Verifica se a data escolhida já passou
    if (isBefore(start, new Date())) {
      return res.status(400).json({ error: 'Essa data não é permitida' });
    }

    /*
      Depois adiciona essa data no primeiro argumento, o segundo vai ser a duração
      do plano escolhido EX: Gold tem 3 meses ai esse 3 é add no plan.duration
    */
    const end_date = addMonths(start, plan.duration);

    const total = plan.price * plan.duration;

    const registration = await Registrations.create({
      start_date: start,
      end_date,
      student_id,
      plan_id,
      price: total,
    });

    await Queue.add(RegistrationMail.key, { registration, student, plan });

    return res.json(registration);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { id } = req.params;

    const registration = await Registrations.findByPk(id);

    if (!registration) {
      return res.status(400).json({ error: 'Matricula não existe' });
    }

    const { plan_id, start_date } = req.body;

    const plan = await Plans.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan não existe' });
    }

    const start = parseISO(start_date);

    if (isBefore(start, new Date())) {
      return res.status(400).json({ error: 'Essa data não é permitida' });
    }

    const end_date = addMonths(start, plan.duration);

    const total = plan.price * plan.duration;

    const updateRegistration = {
      start_date: start,
      end_date,
      price: total,
      plan_id,
    };

    await registration.update(updateRegistration);

    return res.json(registration);
  }

  async delete(req, res) {
    const registration = await Registrations.findByPk(req.params.id);

    if (!registration) {
      return res.status(400).json({ error: 'Plano não existe' });
    }

    await registration.destroy();

    return res.json(registration);
  }
}

export default new RegistrationController();
