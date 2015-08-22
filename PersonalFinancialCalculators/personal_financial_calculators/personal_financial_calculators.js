if (personalFinancialCalculators === undefined) {
  var personalFinancialCalculators = {}
}

personalFinancialCalculators.isNaN = function (value, name) {
    if(isNaN(value)){
      alert(name + " has to be a number: " + value);
      return true;
    }
    return false;
};

personalFinancialCalculators.isInt = function (value, name) {
  if(isNaN(value) || parseInt(value) != value){
    alert(name + " has to be an integer: " + value);
    return false;
  }
  return true;
};

personalFinancialCalculators.isPositive = function (value, name) {
  if(isNaN(value) || parseFloat(value) < 0){
    alert(name + " has to be a positive number: " + value);
    return false;
  }
  return true;
};

personalFinancialCalculators.toCurrency = function (num) {
  return num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
};

personalFinancialCalculators.setStatusMessage= function (msg) {
  $('#status-console').html(msg);
}

/**
 * Saving Calculator
 **/

personalFinancialCalculators.validateSaving = function (
  principal,
  deposit,
  annualReturn,
  years
) {
  if (this.isNaN(principal, "Initial principal")) {
    return false;
  }
  if (this.isNaN(deposit, "Annual deposit")) {
    return false;
  }
  if (this.isNaN(annualReturn, "Annual return")) {
    return false;
  }
  if (!this.isInt(years, "Number of years")) {
    return false;
  }
  if (!this.isPositive(years, "Number of years")) {
    return false;
  }
  return true;
};

personalFinancialCalculators.calculateSaving = function (
  initial,
  // put at the beginning of each month after the first month
  deposit,
  annualReturn,  // in %
  years
) {
  // monthly return
  var r = annualReturn / (12 * 100.0);
  var z = 1 + r;
  var p = years * 12;

  var finalAmountForInitial = initial * Math.pow(z, p);

  // Geometric series
  // S = ar + ar^2 ... ar^n
  // S = ar( (r^n - 1) / (r - 1) )
  // Notice that there is no first month deposit, so we use p -1 for n
  // Need to take care of special case when interest rate is 0 and the number
  // of years is 0
  var finalAmountForMonthlyDeposits;
  if (years === 0) {
    finalAmountForMonthlyDeposits = 0;
  } else if (z === 1) {
    finalAmountForMonthlyDeposits = deposit * (p - 1);
  } else {
    finalAmountForMonthlyDeposits = deposit * z *
      ((Math.pow(z, p - 1) - 1) / (z - 1));
  }

  return finalAmountForInitial + finalAmountForMonthlyDeposits;
};

$(document).ready(
  function () {
    $('#saving-calculator-calculate').click(
      function (e) {
        e.preventDefault();

        // Clear the result first
        $('#saving-calculator-amount').val("");

        // Get the inputs then calculate the result

        var principal = $('#saving-calculator-principal').val();
        var deposit = $('#saving-calculator-deposit').val();
        var annualReturn = $('#saving-calculator-return').val();
        var years = $('#saving-calculator-years').val();

        if (
          personalFinancialCalculators.validateSaving(
            principal,
            deposit,
            annualReturn,
            years
          )
        ) {
          $('#saving-calculator-amount').val(
            personalFinancialCalculators.toCurrency(
              personalFinancialCalculators.calculateSaving(
                parseFloat(principal),
                parseFloat(deposit),
                parseFloat(annualReturn),
                parseFloat(years)
              )
            )
          );
        }
      }
    );
  }
);

/**
 * end of Saving Calculator
 **/

/**
 * Mortgage Payment Calculator
 **/
personalFinancialCalculators.validateMortgagePayment = function (
  principal,
  years,
  rate
) {
  if(this.isNaN(principal, "Mortgage principal")){
    return false;
  }
  if(this.isNaN(rate, "Annual interest rate")){
    return false;
  }
  if(!this.isInt(years, "Number of years")){
    return false;
  }
  if(!this.isPositive(years, "Number of years")){
    return false;
  }
  return true;
};

personalFinancialCalculators.calculateMortgagePayment = function (
  principal,
  years,
  rate  // annual interest rate, APR
) {
  var p = years * 12;
  var rate = rate / 100.0;
  var monthlyRate = rate / 12.0

  // special case
  if(monthlyRate === 0){
    return principal / p;
  }
  z = 1 + monthlyRate;

  pmt = principal * Math.pow(z, p) * (z - 1) / (Math.pow(z, p) - 1);
  return pmt;
};

$(document).ready(
  function () {
    $('#mortgage-payment-calculator-calculate').click(
      function (e) {
        e.preventDefault();

        // Clear the result first
        $('#mortgage-payment-calculator-payment').val("");

        // Get the inputs then calculate the result
        var principal = $('#mortgage-payment-calculator-principal').val();
        var years = $('#mortgage-payment-calculator-years').val();
        var rate = $('#mortgage-payment-calculator-rate').val();

        if (
          personalFinancialCalculators.validateMortgagePayment(
            principal,
            years,
            rate
          )
        ) {
          $('#mortgage-payment-calculator-payment').val(
            personalFinancialCalculators.toCurrency(
              personalFinancialCalculators.calculateMortgagePayment(
                parseFloat(principal),
                parseFloat(years),
                parseFloat(rate)
              )
            )
          );
        }
      }
    );
  }
);

/**
 * end of Mortgage Payment Calculator
 **/

/**
 * Monthly Contribution Calculator
 **/
personalFinancialCalculators.validateMonthlyContribution = function (
  target,
  years,
  rate
) {
  if(this.isNaN(target, "Target amount")){
    return false;
  }
  if(this.isNaN(rate, "Annual return")){
    return false;
  }
  if(!this.isInt(years, "Number of years")){
    return false;
  }
  if(!this.isPositive(years, "Number of years")){
    return false;
  }
  return true;
};

personalFinancialCalculators.calculateMonthlyContribution = function (
  target,
  years,
  rate  // annual interest rate, APR
) {
  if(years <= 0){
    if(target === 0){
      return 0;
    } else {
      return -1;
    }
  }

  var p = years * 12;

  if(rate === 0){
      return target / p;
  }

  rate /= 12 * 100.0;
  var top = target * (1.0 - 1.0 / (1.0 + rate));
  var bottom = Math.pow((1.0 + rate), p) - 1.0;
  return top / bottom;
};

$(document).ready(
  function () {
    $('#monthly-contribution-calculator-calculate').click(
      function (e) {
        e.preventDefault();

        // Clear the result first
        $('#monthly-contribution-calculator-contribution').val("");

        // Get the inputs then calculate the result
        var target = $('#monthly-contribution-calculator-target').val();
        var years = $('#monthly-contribution-calculator-years').val();
        var rate = $('#monthly-contribution-calculator-rate').val();

        if (
          personalFinancialCalculators.validateMonthlyContribution(
            target,
            years,
            rate
          )
        ) {
          $('#monthly-contribution-calculator-contribution').val(
            personalFinancialCalculators.toCurrency(
              personalFinancialCalculators.calculateMonthlyContribution(
                parseFloat(target),
                parseFloat(years),
                parseFloat(rate)
              )
            )
          );
        }
      }
    );
  }
);

/**
 * end of Monthly Contribution Calculator
 **/

/**
 * Net Present Value (NPV) Calculator
 **/
personalFinancialCalculators.validateNPV = function (
  payment,
  numOfPayments,
  rate
) {
  if(this.isNaN(payment, "Payment")){
    return false;
  }
  if(!this.isInt(numOfPayments, "Number of payments")){
    return false;
  }
  if(!this.isPositive(numOfPayments, "Number of payments")){
    return false;
  }
  if(this.isNaN(rate, "Discount rate")){
    return false;
  }
  return true;
};

personalFinancialCalculators.calculateNPV = function (
  payment,
  numOfPayments,
  rate  // discount rate for each period
) {
  if (rate === 0) {
    return payment * numOfPayments;
  }

  // S = ar + ar^2 ... ar^n
  // S = ar( (r^n - 1) / (r - 1) )
  var z = 1 / (1 + rate / 100.0);
  var ans = payment * z * (Math.pow(z, numOfPayments) - 1) / (z - 1)

  return ans;
};

$(document).ready(
  function () {
    $('#npv-calculator-calculate').click(
      function (e) {
        e.preventDefault();

        // Clear the result first
        $('#npv-calculator-npv').val("");

        // Get the inputs then calculate the result
        var payment = $('#npv-calculator-payment').val();
        var num = $('#npv-calculator-num').val();
        var rate = $('#npv-calculator-rate').val();

        if (
          personalFinancialCalculators.validateNPV(
            payment,
            num,
            rate
          )
        ) {
          $('#npv-calculator-npv').val(
            personalFinancialCalculators.toCurrency(
              personalFinancialCalculators.calculateNPV(
                parseFloat(payment),
                parseFloat(num),
                parseFloat(rate)
              )
            )
          );
        }
      }
    );
  }
);

/**
 * end of NPV Calculator
 **/

/**
 * Loan Rate Calculator
 **/
personalFinancialCalculators.validateLoanRate = function (
  principal,
  years,
  monthlyPayment
) {
  if(this.isNaN(principal, "Principal")){
    return false;
  }
  if(!this.isInt(years, "Years")){
    return false;
  }
  if(!this.isPositive(years, "Years")){
    return false;
  }
  if(this.isNaN(monthlyPayment, "Monthly payment")){
    return false;
  }
  return true;
};

personalFinancialCalculators.calculateLoanRate = function (
  principal,
  years,
  monthlyPayment
) {
  var tolerance = 0.001;
  // only guess between -100% to 100%
  var minRate = -100;
  var maxRate = 100;
  var rate = 0;
  var est = this.calculateMortgagePayment(
    principal,
    years,
    rate
  );
  var diff = monthlyPayment - est;
  // only guess 100 times
  var guesses = 100;

  while (guesses > 0 && Math.abs(diff) > tolerance) {
    if (diff > 0) {
      // Guessed rate causes the payment to be less than the correct one,
      // that mean the rate is too low
      minRate = rate;
    } else {
      maxRate = rate;
    }

    rate = (minRate + maxRate) / 2;
    est = this.calculateMortgagePayment(
      principal,
      years,
      rate
    )

    diff = monthlyPayment - est;
    guesses -= 1;
  }

  if(Math.abs(diff) > tolerance) {
    // we cannot find the correct loan rate because we have guessed more than
    // "guesses" times and it's still out of the tolerance
    return null;
  }

  return rate;
};

$(document).ready(
  function () {
    $('#loan-rate-calculator-calculate').click(
      function (e) {
        e.preventDefault();

        // Clear the result first
        $('#loan-rate-calculator-loan-rate').val("");

        // Get the inputs then calculate the result
        var principal = $('#loan-rate-calculator-principal').val();
        var years = $('#loan-rate-calculator-years').val();
        var monthlyPayment = $('#loan-rate-calculator-monthly-payment').val();

        if (
          personalFinancialCalculators.validateLoanRate(
            principal,
            years,
            monthlyPayment
          )
        ) {
          var rate = personalFinancialCalculators.calculateLoanRate(
            parseFloat(principal),
            parseFloat(years),
            parseFloat(monthlyPayment)
          );

          var res = "N/A";
          if (rate !== null) {
            res = rate.toFixed(2);
          }
          $('#loan-rate-calculator-loan-rate').val(res);
        }
      }
    );
  }
);

/**
 * end of Loan Rate Calculator
 **/

/**
 * Mortgage amortization schedule
 **/
personalFinancialCalculators.validateMortgageAmortSchedule = function (
  principal,
  years,
  rate
) {
  if(this.isNaN(principal, "Mortgage principal")){
    return false;
  }
  if(this.isNaN(rate, "Annual interest rate")){
    return false;
  }
  if(!this.isInt(years, "Number of years")){
    return false;
  }
  if(!this.isPositive(years, "Number of years")){
    return false;
  }
  return true;
};

personalFinancialCalculators.calculateMortgageAmortSchedule = function (
  payment,
  numOfPayments,
  rate  // discount rate for each period
) {
  if (rate === 0) {
    return payment * numOfPayments;
  }

  // S = ar + ar^2 ... ar^n
  // S = ar( (r^n - 1) / (r - 1) )
  var z = 1 / (1 + rate / 100.0);
  var ans = payment * z * (Math.pow(z, numOfPayments) - 1) / (z - 1)

  return ans;
};

/**
 *
 * Using the formula from:
 * http://www.financeformulas.net/Remaining_Balance_Formula.html
 *
 * Remaining balance = Future value of original balance - Future value of
 * annuity
 *
 * P = principal, the initial amount of the loan
 * r = rate of the period (usually monthly rate for mortgages)
 * n = Number of periods (years * 12 for mortgages) for the original mortgage
 * t = Number of periods passed
 * z = 1 + r
 * a = monthly payment
 *
 * Future value of original balance = P * z^n
 * Future value of annuity = a * (z^t - 1) / (z - 1)
 *
 **/
personalFinancialCalculators.calculateRemainingMortgageBalance = function (
  principal,
  years,
  rate,  // annual interest rate, APR
  yearsPassed
) {
  var n = years * 12;
  var r = rate / 12.0 / 100.0;
  var t = yearsPassed * 12;
  var z = 1 + r;
  var a = this.calculateMortgagePayment(principal, years, rate);

  // special case
  if (r === 0) {
    return principal * (n - t) / n;
  }

  var futureValOfOriginalBalance = principal * Math.pow(z, t);
  var futureValOfAnnuity;
  if (r === 0) {
    futureValOfAnnuity = a * t;
  } else {
    futureValOfAnnuity = a * (Math.pow(z, t) - 1) / (z - 1);
  }

  return futureValOfOriginalBalance - futureValOfAnnuity;
}

personalFinancialCalculators.drawMortgageAmortSchedule = function (
  principal,
  years,
  rate
) {
  var tableHTML = '<table class="table-stripe">\n';
  var headers = [
    'Year',
    'Interest Paid',
    'Principal Paid',
    'Balance',
    '% of the original principal'
  ];

  tableHTML += '<thead><tr>\n';
  for (var i in headers) {
    tableHTML += '<th>' + headers[i] + '</th>';
  }
  tableHTML += '\n</tr></thead>\n';

  var payment = this.calculateMortgagePayment(
    principal,
    years,
    rate
  );

  //
  // gather every accumulated year data
  //

  // years + year 0 data
  var accumulatedData = new Array(years + 1);
  // n'th row is [
  //  interest paid after n years,
  //  principal paid down after n years,
  //  remaining balance at the end of year n
  // ]
  accumulatedData[0] = [0, 0, principal]

  for (var i = 0; i < years; i++) {
    var year = i + 1;
    var totalPayment = payment * year * 12;

    var remainingBalance = this.calculateRemainingMortgageBalance(
        principal,
        years,
        rate,
        year
    )

    var principalPaidSoFar = principal - remainingBalance;
    var interestPaidSoFar = totalPayment - principalPaidSoFar;

    var row = [interestPaidSoFar, principalPaidSoFar, remainingBalance];

    accumulatedData[year] = row;
  }

  // draw rows for each year
  tableHTML += '<tbody>\n';
  for (var i = 0; i < years; i++) {
    var prevData = accumulatedData[i];
    var curData = accumulatedData[i + 1];

    var year = i + 1;
    var row = [
      year,
      this.toCurrency(curData[0] - prevData[0]),  // interest paid this year
      this.toCurrency(curData[1] - prevData[1]),  // principal paid this year
      this.toCurrency(curData[2]),  // remaining balance
      this.toCurrency((curData[2] / principal) * 100) + '%' // remaining balance in percentage
    ];

    tableHTML += '<tr>';
    for (var j in row) {
      tableHTML += '<td>' + row[j] + '</td>';
    }
    tableHTML += '</tr>\n';
  }
  tableHTML += '</tbody>\n';

  tableHTML += '</table>\n';

  return tableHTML;
};

$(document).ready(
  function () {
    $('#mortgage-amort-schedule-calculate').click(
      function (e) {
        e.preventDefault();

        // Clear the result first
        $('#mortgage-amort-schedule-monthly-payment').val("");
        $('#mortgage-amort-schedule-total-payment').val("");
        $('#mortgage-amort-schedule-total-interest').val("");
        $('#mortgage-amort-schedule-table').html("");

        // Get the inputs then calculate the result
        var principal = $('#mortgage-amort-schedule-principal').val();
        var years = $('#mortgage-amort-schedule-years').val();
        var rate = $('#mortgage-amort-schedule-rate').val();

        if (
          personalFinancialCalculators.validateMortgageAmortSchedule(
            principal,
            years,
            rate
          )
        ) {
          var monthlyPayment = personalFinancialCalculators.calculateMortgagePayment(
            parseFloat(principal),
            parseFloat(years),
            parseFloat(rate)
          )
          var totalPayment = monthlyPayment * years * 12;
          var totalInterestPaid = totalPayment - principal;

          $('#mortgage-amort-schedule-monthly-payment').val(
            personalFinancialCalculators.toCurrency(monthlyPayment)
          );
          $('#mortgage-amort-schedule-total-payment').val(
            personalFinancialCalculators.toCurrency(totalPayment)
          );
          $('#mortgage-amort-schedule-total-interest').val(
            personalFinancialCalculators.toCurrency(totalInterestPaid)
          );
          $('#mortgage-amort-schedule-draw').html(
            personalFinancialCalculators.drawMortgageAmortSchedule(
              principal,
              years,
              rate
            )
          );
        }
      }
    );
  }
);


/**
 * end of Mortgage amortization schedule
 **/

/**
 * Setup for the app as a whole
 **/
$(document).ready(
  function () {
    var appCache = window.applicationCache;
    $(appCache).bind(
      "downloading",
      function (event) {
        personalFinancialCalculators.setStatusMessage(
          "Downloading cache for offline access..."
        );
      }
    );

    $(appCache).bind(
      "cached",
      function (event) {
        personalFinancialCalculators.setStatusMessage(
          ""
        );
      }
    );

    $(appCache).bind(
      "updateready",
      function (event) {
        personalFinancialCalculators.setStatusMessage(
          "A newer version is available"
        );
        $('#update-cache-button').show();
      }
    );

    $('#update-cache-button').click(
      function (e) {
        window.location.reload();
      }
    );
  }
)
