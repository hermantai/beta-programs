function getParams() {
  // found in http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  var match,
      pl     = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) {
        return decodeURIComponent(s.replace(pl, " "));
      },
      query  = window.location.search.substring(1);

  var urlParams = {};
  while ((match = search.exec(query)) !== null) {
     urlParams[decode(match[1])] = decode(match[2]);
  }
  return urlParams;
}

function setPageTitle(newTitle) {
  if (document.title !== newTitle) {
    document.title = newTitle;
  }

  var displayTitleInput = document.getElementById('display-title-input');
  // The check of the displayTitleInput.value cannot be combined with the
  // document.title check above because displayTitleInput.value is not
  // in sync with document.title in one situation: when the page is loaded
  // without the query parameter "title" being set.
  if (displayTitleInput.value !== newTitle) {
    displayTitleInput.value = newTitle;
  }

  var setTitleInput = document.getElementById('set-title-input');
  if (setTitleInput.value !== newTitle) {
      // This can happen if setPageTitle is called from a "back" button,
      // or initial page load, instead of responding to a user "set title"
      // action.
      setTitleInput.value = newTitle;
  }
}

function getLocationFromTitle(title) {
  return window.location.pathname + "?title=" + encodeURIComponent(title);
}

/**
 * In two situations this setPageStateOnPageLoad method has to be
 * called: when the page is loaded (a user enters the url and click enter),
 * or the user clicks the "back" button to go back to this page.
 */
function setPageStateOnPageLoad(e) {
  var title = getParams().title;

  if (title === undefined) {
    title = "Set Title";
  }
  setPageTitle(title);
  // Set the state for this initial page, so we can set the title back
  // later (in window.popstate event) if the user uses the "back" button
  // to come back to this page.
  // Note that we use replaceState, because when the user goes to this
  // page with title "ABC", pressing the "back" button should not stay
  // at this page (this "Set Title" web app). He/she should go back to
  // whatever page he/she was browsing.
  window.history.replaceState(
    {title: title},  // the state is used for window.popstate
                            // event
    title
    /* we don't pass a new url here */
  );
}

window.onload = function (e) {
  setPageStateOnPageLoad(e);

  var setTitleButton = document.getElementById('set-title-button');
  setTitleButton.addEventListener(
    "click",
    function(e) {
      e.preventDefault();

      var setTitleInput = document.getElementById('set-title-input');
      var newTitle = setTitleInput.value;
      setPageTitle(newTitle);

      window.history.pushState(
        {title: newTitle},  // the state is used for window.popstate event
        newTitle,
        getLocationFromTitle(newTitle)
      );
    }
  );
  // When the user presses the back and forward button, the page does not
  // reload, so we need to know the previous state and set the page
  // accordingly.
  window.addEventListener(
    'popstate',
    setPageStateOnPageLoad
  );

  var setTitleInput = document.getElementById('set-title-input');
  setTitleInput.focus();
}
