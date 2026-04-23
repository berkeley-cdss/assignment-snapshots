import { atom } from "jotai";

export const userAtom = atom("oski@berkeley.edu");

// array of json objects representing all courses the user teaches
export const coursesAtom = atom([]);

// array of json objects representing all assignments for the selected course
export const assignmentsAtom = atom([]);

// array of json objects representing all students who submitted for the selected assignment
export const studentsAtom = atom([]);

// array of json objects representing all backups for the selected submission
// in reverse chronological order
export const backupsAtom = atom([]);
