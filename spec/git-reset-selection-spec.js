'use babel';
/* global atom, waitsForPromise */

import GitResetSelection from '../lib/git-reset-selection';
import temp from 'temp';
import path from 'path';
import fs from 'fs';

describe('GitResetSelection', () => {
  let editor, directory, filePath;

  beforeEach(() => {
    GitResetSelection.exec  = jasmine.createSpy('exec');

    directory = temp.mkdirSync();

    atom.project.setPaths(directory);

    filePath = path.join(directory, 'test.txt');

    fs.writeFileSync(filePath, '');

    waitsForPromise(() => {
      return atom.workspace.open(filePath).then((e) => {
        return editor = e;
      });
    });

    atom.packages.activatePackage('git-reset-selection');
  });

  describe('when the git-reset-selection:reset event is triggered', () => {
    it('calls the correct git command', () => {
      editor.setText('test\nhello');
      editor.selectAll();

      GitResetSelection.reset();

      expect(GitResetSelection.exec.mostRecentCall.args[0]).toEqual('git show HEAD:/private' + filePath);
    });

    it('replaces the correct text', () => {
      GitResetSelection.exec.andCallFake((command, cmd, callback) => {
        callback(null, 'bob\ntest');
      });
      editor.setText('test\nhello');
      editor.selectAll();

      GitResetSelection.reset();

      expect(editor.getText()).toEqual('bob\ntest');
    });

    it('replaces the correct text with partial selection (first half)', () => {
      GitResetSelection.exec.andCallFake((command, cmd, callback) => {
        callback(null, 'five\nsix\nseven\neight');
      });
      editor.setText('one\ntwo\nthree\nfour');
      editor.addSelectionForBufferRange([[0,0], [1,2]]);

      GitResetSelection.reset();

      expect(editor.getText()).toEqual('five\nsix\nthree\nfour');
    });

    it('replaces the correct text with partial selection (second half)', () => {
      GitResetSelection.exec.andCallFake((command, cmd, callback) => {
        callback(null, 'five\nsix\nseven\neight');
      });
      editor.setText('one\ntwo\nthree\nfour');
      editor.addSelectionForBufferRange([[2,0], [3,2]]);

      GitResetSelection.reset();

      expect(editor.getText()).toEqual('one\ntwo\nseven\neight');
    });

    it('replaces the correct text with one line selection', () => {
      GitResetSelection.exec.andCallFake((command, cmd, callback) => {
        callback(null, 'five\nsix\nseven\neight');
      });
      editor.setText('one\ntwo\nthree\nfour');
      editor.addSelectionForBufferRange([[2,0], [2,2]]);

      GitResetSelection.reset();

      expect(editor.getText()).toEqual('one\ntwo\nseven\nfour');
    });

  });
});
