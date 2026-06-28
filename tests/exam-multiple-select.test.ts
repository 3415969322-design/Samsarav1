import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateExamAnswer,
  normalizeStoredQuestion,
  parseStructuredQuestionBank,
} from "../src/features/exam/question-processing";
import { getExamProgress } from "../src/features/exam/progress";

test("legacy short-answer records with letter answers become multiple-select questions", () => {
  const question = normalizeStoredQuestion({
    answerJson: {
      keywords: ["ACD"],
      text: "ACD",
      type: "SHORT_ANSWER",
    },
    optionsJson: null,
    stem: [
      "关于示例知识，下列说法正确的有( )。",
      "A. 第一项",
      "B. 第二项",
      "C. 第三项",
      "D. 第四项",
    ].join("\n"),
    type: "SHORT_ANSWER",
  });

  assert.equal(question.kind, "MULTIPLE_SELECT");
  assert.equal(question.stem, "关于示例知识，下列说法正确的有( )。");
  assert.deepEqual(question.options, ["第一项", "第二项", "第三项", "第四项"]);
  assert.deepEqual(question.answer, {
    correctIndices: [0, 2, 3],
    correctTexts: ["第一项", "第三项", "第四项"],
    type: "MULTIPLE_SELECT",
  });
});

test("structured imports preserve single-choice and multiple-select questions", () => {
  const exam = parseStructuredQuestionBank(`
1. (单选题)下列哪项正确？
A. 选项一
B. 选项二
C. 选项三
D. 选项四
我的答案:B 正确答案:B
2. (多选题)下列哪些正确？
A. 甲
B. 乙
C. 丙
D. 丁
我的答案:ACD 正确答案:ACD
`);

  assert.ok(exam);
  assert.equal(exam.questions.length, 2);
  assert.deepEqual(exam.questions[0].answer, {
    correctIndex: 1,
    correctText: "选项二",
    type: "MULTIPLE_CHOICE",
  });
  assert.deepEqual(exam.questions[1].answer, {
    correctIndices: [0, 2, 3],
    correctTexts: ["甲", "丙", "丁"],
    type: "MULTIPLE_SELECT",
  });
});

test("multiple-select grading ignores selection order but requires an exact set", () => {
  const correctAnswer = {
    correctIndices: [0, 2, 3],
    correctTexts: ["甲", "丙", "丁"],
    type: "MULTIPLE_SELECT" as const,
  };
  const options = ["甲", "乙", "丙", "丁"];

  assert.equal(
    evaluateExamAnswer({ correctAnswer, options, rawAnswers: ["3", "0", "2"] }).isCorrect,
    true,
  );
  assert.equal(
    evaluateExamAnswer({ correctAnswer, options, rawAnswers: ["0", "2"] }).isCorrect,
    false,
  );
  assert.equal(
    evaluateExamAnswer({ correctAnswer, options, rawAnswers: ["0", "1", "2", "3"] })
      .isCorrect,
    false,
  );
});

test("practice progress resumes at the first unanswered question", () => {
  assert.deepEqual(getExamProgress(["q1", "q2", "q3", "q4"], ["q1", "q2"]), {
    answered: 2,
    completed: false,
    resumeIndex: 2,
    total: 4,
  });

  assert.deepEqual(getExamProgress(["q1", "q2"], ["q2", "q1"]), {
    answered: 2,
    completed: true,
    resumeIndex: 1,
    total: 2,
  });
});
