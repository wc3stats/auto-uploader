class Module
{
  start () {}
  stop  () {}

  async restart ()
  {
    this.stop ();
    this.start ();
  }
}

module.exports = Module;