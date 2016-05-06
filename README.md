# hubot-brain-timeindex


### Requirements
Node v4+  
lodash  
moment  

### Installation
`$ npm install --save hubot-brain-timeindex`

### Example
```js
const HubotBrainTimeindex = require('hubot-brain-timeindex');

let _timeidx;

module.exports = (robot) => {
  _timeidx = new HubotBrainTimeindex(robot, true);

  robot.respond(/ADD$/i, (res) => {
    _timeidx.add('2016-05-05 11:30', 'KEY1');
  });
  
  robot.respond(/SEARCH$/i, (res) => {
    res.send('search');
    const result = _timeidx.search('EQ', '2016-05-05 11:30');
    console.log(result);
  });
}
```