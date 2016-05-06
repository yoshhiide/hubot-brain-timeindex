// Description:
//   Utility commands surrounding Hubot uptime.
'use strict';

const HubotBrainTimeindex = require('hubot-brain-timeindex');

const moment = require('moment');
const _ = require('lodash');

let _robot;
let _timeidx;

module.exports = (robot) => {
  _robot = robot;
  _timeidx = new HubotBrainTimeindex(robot, true);

  robot.respond(/PING$/i, (res) => {
    res.send('PONG');
  });

  robot.hear(/TESTDATA$/i, (res) => {
    res.send('testdata set start.');
    for (let i = 0; i < 500; i++) {
      const random = Math.random() * 50;
      const future = moment().add(random, 'days').format('YYYY-MM-DD HH:mm');
      const past   = moment().subtract(random, 'days').format('YYYY-MM-DD HH:mm');

      if ((i%2)) {
        _timeidx.add(future, `key${i}`);
      } else {
        _timeidx.add(past, `key${i}`);
      }
    }
    res.send('testdata set end.');
  });

  robot.respond(/s1$/i, (res) => {
    res.send('search');
    const result = _timeidx.search('LE', '2016-05-05 11:30');
    console.log(result);
  });
  robot.respond(/s2$/i, (res) => {
    res.send('search');
    const result = _timeidx.search('EQ', '2016-05-05 11:27');
    console.log(result);
  });
  robot.respond(/s3$/i, (res) => {
    res.send('search');
    const result = _timeidx.search('GE', '2016-05-05');
    console.log(result);
  });
  robot.respond(/d1$/i, (res) => {
    res.send('delete.');
    _timeidx.del('LT', '2016-05-05');
  });
  robot.respond(/d2$/i, (res) => {
    res.send('delete.');
    _timeidx.del('EQ', '2016-05-05');
  });
  robot.respond(/d3$/i, (res) => {
    res.send('delete.');
    _timeidx.del('GT', '2016-05-06');
  });
};

