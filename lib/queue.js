const logger = require ('electron-log');
const { upload } = require ('./util');

class Queue
{
  constructor ()
  {
    this.paths = [];
    this.uploading = false;
  }

  add (path)
  {
    logger.info (`[Watcher] Pushing [${path}] onto upload queue.`);

    this.paths.push (path);

    if (!this.uploading) {
      this.upload ();
    }
  }

  async upload ()
  {
    this.uploading = true;

    while (this.paths.length) {
      await upload (this.paths.shift ());
    }

    this.uploading = false;
    logger.info (`[Watcher] Upload queue empty, waiting...`);
  }
}

module.exports = Queue;