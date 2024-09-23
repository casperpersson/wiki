const _ = require('lodash')
const sql = require('mssql')
// const config = require('../core/config')
// const dbConfig = require('../core/db')
/* global WIKI */

module.exports = async (pageId) => {
  WIKI.logger.info(`Rebuilding page tree...`)
  // WIKI.models = require('../core/db').init()
  // await WIKI.configSvc.loadFromDb()
  // await WIKI.configSvc.applyFlags()
  let dbConfig = (!_.isEmpty(process.env.DATABASE_URL)) ? process.env.DATABASE_URL : {
    host: WIKI.config.db.host.toString(),
    user: WIKI.config.db.user.toString(),
    password: WIKI.config.db.pass.toString(),
    database: WIKI.config.db.db.toString(),
    port: WIKI.config.db.port,
    server: WIKI.config.db.host.toString(),
  }

  try {
    // Connect to the database
    const pool = await sql.connect(dbConfig);

    // Call the stored procedure GetAuthorsByBirthDate
    const result = await pool
      .request()
      .execute('ext.rebuild_page_tree');

    // Return the result
    return result.recordset;
  } catch (err) {
    WIKI.logger.error(`Rebuilding page tree: [ FAILED ]`)
    WIKI.logger.error(err.message)
    // exit process with error code
    throw err
  }
}


    // WIKI.models = require('../core/db').init()
    // await WIKI.configSvc.loadFromDb()
    // await WIKI.configSvc.applyFlags()

    // const pages = await WIKI.models.pages.query().select('id', 'path', 'localeCode', 'title', 'isPrivate', 'privateNS').orderBy(['localeCode', 'path'])
    // let tree = []
    // let pik = 0

    // for (const page of pages) {
    //   const pagePaths = page.path.split('/')
    //   let currentPath = ''
    //   let depth = 0
    //   let parentId = null
    //   let ancestors = []
    //   for (const part of pagePaths) {
    //     depth++
    //     const isFolder = (depth < pagePaths.length)
    //     currentPath = currentPath ? `${currentPath}/${part}` : part
    //     const found = _.find(tree, {
    //       localeCode: page.localeCode,
    //       path: currentPath
    //     })
    //     if (!found) {
    //       pik++
    //       tree.push({
    //         id: pik,
    //         localeCode: page.localeCode,
    //         path: currentPath,
    //         depth: depth,
    //         title: isFolder ? part : page.title,
    //         isFolder: isFolder,
    //         isPrivate: !isFolder && page.isPrivate,
    //         privateNS: !isFolder ? page.privateNS : null,
    //         parent: parentId,
    //         pageId: isFolder ? null : page.id,
    //         ancestors: JSON.stringify(ancestors)
    //       })
    //       parentId = pik
    //     } else if (isFolder && !found.isFolder) {
    //       found.isFolder = true
    //       parentId = found.id
    //     } else {
    //       parentId = found.id
    //     }
    //     ancestors.push(parentId)
    //   }
    // }

    // await WIKI.models.knex.table('pageTree').truncate()
    // if (tree.length > 0) {
    //   // -> Save in chunks, because of per query max parameters (35k Postgres, 2k MSSQL, 1k for SQLite)
    //   if ((WIKI.config.db.type !== 'sqlite')) {
    //     for (const chunk of _.chunk(tree, 100)) {
    //       await WIKI.models.knex.table('pageTree').insert(chunk)
    //     }
    //   } else {
    //     for (const chunk of _.chunk(tree, 60)) {
    //       await WIKI.models.knex.table('pageTree').insert(chunk)
    //     }
    //   }
    // }

    // await WIKI.models.knex.destroy()

    // WIKI.logger.info(`Rebuilding page tree: [ COMPLETED ]`)
//   } catch (err) {
//     WIKI.logger.error(`Rebuilding page tree: [ FAILED ]`)
//     WIKI.logger.error(err.message)
//     // exit process with error code
//     throw err
//   }
// }
