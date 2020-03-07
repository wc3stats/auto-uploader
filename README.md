# WC3Stats Auto Uploader

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [How it Works](#how-it-works)
- [FAQ](#faq)
- [Building](#building)
- [Notes](#notes)

## Features

* Automatically uploads Warcraft III replay files to wc3stats.com.
* **No upfront configuration** & detailed logging for troubleshooting.
* **Automatically starts** when logging into your computer (i.e. signed out or restart).
* **System tray icon** to indicate the program is running with menu items (settings, logs and exit).
* **Automatically reloads** when the settings file is updated (no need to restart).
* **Easily uninstallable** in the "Add or remove programs" control panel.
* **Supports networkio** allowing map editors to [proxy network requests](https://github.com/voces/wc3networkio/blob/master/README.md).

## Installation

1. Download the [latest release](https://wc3stats.com/auto-uploader "latest release").
2. Run the installer.

*Note: Both your web browser when downloading and Windows Firewall will likely flag this program as unsafe. One of the motivations for choosing NodeJS and Electron (aside from its ease of use) was to make how the program works as accessible as possible. If you have any concerns, **please do not hesistate to contact us on [our discord](https://wcstats.com/discord)**.*

## How it Works

When the program runs, a list of configured directories are added to a [chokidar](https://github.com/paulmillr/chokidar) watcher. These directories are configurable by right-clicking on the program icon in the system tray and clicking `settings`.

Whenever a file is added or changed in one of the directories (like after a Warcraft III game when `LastReplay.w3g` is saved), it is added to an upload queue. A queue is used to ensure only one upload occurs at a time in the event that several files are copied into one of the watched directories. While there are items in the queue, they will be sequentially uploaded to wc3stats.com.

## FAQ

#### Why is the installer so big?

This program uses [electron](https://electronjs.org/) to transform web technologies like NodeJS into a native format that Windows can work with. Because of this, the size of the program is dramatically larger than a native (e.g. C++) application would be. However, weighing in at around 50mb, we felt the size was not prohibitive.

#### Why is the program flagged by my antivirus and firewall?

[This program is not currently signed.](https://www.electron.build/code-signing)

#### Why are there two processes running in the Windows Task Manager?

[This is a side effect of the electron framework](https://electronjs.org/docs/tutorial/application-architecture) and is to be expected.

## Building

1. **Install Dependencies:** `npm install`

2a. **Development:** `npm run start`

2b. **Packaging (create exe):** `npm run build`

## Notes

For more information or help troubleshooting feel free to join [our discord](https://discord.gg/N3VGkUM).