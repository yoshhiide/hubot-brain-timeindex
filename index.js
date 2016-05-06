'use strict';

const moment = require('moment');
const _ = require('lodash');

class HubotBrainTimeindex {
  constructor(robot, saveNow, brainKey) {
    this.brain = robot.brain;
    this.saveNow = saveNow || false;
    this.brainKey = brainKey || 'dateTimeIndexSearch';
  }

  // date(format1): '2016-05-01'
  // date(format2): '2016-05-01 20:15'
  search(operator, datetime) {
    if (!datetime) {
      return 'not found 2 args.';
    }

    if ((datetime.length !== 10) &&
        (datetime.length !== 16)) {
      return 'different format.';
    }

    // format key1(date), key2(time)
    const dateFormat = moment(datetime).format('YYYYMMDD');
    const timeFormat = moment(datetime).format('HHmm');
    const dTIS = this.brain.get(this.brainKey);

    // datetime(format1): '2016-05-01'
    if (datetime.length === 10) {
      if (operator === 'EQ') {
        return _.get(dTIS, dateFormat);
      } else {
        return this.searchKey1(dTIS, operator, dateFormat);
      }
    }

    // datetime(format2): '2016-05-01 20:15'
    if (datetime.length === 16) {
      if (operator === 'EQ') {
        return _.get(dTIS, `${dateFormat}.${timeFormat}`);
      } else {
        return this.searchKey2(dTIS, operator, dateFormat, timeFormat);
      }
    }

  }

  add(datetime, key) {
    if (!key) {
      return 'not found key.';
    }

    if (!datetime) {
      return 'not found datetime.';
    }

    if (datetime.length !== 16) {
      return 'different format.';
    }

    // format key1(date), key2(time)
    const dateFormat = moment(datetime).format('YYYYMMDD');
    const timeFormat = moment(datetime).format('HHmm');

    // memo: false時に{}必須
    const dTIS = this.brain.get(this.brainKey) || {};

    const keys = _.result(dTIS, `${dateFormat}.${timeFormat}`, []);

    // add key
    keys.push(key);

    dTIS[dateFormat] = Object.assign({}, dTIS[dateFormat], {[timeFormat]: keys});
    this.brain.set(this.brainKey, dTIS);

    // redis save
    if (this.saveNow) {
      this.brain.save();
    }
  }

  // date(format): '2016-05-01'
  del(operator, date) {
    if (!date) {
      return 'not found 2 args.'
    }

    if (date.length !== 10) {
      return 'different format.';
    }

    const dateFormat = moment(date).format('YYYYMMDD');

    const days = operator === 'EQ' ? {[dateFormat]: ''} : this.search(operator, date);

    const delDays = Object.keys(days);
    const delDaysLen = delDays.length;

    const dTIS = this.brain.get(this.brainKey) || {};

    for (let i = 0; i < delDaysLen; i++) {
      _.unset(dTIS, delDays[i]);
    }

    this.brain.set(this.brainKey, dTIS);

    // redis save
    if (this.saveNow) {
      this.brain.save();
    }
  }

  searchKey1(dTIS, operator, dateFormat) {
    const days = Object.keys(dTIS);

    const filterDays = _.filter(days, (day) => {
      switch(operator) {
        case 'GT':
          return dateFormat < day;
          break;
        case 'GE':
          return dateFormat <= day;
          break;
        case 'LT':
          return dateFormat > day;
          break;
        case 'LE':
          return dateFormat >= day;
          break;
      }
    });

    return _.reduce(filterDays, (result, day) => {
      result[day] = dTIS[day];
      return result;
    }, {});
  }

  searchKey2(dTIS, operator, dateFormat, timeFormat) {
    const operatorTime = (operator === 'GT' ? 'GE' : (operator === 'LT' ? 'LE' : operator));
    const daysObj = this.searchKey1(dTIS, operatorTime, dateFormat);
    const days = Object.keys(daysObj);

    // create key(day.time)
    const dayTimeKeys = _.reduce(daysObj, (result, day, date) => {
      const times = Object.keys(day);
      result = _.concat(result, _.map(times, (time) => ({date, time})));
      return result;
    }, []);

    const filterTimes = _.filter(dayTimeKeys, (datetime) => {
      switch(operator) {
        case 'GT':
          return `${dateFormat}.${timeFormat}` < `${datetime.date}.${datetime.time}`;
          break;
        case 'GE':
          return `${dateFormat}.${timeFormat}` <= `${datetime.date}.${datetime.time}`;
          break;
        case 'LT':
          return `${dateFormat}.${timeFormat}` > `${datetime.date}.${datetime.time}`;
          break;
        case 'LE':
          return `${dateFormat}.${timeFormat}` >= `${datetime.date}.${datetime.time}`;
          break;
      }
    });

    return _.reduce(filterTimes, (result, datetime) => {
      const timeData = _.get(dTIS, `${datetime.date}.${datetime.time}`);
      result[datetime.date] = Object.assign({}, result[datetime.date], {[datetime.time]: timeData});
      return result;
    }, {});
  }

}

module.exports = HubotBrainTimeindex;
