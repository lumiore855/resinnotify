const express = require("express");
const nacl = require("tweetnacl");

const app = express();

const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
if (!PUBLIC_KEY) {
  throw new Error("DISCORD_PUBLIC_KEY is not set");
}

app.post(
  "/interactions",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signature = req.header("X-Signature-Ed25519");
    const timestamp = req.header("X-Signature-Timestamp");

    if (!signature || !timestamp) {
      return res.status(401).send("Missing signature headers");
    }

    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + req.body.toString(), "utf8"),
      Buffer.from(signature, "hex"),
      Buffer.from(PUBLIC_KEY, "hex")
    );

    if (!isVerified) {
      return res.status(401).send("Bad request signature");
    }

    const interaction = JSON.parse(req.body.toString("utf8"));

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

    return res.json({
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
