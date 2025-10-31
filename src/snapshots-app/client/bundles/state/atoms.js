import { atom } from 'jotai';

export const userAtom = atom('rdang@berkeley.edu');

// json object representing course info
export const selectedCourseAtom = atom(null);

// json object representing assignment info
export const selectedAssignmentAtom = atom(null);

export const backupsAtom = atom([]);
export const selectedBackupAtom = atom(null);
