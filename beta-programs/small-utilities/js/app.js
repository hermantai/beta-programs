$(function() {
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
