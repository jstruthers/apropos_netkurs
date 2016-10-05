function Timer (startTime, alertTime)
{
  this.startTime = startTime;
  this.total = startTime;
  this.alertTime = startTime - alertTime;
  this.interval = null;
  this.timeString = "";
  this.init();
}

Timer.prototype.fiveMinuteWarning = function()
{   
  $('.timer').velocity(
  {
    color: '#B22222',
    scale: '1.8',
    marginLeft: '25px',
    marginRight: '25px'
  }, {
    duration: 1000,
    easing: 'easeOutQuart'
  });
};

Timer.prototype.formatTime = function( opt )
{
  var tHours = Math.floor(this.total / 3600000),
      tMins = Math.floor(this.total / 60000),
      tSecs = Math.floor(this.total / 1000),
      mins = tMins % 60,
      secs = Math.floor(this.total % 60000 / 1000);
  
  if (tHours < 10) { tHours = "0" + tHours};
  if (mins < 10) { mins = "0" + mins };
	if (secs < 10) { secs = "0" + secs };
  
  switch( opt )
  {
    case 's' : return mins + ' : ' + secs; break;
    case 'm' : return tHours + ' : ' + mins; break;
    case 'l' :
      var lJSON = store.langData[store.currentLang].timer, pFx = lJSON.pluralPostfix;
      return tHours + (tHours > 1 ? lJSON.hour + pFx : lJSON.hour)
             + ' ' + mins + (mins > 1 ? lJSON.minute + pFx : lJSON.minute)
             + lJSON.and
             + ' ' + secs + (secs > 1 ? lJSON.second + pFx : lJSON.second);
      break;
  }
}

Timer.prototype.tick = function()
{
  if (this.total === 0)
  {
    this.stop();
    $('.timer').text( '00:00' );
  }
  else
  {
    if (this.total === 300000)
    {
      this.fiveMinuteWarning();
    }
    else if (this.total < 300000)
    {
      this.timeString = this.formatTime( 's' );
    }
    else
    {
      this.timeString = this.formatTime( 'm' );
    }

    $('.timer').text( this.timeString );
  }
  this.total -= 1000;
};

Timer.prototype.stop = function()
{
  clearInterval( this.interval );
  this.total = this.startTime - this.total;
  this.timeString = this.formatTime( 'l' );
};

Timer.prototype.init = function()
{
  this.timeString = this.formatTime( 'm' );
  $('.timer').text( this.timeString );
  this.interval = setInterval(this.tick.bind(this), 1000);
};
