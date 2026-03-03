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

export { getOkpyCommand };
