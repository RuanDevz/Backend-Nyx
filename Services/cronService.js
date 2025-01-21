const cron = require('node-cron');
const { User } = require('../models'); // Importe o modelo User

// Tarefa agendada para remover o acesso VIP expirado
const startCronJob = () => {
  cron.schedule('0 0 * * *', async () => { // Executa todos os dias à meia-noite
    try {
      const currentDate = new Date();
      const users = await User.findAll({
        where: {
          isVip: true,
          vipExpirationDate: { [Op.lte]: currentDate }, // Filtra usuários com vipExpirationDate expirado
        },
      });

      for (const user of users) {
        await user.update({
          isVip: false,
          vipExpirationDate: null,
        });
      }

      console.log(`Updated ${users.length} users with expired VIP status.`);
    } catch (error) {
      console.error('Error updating expired VIP statuses:', error);
    }
  });
};

module.exports = startCronJob;