import express from "express";
import crypto from "crypto";

const app = express();

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

app.post("/interactions", (req, res) => {
  const signature = req.get("X-Signature-Ed25519");
  const timestamp = req.get("X-Signature-Timestamp");

  const isVerified = crypto.verify(
    null,
    Buffer.from(timestamp + req.rawBody),
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

  if (req.body.type === 1) {
    return res.json({ type: 1 });
  }

  if (req.body.type === 2 && req.body.data.name === "ping") {
    return res.json({
      type: 4,
      data: {
        content: "pong 🟢 Interaction OK",
        flags: 64,
      }
    });
  }

  res.sendStatus(400);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Interaction server running");
});
