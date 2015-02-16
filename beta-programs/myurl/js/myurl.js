function ends_with(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function setup_components() {
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
  var container = document.getElementById('my_urls_container');

  for (var i = 0; i < smart_urls.length; i++) {
    var smart_url = smart_urls[i];
    var f = document.createElement('form');
    if (smart_url['is_hidden'] && !hide_admin_urls) {
      console.log('Not revealing "' + smart_url['name'] + '"');
      continue;
    }
    f.setAttribute('id', smart_url['name']);

    var input_ele = document.createElement('input');
    var input_ele_id = smart_url['name'] + "_input";
    input_ele.setAttribute('type', 'text');
    input_ele.setAttribute('name', input_ele_id);
    input_ele.setAttribute('id', input_ele_id);
    input_ele.setAttribute('size', 20);

    f.appendChild(input_ele);

    var submit_ele = document.createElement('input');
    submit_ele.setAttribute('type', 'submit');
    submit_ele.setAttribute('value', smart_url['name']);

    submit_ele.onclick = (function(my_smart_url, my_input_ele) {
      return function (e) {
        var input_value = encodeURIComponent(my_input_ele.value);
        var url = my_smart_url['url'].replace('%s', input_value);
        console.log("Going to " + url);
        window.location.href = url;
        return false;
      };
    })(smart_url, input_ele);

    f.appendChild(submit_ele);

    var link_ele = document.createElement('a');
    link_ele.href = "#";

    var link_text_node = document.createTextNode(smart_url['name']);
    link_ele.appendChild(link_text_node);

    link_ele.onclick = (function(my_link_ele, my_smart_url, my_input_ele) {
      return function (e) {
        // set the href of the anchor
        var input_value = encodeURIComponent(my_input_ele.value);
        var url = my_smart_url['url'].replace('%s', input_value);
        console.log("Going to " + url);
        my_link_ele.href = url;

        // clear the input value, so we can easily type another one and
        // click the link again
        my_input_ele.value = '';
        my_input_ele.focus();
        return true;
      };
    })(link_ele, smart_url, input_ele);


    f.appendChild(link_ele);

    container.appendChild(f);
  }
}

$(document).ready(setup_components);
