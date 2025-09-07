const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Create checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartId } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    let cart;
    if (cartId) {
      cart = await Cart.findOne({ _id: cartId, user: userId }).populate("items.product");
    } else {
      cart = await Cart.findOne({ user: userId }).populate("items.product");
    }

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const validItems = [];
    const issues = [];

    for (const item of cart.items) {
      if (!item.product) {
        issues.push(`Product not found for cart item`);
        continue;
      }

      if (item.product.stock < item.quantity) {
        if (item.product.stock === 0) {
          issues.push(`${item.product.name} is out of stock`);
        } else {
          issues.push(`Only ${item.product.stock} ${item.product.name} available`);
          item.quantity = item.product.stock;
          validItems.push(item);
        }
      } else {
        validItems.push(item);
      }
    }

    if (validItems.length === 0) {
      return res.status(400).json({ 
        error: "No items available for checkout",
        issues: issues
      });
    }

    const line_items = validItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          description: item.product.description || `${item.product.category} - Eco-friendly product`,
          images: [],
        },
        unit_amount: Math.round(parseFloat(item.product.price) * 100),
      },
      quantity: item.quantity,
    }));

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    const sessionData = {
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      metadata: {
        userId: userId.toString(),
        cartId: cart._id.toString(),
        itemCount: validItems.length.toString()
      },
      success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/cart`,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'LK'],
      },
    };

    if (req.user.email) {
      sessionData.customer_email = req.user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    res.json({ 
      success: true,
      url: session.url,
      sessionId: session.id,
      message: issues.length > 0 ? 'Some items were adjusted due to stock availability' : 'Checkout session created successfully',
      issues: issues.length > 0 ? issues : undefined
    });

  } catch (err) {
    console.error("Stripe Checkout Error:", err.message);
    res.status(500).json({ 
      error: "Failed to create checkout session",
      message: err.message
    });
  }
};

// Handle successful payment
exports.handlePaymentSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "Session ID is required" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') return res.status(400).json({ error: "Payment not completed" });

    const { userId, cartId } = session.metadata;
    const cart = await Cart.findOne({ _id: cartId, user: userId }).populate("items.product");

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const stockUpdates = [];
    for (const item of cart.items) {
      if (item.product && item.product.stock >= item.quantity) {
        const updatedProduct = await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { stock: -item.quantity }, updatedAt: new Date() },
          { new: true }
        );
        stockUpdates.push({
          productId: item.product._id,
          productName: item.product.name,
          quantityPurchased: item.quantity,
          previousStock: item.product.stock,
          newStock: updatedProduct.stock
        });
      }
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Payment successful and order processed",
      sessionId: sessionId,
      orderId: 'ECO-' + Date.now(),
      stockUpdates,
      itemsProcessed: stockUpdates.length,
      totalAmount: session.amount_total / 100,
      currency: session.currency
    });

  } catch (err) {
    console.error("Payment Success Handler Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Webhook handler
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(400).send('Webhook secret not configured');
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('Webhook event:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Webhook: Checkout session completed:', session.id);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

// Test Stripe connection
exports.testStripe = async (req, res) => {
  try {
    await stripe.paymentMethods.list({ type: 'card', limit: 1 });
    res.json({
      success: true,
      message: 'Stripe connection successful',
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
      webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Placeholders for undefined routes
exports.processBuyNow = async (req, res) => {
  res.status(200).json({ success: true, message: "Buy Now not implemented yet" });
};
exports.getPaymentHistory = async (req, res) => {
  res.status(200).json({ success: true, message: "Payment history not implemented yet" });
};
