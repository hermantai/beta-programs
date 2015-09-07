$(function() {
  // javascript-for-bookmarklets
  $('#javascript-for-bookmarklets-input-textarea').on('keyup', function (e) {
    var inputVal = $(e.target).val();
    var outputVal = inputVal.replace(/\r\n|\r|\n/g, ' ');
    // make the javascript snippet a href attribute for <a>
    outputVal = 'href="javascript: ' + outputVal.replace(/"/g, '&quot;') + '"'
    $('#javascript-for-bookmarklets-output-textarea').val(outputVal);
  });
});
