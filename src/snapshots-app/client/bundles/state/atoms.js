import { atom } from 'jotai';

// TODO how to fix problem of going to page directly by URL?

export const userAtom = atom('rdang@berkeley.edu');

// array of json object representing all courses the user teaches
export const coursesAtom = atom([]);

// array of json object representing all assignments for the selected course
export const assignmentsAtom = atom([]);

// json object representing course info
// TODO delete this
export const selectedCourseAtom = atom(null);

// json object representing assignment info
// TODO delete this
export const selectedAssignmentAtom = atom(null);

export const backupsAtom = atom([]);
export const selectedBackupAtom = atom(null);
