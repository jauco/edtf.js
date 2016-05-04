'use strict'

const { parse: p, parser } = require('../src/parser')
const { Parser } = require('nearley')

describe('parser', () => {
  it('returns a parser instance', () =>
    expect(parser()).to.be.instanceof(Parser))

  describe('recognizes', () => {
    it('YYYY', () => {
      expect(p('2016')).to.produce([2016])
      expect(p('0409')).to.produce([409])
      expect(p('0023')).to.produce([23])
      expect(p('0007')).to.produce([7])
      expect(p('0000')).to.produce([0])
      expect(p('9999')).to.produce([9999])
      expect(p('-0002')).to.produce([-2])
      expect(p('-9999')).to.produce([-9999])

      expect(() => p('-0000')).to.be.rejected
      expect(() => p('12345')).to.be.rejected
    })

    it('YYYY-MM', () => {
      expect(p('2016-05')).to.produce([2016, 4])
      expect(p('2016-01')).to.produce([2016, 0])
      expect(p('2016-12')).to.produce([2016, 11])

      expect(() => p('2016-13')).to.be.rejected
      expect(() => p('2016-00')).to.be.rejected
    })

    it('YYYY-MM-DD', () => {
      expect(p('2016-05-01')).to.produce([2016, 4, 1])
      expect(p('2016-05-13')).to.produce([2016, 4, 13])
      expect(p('2016-05-29')).to.produce([2016, 4, 29])
      expect(p('2016-05-30')).to.produce([2016, 4, 30])
      expect(p('2016-05-31')).to.produce([2016, 4, 31])

      expect(() => p('2016-05-00')).to.be.rejected
      expect(() => p('2016-05-32')).to.be.rejected
      expect(() => p('2016-02-30')).to.be.rejected
      expect(() => p('2016-02-31')).to.be.rejected
      expect(() => p('2016-04-31')).to.be.rejected
      expect(() => p('2016-06-31')).to.be.rejected
      expect(() => p('2016-09-31')).to.be.rejected
      expect(() => p('2016-11-31')).to.be.rejected
    })

    it('YYYY-MM-DDTHH:MM:SS', () => {
      expect(p('2016-05-02T16:54:59'))
        .to.produce([2016, 4, 2, 16, 54, 59])
      expect(p('2016-05-02T16:54:59.042'))
        .to.produce([2016, 4, 2, 16, 54, 59, 42])
      expect(p('2016-05-02T24:00:00'))
        .to.produce([2016, 4, 2, 24, 0, 0])

      expect(() => p('2016-05-02T24:00:01')).to.be.rejected
      expect(() => p('2016-05-02T00:61:00')).to.be.rejected
      expect(() => p('2016-05-02T01:01:60')).to.be.rejected
    })

    it('YYYY-MM-DDTHH:MM:SSZ', () => {
      expect(p('2016-05-02T16:54:59Z'))
        .to.produce([2016, 4, 2, 16, 54, 59])
      expect(p('2016-05-02T16:54:59.042Z'))
        .to.produce([2016, 4, 2, 16, 54, 59, 42])
    })

    it('YYYY-MM-DDTHH:MM:SS[+-]HH:MM', () => {
      expect(p('2016-05-02T16:54:59+02:30'))
        .to.produce([2016, 4, 2, 16, 54, 59])
        .and.have.property('offset', 150)

      expect(p('2016-05-02T16:54:59+00:00')).to.have.property('offset', 0)
      expect(p('2016-05-02T16:54:59+14:00')).to.have.property('offset', 840)
      expect(p('2016-05-02T16:54:59+13:30')).to.have.property('offset', 810)
      expect(p('2016-05-02T16:54:59+12:00')).to.have.property('offset', 720)
      expect(p('2016-05-02T16:54:59+04:10')).to.have.property('offset', 250)
      expect(p('2016-05-02T16:54:59-00:15')).to.have.property('offset', -15)
      expect(p('2016-05-02T16:54:59-11:59')).to.have.property('offset', -719)
      expect(p('2016-05-02T16:54:59-12:00')).to.have.property('offset', -720)

      expect(() => p('2016-05-02T12:00:00-00:00')).to.be.rejected
      expect(() => p('2016-05-02T12:00:00-12:01')).to.be.rejected
      expect(() => p('2016-05-02T12:00:00-13:00')).to.be.rejected
      expect(() => p('2016-05-02T12:00:00-14:00')).to.be.rejected
      expect(() => p('2016-05-02T12:00:00+14:01')).to.be.rejected
    })

    it('YYYY[?~%]', () => {
      expect(p('2016?')).to.produce([2016]).and.be.uncertain.and.not.approximate
      expect(p('2016~')).to.produce([2016]).and.be.approximate.and.not.uncertain
      expect(p('2016%')).to.be.approximate.and.uncertain
    })

    it('YYYY-MM[?~%]', () => {
      expect(p('2016-05?')).to.produce([2016, 4]).and.be.uncertain
      expect(p('2016-05~')).to.produce([2016, 4]).and.be.approximate
      expect(p('2016-05%')).to.approximate.and.uncertain
    })

    it('YYYY-MM-DD[?~%]', () => {
      expect(p('2016-05-03?')).to.produce([2016, 4, 3]).and.be.uncertain
      expect(p('2016-05-03~')).to.produce([2016, 4, 3]).and.be.approximate
      expect(p('2016-05-03%')).to.approximate.and.uncertain
    })

    it('YYYY-MM-XX', () =>
      expect(p('2016-05-XX'))
        .to.produce([2016, 4])
        .and.have.unspecified('day')
        .and.not.have.unspecified('month')
        .and.not.have.unspecified('year'))

    it('YYYY-XX', () =>
      expect(p('2016-XX'))
        .to.produce([2016])
        .and.have.unspecified('month')
        .and.not.have.unspecified('day')
        .and.not.have.unspecified('year'))

    it('XXXX', () =>
      expect(p('XXXX'))
        .to.produce([])
        .and.have.unspecified('year')
        .and.not.have.unspecified('day')
        .and.not.have.unspecified('month'))

    it('YYXX', () =>
      expect(p('19XX'))
        .to.produce([1900])
        .and.have.unspecified('year')
        .and.not.have.unspecified('day')
        .and.not.have.unspecified('month'))

    it('YYYX', () =>
      expect(p('198X'))
        .to.produce([1980])
        .and.have.unspecified('year')
        .and.not.have.unspecified('day')
        .and.not.have.unspecified('month'))

    it('XXXX-XX', () =>
      expect(p('XXXX-XX'))
        .to.produce([])
        .and.have.unspecified('year')
        .and.have.unspecified('month')
        .and.not.have.unspecified('day'))

    it('XXXX-XX-XX', () =>
      expect(p('XXXX-XX-XX'))
        .to.produce([])
        .and.have.unspecified('year')
        .and.have.unspecified('month')
        .and.have.unspecified('day'))

    it('"Y"YYYYY...', () => {
      expect(p('Y170002')).to.produce([170002])
      expect(p('Y10000')).to.produce([10000])
      expect(() => p('Y9999')).to.be.rejected
      expect(() => p('Y00001')).to.be.rejected
    })

    it('"Y"-YYYYY...', () => {
      expect(p('Y-170002')).to.produce([-170002])
      expect(p('Y-10000')).to.produce([-10000])
      expect(() => p('Y-9999')).to.be.rejected
      expect(() => p('Y-00001')).to.be.rejected
    })

  })
})
