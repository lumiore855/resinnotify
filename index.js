const express = require("express");
const crypto = require("crypto");

const app = express();

const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

app.post(
  "/interactions",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signature = req.get("X-Signature-Ed25519");
    const timestamp = req.get("X-Signature-Timestamp");

    if (!signature || !timestamp) {
      return res.status(401).send("Missing signature headers");
    }

    const body = req.body; // ← Buffer

    const isVerified = crypto.verify(
      null,
      Buffer.concat([
        Buffer.from(timestamp),
        body,
      ]),
      {
        key: Buffer.from(PUBLIC_KEY, "hex"),
        format: "der",
        type: "spki",
      },
      Buffer.from(signature, "hex")
    );

    if (!isVerified) {
      return res.status(401).send("Bad request signature");
    }

    const interaction = JSON.parse(body.toString("utf8"));

    if (interaction.type === 1) {
      return res.json({ type: 1 });
    }

    if (interaction.type === 2 && interaction.data?.name === "ping") {
      return res.json({
        type: 4,
        data: {
          content: "pong 🟢 Interaction OK",
          flags: 64,
        },
      });
    }

    return res.status(200).json({
      type: 4,
      data: {
        content: "Unknown command",
        flags: 64,
      },
    });
  }
);

app.listen(process.env.PORT || 10000, () => {
  console.log("Interaction server running");
});
