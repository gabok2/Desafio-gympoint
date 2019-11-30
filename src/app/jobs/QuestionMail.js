import Mail from '../../lib/Mail';

class QuestionMail {
  get key() {
    return 'QuestionMail';
  }

  async handle({ data }) {
    const { answerHelp, student } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Pergunta respondida',
      template: 'question',
      context: {
        student: student.name,
        question: answerHelp.question,
        answer: answerHelp.answer,
      },
    });
  }
}

export default new QuestionMail();
