var timer = {
  prevInterval: null,
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
    element.html("The timer is on!");
    element.toggle('pulsate');
  },  // ring
};

$(function () {
  // setup Visual Timer UI
  $('#set-timer-button').on('click', function (e) {
    e.preventDefault();
    timer.resetTimer();

    var secondsToRing = parseInt($('#seconds-to-ring-input').val());
    var startingTime = new Date().getTime();

    timer.prevInterval = setInterval(function () {
      var currentTime = new Date().getTime();
      var diff = (currentTime - startingTime) / 1000.0;
      $('#countdown-output').html(Math.round(diff));
      if (diff > secondsToRing) {
        timer.ring();
      }
    }, 1000); //  setInterval
  });  //  set-timer-button on click
  $('#reset-timer-button').on('click', function (e) {
    e.preventDefault();
    timer.resetTimer();
    $('#seconds-to-ring-input').val("");
  });  // reset-timer-button on click
});  // init on load
