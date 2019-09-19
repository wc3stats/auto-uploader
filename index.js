if (require ('electron-squirrel-startup')) return;

/** **/

const { app, Tray, Menu, shell, dialog } = require ('electron');
const logger = require ('electron-log');
const path = require ('path');
const chokidar = require ('chokidar');
const Store = require ('./lib/store');
const Queue = require ('./lib/queue');
const { upload, resolve } = require ('./lib/util');

logger.transports.file.fileName = 'log.txt';
logger.transports.file.init ();

logger.info ('Starting up...');

/**
 * Start the program when a user logs in (after bootup for example).
 */
app.setLoginItemSettings ({
  openAtLogin: true,
  path: process.execPath,
  args: [
    '--processStart',
    `${path.basename (process.execPath)}`,
    '--process-start-args',
    "--hidden"
  ]
});

/**
 * Don't allow multiple instances of the program to be run.
 */
let lock = app.requestSingleInstanceLock ();

if (!lock) {
  return app.quit ();
}

app.on ('second-instance', (event, argv, cwd) => {
  logger.info (`Prevented second instance from spawning.`);
});

/**
 * Prevent garbage collection.
 */
let config,
    icon,
    menu,
    queue,
    watcher,
    watchPaths;

app.on ('ready', () => {

  logger.info (`App ready (${process.pid})...`);

  /** **/

  config = new Store (
    /* Store */    'wc3stats',
    /* Defaults */ require ('./config')
  );

  /** **/

  icon = path.join (__dirname, 'icon.ico');
  icon = new Tray (icon);
  icon.setToolTip ('WC3Stats Auto Uploader');

  menu = Menu.buildFromTemplate ([
    {
      label: 'Settings',
      click: () => {
        config.open ();
      }
    },

    {
      label: 'Logs',
      click: () => {
        shell.openItem (logger.transports.file.file);
      }
    },

    {
      label: 'Version',
      click: () => {
        dialog.showMessageBox (
          null,
          {
            title: 'Version',
            message: `${app.getName ()} ${app.getVersion ()} (${app.getLocale ()})`
          }
        );
      }
    },

    {
      label: 'Exit',
      click: () => {
        app.quit ();
      }
    }
  ]);

  icon.setContextMenu (menu);

  /** **/

  setup ();

  config.on ('change', () => {
    logger.info (`Configuration change detected, reinitializing...`);
    setup ();
  });

});

function setup ()
{
  cleanup ();

  logger.info (`Running setup...`);

  /**
   * Upload queue to ensure only 1 file is uploaded at a time.
   */
  queue = new Queue ();

  /**
   * Get the list of paths that will be monitored by chokidar. Note we resolve
   * to make paths unix-style to be compatibile with chokidar.
   */
  watchPaths = config
    .get ('watch')
    .map (p => resolve (p));

  logger.info (`Watching: [${watchPaths.join (', ')}].`);

  /**
   * Watch all of the folders and / or files specified in the config.
   */
  watcher = chokidar.watch (watchPaths);

  watcher.on ('ready', () => {
    logger.info (`Watcher ready (${process.pid}).`);

    watcher
      .on ('add',    p => queue.add (p))
      .on ('change', p => queue.add (p));
  });
}

function cleanup ()
{
  if (watcher) {
    logger.info (`Stopping watcher.`);
    watcher.close ();
  }
}