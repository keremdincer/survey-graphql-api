import { arg, inputObjectType, intArg, makeSchema, nonNull, objectType } from "nexus";

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('allForms', {
      type: 'Form',
      resolve: (_parent, _args, context) => {
        return context.prisma.form.findMany()
      }
    })

    t.nullable.field('formById', {
      type: 'Form',
      args: {
        id: intArg(),
      },
      resolve: (_parent, args, context) => {
        return context.prisma.form.findUnique({
          where: { id: args.id || undefined }
        })
      }
    })
  }
})

const Form = objectType({
  name: 'Form',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('slug')
    t.nonNull.string('title')
    t.string('description')
    t.nonNull.boolean('published')
    t.nonNull.list.nonNull.field('sections', {
      type: 'Section',
      resolve: (parent, _, context) => {
        return context.prisma.form.findUnique({
          where: { id: parent.id || undefined }
        }).sections()
      }
    })
    t.nonNull.list.nonNull.field('scores', {
      type: 'Score',
      resolve: (parent, _, context) => {
        return context.prisma.form.findUnique({
          where: { id: parent.id }
        }).scores()
      }
    })
  }
})

const Section = objectType({
  name: 'Section',
  definition(t) {
    t.nonNull.int('id')
    t.string('title')
    t.string('description')
    t.field('form', {
      type: 'Form',
      resolve: (parent, _, context) => {
        return context.prisma.section.findUnique({
          where: { id: parent.id || undefined }
        }).form()
      }
    })
    t.nonNull.list.nonNull.field('questions', {
      type: 'Question',
      resolve: (parent, _, context) => {
        return context.prisma.section.findUnique({
          where: { id: parent.id || undefined }
        }).questions()
      }
    })
  }
})

const Question = objectType({
  name: 'Question',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('body')
    t.nonNull.boolean('required')
    t.field('section', {
      type: 'Section',
      resolve: (parent, _, context) => {
        return context.prisma.question.findUnique({
          where: { id: parent.id || undefined }
        }).section()
      }
    })
    t.nonNull.list.nonNull.field('answers', {
      type: 'Answer',
      resolve: (parent, _, context) => {
        return context.prisma.question.findUnique({
          where: { id: parent.id || undefined }
        }).answers()
      }
    })
  }
})

const Answer = objectType({
  name: 'Answer',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('body')
    t.nonNull.string('type')
    t.field('question', {
      type: 'Question',
      resolve: (parent, _, context) => {
        return context.prisma.answer.findUnique({
          where: { id: parent.id || undefined }
        }).question()
      }
    })
    t.nonNull.list.nonNull.field('answerPoints', {
      type: 'AnswerPoint',
      resolve: (parent, _, context) => {
        return context.prisma.answer.findUnique({
          where: { id: parent.id }
        }).answerPoints()
      }
    })
  }
})

const AnswerPoint = objectType({
  name: 'AnswerPoint',
  definition(t) {
    t.nonNull.int('answerId')
    t.nonNull.int('scoreId')
    t.nonNull.float('male')
    t.nonNull.float('female')
    t.field('score', {
      type: 'Score',
      resolve: (parent, _, context) => {
        return context.prisma.answerPoint.findUnique({
          where: {
            answerId_scoreId: {
              answerId: parent.answerId, scoreId: parent.scoreId
            }
          }
        }).score()
      }
    })
    t.field('answer', {
      type: 'Answer',
      resolve: (parent, _, context) => {
        return context.prisma.answerPoint.findUnique({
          where: {
            answerId_scoreId: {
              answerId: parent.answerId, scoreId: parent.scoreId
            }
          }
        }).answer()
      }
    })
  }
})

const Score = objectType({
  name: 'Score',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('title')
    t.field('form', {
      type: 'Form',
      resolve: (parent, _, context) => {
        return context.prisma.score.findUnique({
          where: { id: parent.id }
        }).form()
      }
    })
    t.nonNull.list.nonNull.field('answerPoints', {
      type: 'AnswerPoint',
      resolve: (parent, _, context) => {
        return context.prisma.score.findUnique({
          where: { id: parent.id }
        }).answerPoints()
      }
    })
  }
})

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.nonNull.field('createForm', {
      type: 'Form',
      args: {
        data: nonNull(
          arg({
            type: 'FormCreateInput'
          })
        )
      },
      resolve: (_, args, context) => {
        return context.prisma.form.create({
          data: {
            slug: args.data.slug,
            title: args.data.title,
            description: args.data.description
          }
        })
      }
    })

    t.nonNull.field('createSection', {
      type: 'Section',
      args: {
        data: nonNull(
          arg({
            type: 'SectionCreateInput'
          })
        ),
        formId: nonNull(intArg())
      },
      resolve: (_, args, context) => {
        return context.prisma.section.create({
          data: {
            title: args.data.title,
            description: args.data.description,
            form: {
              connect: { id: args.formId }
            }
          }
        })
      }
    })

    t.nonNull.field('createQuestion', {
      type: 'Question',
      args: {
        data: nonNull(
          arg({
            type: 'QuestionCreateInput'
          })
        ),
        sectionId: nonNull(intArg())
      },
      resolve: (_, args, context) => {
        return context.prisma.question.create({
          data: {
            body: args.data.body,
            section: {
              connect: { id: args.sectionId }
            }
          }
        })
      }
    })

    t.nonNull.field('createAnswer', {
      type: 'Answer',
      args: {
        data: nonNull(
          arg({
            type: 'AnswerCreateInput'
          })
        ),
        questionId: nonNull(intArg())
      },
      resolve: (_, args, context) => {
        return context.prisma.answer.create({
          data: {
            body: args.data.body,
            question: {
              connect: { id: args.questionId }
            }
          }
        })
      }
    })

    t.nonNull.field('createScore', {
      type: 'Score',
      args: {
        data: nonNull(
          arg({
            type: 'ScoreCreateInput'
          })
        ),
        formId: nonNull(intArg())
      },
      resolve: (_, args, context) => {
        return context.prisma.score.create({
          data: {
            title: args.data.title,
            form: {
              connect: { id: args.formId }
            }
          }
        })
      }
    })

    t.nonNull.field('createAnswerPoint', {
      type: 'AnswerPoint',
      args: {
        data: nonNull(
          arg({
            type: 'AnswerPointCreateInput'
          })
        ),
        answerId: nonNull(intArg()),
        scoreId: nonNull(intArg())
      },
      resolve: (_, args, context) => {
        return context.prisma.answerPoint.create({
          data: {
            male: args.data.male,
            female: args.data.female,
            score: {
              connect: { id: args.scoreId }
            },
            answer: {
              connect: { id: args.answerId }
            }
          }
        })
      }
    })
  }
})

const FormCreateInput = inputObjectType({
  name: 'FormCreateInput',
  definition(t) {
    t.nonNull.string('title')
    t.nonNull.string('slug')
    t.string('description')
  }
})

const SectionCreateInput = inputObjectType({
  name: 'SectionCreateInput',
  definition(t) {
    t.string('title')
    t.string('description')
  }
})

const QuestionCreateInput = inputObjectType({
  name: 'QuestionCreateInput',
  definition(t) {
    t.nonNull.string('body')
  }
})

const AnswerCreateInput = inputObjectType({
  name: 'AnswerCreateInput',
  definition(t) {
    t.nonNull.string('body')
  }
})

const ScoreCreateInput = inputObjectType({
  name: 'ScoreCreateInput',
  definition(t) {
    t.nonNull.string('title')
  }
})

const AnswerPointCreateInput = inputObjectType({
  name: 'AnswerPointCreateInput',
  definition(t) {
    t.nonNull.float('male')
    t.nonNull.float('female')
  }
})

export const schema = makeSchema({
  types: [
    Query,
    Mutation,
    Form,
    Section,
    Question,
    Answer,
    AnswerPoint,
    Score,
    FormCreateInput,
    SectionCreateInput,
    QuestionCreateInput,
    AnswerCreateInput,
    ScoreCreateInput,
    AnswerPointCreateInput
  ],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts'
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context'
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma'
      }
    ]
  }
})