const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());

app.post('/resend', (req, res) => {
  console.log("🔥 Webhook hit. Running resend.js...");

  exec('node resend.js', (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Script error:", err);
      return res.status(500).send("Script failed.");
    }

    console.log(stdout);
    res.send("✅ Resend triggered.");
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook running on port ${PORT}`);
});