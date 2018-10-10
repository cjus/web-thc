const {Component, h, render} = window.preact;
const TOTAL_BACKGROUNDS = 5;
const VERSION = 'v022';
const DEGREES = 359.9;
const RING1 = 170;
const RING2 = 156;
const RING3 = 145;

var THCSettings = {
  textColorIndex: 0,
  backgroundId: 0,
  rangeStart: 5,
  rangeEnd: 20
};

class Clock extends Component {
  constructor() {
    super();
    this.init();
  }

  init() {
    THCSettings = Object.assign(THCSettings, JSON.parse(localStorage.getItem('settings') || '{}'));
    this.textColors = [
      '#00F5FF',
      '#00BAFF',
      '#0089FF',
      '#0045FF',
      '#ECECF5',
      '#F5FF00',
      '#FFCE00',
      '#FFA700',
      '#FF7F00',
      '#FF4E00',
      '#FF0000',
      '#9300FF',
      '#5800FF',
      '#58FF00',
      '#00FF6C',
      '#00FFBA'
    ];

    this.textColorIndex = THCSettings.textColorIndex;
    this.backgroundId = THCSettings.backgroundId;
    this.interval;
    this.lastClick = 9999;
    this.sprintStart = 0;
    this.lastSprintStart = 9999;
    this.totalSprintSegmentsPerSecond = DEGREES / (15 * 60);
    this.lastHour = 0;

    this.initDigitalWatch();

    document.getElementById('version').innerHTML = VERSION;

    let el = document.getElementById('arc1');
    el.setAttribute('d', Clock.describeArc(180, 180, RING1, 0, DEGREES));

    window.clickTP = () => {
      let now = new Date();
      let curClick = now.getTime();
      if ((curClick / 1000 - this.lastClick / 1000) < 1) {
        if (this.textColorIndex + 1 === this.textColors.length) {
          this.textColorIndex = 0;
        } else {
          this.textColorIndex++;
        }
        this.changeTextColor('curTime');
        this.changeTextColor('countdownTime');
        this.changeTextColor('version');
        this.changeRingColors();
      } else {
        this.lastClick = curClick;
      }
    }

    window.clickLT = () => {
      let now = new Date();
      let curClick = now.getTime();
      if ((curClick / 1000 - this.lastClick / 1000) < 1) {
        if (this.backgroundId - 1 < 1) {
          this.backgroundId = 1;
        } else {
          this.backgroundId--;
        }
        this.changeBackground();
      } else {
        this.lastClick = curClick;
      }
    }

    window.clickRT = () => {
      let now = new Date();
      let curClick = now.getTime();
      if ((curClick / 1000 - this.lastClick / 1000) < 1) {
        if (this.backgroundId + 1 > TOTAL_BACKGROUNDS) {
          this.backgroundId = TOTAL_BACKGROUNDS;
        } else {
          this.backgroundId++;
        }
        this.changeBackground();
      } else {
        this.lastClick = curClick;
      }
    }

    window.clickBT = () => {
      let now = new Date();
      this.lastHour = now.getHours();
      this.sprintStart = (new Date()).getTime();
      if ((this.sprintStart / 1000 - this.lastSprintStart / 1000) > 1) {
        this.lastSprintStart = this.sprintStart;
        this.sprintStart = 0;
      } else {
        var el = document.getElementById('arc2');
        el.setAttribute('d', Clock.describeArc(180, 180, RING2, 0, DEGREES));
      }
    }
  }

  static polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    let angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  static describeArc(x, y, radius, startAngle, endAngle) {
    let start = Clock.polarToCartesian(x, y, radius, endAngle);
    let end = Clock.polarToCartesian(x, y, radius, startAngle);
    let largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    let d = [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
    return d;
  }

  changeTextColor(item) {
    let el = document.getElementById(item);
    el.setAttribute('style', 'fill: ' + this.textColors[this.textColorIndex] + '; fill-opacity: .75;');
    THCSettings.textColorIndex = this.textColorIndex;
    localStorage.setItem('settings', JSON.stringify(THCSettings));
  }

  changeRingColors() {
    let color = this.textColors[this.textColorIndex];
    let el = document.getElementById('arc1');
    el.setAttribute('style', 'stroke: ' + color + '; fill: none; stroke-opacity: 0.4; stroke-width: 16; stroke-linecap: round;');
    el = document.getElementById('arc2');
    el.setAttribute('style', 'stroke: ' + color + '; fill: none; stroke-opacity: 0.6; stroke-width: 10; stroke-linecap: round;');
    el = document.getElementById('arc3');
    el.setAttribute('style', 'stroke: ' + color + '; fill: none; stroke-opacity: 0.3; stroke-width: 10; stroke-linecap: round;');
  }

  changeBackground() {
    let path = 'url(images/back0' + this.backgroundId + '.png)';
    if (this.backgroundId === TOTAL_BACKGROUNDS) {
      path = 'none';
    }
    //document.getElementsByTagName('body')[0].style.backgroundImage = path;
    document.getElementById('clockPage').style.backgroundImage = path;
    THCSettings.backgroundId = this.backgroundId;
    localStorage.setItem('settings', JSON.stringify(THCSettings));
  }

  updateWatch() {
    let today = new Date();
    let curTime = today.getTime();
    let endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), THCSettings.rangeEnd, 0, 0).getTime();
    let startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), THCSettings.rangeStart, 0, 0).getTime();

    let displayTime = (today).toLocaleTimeString().split(' ')[0];

    document.getElementById('curTime').innerHTML = displayTime;

    let totalsecSegmentsPerSecond = (DEGREES / 60);
    let secSegments = DEGREES - (totalsecSegmentsPerSecond * today.getSeconds());
    let el2 = document.getElementById('arc3');
    secSegments -= totalsecSegmentsPerSecond;
    if (secSegments < totalsecSegmentsPerSecond) {
      secSegments = DEGREES;
    }
    el2.setAttribute('d', Clock.describeArc(180, 180, RING3, 0, secSegments));

    if (this.sprintStart) {
      let sprintSegments = ((curTime - this.sprintStart) / 1000) * this.totalSprintSegmentsPerSecond;
      let el3 = document.getElementById('arc2');
      if (sprintSegments < DEGREES) {
        el3.setAttribute('d', Clock.describeArc(180, 180, RING2, 0, DEGREES - sprintSegments));
      } else {
        this.sprintStart = 0;
        el3.setAttribute('d', Clock.describeArc(180, 180, RING2, 0, 0));
      }
    }

    if (curTime < startTime || curTime > endTime) {
      document.getElementById('countdownTime').innerHTML = 'EXPIRED';
      let el = document.getElementById('arc1');
      el.setAttribute('d', Clock.describeArc(180, 180, RING1, 0, 0));
      return;
    }

    let curHour = today.getHours();
    if (curHour !== this.lastHour) {
      this.lastHour = curHour;
    }

    let distance = (endTime - curTime);
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
    let remain = (((hours > 9) ? hours : '0' + hours) + ':' + ((minutes > 9) ? minutes : '0' + minutes));

    document.getElementById('countdownTime').innerHTML = remain;

    let totalSecondsPerSegment = (endTime - startTime) / DEGREES;
    let elapsedSegments = (today.getTime() - startTime) / totalSecondsPerSegment;
    let segments = DEGREES - elapsedSegments;

    let el = document.getElementById('arc1');
    el.setAttribute('d', Clock.describeArc(180, 180, RING1, 0, segments));
  }

  initDigitalWatch() {
    this.changeBackground();
    this.changeTextColor('curTime');
    this.changeTextColor('countdownTime');
    this.changeTextColor('version');
    this.changeRingColors();
    this.interval = setInterval(this.updateWatch, 1000);
  }

  render(props, state) {
    return (
      h('div', {}, )
    );
  }
}

class App extends Component {
  componentDidMount() {
    this.setState({
      title: 'Time Hacker Clock',
      showScreen: 'clock'
    });
  }

  onPress(bID) {
    this.setState({
      showScreen: bID
    });
  }

  render(props, state) {
    let bodyElements = ('div', {}, '');
    let el;

    console.log('state.showScreen', state.showScreen);
    switch (state.showScreen) {
      case 'clock':
        el = document.getElementById('clockPage');
        el.style.visibility = 'visible';
        bodyElements = (
          h('div', {id: 'button-bar'},
            h('span', {class: 'simple-button noselect glyphicon glyphicon-cog', 'aria-hidden': true, onclick: this.onPress.bind(this, 'gear')},),
            h('span', {class: 'simple-button noselect glyphicon glyphicon glyphicon-question-sign', 'aria-hidden': true, onclick: this.onPress.bind(this, 'help')},),
            h('span', {class: 'simple-button noselect glyphicon glyphicon glyphicon-open', 'aria-hidden': true, onclick: this.onPress.bind(this, 'eject')},),
          )
        );
        break;
      case 'gear':
        el = document.getElementById('clockPage');
        el.style.visibility = 'hidden';
        bodyElements = (
          h('div', {},
            h('div', {id: 'button-bar'},
              h('span', {class: 'simple-button noselect glyphicon glyphicon glyphicon-remove', 'aria-hidden': true, onclick: this.onPress.bind(this, 'clock')},)
            ),
            h('div', {class: 'dialog'},
              h('h3', {}, 'Configure'),
              h('p',{}, 'This is the config screen.')
            )
          )
        );
        break;
      case 'help':
        el = document.getElementById('clockPage');
        el.style.visibility = 'hidden';
        bodyElements = (
          h('div', {},
            h('div', {id: 'button-bar'},
              h('span', {class: 'simple-button noselect glyphicon glyphicon glyphicon-remove', 'aria-hidden': true, onclick: this.onPress.bind(this, 'clock')},)
            ),
            h('div', {class: 'dialog'},
              h('h3', {}, 'Help'),
              h('span',{}, 'This clock is based on the '),
              h('a', {href: 'https://medium.com/@cjus/the-time-hacker-method-12970c47f04f', target: '_blank'}, 'Time Hacker Method (THM)'),
              h('span',{}, ' To learn more about this and other Time Hacker Clocks visit the '),
              h('a', {href: 'https://medium.com/@cjus/time-hacker-clocks-3a1491dd02a7', target: '_blank'}, 'medium post'),
              h('p',{}, 'When back on the clock page, double click on the areas shown to interact with the clock.'),
              h('img', {id: 'clock-hit', src: './images/clickzones.png'}, ),
              h('p',{}, 'The changes you make are stored in your browser cache so you won\'t have to change the settings each time you load the clock.'),
              h('span',{}, 'This Time Hacker Clock was created by '),
              h('a', {href: 'https://twitter.com/cjus', target: '_blank'}, '@cjus'),
              h('span',{}, ' and built using SVG and PreactJS.'),
            )
          )
        );
        break;
      case 'eject':
        window.open ('./thc.html','_blank', 'toolbar=false,scrollbars=yes,resizable=false,top=0,left=0, width=360,height=400');
        this.setState({
          showScreen: 'clock'
        });
        break;
      default:
        break;
    }

    return (
      h('div', {},
        h(Clock, {}, ),
        bodyElements
      )
    );
  }
}

render(h(App), document.body);

