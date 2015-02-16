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


var myurl = {
  settings: {
    _fields: {
      "is_sync_text_inputs": {
        type: "boolean"
      }
    },

    init: function () {
      this.load_settings();
      this.log_settings();

      $("#sync-text-inputs-checkbox").prop("checked", this.is_sync_text_inputs);
    },

    load_settings: function () {
      for (var field_name in this._fields) {
        var field = this._fields[field_name];
        var value = localStorage.getItem(field_name);
        if (field.type === "boolean") {
          value = value && value === "true" ? true : false;
        }
        this[field_name] = value;
      }
    },

    log_settings: function () {
      console.log("Settings:");
      for (var field_name in this._fields) {
        console.log("{0} -> {1}".format(field_name, this[field_name]));
      }
    },

    set: function (field_name, value) {
      if (!this.hasOwnProperty(field_name)) {
        console.error("No field [{0}] in settings".format(field_name));
      }

      localStorage.setItem(field_name, value);
      this[field_name] = value;
    }
  }
};


function ends_with(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}


function setup_components() {
  // Set up the "Home" page

  var smart_urls = [
    {
      'name': 'Finance Yahoo',
      'url': 'http://finance.yahoo.com/q?s=%s&ql=1',
    },
    {
      'name': 'Finance Yahoo message board',
      'url': 'http://finance.yahoo.com/mb/%s/',
    },
    {
      'name': 'Google Finance',
      'url': 'https://www.google.com/finance?q=%s',
    },
    {
      'name': 'Euros in USD',
      'url': 'https://www.google.com/#q=%s+eur+in+usd&safe=off',
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
      'name': 'USD in CNY',
      'url': 'https://www.google.com/#q=%s+usd+in+cny&safe=off',
    },
    {
      'name': 'CNY in USD',
      'url': 'https://www.google.com/#q=%s+cny+in+usd&safe=off',
    },
  ];

  var hide_admin_urls = ends_with(window.location.href, "?reveal_all=true");
  var container = $('#my-urls-container');
  var text_input_elements = [];

  for (var i = 0; i < smart_urls.length; i++) {
    var smart_url = smart_urls[i];
    if (smart_url['is_hidden'] && !hide_admin_urls) {
      console.log('Not revealing "' + smart_url['name'] + '"');
      continue;
    }

    var form = $(
      '<form id="{0}" role="form" class="form-inline"></form>'.format(
        smart_url['name']
      )
    );

    var form_group = $('<div class="form-group"></div>');
    form.append(form_group);

    var input_element_id = smart_url['name'] + "_input";
    var input_element = $(
      '<input type="text" name="{0}" id="{0}" class="form-control" />'.format(
        input_element_id
      )
    );
    input_element.keyup(
      function () {
        if (myurl.settings.is_sync_text_inputs) {
          // Iterate through all text input elements
          // Note that text_input_elements is defined at the beginning of
          // setup_components function, so it containx all text input elements
          // when the following code runs.
          var text_value = this.value;
          for (var j = 0; j < text_input_elements.length; j++) {
            text_input_elements[j].val(text_value);
          }
        }
      }
    );

    text_input_elements.push(input_element);
    form_group.append(input_element);

    var redirect_func = (function(my_smart_url, my_input_element) {
      return function (e) {
        e.preventDefault();
        var input_value = encodeURIComponent(my_input_element.val());
        var url = my_smart_url['url'].replace('%s', input_value);
        console.log("Going to " + url);
        window.open(url, "_blank");
        my_input_element.focus();
      };
    })(smart_url, input_element);

    var redirect_link = $(
      '<a href="#">{0}</a>'.format(smart_url['name'])
    );
    redirect_link.click(redirect_func);
    form_group.append(redirect_link);

    var submit_element = $(
      '<button type="submit" class="btn btn-default">{0}</button>'.format(smart_url['name'])
    );
    submit_element.click(redirect_func);
    form_group.append(submit_element);

    container.append(form);
  }

  // Set up the "Settings" page
  myurl.settings.init();

  $("#sync-text-inputs-checkbox").change(
    function () {
      myurl.settings.set('is_sync_text_inputs', this.checked);
    }
  );
}


$(document).ready(setup_components);
