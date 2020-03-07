if (require ('electron-squirrel-startup')) return;

/** **/

const { app, Tray, Menu, shell, dialog } = require ('electron');
const logger = require ('electron-log');
const path = require ('path');
const Store = require ('./lib/store');
const Watcher = require ('./lib/modules/watcher');
const Netio = require ('./lib/modules/netio');

logger.transports.file.fileName = 'log.txt';
logger.transports.file.level = 'info';
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
  logger.info (`[General] Prevented second instance from spawning.`);
});

/**
 * Prevent garbage collection.
 */
let config,
    icon,
    menu,
    modules;

app.on ('ready', () => {

  logger.info (`[General] App ready (${process.pid})...`);

  /** **/

  config = new Store (
    /* Store */    'wc3stats',
    /* Defaults */ require ('./config')
  );

  logger.info (`[General] App version: [v${config.version}]`);

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

  modules = [];

  setup ();

  config.on ('change', () => {
    logger.info (`[General] Configuration change detected, reinitializing...`);
    setup ();
  });

});

function setup ()
{
  cleanup ();

  logger.info (`[General] Running setup...`);

  modules = [
    new Watcher (config).start (),
    new Netio   (config).start ()
  ];
}

function cleanup ()
{
  modules.forEach (m => m.stop ());
}