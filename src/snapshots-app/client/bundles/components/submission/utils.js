function getOkpyCommand(questionCliNames, unlock) {
  if (questionCliNames === null) {
    return "python3 ok";
  } else if (!unlock) {
    const okpyCliQuestions = questionCliNames
      .map((questionName) => `-q ${questionName}`)
      .join(" ");
    return `python3 ok ${okpyCliQuestions}`;
  } else {
    const okpyCliQuestions = questionCliNames
      .map((questionName) => `-q ${questionName} -u`)
      .join(" ");
    return `python3 ok ${okpyCliQuestions}`;
  }
}

const areArraysEqual = (arr1, arr2) => {
  if (arr1 === null || arr2 === null) {
    return false;
  }

  if (arr1.length !== arr2.length) {
    return false;
  }

  return arr1.every((element, index) => element === arr2[index]);
};

export { getOkpyCommand, areArraysEqual };
