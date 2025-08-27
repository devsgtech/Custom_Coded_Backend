const ipService = require("../services/ipService");

async function fetchIPAddress(req, res, next) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(",")[0] : req.socket.remoteAddress;
  const date = new Date();
  const userAgent = req.headers["user-agent"]; // e.g. "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_6_1)"
  const referrer = req.headers["referer"] || req.headers["referrer"]; // e.g. "https://google.com/"

  const honeypotLogObject = {
    ip,
    date,
    userAgent,
    referrer
  };

  // Log/save the IP in DB
  saveIpToDB(honeypotLogObject);

  next();
}

async function saveIpToDB(logObject) {
  // Replace with your DB code
  console.log("Saving to DB:", logObject);
  try {
    const saveIP = await ipService.saveIpToDB(logObject);
  } catch (error) {}
}

module.exports = fetchIPAddress;
