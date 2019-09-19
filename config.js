const { app } = require ('electron');

module.exports = {
  watch: [
    `${app.getPath ('home')}/Documents/Warcraft III/Replay/**/*.w3g`,
    `!${app.getPath ('home')}/Documents/Warcraft III/Replay/**/TempReplay.w3g`
  ]
};