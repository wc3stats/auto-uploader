const logger = require ('electron-log');
const chokidar = require ('chokidar');
const Module = require ('../module');
const Queue = require ('../queue');
const { resolve } = require ('../util');

class Watcher extends Module
{
  constructor (config)
  {
    super ();

    this.config = config;

    this.queue   = null;
    this.watcher = null;
  }

  start ()
  {
    let queue;
    let paths;
    let watcher;

    /**
     * Upload queue to ensure only 1 file is uploaded at a time.
     */
    queue = new Queue ();

    /**
     * Get the list of paths that will be monitored by chokidar. Note we resolve
     * to make paths unix-style to be compatibile with chokidar.
     */
    paths = this.config
      .get ('watch')
      .map (resolve);

    logger.info (`[Watcher] Watching: [${paths.join (', ')}].`);

    watcher = chokidar.watch (paths);

    watcher.on ('ready', () => {
      logger.info (`[Watcher] Ready (${process.pid}).`);

      watcher
        .on ('add',    p => queue.add (p))
        .on ('change', p => queue.add (p));
    });

    this.queue = queue;
    this.watcher = watcher;

    return this;
  }

  stop ()
  {
    logger.info (`[Watcher] Stopping.`);

    this.queue = null;
    this.watcher.close ();

    return this;
  }
}

module.exports = Watcher;