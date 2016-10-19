(function () {
  var public = {};

  public.utility = function(store)
    {
      this.store = store;
      this.startTime = store.stats.durationTime;
      this.total = store.stats.durationTime;
      this.alertTime = store.stats.alertTime;
      this.interval = null;
      this.timeString = "";
      this.init();
    }

    public.utility.prototype.fiveMinuteWarning = function()
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

    public.utility.prototype.formatTime = function( opt )
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
          var lJSON = this.store.langData[this.store.currentLang].timer, pFx = lJSON.pluralPostfix;
          return tHours + (tHours > 1 ? lJSON.hour + pFx : lJSON.hour)
                 + ' ' + mins + (mins > 1 ? lJSON.minute + pFx : lJSON.minute)
                 + lJSON.and
                 + ' ' + secs + (secs > 1 ? lJSON.second + pFx : lJSON.second);
          break;
      }
    }

    public.utility.prototype.tick = function()
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

    public.utility.prototype.stop = function()
    {
      clearInterval( this.interval );
      this.total = this.startTime - this.total;
      this.timeString = this.formatTime( 'l' );
    };

    public.utility.prototype.init = function()
    {
      this.timeString = this.formatTime( 'm' );
      $('.timer').text( this.timeString );
      this.interval = setInterval(this.tick.bind(this), 1000);
    };

    public.utility.prototype.formatDate = function()
    {
      //function addZero(i, h = false) {
    //  // if i = hour and language is english, convert 0-24 to 0-12
    //    if (h && params.courseLang == 0 && i > 12) i -=12;
    //
    //    // adds leading zero
    //    if (i < 10) {
    //        i = "0" + i;
    //    }
    //    return i;
    //}
    };

    return public;
})();


