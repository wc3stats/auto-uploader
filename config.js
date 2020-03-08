const { app } = require ('electron');

module.exports = {
  version: 13,

  watch: [
    `${app.getPath ('home')}/Documents/Warcraft III/BattleNet/**/*.w3g`,
    `!${app.getPath ('home')}/Documents/Warcraft III/BattleNet/**/TempReplay.w3g`
  ],

  netio: {
    requests: `${app.getPath ('home')}/Documents/Warcraft III/CustomMapData/networkio/requests/**/*.*`,
    responses: `${app.getPath ('home')}/Documents/Warcraft III/CustomMapData/networkio/responses`,

    /**
     * Written on request for 'proxy://version'.
     */
    version: 1,

    whitelist: [
      'api.wc3stats.com'
    ],

    /**
     * Number of response files to write with the same response. WC3 cannot check
     * the same file twice.
     */
    redundancy: 10,

    /**
     * Maximum characters allowed per ability block.
     */
    blocksize: 200,

    /**
     * Ability codes used as 'buckets' for passing information to the responses.
     * Each bucket can hold up to 'blockSize' characters and the information
     * is passed via BlzSetAbilityIcon.
     */
    abilities: [
      1097690227,
      1098018659,
      1097689443,
      1097689452,
      1097034854,
      1097035111,
      1097098598,
      1097099635,
      1097228916,
      1097228907
    ]
  }
};