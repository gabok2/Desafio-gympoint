import * as Yup from 'yup';
import HelpOrder from '../models/Help_orders';
import Student from '../models/Students';
import Registration from '../models/Registrations';

class HelpOrderController {
  async index(req, res) {
    const { id } = req.params;

    const helps = await HelpOrder.findAll({
      student_id: id,
    });

    return res.json(helps);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { id } = req.params;
    const { question } = req.body;

    const student = await Student.findByPk(id);

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

    const helps = await HelpOrder.create({
      student_id: id,
      question,
    });

    return res.json({ helps });
  }
}

export default new HelpOrderController();
