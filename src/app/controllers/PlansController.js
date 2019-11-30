import * as Yup from 'yup';

import Plans from '../models/Plans';

class PlansController {
  async index(req, res) {
    const plans = await Plans.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
    });

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title } = req.body;

    const plansExists = await Plans.findOne({
      where: { title },
    });

    if (plansExists) {
      return res.status(400).json({ error: 'Plano já existe' });
    }

    const { duration, price } = await Plans.create(req.body);

    return res.json({
      title,
      duration,
      price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title } = req.body;

    const plans = await Plans.findByPk(req.params.id);

    if (!plans) {
      return res.status(400).json({ error: 'Plano não existe' });
    }

    if (title === plans.title) {
      const titleExists = await Plans.findOne({
        where: { title },
      });

      if (titleExists) {
        return res.status(400).json({ error: 'Title já existe' });
      }
    }

    const { duration, price } = await plans.update(req.body);

    return res.json({
      title,
      duration,
      price,
    });
  }

  async delete(req, res) {
    const plans = await Plans.findByPk(req.params.id);

    if (!plans) {
      return res.status(400).json({ error: 'Plano não existe' });
    }

    await plans.destroy();

    return res.json(plans);
  }
}

export default new PlansController();
