'use babel';
// TO

import GitResetSelection from '../lib/git-reset-selection';
import temp from 'temp';
import path from 'path';
import fs from 'fs';

describe('GitResetSelection', () => {
  let workspaceElement, activationPromise, editor, directory, filePath;

  beforeEach(() => {
    GitResetSelection.exec  = jasmine.createSpy('exec');

    directory = temp.mkdirSync();

    atom.project.setPaths(directory);

    workspaceElement = atom.views.getView(atom.workspace);

    filePath = path.join(directory, 'test.txt');

    fs.writeFileSync(filePath, '');

    waitsForPromise(() => {
      return atom.workspace.open(filePath).then((e) => {
        return editor = e;
      });
    })

    activationPromise = atom.packages.activatePackage('git-reset-selection');
  });

  describe('when the git-reset-selection:reset event is triggered', () => {
    it('calls the correct git command', () => {
      editor.setText('test\nhello');
      editor.selectAll();

      GitResetSelection.reset();

      expect(GitResetSelection.exec.mostRecentCall.args[0]).toEqual('git show HEAD:/private' + filePath);
    });

    it('replaces the correct text', () => {
      GitResetSelection.exec.andCallFake(function(command, cmd, callback) {
        callback(null, 'bob\ntest');
      });
      editor.setText('test\nhello');
      editor.selectAll();

      GitResetSelection.reset();

      expect(editor.getText()).toEqual('bob\ntest');
    });

  });
});
