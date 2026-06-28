export function getExamResumeIndex(questionOrder: string[], answeredQuestionIds: string[]) {
  const answeredIds = new Set(answeredQuestionIds);

  return questionOrder.findIndex((questionId) => !answeredIds.has(questionId));
}

export function getExamProgress(questionOrder: string[], answeredQuestionIds: string[]) {
  const questionIds = new Set(questionOrder);
  const answered = new Set(
    answeredQuestionIds.filter((questionId) => questionIds.has(questionId)),
  ).size;
  const resumeIndex = getExamResumeIndex(questionOrder, answeredQuestionIds);

  return {
    answered,
    completed: questionOrder.length > 0 && resumeIndex === -1,
    resumeIndex: resumeIndex === -1 ? Math.max(questionOrder.length - 1, 0) : resumeIndex,
    total: questionOrder.length,
  };
}
