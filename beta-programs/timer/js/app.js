var timer = {
  prevInterval: null,
  // A Date object to represent the time to ring
  ringTime: null,
  resetTimer: function () {
    if (this.prevInterval) {
      clearInterval(this.prevInterval);
      this.prevInterval = null;
    }

    var element = $('#countdown-output')
    element.removeClass("ringing-timer");
    element.html("");
    element.stop();
  },  // resetTimer

  ring: function () {
    var element = $('#countdown-output')
    element.addClass("ringing-timer");
    element.html(
      "The timer went off at " + this.ringTime.toLocaleTimeString()+ "!"
    );
    element.toggle('pulsate');
  },  // ring

  stop: function () {
    if (this.prevInterval) {
      clearInterval(this.prevInterval);
      this.prevInterval = null;
    }
  }, // stop
};

$(function () {
  // setup Visual Timer UI
  $('#set-timer-button').on('click', function (e) {
    e.preventDefault();
    timer.resetTimer();
    // The output may be gone before, so make sure it's on at the beginning.
    $('#countdown-output').toggle(true);
    $('#countdown-output').css('opacity', 100);

    var secondsToRing = 0;
    secondsToRing += $('#seconds-to-ring-input').val() === "" ?
      0 : parseInt($('#seconds-to-ring-input').val());
    secondsToRing += $('#minutes-to-ring-input').val() === "" ?
      0 : parseInt($('#minutes-to-ring-input').val()) * 60;

    var startingTimeInMillis = new Date().getTime();
    timer.ringTime = new Date(startingTimeInMillis);
    timer.ringTime.setSeconds(timer.ringTime.getSeconds() + secondsToRing);

    timer.prevInterval = setInterval(function () {
      var currentTimeInMillis = new Date().getTime();
      var diff = (currentTimeInMillis - startingTimeInMillis) / 1000.0;
      var secondsLapsed = Math.round(diff);
      var minutesLapsed = Math.floor(secondsLapsed / 60);
      var secondsRemained = Math.round(
        (timer.ringTime.getTime() - currentTimeInMillis) / 1000
      );
      var minutesRemained = Math.floor(secondsRemained / 60);
      $('#countdown-output').html(
        minutesLapsed + " minutes " + secondsLapsed % 60 + " seconds" +
        "<br />" +
        '<span class="remaining-duration">' +
        "Remaining: " + minutesRemained + " minutes " +
        secondsRemained % 60 + " seconds" +
        "</span>"

      );
      if (diff > secondsToRing) {
        timer.ring();
      }
    }, 1000); //  setInterval
  });  //  set-timer-button on click

  $('#reset-timer-button').on('click', function (e) {
    e.preventDefault();
    timer.resetTimer();
    $('#seconds-to-ring-input').val("");
    $('#minutes-to-ring-input').val("");
  });  // reset-timer-button on click

  $('#stop-timer-button').on('click', function (e) {
    e.preventDefault();
    timer.stop();
  });  // reset-timer-button on click

  var set_timer_inputs = [
    $('#seconds-to-ring-input'),
    $('#minutes-to-ring-input')
  ];
  for (var i = 0; i < set_timer_inputs.length; i++) {
    set_timer_inputs[i].on('keypress', function (e) {
      if (e.keyCode === 13) {
        // enter key is pressed
        e.preventDefault();
        $('#set-timer-button').click();
      }
    });
  }
});  // init on load
