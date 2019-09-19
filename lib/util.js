const logger = require ('electron-log');
const FormData = require ('form-data');
const fs = require ('fs');
const path = require ('path');

let fetch;

fetch = require ('electron-fetch');
fetch = fetch.default;

/** **/

const endpoints = {
  upload: 'https://api.wc3stats.com/upload?toDisplay=true'
};

/** **/

module.exports = {

  async upload (path)
  {
    if (!fs.existsSync (path)) {
      logger.error (`File not found: ${path}.`);
    }

    logger.info (`Uploading [${path}].`);

    let form = new FormData ();
    form.append ('replay', fs.createReadStream (path));

    let res = await fetch (
      endpoints.upload,
      {
        method: 'POST',
        body: form
      }
    );

    let json = await res.json ();

    if (res.status != 200 || json.code != 200) {
      logger.error (`Received unexpected status [${json.status}] uploading [${path}].`);
      logger.error (json);
      return res;
    }

    logger.info (`File [${path}] successfully uploaded (${json.queryTime} sec).`);
    return res;
  },

  resolve (p)
  {
    return p
      .replace (/\\/g, '/');
  },

  nl (s)
  {
    return s
      .replace (/(?<!\r)\n/g, "\r\n");
  }

};