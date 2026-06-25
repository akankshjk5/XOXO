const crypto = require("crypto");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

async function record(userId, { kind, direction, amount, reason, balanceAfter, ref }) {
  return Transaction.create({ user: userId, kind, direction, amount, reason, balanceAfter, ref });
}

// GET /api/wallet
exports.getWallet = async (req, res, next) => {
  try {
    let user = await User.findById(req.user._id);
    // Lazily assign a referral code if missing
    if (!user.referralCode) {
      user.referralCode = (user.name.split(" ")[0] || "XOXO").toUpperCase().slice(0, 6) +
        crypto.randomBytes(2).toString("hex").toUpperCase();
      await user.save();
    }
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({
      success: true,
      data: {
        walletBalance: user.walletBalance,
        rewardPoints: user.rewardPoints,
        referralCode: user.referralCode,
        transactions,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/wallet/redeem  { points }
// Converts reward points to wallet balance (1 point = ₹1).
exports.redeemPoints = async (req, res, next) => {
  try {
    const points = Math.floor(Number(req.body.points));
    if (!points || points <= 0) {
      return res.status(400).json({ success: false, message: "Enter points to redeem" });
    }
    const user = await User.findById(req.user._id);
    if (user.rewardPoints < points) {
      return res.status(400).json({ success: false, message: "Not enough reward points" });
    }
    user.rewardPoints -= points;
    user.walletBalance += points;
    await user.save();

    await record(user._id, { kind: "reward", direction: "debit", amount: points, reason: "Redeemed to wallet", balanceAfter: user.rewardPoints });
    await record(user._id, { kind: "wallet", direction: "credit", amount: points, reason: "Reward redemption", balanceAfter: user.walletBalance });

    res.json({ success: true, data: { walletBalance: user.walletBalance, rewardPoints: user.rewardPoints } });
  } catch (err) {
    next(err);
  }
};

// POST /api/wallet/referral  { code }
// Apply someone else's referral code once; both parties get a bonus.
exports.applyReferral = async (req, res, next) => {
  try {
    const code = String(req.body.code || "").trim().toUpperCase();
    if (!code) return res.status(400).json({ success: false, message: "Enter a referral code" });

    const me = await User.findById(req.user._id);
    if (me.referredBy) {
      return res.status(400).json({ success: false, message: "Referral already applied" });
    }
    if (me.referralCode === code) {
      return res.status(400).json({ success: false, message: "You can't refer yourself" });
    }
    const referrer = await User.findOne({ referralCode: code });
    if (!referrer) return res.status(404).json({ success: false, message: "Invalid referral code" });

    const BONUS = 500;
    me.referredBy = referrer._id;
    me.walletBalance += BONUS;
    await me.save();
    referrer.walletBalance += BONUS;
    await referrer.save();

    await record(me._id, { kind: "wallet", direction: "credit", amount: BONUS, reason: "Referral bonus", balanceAfter: me.walletBalance });
    await record(referrer._id, { kind: "wallet", direction: "credit", amount: BONUS, reason: `Referral bonus (${me.name})`, balanceAfter: referrer.walletBalance });

    res.json({ success: true, data: { walletBalance: me.walletBalance }, message: `₹${BONUS} added to your wallet!` });
  } catch (err) {
    next(err);
  }
};

module.exports.record = record;
