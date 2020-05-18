'use strict'

const { readFile } = require('fs')

readFile('./files.json', (err, buffer) => {
  if (err) {
    throw err
  } else {
    const text = buffer.toString()
    const data = JSON.parse(text)

    console.log(data)
  }
})
