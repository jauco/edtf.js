'use strict'

const assert = require('assert')
const Bitmask = require('./bitmask')
const { parse } = require('./parser')
const { abs, floor } = Math

const V = new WeakMap()
const U = new WeakMap()
const A = new WeakMap()


class Decade {
  static parse(input) {
    return parse(input, { types: ['Decade'] })
  }

  constructor(input) {
    V[this] = []

    this.uncertain = 0
    this.approximate = 0

    switch (typeof input) {
    case 'number':
      this.decade = input
      break

    case 'string':
      input = Decade.parse(input)
      // eslint-disable-line no-fallthrough

    case 'object':
      if (Array.isArray(input))
        input = { values: input }

      {
        assert(input !== null)
        if (input.type) assert.equal('Decade', input.type)

        assert(input.values)
        assert(input.values.length === 1)

        this.decade = input.values[0]
        this.uncertain = input.uncertain
        this.approximate = input.approximate
      }
      break

    default:
      this.year = new Date().getUTCFullYear()
    }
  }

  get type() {
    return 'Decade'
  }

  get decade() {
    return this.values[0]
  }

  set decade(decade) {
    decade = floor(Number(decade))
    assert(abs(decade) < 1000, `invalid decade: ${decade}`)
    return this.values[0] = decade
  }

  get year() {
    return this.values[0] * 10
  }

  set year(year) {
    return this.decade = year / 10
  }

  set uncertain(value) {
    U[this] = new Bitmask(value)
  }

  get uncertain() {
    return U[this]
  }

  set approximate(value) {
    A[this] = new Bitmask(value)
  }

  get approximate() {
    return A[this]
  }

  get values() {
    return V[this]
  }

  get edtf() {
    return this.toEDTF()
  }

  get min() {
    return Date.UTC(this.year, 0)
  }

  get max() {
    return Date.UTC(this.year + 9, 11, 31, 24, 0, 0)
  }

  toEDTF() {
    let decade = Decade.pad(this.decade)

    if (this.uncertain.value)
      decade = decade + '?'

    if (this.approximate.value)
      decade = (decade + '~').replace(/\?~/, '%')

    return decade
  }

  static pad(number) {
    let k = abs(number)
    let sign = (k === number) ? '' : '-'

    if (k < 10)   return `${sign}00${k}`
    if (k < 100)  return `${sign}0${k}`

    return `${number}`
  }
}

module.exports = Decade