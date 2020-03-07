const logger = require ('electron-log');
const FormData = require ('form-data');
const fs = require ('fs').promises;
const { createReadStream } = require ('fs');
const path = require ('path');

let fetch;

fetch = require ('electron-fetch');
fetch = fetch.default;

/** **/

const endpoints = {
  upload: 'https://api.wc3stats.com/upload?auto=true'
};

/** **/

const $ = {

  async upload (path)
  {
    if (!await $.exists (path)) {
      logger.error (`[Watcher] File not found: ${path}.`);
    }

    logger.info (`[Watcher] Uploading [${path}].`);

    let form = new FormData ();
    form.append ('replay', createReadStream (path));

    let res = await fetch (
      endpoints.upload,
      {
        method: 'POST',
        body: form
      }
    );

    let json = await res.json ();

    if (res.status != 200 || json.code != 200) {
      logger.error (`[Watcher] Received unexpected status [${json.status}] uploading [${path}].`);
      logger.error (json);
      return res;
    }

    logger.info (`[Watcher] File [${path}] successfully uploaded (${json.queryTime} sec).`);
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
  },

  isset (obj, k)
  {
    return k in obj;
  },

  async exists (file)
  {
    try {
      await fs.lstat (file);
    } catch (e) {
      return false;
    }

    return true;
  },

  async mkdir (dir)
  {
    return fs.mkdir (dir, { recursive : true });
  },

  async unlink (file)
  {
    if (!await $.exists (file)) {
      return;
    }

    return fs.unlink (file);
  }

};

module.exports = $;