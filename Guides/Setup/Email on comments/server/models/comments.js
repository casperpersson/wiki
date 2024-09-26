const Model = require('objection').Model
const validate = require('validate.js')
const _ = require('lodash')

/* global WIKI */

/**
 * Comments model
 */
module.exports = class Comment extends Model {
  static get tableName() { return 'comments' }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [],

      properties: {
        id: {type: 'integer'},
        content: {type: 'string'},
        render: {type: 'string'},
        name: {type: 'string'},
        email: {type: 'string'},
        alternative_email: {type: 'string'},
        ip: {type: 'string'},
        createdAt: {type: 'string'},
        updatedAt: {type: 'string'}
      }
    }
  }

  static get relationMappings() {
    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./users'),
        join: {
          from: 'comments.authorId',
          to: 'users.id'
        }
      },
      page: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./pages'),
        join: {
          from: 'comments.pageId',
          to: 'pages.id'
        }
      }
    }
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString()
  }
  $beforeInsert() {
    this.createdAt = new Date().toISOString()
    this.updatedAt = new Date().toISOString()
  }

  /**
   * Post New Comment
   */
  static async postNewComment ({ pageId, replyTo, content, guestName, guestEmail, user, ip }) {

    // -> Input validation
    if (user.id === 2) {
      const validation = validate({
        email: _.toLower(guestEmail),
        name: guestName
      }, {
        email: {
          email: true,
          length: {
            maximum: 255
          }
        },
        alternative_email: {
          email: true,
          length: {
            maximum: 255
          }
        },
        name: {
          presence: {
            allowEmpty: false
          },
          length: {
            minimum: 2,
            maximum: 255
          }
        }
      }, { format: 'flat' })

      if (validation && validation.length > 0) {
        throw new WIKI.Error.InputInvalid(validation[0])
      }
    }

    content = _.trim(content)
    if (content.length < 2) {
      throw new WIKI.Error.CommentContentMissing()
    }

    // -> Load Page
    const page = await WIKI.models.pages.getPageFromDb(pageId)
    if (page) {
      if (!WIKI.auth.checkAccess(user, ['write:comments'], {
        path: page.path,
        locale: page.localeCode,
        tags: page.tags
      })) {
        throw new WIKI.Error.CommentPostForbidden()
      }
    } else {
      throw new WIKI.Error.PageNotFound()
    }

    if (page.authorAlternative_email == null) {
      await WIKI.mail.send({
        template: 'comment',
        to: page.authorEmail,
        subject: `A comment you made has been deleted from: `+` `+`"`+page.title+`"`,
        data: {
          preheadertext: `New comment`,
          title:  `A comment on your page has been added `+` `+`"`+page.title+`"`,
          content: user.name + ` Wrote: ` + "<br>" + "'" +content+ "'" + "<br>" + `for faster communication you can contact :  `+` `+ user.email,
          buttonLink: WIKI.config.host+'/' + page.path,
          buttonText: 'Go to page',

        },
        text: `Well done, you found this text, report your find and nothing will happen `
      })
    } else {
      await WIKI.mail.send({
        template: 'comment',
        to: page.authorAlternative_email,
        subject: `A comment you made has been deleted from: `+` `+`"`+page.title+`"`,
        data: {
          preheadertext: `New comment`,
          title:  `A comment on your page has been added `+` `+`"`+page.title+`"`,
          content: user.name + ` Wrote: ` + "<br>" + "'" +content+ "'" + "<br>" + `for faster communication you can contact :  `+` `+ user.email,
          buttonLink: WIKI.config.host+'/' + page.path,
          buttonText: 'Go to page',
        },
        text: `Well done, you found this text, report your find and nothing will happen `
      })
    }

    // -> Process by comment provider
    return WIKI.data.commentProvider.create({
      page,
      replyTo,
      content,
      user: {
        ...user,
        ...(user.id === 2) ? {
          name: guestName,
          email: guestEmail
        } : {},
        ip
      }
    })
  }

  /**
   * Update an Existing Comment
   */
  static async updateComment ({ id, content, user, ip }) {
    // -> Load Page
    const pageId = await WIKI.data.commentProvider.getPageIdFromCommentId(id)
    if (!pageId) {
      throw new WIKI.Error.CommentNotFound()
    }
    const page = await WIKI.models.pages.getPageFromDb(pageId)
    if (page) {
      if (!WIKI.auth.checkAccess(user, ['manage:comments'], {
        path: page.path,
        locale: page.localeCode,
        tags: page.tags
      })) {
        throw new WIKI.Error.CommentManageForbidden()
      }
    } else {
      throw new WIKI.Error.PageNotFound()
    }
    if (page.authorAlternative_email == null) {
      await WIKI.mail.send({
        template: 'comment',
        to: page.authorEmail,
        subject: `A comment you made has been deleted from: `+` `+`"`+page.title+`"`,
        data: {
          preheadertext: `A comment has been edited`,
          title:  `A comment on your page has been edited `+` `+`"`+page.title+`"`,
          content: user.name + ` Wrote: ` + "<br>" + "'" +content+ "'" + "<br>" + `for faster communication you can contact :  `+` `+ user.email,
          buttonLink: WIKI.config.host+'/' + page.path,
          buttonText: 'Go to page',

        },
        text: `Well done, you found this text, report your find and nothing will happen `
      })
    } else {
      await WIKI.mail.send({
        template: 'comment',
        to: page.authorAlternative_email,
        subject: `A comment you made has been deleted from: `+` `+`"`+page.title+`"`,
        data: {
          preheadertext: `A comment has been edited`,
          title:  `A comment on your page has been edited `+` `+`"`+page.title+`"`,
          content: user.name + ` Wrote: ` + "<br>" + "'" +content+ "'" + "<br>" + `for faster communication you can contact :  `+` `+ user.email,
          buttonLink: WIKI.config.host+'/' + page.path,
          buttonText: 'Go to page',
        },
        text: `Well done, you found this text, report your find and nothing will happen `
      })
    }

    // -> Process by comment provider
    return WIKI.data.commentProvider.update({
      id,
      content,
      page,
      user: {
        ...user,
        ip
      }
    })

  }

  /**
   * Delete an Existing Comment
   */
  static async deleteComment ({ id, user, ip, content }) {
    // -> Load Page
    const pageId = await WIKI.data.commentProvider.getPageIdFromCommentId(id)
    if (!pageId) {
      throw new WIKI.Error.CommentNotFound()
    }
    const page = await WIKI.models.pages.getPageFromDb(pageId)
    if (page) {
      if (!WIKI.auth.checkAccess(user, ['manage:comments'], {
        path: page.path,
        locale: page.localeCode,
        tags: page.tags
      })) {
        throw new WIKI.Error.CommentManageForbidden()
      }
    } else {
      throw new WIKI.Error.PageNotFound()
    }
    if (page.authorAlternative_email == null) {
      await WIKI.mail.send({
        template: 'comment',
        to: page.authorEmail,
        subject: `A comment you made has been deleted from: `+` `+`"`+page.title+`"`,
        data: {
          preheadertext: `A comment has been deleted`,
          title:  `A comment you made has been deleted from: `+` `+`"`+page.title+`"`,
          content: user.name + ` has deleted your comment` + "<br>" + `for faster communication you can contact :  `+` `+ user.email,
          buttonLink: WIKI.config.host+'/' + page.path,
          buttonText: 'Go to page',

        },
        text: `Well done, you found this text, report your find and nothing will happen `
      })
    } else {
      await WIKI.mail.send({
        template: 'comment',
        to: page.authorAlternative_email,
        subject: `A comment you made has been deleted from: `+` `+`"`+page.title+`"`,
        data: {
          preheadertext: `A comment has been deleted`,
          title:  `A comment you made has been deleted from:  `+` `+`"`+page.title+`"`,
          content: user.name + ` has deleted your comment` + "<br>" + `for faster communication you can contact :  `+` `+ user.email,
          buttonLink: WIKI.config.host+'/' + page.path,
          buttonText: 'Go to page',
        },
        text: `Well done, you found this text, report your find and nothing will happen `
      })
    }
    // -> Process by comment provider
    await WIKI.data.commentProvider.remove({
      id,
      page,
      content,
      user: {
        ...user,
        ip
      }
    })
  }
}
