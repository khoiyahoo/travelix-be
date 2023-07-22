/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const fs = require('fs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const data = []
    fs.readdirSync( __dirname + '/../translations').forEach(lang => {
      if (lang !== ".DS_Store") {
        fs.readdirSync( __dirname + '/../translations/' + lang).forEach(file => {
          if (file !== ".DS_Store") {
            const rawData = fs.readFileSync(`${__dirname}/../translations/${lang}/${file}`, { encoding: 'utf8' })
            let dataJson = JSON.parse(rawData);
            Object.keys(dataJson).forEach(key => {
              data.push({
                id: data.length + 1,
                key: key,
                data: dataJson[key],
                language: lang,
                namespace: 'common',
                createdAt: new Date(),
                updatedAt: new Date()
              })
            })
          }
        })
      }
    })
    return queryInterface.bulkInsert("translations", data)
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete(
      "translations",
      {
        id: {
          [Sequelize.Op.ne]: null,
        },
      },
      {}
    );
  }
};
