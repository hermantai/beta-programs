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


function numbers_text_to_numbers(numbers_text) {
  var potential_numbers = parse_potential_numbers(numbers_text);
  var numbers = extract_numbers(potential_numbers);
  return numbers;
}


function parse_potential_numbers(numbers_text) {
  var ar = [];
  var s = "";

  for (var i = 0; i < numbers_text.length; i++) {
    var c = numbers_text.charAt(i);
    if (is_number_component(c)) {
      s += c;
    } else {
      ar.push(s);
      s = "";
    }
  }

  if (s !== "") {
    ar.push(s);
  }

  return ar;
}


function extract_numbers(potential_numbers) {
  var nums = [];

  for (var i = 0; i < potential_numbers.length; i++) {
    var pn = potential_numbers[i];
    var sign = 1;

    // first, handle negative sign
    if (pn.charAt(0) === '-') {
      sign = -1;
      pn = pn.slice(1);

      if (pn === "") {
        continue;
      }
    }

    // second, handle hyphens in between digits
    var numbers_without_dashes = pn.split('-').filter(
      function (s) {return s !== ""}
    );

    // finally, hanlde the dots in between numbers (because a leading dot and
    // a trailing dot is ok)
    var cleaned_nums = handle_dots(numbers_without_dashes).map(parseFloat);

    if (cleaned_nums.length >= 1) {
      nums.push(cleaned_nums[0] * sign);
      nums.push.apply(nums, cleaned_nums.slice(1));
    }
  }

  return nums.map(parseFloat);
}


function handle_dots(numbers_without_dashes) {
  var nums = [];

  for (var i = 0; i < numbers_without_dashes.length; i++) {
    var n_without_dashes = numbers_without_dashes[i];
    var matched_with_dots = n_without_dashes.match(/\./g);
    if (matched_with_dots && matched_with_dots.length > 1) {
      var pure_numbers = n_without_dashes.split('.');
      for (var j = 0; j < pure_numbers.length; j++) {
        if (pure_numbers[j] !== "") {
          nums.push(pure_numbers[j]);
        }
      }
    } else {
      nums.push(n_without_dashes);
    }
  }

  return nums;
}


var is_number_component = (function() {
  var re = /^\d|\.|-$/;
  return function(c) {
    return re.test(c);
  }
}());


function bang_numbers(numbers, container) {
  console.log(numbers);

  var html = html_for_table_with_num_columns_equal_numbers_len(numbers);
  html += "<hr />\n";
  html += html_for_table_with_more_columns_than_numbers_len(numbers);
  container.html(html);

  $(function () {
    $('[data-toggle="popover"]').popover()
  })
}


function html_for_table_with_num_columns_equal_numbers_len(numbers) {
  var html = '<table class="table table-bordered table-striped table-condensed">\n';

  var indices = [];
  for (var i = 0; i < numbers.length; i++) {
    indices.push(i + 1);
  }

  html += "<thead>\n";
  html += make_table_row_html("Index", indices);
  html += "</thead>\n";

  html += "<tbody>\n";
  html += make_table_row_html("Number", numbers, "The numbers parsed.");
  var acc_sum_help = "Accumulated sums. 1st column is the 1st number;"
    + " 2nd column is the sum of 1st and 2nd numbers;"
    + " 3rd column is the sum of 1st to 3rd numbers, etc.";
  html += make_table_row_html(
    "Acc. Sum",
    get_accumulated_sums(numbers),
    acc_sum_help
  );
  html += make_table_row_html(
    "AccDiffs to 1st",
    get_accumulated_diffs_to_1st_number(numbers),
    "Accumulated differences to the 1st number"
  );
  html += make_table_row_html("Product", get_product(numbers));
  html += make_table_row_html("Quotient", get_quotient(numbers));
  html += make_table_row_html("Power", get_power(numbers));
  html += make_table_row_html("Diff.", get_differences(numbers));
  html += make_table_row_html(
    "Frac. of 1st",
    get_fractions_of_1st_number(numbers),
    "Fractions of the 1st number"
  );
  html += make_table_row_html("Growth.", get_growths(numbers));
  html += make_table_row_html(
    "Comp. Growth", get_compounded_growths(numbers)
  );
  html += make_table_row_html(
    "Avg. Growth",
    get_average_growths(numbers)
  );
  var mortgage_payment_help = "Mortgage payment using the first three numbers"
    + " to represent 1) principle; 2) APR in fraction; 3) number of years.";
  html += make_table_row_html(
    "Mort. PMT",
    get_mortgage_payment(numbers),
    mortgage_payment_help
  );

  var mortgage_principle_help = "Mortgage principle using the first three numbers"
    + " to represent 1) monthly payment; 2) APR in fraction; 3) number of years.";
  html += make_table_row_html(
    "Mort. Principle",
    get_mortgage_principle(numbers),
    mortgage_principle_help
  );

  html += "</tbody>\n";
  html += '</table>\n';

  return html;
}


function html_for_table_with_more_columns_than_numbers_len(numbers) {
  var html = '<table class="table table-bordered table-striped table-condensed">\n';

  var indices = [];
  for (var i = 0; i < numbers.length; i++) {
    indices.push(i + 1);
  }

  html += "<thead>\n";
  html += make_table_row_html("Index", indices);
  html += "</thead>\n";

  html += "<tbody>\n";

  html += make_table_row_html("Number", numbers, "The numbers parsed.");
  html += make_table_row_html(
    "Proj.<br/>Numbers",
    get_projected_numbers(numbers)
  );
  html += make_table_row_html(
    "Geo.<br/>Series",
    get_geometric_series(numbers)
  );
  html += make_table_row_html(
    "Geo. S.<br/>Sum",
    get_geometric_series_sum(numbers)
  );

  html += "</tbody>\n";
  html += '</table>\n';

  return html;
}


function make_table_row_html(header, items, header_popover_text) {
  var header_id_html = header_popover_text
    ? ' data-toggle="popover" title="{0}"'.format(header_popover_text)
    : "";

  var row_html = '<tr><th{0}>{1}</th>'.format(header_id_html, header);
  for (var i = 0; i < items.length; i++) {
    if (items[i] === "") {
      var str = "";
    } else {
      // make sure we have at most 4 decimal places and trailing zeros are
      // removed by parseFloat
      var str = parseFloat(items[i].toFixed(4)).toLocaleString();
    }
    row_html += "<td>" + str + "</td>";
  }
  row_html += "</tr>";
  return row_html;
}


function get_accumulated_sums(numbers) {
  var sums = [];
  var sum = 0;
  for (var i = 0; i < numbers.length; i++) {
    sum += numbers[i];
    sums.push(sum);
  }
  return sums;
}


function get_accumulated_diffs_to_1st_number(numbers) {
  var diffs = [];
  if (!numbers) {
    return diffs;
  }

  var diff = numbers[0];
  diffs.push(diff);
  for (var i = 1; i < numbers.length; i++) {
    diff -= numbers[i];
    diffs.push(diff);
  }
  return diffs;
}


function get_product(numbers) {
  return get_two_numbers_operation_items(
    numbers,
    function (a, b) {return a * b}
  );
}


function get_quotient(numbers) {
  return get_two_numbers_operation_items(
    numbers,
    function (a, b) {return a / b}
  );
}


function get_power(numbers) {
  return get_two_numbers_operation_items(
    numbers,
    function (a, b) {return Math.pow(a, b);},
    // The result of power is generally big, so we only display it if there
    // are only two numbers
    true,
    function (a, b) {return Math.pow(a, b) < Math.pow(10, 20);}
  );
}


function get_differences(numbers) {
  var diffs = [""]; // Only get the difference starting from the second number
  for (var i = 1; i < numbers.length; i++) {
    diffs.push(numbers[i] - numbers[i - 1]);
  }
  return diffs;
}


function get_fractions_of_1st_number(numbers) {
  var fractions = [];

  if (numbers.length >= 1) {
    fractions.push(1);
  }
  for (var i = 1; i < numbers.length; i++) {
    fractions.push(numbers[i] / numbers[0]);
  }
  return fractions;
}


function get_growths(numbers) {
  var fracs = [""]; // Only get the growth starting from the second number
  for (var i = 1; i < numbers.length; i++) {
    fracs.push((numbers[i] - numbers[i - 1]) / numbers[i]);
  }
  return fracs;
}


function get_compounded_growths(numbers) {
  var growths = [];

  if (numbers.length >= 1) {
    growths.push("");  // Compounded growth with one number does not make sense

    for (var i = 1; i < numbers.length; i++) {
      growths.push(
        Math.pow(numbers[i] / numbers[0], 1 / i) - 1
      );
    }
  }

  return growths;
}


function get_average_growths(numbers) {
  var avg_growths = [];
  var growths = [];

  if (numbers.length >= 1) {
    avg_growths.push("");  // Average growth with one number does not make sense

    for (var i = 1; i < numbers.length; i++) {
      growths.push(
        ((numbers[i] - numbers[i - 1])/ numbers[i - 1])
      );

      // divide the sum by the number of growths is the average growth
      avg_growths.push(
        growths.reduce(function (a, b) {return a + b;}, 0) / growths.length
      );
    }
  }

  return avg_growths;
}


/**
 * Only apply to the case that numbers has only three numbers and the third
 * number value is: 0 <= number <= 20. Otherwise, an array of numbers.length
 * empty strings is returned.
 *
 * Assume the first number is the base and the second number is the growth
 * rate. The third number is the number of times the growth is multiplied to
 * the base.
 **/
function get_projected_numbers(numbers) {
  if (numbers.length === 3 && numbers[2] >= 0 && numbers[2] <= 20) {
    var num = numbers[0];
    var growth = numbers[1];
    var n = Math.floor(numbers[2]);

    var items = [];

    for (var i = 0; i < n + 1; i++) {
      items.push(num);
      num *= (1 + growth);
    }
  } else {
    var items = create_array_with_repeated_items("", numbers.length);
  }

  return items;
}


/**
 * Only apply to the case that there are three numbers in the given
 * numbers array. Otherwise, an array of numbers.length empty strings is
 * returned.
 *
 * The three number are:
 * Principle, annual interest rate in fraction, number of years
 *
 * Because a mortgage payment is just one value, the returned array from this
 * function always has numbers.length items with the third position being the
 * payment , while the rest are empty strings.
 *
 * NPER = Years * 12
 * rate = interest rate in fraction / 12
 *
 * If rate is not 0
 * ----------------
 * PMT = P * (1 + rate)^N / (((1 + rate)^N - 1) / rate)
 *
 * If rate = 0
 * -----------
 * PMT = P / NPER
 *
 * (PMT*NPER)+PV = 0
 **/
function get_mortgage_payment(numbers) {
  var items = create_array_with_repeated_items("", numbers.length);

  if (numbers.length == 3) {
    var p = numbers[0];
    var rate = numbers[1] / 12;
    var n = numbers[2] * 12;

    if (rate === 0) {
      var payment = p / n;
    } else {
      var payment = p * Math.pow(1 + rate, n) / ((Math.pow(1 + rate, n) - 1) / rate);
    }

    items[2] = payment;
  }

  return items;
}


/**
 * Only apply to the case that there are three numbers in the given
 * numbers array. Otherwise, an array of numbers.length empty strings is
 * returned.
 *
 * The three number are:
 * Monthly payment, annual interest rate in fraction, number of years
 *
 * Because a mortgage principle is just one value, the returned array from this
 * function always has numbers.length items with the third position being the
 * payment , while the rest are empty strings.
 *
 * NPER = Years * 12
 * rate = interest rate in fraction / 12
 *
 * If rate is not 0
 * ----------------
 * P = PMT / ((1 + rate)^N / (((1 + rate)^N - 1) / rate))
 *
 * If rate = 0
 * -----------
 * P = PMT * NPER
 **/
function get_mortgage_principle(numbers) {
  var items = create_array_with_repeated_items("", numbers.length);

  if (numbers.length == 3) {
    var payment = numbers[0];
    var rate = numbers[1] / 12;
    var n = numbers[2] * 12;

    if (rate === 0) {
      var p = payment * n;
    } else {
      var p = payment / (Math.pow(1 + rate, n) / ((Math.pow(1 + rate, n) - 1) / rate));
    }

    items[2] = p;
  }

  return items;
}


/**
 * Only apply to the case that there are three numbers in the given numbers
 * array with the third number is a positive integer at most 30.
 *
 * The three numbers are:
 * A, rate and n. The result is an array with the following numbers:
 * [A, A * rate, A * rate**2, A * rate**3,...A * rate**n]
 **/
function get_geometric_series(numbers) {
  var nums = create_array_with_repeated_items("", numbers.length);

  if (numbers.length == 3 && numbers[2] >= 0 && numbers[2] <= 30) {
    nums = [];
    var a = numbers[0];
    var r = numbers[1];
    var n = Math.floor(numbers[2]);
    for (var i = 0; i < n; i++) {
      nums.push(a * Math.pow(r, i));
    }
  }
  return nums;
}


/**
 * Only apply to the case that there are three numbers in the given numbers
 * array with the third number is a positive integer at most 30 and the geo
 * metric series sum does not exceed 10^20.
 *
 * The three numbers are:
 * A, rate and n. The result is an array with the same length as the given
 * numbers array, with all values being "", except that the first value S is:
 * S = A * (1 + rate + rate ** 2 + ... + rate ** n)
 **/
function get_geometric_series_sum(numbers) {
  var nums = create_array_with_repeated_items("", numbers.length);

  if (numbers.length == 3 && numbers[2] >= 0 && numbers[2] <= 30) {
    var sum = 0;
    var a = numbers[0];
    var r = numbers[1];
    var n = Math.floor(numbers[2]);

    for (var i = 0; i < n; i++) {
      sum += a * Math.pow(r, i);
    }

    if (sum < Math.pow(10, 20)) {
      // we only want to display the result if the number is not that large
      nums[2] = sum;
    }
  }

  return nums;
}


/**
 * Given an array of numbers, return an array of items with the same length
 * such that if the given array has at least two numbers, the second item in
 * the returned array is the result of applying the binary_func to the first
 * two numbers of the given array.
 *
 * If two_numbers_only is true, the second item is set to result of
 * binary_func only if the length of numbers is 2
 *
 * two_numbers_filter is a function that takes two numbers and returns true or
 * false. If it returns false, the result is an empty string instead of using
 * binary_func.
 **/
function get_two_numbers_operation_items(numbers, binary_func, two_numbers_only, two_numbers_filter) {
  var items = create_array_with_repeated_items("", numbers.length);

  if (
    numbers.length >= 2 && (
      !two_numbers_filter || two_numbers_filter(numbers[0], numbers[1])
    )
  ) {
    if (numbers.length === 2 || !two_numbers_only) {
      items[1] = binary_func(numbers[0], numbers[1]);
    }
  }

  return items;
}


function create_array_with_repeated_items(item, num) {
  var ar = []
  for (var i = 0; i < num; i++) {
    ar.push(item);
  }
  return ar;
}


function evaluate_free_form_text(free_form_text_input, output) {
  output.removeClass("alert-success");
  output.removeClass("alert-danger");
  try {
    var val = calculator_parser.parse(free_form_text_input.val());
    output.empty();
    output.addClass("alert-success");
    output.append(val);
  } catch (ex) {
    output.empty();
    output.addClass("alert-danger");
    output.append(ex);
  }
}


// The reason that we want to run the window.onload function only if the
// #numbers-text element exists is that this file maybe loaded by jasmine,
// which does not have the html element.
(function(){
  var numbers_text_input = $("#numbers-text-input");
  if (!numbers_text_input) {
    console.log("No #numbers-text element");
    return;
  }

  $(document).ready(
    function () {
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

      // Initialize the Home page components

      var process_func = function() {
        var numbers = numbers_text_to_numbers(numbers_text_input.val());
        bang_numbers(numbers, $("#output-div"));
      }

      numbers_text_input.keypress(
        function (e) {
          if (e.keyCode === 13) {
            // enter key is pressed
            e.preventDefault();
            process_func();
          }
        }
      );

      numbers_text_input.keyup(
        function (e) {
          if (e.keyCode === 27) {
            // escape key is pressed
            e.preventDefault();
            $(this).val("");
          }
        }
      );

      $("#bang-button").click(
        function (e) {
          e.preventDefault();
          process_func();
        }
      );

      $("#clear-button").click(
        function(e) {
          e.preventDefault();
          numbers_text_input.val("");
        }
      );

      numbers_text_input.focus();

      // Initialize the Free Form page

      var free_form_text_input = $("#free-form-text-input");
      free_form_text_input.keyup(
        function (e) {
          if (e.keyCode === 27) {
            // escape key is pressed
            e.preventDefault();
            $(this).val("");
          }
        }
      );

      $("#evaluate-button").click(
        function (e) {
          e.preventDefault();
          evaluate_free_form_text(
            free_form_text_input,
            $("#free-form-result-output")
          );

        }
      );
    }
  );
})();
