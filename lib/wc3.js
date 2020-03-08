const logger = require ('electron-log');

const $ = {
  /**
   * Request format:
   *
   * function PreloadFiles takes nothing returns nothing
   *
   *    call PreloadStart()
   *    call Preload( "{ "url": "https://api.wc3stats.com/gamelist?limit=1" }" )
   *    call PreloadEnd( 0.0 )
   *
   * endfunction
   */
  unpack (raw) {
    let unpacked;

    unpacked = raw.slice (
      raw.indexOf ('"') + 1,
      raw.lastIndexOf ('"')
    );

    try {
      unpacked = JSON.parse (unpacked);
    } catch (e) {
      logger.error (`[WC3] Failed to unpack: ${raw}`);
      return null;
    }

    return unpacked;
  },

  /**
   * Response format:
   *
   * function PreloadFiles takes nothing returns nothing
   *   call BlzSetAbilityIcon(1097690227, '-blah blah blah');
   *   call BlzSetAbilityIcon(1098018659, '-moreblah blah');
   * endfunction
   */
  pack (payload, { blocksize, abilities }) {
    let packed;
    let maxlen;

    maxlen = blocksize * abilities.length;

    if (typeof payload === 'string') {
      payload = payload.replace (/"/g, '\\"');
    }

    payload = '' + payload;

    if (payload.length > maxlen) {
      logger.warn (`[WC3] Response size [${payload.length}] exceeds maximum length [${maxlen}].`);
      payload = '';
    }

    let block;
    let adx;
    let pdx;

    packed = 'function PreloadFiles takes nothing returns nothing';

    for (adx = 0, pdx = 0; pdx < payload.length; adx++, pdx += blocksize) {
      block = payload.slice (pdx, pdx + blocksize);
      packed += `\n\tcall BlzSetAbilityIcon(${abilities [adx]}, "-${block}")`;
    }

    packed += '\nendfunction';
    return packed;
  }
};

module.exports = $;