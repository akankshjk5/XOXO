const Coupon = require("../models/Coupon");

function computeDiscount(coupon, subtotal) {
  if (coupon.discountType === "fixed") {
    return Math.min(coupon.discountValue, subtotal);
  }
  return Math.round((subtotal * coupon.discountValue) / 100);
}

async function findValidCoupon(code, subtotal) {
  const coupon = await Coupon.findOne({
    code: String(code).toUpperCase().trim(),
    isActive: true,
  });

  if (!coupon) {
    return { error: "Invalid coupon code" };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { error: "This coupon has expired" };
  }

  if (subtotal < (coupon.minAmount || 0)) {
    return {
      error: `Minimum booking amount is ₹${(coupon.minAmount || 0).toLocaleString("en-IN")}`,
    };
  }

  const discount = computeDiscount(coupon, subtotal);
  return { coupon, discount };
}

/** POST /api/coupons/validate */
exports.validate = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || subtotal == null) {
      return res.status(400).json({ success: false, message: "code and subtotal are required" });
    }

    const result = await findValidCoupon(code, Number(subtotal));
    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }

    const { coupon, discount } = result;
    res.json({
      success: true,
      data: {
        code: coupon.code,
        discount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.findValidCoupon = findValidCoupon;
exports.computeDiscount = computeDiscount;
