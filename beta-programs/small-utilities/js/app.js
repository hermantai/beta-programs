if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

function addZeroIfNeeded(num) {
  // add a prefix zero and return a string if num is smaller than 10,
  // otherwise, just return the string of num
  if (num < 10) {
    return "0" + num.toString();
  } else {
    return num.toString();
  }
}

$(function () {
  // javascript-for-bookmarklets
  $('#javascript-for-bookmarklets-input-textarea').on('keyup', function (e) {
    var inputVal = $(e.target).val();
    if (inputVal) {
      var outputVal = inputVal.replace(/\r\n|\r|\n/g, ' ');
      // make the javascript snippet a href attribute for <a>
      outputVal = 'href="javascript: ' + outputVal.replace(/"/g, '&quot;') + '"'
    } else {
      var outputVal = "";
    }
    $('#javascript-for-bookmarklets-output-textarea').val(outputVal);
  });
});

$(function() {
  // plain-notepad
  var stored_text = localStorage.getItem('plain-notepad-stored-text');
  if (stored_text) {
    $('#plain-notepad-textarea').val(stored_text);
  }
  $('#plain-notepad-textarea').on('keyup', function (e) {
    if (e.target.value) {
      localStorage.setItem('plain-notepad-stored-text', e.target.value);
      var d = new Date();
      $('#plain-notepad-status').html(
        "Saved on: {0}-{1}-{2} {3}:{4}:{5}".format(
          d.getFullYear(),
          addZeroIfNeeded(d.getMonth() + 1),
          addZeroIfNeeded(d.getDate()),
          addZeroIfNeeded(d.getHours()),
          addZeroIfNeeded(d.getMinutes()),
          addZeroIfNeeded(d.getSeconds())
        )
      );
    } else {
      localStorage.removeItem('plain-notepad-stored-text');
    }
  });  // plain-notepad-textarea on keyup
});

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

$(function() {
  // simple-string-replace

  var replace_func = function () {
    $('#simple-string-replace-newstr').val(
        $('#simple-string-replace-textarea').val().replaceAll(
          $('#simple-string-replace-substr').val(),
          $('#simple-string-replace-newsubstr').val())
    );
  }

  var capture_enter_and_replace_func = function (event) {
			var keycode = (event.keyCode ? event.keyCode : event.which);
			if(keycode == '13'){
					replace_func();
          return true;
			}
  };

  // capture enter in input textarea and the newsubstr text box
	$('#simple-string-replace-textarea').keypress(capture_enter_and_replace_func);
	$('#simple-string-replace-substr').keypress(capture_enter_and_replace_func);
	$('#simple-string-replace-newsubstr').keypress(capture_enter_and_replace_func);

  $('#simple-string-replace-button').click(replace_func);
});
