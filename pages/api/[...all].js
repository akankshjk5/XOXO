import { app, startPromise } from "../../backend/src/server.js";

export default async function handler(req, res) {
  try {
    // Wait for the database connection
    await startPromise;

    // Rewrite relative URLs for static invoices and uploads so Express can serve them
    if (req.url.startsWith("/api/invoices/")) {
      req.url = req.url.replace("/api/invoices/", "/invoices/");
    } else if (req.url.startsWith("/api/uploads/")) {
      req.url = req.url.replace("/api/uploads/", "/uploads/");
    }

    // Run Express request handler
    return app(req, res);
  } catch (error) {
    console.error("Serverless API route error:", error);
    return res.status(500).json({
      success: false,
      message: "Serverless execution error",
      error: error.message,
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
