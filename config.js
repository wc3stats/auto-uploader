const { app } = require ('electron');

module.exports = {
  watch: [
    `${app.getPath ('home')}/Documents/Warcraft III/BattleNet/**/*.w3g`,
    `!${app.getPath ('home')}/Documents/Warcraft III/BattleNet/**/TempReplay.w3g`
  ]
};