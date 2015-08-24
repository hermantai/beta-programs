var searchYourText = (function() {
  var _search_pos = 0;
  var _prev_query = null;

  var obj = {
    refreshDisplay: function () {
      $('#display-div').html("");
      var textNode = document.createTextNode($('#userinput-textarea').val());
      $('#display-div').append(textNode);
      findAndReplace('\n', '<br />', $('#display-div')[0]);
    },

    removeHighlights: function () {
      $('.highlight').each(function () {
        $(this).replaceWith(document.createTextNode($(this).text()));
      });
      $('#display-div')[0].normalize();
    },

    scrollTo: function (n) {
      var highlights = $('.highlight');
      if (highlights.length !== 0) {
        n %= highlights.length;

        var highlight = highlights[n];
        // The display-div does not have a 0 top, so we need to take that out
        // from the offsetTop before the scrolling
        var offsetTop = $(highlight).offset().top -
          $('#display-div').offset().top;
        $(window).scrollTop(offsetTop);
      }
    },

    searchPos: function (pos) {
      if (pos !== undefined) {
        _search_pos = pos;
      }
      return _search_pos;
    },

    prevQuery: function (query) {
      if (query) {
        _prev_query = query;
      }
      return _prev_query;
    },
  };  // obj

  return obj;
})();

$(document).ready(
  function () {
    $('#search-button').click(function (e) {
      e.preventDefault();

      var query = $('#search-input').val();
      if (
        query !== searchYourText.prevQuery() ||
        searchYourText.searchPos() === 0
      ) {
        searchYourText.removeHighlights();
        searchYourText.searchPos(0);
        // first change all br's back to newline characters
        $('#display-div').find('br').before(
          document.createTextNode('\n')
        ).remove();
        $('#display-div')[0].normalize();

        // then do a findAndReplace
        findAndReplace(
          query,
          '<span class="highlight">$&</span>',
          $('#display-div')[0]
        );
        // finally, change all newline characters back to br's
        findAndReplace('\n', '<br />', $('#display-div')[0]);

        searchYourText.scrollTo(0);

        searchYourText.searchPos(1);
      } else {
        var curPos = searchYourText.searchPos();
        searchYourText.scrollTo(curPos);
        searchYourText.searchPos(curPos + 1);
      }

      searchYourText.prevQuery(query);
    });  // register search-button click event

    $('#userinput-textarea').on("input propertychange", function (e) {
      searchYourText.refreshDisplay();
      searchYourText.searchPos(0);
    });  // register userinput-textarea on change event
});  // ready
