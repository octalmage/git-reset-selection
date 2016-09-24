'use babel';

import { CompositeDisposable } from 'atom';
import Path from 'path';
import { exec } from 'child_process';

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register the reset command.
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'git-reset-selection:reset': () => this.reset()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  reset() {
    const editor = atom.workspace.getActivePaneItem()
    const origRange = editor.getLastSelection().getBufferRange()
    const filePath = editor.buffer.file.path;
    // Get the relative path for the file.
    const [,relativePath] = atom.project.relativizePath(filePath);
    // Use git:show to "capture" the file at HEAD.
    const cmdText = `git show HEAD:${relativePath}`;
    this.exec(cmdText, { cwd: Path.dirname(filePath) }, (error, stdout, stderr) => {
      let newBody = this.extractLines(origRange.start.row, origRange.end.row, stdout);
      // TODO: There has to be a better way to do this. I need the range of all text on these lines.
      let newRange = editor.clipBufferRange([[origRange.start.row, 0], [origRange.end.row, Infinity]]);
      editor.setTextInBufferRange(newRange, newBody);
    });
  },

  extractLines(start, end, body) {
    return body.split('\n').slice(start, end+1).join('\n');
  },

  // Mockable exec function.
  exec(cmd, cwd, callback) {
    return exec(cmd, cwd, callback);
  }
};
