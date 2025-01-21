const express = require('express');
const router = express.Router();
const { User } = require('../models'); // Importe o modelo User

// Rota para cancelar a assinatura
router.post('/cancel-subscription', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      stripeSubscriptionId: null,
    });

    res.status(200).json({
      message: 'Subscription canceled successfully. You will retain VIP access until the end of the current billing period.',
      vipExpirationDate: user.vipExpirationDate,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;