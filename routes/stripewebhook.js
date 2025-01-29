const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User } = require('../models');

const router = express.Router();

router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`⚠️  Erro na verificação do webhook: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            const customerEmail = invoice.customer_email;

            const user = await User.findOne({ where: { email: customerEmail } });

            if (user) {
                let newExpirationDate;

                if (user.isVip && user.vipExpirationDate) {
                    newExpirationDate = new Date(user.vipExpirationDate);
                    newExpirationDate.setDate(newExpirationDate.getDate() + 30);
                } else {
                    newExpirationDate = new Date();
                    newExpirationDate.setDate(newExpirationDate.getDate() + 30);
                }

                await user.update({
                    isVip: true,
                    vipExpirationDate: newExpirationDate,
                });
            }
            break;
        default:
            console.log(`Evento não tratado: ${event.type}`);
    }

    res.json({ received: true });
});

module.exports = router;