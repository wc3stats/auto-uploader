const { app, shell } = require ('electron');
const logger = require ('electron-log');
const chokidar = require ('chokidar');
const EventEmitter = require ('events');
const path = require ('path');
const fs = require ('fs');
const { nl, isset } = require ('./util');
const merge = require ('merge-deep');

/**
 * https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
 */
class Store extends EventEmitter
{
  constructor (id, defaults)
  {
    super ();

    /**
     * https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname
     */
    const userData = app.getPath ('userData');

    // Used to monitor the store for changes.
    this.watcher = null;
    this.store = null;

    this.defaults = defaults;
    this.path = path.join (userData, `${id}.txt`);

    this.refresh ();
    this.watch ();
  }

  get (key)
  {
    return this.resolve (key, this.store)
        || this.resolve (key, this.defaults)
        || null;
  }

  set (key, value)
  {
    this.store [key] = value;
    this.save ();
  }

  resolve (key, object)
  {
    let pts = key.split ('.');
    let ptr = object;

    for (let pt of pts) {
      if (! (pt in ptr)) {
        return null;
      }

      ptr = ptr [pt];
    }

    return ptr;
  }

  refresh ()
  {
    this.store = this.read ();
    this.save ();
  }

  read ()
  {
    let store = {};

    if (fs.existsSync (this.path)) {
      logger.info (`[General] Reading store file [${this.path}].`);

      try {
        store = fs.readFileSync (this.path);
      } catch (e) {
        logger.error ('[General] Failed to read store.');
      }

      try {
        store = JSON.parse (store);
      } catch (e) {
        logger.warn ('[General] Failed to parse store');
      }
    } else {
      logger.info (`[General] Store file not found [${this.page}] Using defaults.`);
    }

    store = merge (store, this.defaults);
    return store;
  }

  save ()
  {
    try {
      fs.writeFileSync (
        this.path,
        nl (JSON.stringify (this.store, null, 4))
      );
    } catch (e) {
      logger.error ('[General] Failed to save store.');
    }
  }

  watch ()
  {
    // Watch the store file for changes.
    this.watcher = chokidar
      .watch (this.path)
      .on ('change', p => {
        this.refresh ();
        this.emit ('change');
      });
  }

  open ()
  {
    // Check if it exists before trying to open, user may have deleted the
    // APPDATA folder.
    if (!fs.existsSync (this.path)) {
      logger.info (`[General] Store not found, recreating.`);
      this.save ();
    }

    shell.openItem (this.path);
  }

  destroy ()
  {
    this.watcher.close ();
  }
}

module.exports = Store;