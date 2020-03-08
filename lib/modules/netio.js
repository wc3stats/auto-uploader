const Module = require ('../module');
const logger = require ('electron-log');
const chokidar = require ('chokidar');
const Semaphore = require ('await-semaphore').Semaphore;
const { resolve, isset } = require ('../util');
const Request = require ('../request');

/** **/

class Netio extends Module
{
  constructor (config)
  {
    super ();

    this.config = config;

    this.lock    = new Semaphore (1);
    this.watcher = null;
  }

  start ()
  {
    let watch;
    let watcher;

    watch = resolve (this.config.get ('netio.requests'));

    logger.info (`[Netio] Watching: [${watch}].`);

    watcher = chokidar.watch (watch);

    watcher.on ('ready', () => {
      logger.info (`[Netio] Ready (${process.pid}).`);

      watcher
        .on ('add',    p => this.handle (p))
        .on ('change', p => this.handle (p));
    });

    this.watcher = watcher;

    return this;
  }

  stop ()
  {
    logger.info (`[Netio] Stopping watcher.`);
    this.watcher.close ();

    return this;
  }

  async handle (file)
  {
    let req;
    let res;
    let rel;

    req = (new Request (file))
      .set ('version',    this.config.get ('netio.version'))
      .set ('blocksize',  this.config.get ('netio.blocksize'))
      .set ('abilities',  this.config.get ('netio.abilities'))
      .set ('whitelist',  this.config.get ('netio.whitelist'))
      .set ('redundancy', this.config.get ('netio.redundancy'))
      .set ('responses',  this.config.get ('netio.responses'));

    try {
      rel = await this.lock.acquire ();
      res = await req.execute ();

      if (res) {
        await req.save (res);
      }
    } catch (e) {
      logger.error (`[Netio] Request failed:`);
      logger.error (e);
    }

    rel ();
  }
}

module.exports = Netio;