// Services/cronService.js
const cron = require('node-cron');
const { User, Op } = require('../models'); 

async function checkVipExpiration() {
    try {
        const users = await User.findAll({
            where: {
                isVip: true,
                vipExpirationDate: {
                    [Op.lt]: new Date(),
                },
            },
        });


        for (const user of users) {
            await user.update({ isVip: false });
            console.log(`Usuário ${user.id} teve seu VIP desativado.`);
        }
    } catch (error) {
        console.error('Erro ao verificar expiração do VIP:', error.message, error.stack);
    }
}

// Função para iniciar o cron job
function startCronJob() {
    cron.schedule('0 0 * * *', checkVipExpiration); // Executa à meia-noite todos os dias
    console.log('Cron job iniciado.');
}

module.exports = startCronJob; 
