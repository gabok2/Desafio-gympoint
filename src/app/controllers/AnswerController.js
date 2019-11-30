import * as Yup from 'yup';
import HelpOrder from '../models/Help_orders';
import Students from '../models/Students';
import Queue from '../../lib/Queue';
import QuestionMail from '../jobs/QuestionMail';

class AnswerController {
  async index(req, res) {
    const answers = await HelpOrder.findOne({
      where: {
        answer: null,
      },
    });

    return res.json(answers);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { answer } = req.body;

    const order = await HelpOrder.findOne({
      where: { id: req.params.id },
    });

    const answerHelp = await order.update({
      ...order,
      answer,
      answer_at: new Date(),
    });

    const student = await Students.findByPk(order.student_id);

    await Queue.add(QuestionMail.key, { student, answerHelp });

    return res.json(answerHelp);
  }
}

export default new AnswerController();
