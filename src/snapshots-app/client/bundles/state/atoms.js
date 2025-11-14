import { atom } from 'jotai';

// TODO how to fix problem of going to page directly by URL?

export const userAtom = atom('rdang@berkeley.edu');

// array of json objects representing all courses the user teaches
export const coursesAtom = atom([]);

// array of json objects representing all assignments for the selected course
export const assignmentsAtom = atom([]);

// array of json objects representing all students who submitted for the selected assignment
export const studentsAtom = atom([]);

// array of json objects representing all backups for the selected submission
export const backupsAtom = atom([]);
