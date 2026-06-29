/** Message shown when the API runs in demo payment mode (no Razorpay keys on Railway). */
export const PAYMENT_GATEWAY_PENDING_MESSAGE =
  "Online payment will be enabled after the client configures their payment gateway.";

export type PaymentMode = "demo" | "test" | "live";

export interface PaymentStatus {
  configured: boolean;
  mode: PaymentMode;
  demo: boolean;
  live: boolean;
  webhook: boolean;
  message: string | null;
}
