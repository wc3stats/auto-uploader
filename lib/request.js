const fs = require ('fs').promises;
const path = require ('path');
const { URL } = require ('url');
const logger = require ('electron-log');
const { pack, unpack } = require ('./wc3');
const { isset, exists, mkdir, unlink } = require ('./util');

/** **/

let fetch;

fetch = require ('electron-fetch');
fetch = fetch.default;

/** **/

class Request
{
  constructor (file, options) {
    this.file = file;
    this.options = options || {};
  }

  set (k, v) {
    this.options [k] = v;
    return this;
  }

  get (k, d) {
    return this.options [k] || d;
  }

  has (k) {
    return isset (this.options, k);
  }

  async read () {
    let raw;
    let req;

    if (!await exists (this.file)) {
      logger.error (`[Request] File not found: ${this.file}`);
      return false;
    }

    raw = await fs.readFile (this.file);
    req = unpack (raw);

    return req;
  }

  async execute () {
    let req;
    let res;
    let opt;

    if (! (req = await this.read ())) {
      logger.error ('[Request] Read failed.');
      return false;
    }

    logger.info ('[Request] Running request:');
    logger.info (req);

    if (!isset (req, 'url')) {
      logger.error ('[Request] Malformed: Missing URL.');
      return false;
    }

    req.url = new URL (req.url);

    if (this.isProxy (req.url)) {
      this.proxy (req);
      return null;
    }

    if (!this.whitelisted (req)) {
      logger.error (`[Request] Rejecting request for non-whitelisted URL: ${req.url}`);
      return false;
    }

    opt = {
      method  : req.method || req.body ? 'POST' : 'GET',
      headers : req.headers,
      body    : req.body ? JSON.stringify (req.body) : null
    };

    res = await fetch (req.url, opt);
    res = await res.text ();

    logger.debug ('[Request] Received response:');
    logger.debug (res);

    return res;
  }

  async save (res) {
    let packed;

    packed = pack (res, {
      blocksize: this.get ('blocksize'),
      abilities: this.get ('abilities')
    });

    await mkdir (this.get ('responses'));

    return await Promise.all (
      this
        .out ()
        .map (out => fs.writeFile (out, packed))
    );
  }

  async delete () {
    await unlink (this.file);

    return await Promise.all (
      this
        .out ()
        .map (out => unlink (out))
    );
  }

  /** **/

  isProxy (url) {
    return url.protocol === 'proxy:';
  }

  async proxy (req) {
    switch (req.url.host) {
      case 'version':
        await this.save (this.get ('version', 1))
      break;

      case 'clear':
        await this.delete ();
      break;

      default:
        logger.error (`[Request] Illegal proxy endpoint: [${req.url.host}].`);
        return false;
      break;
    }

    return true;
  }

  whitelisted (req) {
    if (!this.has ('whitelist')) {
      return false;
    }

    return !!this
      .get ('whitelist')
      .find (u => req.url.host === u);
  }

  out () {
    let out;
    let ext;
    let bse;
    let dir;

    if (!this.has ('responses')) {
      logger.warn (`[Request] No outfiles, responses option empty.`);
      return [];
    }

    out = [];
    ext = path.extname (this.file);
    bse = path.basename (this.file, ext);
    dir = this.get ('responses');

    for (let i = 0; i < this.get ('redundancy', 1); i++) {
      out.push (path.join (dir, `${bse}-${i}${ext}`));
    }

    return out;
  }
}

module.exports = Request;