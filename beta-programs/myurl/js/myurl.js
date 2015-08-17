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

var toast = {
  ERROR: "error",
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",

  show: function (title, message, type) {
    alert("{0}: {1}".format(title, message));
  }
}

/**
 * The myurl module.
 *
 * Object:
 *  SmartUrl:
 *    An object with fields: name and url. The name is for displaying
 *    purpose and the url should contain optional "%s" which is replaced by
 *    user inputs.
 *
 *    This object also has an optional field id to uniquely identify the
 *    object.
 */
var myurl = {
  init: function () {
    this.settings.init();
  },

  add_smart_url: function (smart_url) {
    var that = this;

    this.repo.add_smart_url(smart_url, function(added_smart_url) {
      that._add_smart_url_to_ui(added_smart_url);
    });
  },

  _add_smart_url_to_ui: function(smart_url) {
    myurl.home_page.add_smart_url(smart_url);
    myurl.config_url_page.add_smart_url(smart_url);
  },

  get_all_smart_urls: function () {
    return this.repo.get_all_smart_urls();
  },

  remove_smart_url: function (id) {
    this._remove_smart_url_from_ui(id);
    this.repo.remove_smart_url(id);
  },

  _remove_smart_url_from_ui: function(id) {
    myurl.home_page.remove_smart_url(id);
    myurl.config_url_page.remove_smart_url(id);
  },

  /**
   * Returns the json parsed or null if not parsed successfully.
   */
  save_parse_json: function(s) {
      try {
        json = JSON.parse(s);
        return json;
      } catch(e) {
        toast.show('Invalid json', e, toast.ERROR);
        return null;
      }
  },

  download_json: function(json, filename) {
      var encoded_json = encodeURIComponent(json);
      var anchor = $('<a href="data:text;charset=utf-8,{0}" download="{1}">Download {1}</a>'.format(encoded_json, filename));
      $('#download-link-span').html(anchor);
  },

  _smart_urls: []
};

/**
 * Provides a Repostiory abstraction for retrieving and storing smart url's,
 * including the in-memory caching.
 */
myurl.repo = (function() {
  var _DEFAULT_SMART_URLS = [
    {
      'name': 'Finance Yahoo',
      'url': 'http://finance.yahoo.com/q?s=%s&ql=1',
    },
    {
      'name': 'Finance Yahoo Historical quotes',
      'url': 'http://finance.yahoo.com/q/hp?s=%s+Historical+Prices',
    },
    {
      'name': 'Finance Yahoo message board',
      'url': 'http://finance.yahoo.com/mb/%s/',
    },
    {
      'name': 'Finance Yahoo Analyst Estimates',
      'url': 'http://finance.yahoo.com/q/ae?s=%s+Analyst+Estimates',
    },
    {
      'name': 'Finance Yahoo Insider Transactions',
      'url': 'http://finance.yahoo.com/q/it?s=%s+Insider+Transactions',
    },
    {
      'name': 'HK Finance Yahoo',
      'url': 'https://hk.finance.yahoo.com/q?s=%s&ql=1'
    },
    {
      'name': 'Nasdaq after hours',
      'url': 'http://www.nasdaq.com/symbol/%s/after-hours'
    },
    {
      'name': 'Nasdaq Dividend History',
      'url': 'http://www.nasdaq.com/symbol/%s/dividend-history'
    },
    {
      'name': 'Google Finance',
      'url': 'https://www.google.com/finance?q=%s',
    },
    {
      'name': 'Morningstar Financials',
      'url': 'http://financials.morningstar.com/income-statement/is.html?t=%s&region=USA&culture=en-US',
    },
    {
      'name': 'Morningstar Key Ratios',
      'url': 'http://financials.morningstar.com/ratios/r.html?t=%s&region=USA&culture=en-us',
    },
    {
      'name': 'Seeking Alpha',
      'url': 'http://seekingalpha.com/symbol/%s',
    },
    {
      'name': 'Xueqiu',
      'url': 'http://xueqiu.com/S/%s',
    },
    {
      'name': 'USD in CNY',
      'url': 'https://www.google.com/#q=%s+usd+in+cny&safe=off',
    },
    {
      'name': 'USD in RUB',
      'url': 'https://www.google.com/#q=%s+usd+in+rub&safe=off',
    },
    {
      'name': 'USD in BRL',
      'url': 'https://www.google.com/#q=%s+usd+in+brl&safe=off',
    },
    {
      'name': 'CNY in USD',
      'url': 'https://www.google.com/#q=%s+cny+in+usd&safe=off',
    },
    {
      'name': 'RUB in USD',
      'url': 'https://www.google.com/#q=%s+rub+in+usd&safe=off',
    },
    {
      'name': 'Euros in USD',
      'url': 'https://www.google.com/#q=%s+eur+in+usd&safe=off',
    },
    {
      'name': 'BRL in USD',
      'url': 'https://www.google.com/#q=%s+brl+in+usd&safe=off',
    },
    {
      'name': 'Add a feed to Feedly (login to feedly in the browser, then come here and enter the feed url)',
      'url': 'http://cloud.feedly.com/#subscription%2Ffeed%2F%s',
    },
  ];

  var _smart_urls = [];

  var obj = {
    init: function (callback_for_setup_repo_finished) {
      var that = this;
      this.db.init(
        function() {
          that.db.load_smart_urls(
            function (results) {
              var length = results.rows.length;
              console.log("Has {0} smart urls in storage".format(length));
              for (var i = 0; i < length; i++) {
                _smart_urls.push(results.rows.item(i));
              }
              // Load default smart url's if there is none in the db
              if (
                _smart_urls.length === 0 &&
                _DEFAULT_SMART_URLS.length !== 0
              ){
                // Chain one callback per default smart url, so the
                // default smart url's are added to db in serial, then we call
                // the callback_for_setup_repo_finished at the end. The
                // callback chain is constructed from the end.
                last_callback = callback_for_setup_repo_finished;

                for (var i =  _DEFAULT_SMART_URLS.length - 1; i > 0; i--) {
                  // that.add_smart_url(_DEFAULT_SMART_URLS[i]);
                  last_callback = (function (smart_url, cb) {
                    return function () {
                      that.add_smart_url(smart_url, cb);
                    }
                  })(_DEFAULT_SMART_URLS[i], last_callback);
                }

                that.add_smart_url(_DEFAULT_SMART_URLS[0], last_callback);
              } else {
                if (callback_for_setup_repo_finished) {
                  callback_for_setup_repo_finished();
                }
              }
            }
          );
        }
      );
    },  // myurl.repo.init

    add_smart_url: function(smart_url, callback_for_smart_url_added) {
      this.db.add_smart_url(smart_url, function(added_smart_url) {
        _smart_urls.push(added_smart_url);

        if (callback_for_smart_url_added) {
          callback_for_smart_url_added(added_smart_url);
        }
      });
    },  // myurl.repo.add_smart_url

    get_all_smart_urls: function () {
      return _smart_urls;
    },

    remove_smart_url: function (id, callback_for_smart_url_removed) {
      this.db.remove_smart_url(
        id,
        function () {
          var index = -1;
          for (var i = 0; i < _smart_urls.length; i++) {
            if (_smart_urls[i].id.toString() === id) {
              index = i;
              break;
            }
          }

          if (index === -1) {
            toast.show("Remove URL", "{0} does not exist".format(name), toast.ERROR);
            return;
          }

          _smart_urls.splice(index, 1);
          if (callback_for_smart_url_removed) {
            callback_for_smart_url_removed();
          }
        }
      );
    },  // myurl.repo.remove_smart_url

  };  // obj to be returned for myurl.repo

  return obj;
})();  // myurl.repo

/**
 * The persistent storage for smart url's. This storage is used by myurl.repo
 * for persistent.
 */
myurl.repo.db = (function() {
  var _DATABASE_NAME = "myurl";
  var _DATABASE_VERSION = "1.0";
  var _DATABASE_DESC = "Database for MyURL";
  var _DATABASE_SIZE = 1024 * 1024;
  var _TABLE_SMART_URL = "smart_url";

  var _GENERIC_SQL_HANDLER = function (tx, error) {
    toast.show("Web SQL Error", error.message);
  };

  var _db_handle = null;

  var obj = {
    init: function (callback_for_setup_db_finished) {
      _db_handle = openDatabase(
        _DATABASE_NAME,
        _DATABASE_VERSION,
        _DATABASE_DESC,
        _DATABASE_SIZE
      );

      _db_handle.transaction(
        function (tx) {
          var create_table_sql = (
              'CREATE TABLE IF NOT EXISTS {0} ('
                + 'id INTEGER PRIMARY KEY'
                + ', name STRING'
                + ', url STRING'
                + ')'
          ).format(_TABLE_SMART_URL);

          tx.executeSql(
            create_table_sql,
            [],
            function () {
              if (callback_for_setup_db_finished) {
                callback_for_setup_db_finished();
              }
            },
            _GENERIC_SQL_HANDLER
          );
        }
      );
    },  // myurl.repo.db.init

    load_smart_urls: function (callback_for_smart_urls_loaded) {
      _db_handle.transaction(
        function (tx) {
          tx.executeSql(
            "SELECT * FROM {0} ORDER BY id".format(_TABLE_SMART_URL),
            [],
            function (tx, results) {
              if (callback_for_smart_urls_loaded) {
                callback_for_smart_urls_loaded(results);
              }
            },
            _GENERIC_SQL_HANDLER
          );
        }
      );
    },  // myurl.repo.db.load_smart_urls

    add_smart_url: function(smart_url, callback_for_smart_url_added) {
      _db_handle.transaction(
        function (tx) {
          tx.executeSql(
            'INSERT INTO {0}(name, url) values(?, ?)'.format(_TABLE_SMART_URL),
            [smart_url.name, smart_url.url],
            function(tx, resultSet) {
              if (!resultSet.rowsAffected) {
                toast.show(
                  'Smart url not inserted',
                  '{0} not inserted to db'.format(
                    JSON.stringify(smart_url)
                  ),
                  toast.WARNING
                );
                return;
              }

              smart_url.id = resultSet.insertId

              if (callback_for_smart_url_added) {
                callback_for_smart_url_added(smart_url);
              }
            },
            _GENERIC_SQL_HANDLER
          );
        }
      );
    },  // myurl.repo.db.add_smart_url

    remove_smart_url: function (id, callback_for_smart_url_removed) {
      _db_handle.transaction(
        function (tx) {
          tx.executeSql(
            'DELETE FROM {0} WHERE id = ?'.format(_TABLE_SMART_URL),
            [id],
            function () {
              if (callback_for_smart_url_removed) {
                callback_for_smart_url_removed();
              }
            },
            _GENERIC_SQL_HANDLER
          );
        }
      )
    },  // myurl.repo.db.remove_smart_url

  };  // obj to be returned for myurl.db

  return obj;
})();  // myurl.repo.db

myurl.settings = (function() {
  var _fields = {
    "is_sync_text_inputs": {
      type: "boolean"
    },
    "is_reset_on_url_opened": {
      type: "boolean"
    }
  }

  var obj = {
    init: function () {
      this.load_settings();
      this.log_settings();

      $("#sync-text-inputs-checkbox").prop("checked", this.is_sync_text_inputs);
      $("#reset-on-url-opened-checkbox").prop("checked", this.is_reset_on_url_opened);

    },

    load_settings: function () {
      for (var field_name in _fields) {
        var field = _fields[field_name];
        var value = localStorage.getItem(field_name);
        if (field.type === "boolean") {
          value = value && value === "true" ? true : false;
        }
        this[field_name] = value;
      }
    },

    log_settings: function () {
      console.log("Settings:");
      for (var field_name in _fields) {
        console.log("{0} -> {1}".format(field_name, this[field_name]));
      }
    },

    set: function (field_name, value) {
      if (!this.hasOwnProperty(field_name)) {
        console.error("No field [{0}] in settings".format(field_name));
      }

      localStorage.setItem(field_name, value);
      this[field_name] = value;
    },

  }
  return obj;
})();

myurl.home_page = {
  text_inputs: [],
  add_smart_url: function(smart_url) {
    var container = $('#my-urls-container');

    var form = $(
      '<form id="{0}" role="form" class="form-horizontal"></form>'.format(
        smart_url.name
      )
    ).attr('smart-url-id', smart_url.id);

    var form_group = $('<div class="form-group"></div>');
    form.append(form_group);

    var input_wrapper = $('<div class="col-xs-4 col-md-2"></div>');
    var text_input_id = smart_url['name'] + "_input";
    var text_input = $(
      '<input type="text" name="{0}" id="{0}" class="form-control" />'.format(
        text_input_id
      )
    );
    text_input.keyup(
      function (e) {
        if (e.keyCode === 27) {
          // escape key is pressed
          $(this).val("");
        }

        if (myurl.settings.is_sync_text_inputs) {
          // Iterate through all text input elements
          // Note that text_inputs is defined at the beginning of
          // setup_components function, so it containx all text input elements
          // when the following code runs.
          var text_value = this.value;
          for (var j = 0; j < myurl.home_page.text_inputs.length; j++) {
            myurl.home_page.text_inputs[j].val(text_value);
          }
        }
      }
    );

    myurl.home_page.text_inputs.push(text_input);
    input_wrapper.append(text_input);
    form_group.append(input_wrapper);

    var redirect_func = (function(my_smart_url, my_text_input) {
      return function (e) {
        e.preventDefault();
        var input_value = encodeURIComponent(my_text_input.val());
        var url = my_smart_url['url'].replace('%s', input_value);
        console.log("Going to " + url);
        window.open(url, "_blank");

        if (myurl.settings.is_reset_on_url_opened) {
          my_text_input.val("");
          my_text_input.trigger("keyup");
        }
        my_text_input.focus();
      };
    })(smart_url, text_input);

    var submit_button_wrapper = $('<div class="col-xs-8 col-md-4"></div>');
    var submit_button = $(
      '<button type="submit" class="btn btn-default">{0}</button>'.format(
        smart_url['name']
      )
    );
    submit_button.click(redirect_func);

    submit_button_wrapper.append(submit_button);
    form_group.append(submit_button_wrapper);

    container.append(form);
  },

  remove_smart_url: function(id) {
    $('#my-urls-container form').each(function(index, form_item) {
      if ($(form_item).attr('smart-url-id') === id) {
        $(form_item).remove();
      }
    });
  }
}

myurl.config_url_page = {
  add_smart_url: function(smart_url) {
    var list_item = $("<li></li>");
    list_item.append($('<input type="checkbox" class="smart-url-item" />').attr('smart-url-id', smart_url.id)).attr('smart-url-id', smart_url.id);
    list_item.append(" " + smart_url.name);
    $("#edit-smart-urls-list").append(list_item);
  },

  remove_smart_url: function(id) {
    $('#edit-smart-urls-list li').each(function(index, list_item) {
      if ($(list_item).attr('smart-url-id') === id) {
        $(list_item).remove();
      }
    });
  }
}


function ends_with(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}


function setup_components() {
  myurl.init();
  // Handle hashes and tabs properly

  var hash = window.location.hash;
  if (hash) {
    var body_loc = $('body').scrollTop();
    $('ul.nav a[href="' + hash + '"]').tab('show');
    // It's a bug in chrome with bootstrap css that scrollTop(0) does not
    // work properly if run in $(document).ready, so use a timeout for it.
    window.setTimeout(
      function() {
        $(window).scrollTop(body_loc);
      },
      0
    );
  }

  // Makes every click on a tab changing the hash
  $('.nav-pills a').click(function (e) {
    $(this).tab('show');
    var body_loc = $('body').scrollTop();
    window.location.hash = this.hash;
    $('html,body').scrollTop(body_loc);
  });

  myurl.repo.init(
    function () {
      // Set up the "Home" page
      var smart_urls = myurl.get_all_smart_urls();

      for (var i = 0; i < smart_urls.length; i++) {
        var smart_url = smart_urls[i];
        myurl.home_page.add_smart_url(smart_url);
      }

      // Set up the "Config URLs" page

      // delete smart urls section
      for (var i = 0; i < smart_urls.length; i++) {
        var smart_url = smart_urls[i];
        myurl.config_url_page.add_smart_url(smart_url);
      }

      $("#check-all-smart-urls-checkbox").click(
        function (e) {
          var is_checked = $(e.target).is(':checked');
          $("#edit-smart-urls-list .smart-url-item").each(
            function (index, item) {
              $(item).prop('checked', is_checked);
            }
          );
        }
      );

      $("#delete-checked-smart-urls-button").click(
        function () {
          $("#confirm-delete-checked-smart-urls-dialog").dialog({
            dialogClass: "no-close",
            resizable: false,
            modal: true,
            buttons: {
              Yes: function() {
                $("#edit-smart-urls-list .smart-url-item").each(
                  function (index, item) {
                    if($(item).is(':checked')) {
                      myurl.remove_smart_url($(item).attr('smart-url-id'));
                    }
                  }
                );
                $(this).dialog("close");
              },
              No: function() {
                $(this).dialog("close");
              }
            }
          });
        }
      )

      // add smart url section
      $("#add-smart-url-submit-button").click(
        function (e) {
          e.preventDefault();
          var name = $("#add-smart-url-name-text-input").val();
          var url = $("#add-smart-url-url-text-input").val();

          myurl.add_smart_url(
            {
              name: name,
              url: url,
            }
          );
          $("#add-smart-url-name-text-input").val('');
          $("#add-smart-url-url-text-input").val('');
        }
      );

      // export smart urls section
      $('#export-smart-urls-button').click(
        function(e) {
          e.preventDefault();
          var smart_urls_json = JSON.stringify(
            myurl.get_all_smart_urls(),
            null,
            2
          );

          $('#import-export-textarea').val(smart_urls_json);
        }
      );

      // import smart urls section
      $('#import-smart-urls-button').click(
        function(e) {
          e.preventDefault();
          var smart_urls = myurl.save_parse_json($('#import-export-textarea').val());
          if (smart_urls === null) {
            return;
          }
          for (var i = 0; i < smart_urls.length; i++) {
            var smart_url = smart_urls[i];
            var isValid = true;
            ['name', 'url'].forEach(
              function(fieldName) {
                if (!smart_url.hasOwnProperty(fieldName)) {
                  toast.show(
                    'Invalid smart url',
                    "{0} is not a valid smart url: {1} field is missing".format(
                      JSON.stringify(smart_url),
                      fieldName
                    ),
                    toast.WARNING
                  );
                  isValid = false;
                }
              }
            );

            if (isValid) {
              myurl.add_smart_url(smart_url);
            }
          }
        }
      );

      // download smart urls seciton
      $('#download-smart-urls-button').click(
        function(e) {
          e.preventDefault();
          var smart_urls_json = JSON.stringify(
            myurl.get_all_smart_urls(),
            null,
            2
          );
          myurl.download_json(smart_urls_json, "smart_urls.json");
        }
      );
    }
  );

  // Set up the "Settings" page
  $("#sync-text-inputs-checkbox").change(
    function () {
      myurl.settings.set('is_sync_text_inputs', this.checked);
    }
  );
  $("#reset-on-url-opened-checkbox").change(
    function () {
      myurl.settings.set('is_reset_on_url_opened', this.checked);
    }
  );
}


$(document).ready(setup_components);
