import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { registration, student, plan } = data;

    const formatStartDate = format(
      parseISO(registration.start_date),
      "'dia' dd 'de' MMMM 'de' yyyy",
      { locale: pt }
    );

    const formatEndDate = format(
      parseISO(registration.end_date),
      "'dia' dd 'de' MMMM 'de' yyyy",
      { locale: pt }
    );

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matricula realizada com sucesso',
      template: 'registration',
      context: {
        student: student.name,
        plan: plan.title,
        start_date: formatStartDate,
        end_date: formatEndDate,
      },
    });
  }
}

export default new RegistrationMail();
