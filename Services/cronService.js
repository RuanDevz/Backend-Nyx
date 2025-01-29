const { User } = require('../models');

async function checkVipExpiration() {
    try {
        const users = await User.findAll({
            where: {
                isVip: true,
                vipExpirationDate: {
                    [Op.lt]: new Date(), // Verifica se a data de expiração é menor que a data atual
                },
            },
        });

        for (const user of users) {
            await user.update({ isVip: false });
        }
    } catch (error) {
        console.error('Erro ao verificar expiração do VIP:', error.message, error.stack);
    }
}

// Executa a verificação a cada 24 horas
setInterval(checkVipExpiration, 24 * 60 * 60 * 1000);