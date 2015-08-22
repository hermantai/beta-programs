"""
Investment

created by Herman Tai 3/20/2008
"""

from math import *
TOLERANCE = 0.0000001

def equals(n1,n2):
    return abs(n1-n2) <TOLERANCE

def calculate_monthly_payment(principle,year,rate_percent):
    terms = year * 12.0
    rate = rate_percent/100.0
    monthly_rate = rate/12.0

    # special case
    if monthly_rate == 0:
        return principle/terms

    z = 1+monthly_rate
    pmt = principle * z**terms * (z-1)/(z**terms-1)
    return pmt

def calculate_principle(pmt, years, rate_percent):
    terms = years * 12.0
    monthly_rate = (rate_percent / 100.0) / 12.0
    z = 1+monthly_rate
    if z == 1:
        return pmt * terms
    p = ( (z**terms - 1)*pmt )/( (z-1)*z**terms )
    return p

def calculate_years(principle, pmt, rate_percent):
    monthly_rate = (rate_percent / 100.0) / 12.0
    top_part = ( log(pmt) - log(pmt - principle*monthly_rate) )
    bottom_part = log(1+monthly_rate)
    terms = top_part/bottom_part
    return terms/12.0

def number_format(num, places=0):
    """Format a number with grouped thousands and given decimal places"""
    places = max(0,places)
    tmp = "%.*f" % (places, num)
    point = tmp.find(".")
    integer = (point == -1) and tmp or tmp[:point]
    decimal = (point != -1) and tmp[point:] or ""

    count =  0
    formatted = []
    for i in range(len(integer), 0, -1):
        count += 1
        formatted.append(integer[i - 1])
        if count % 3 == 0 and i - 1:
            formatted.append(",")

    integer = "".join(formatted[::-1])
    return integer+decimal

class RealEstateInvestment:
    def __init__(self, price, years, apr, monthly_expense=0, annual_expense_percent=0, appreciation=0, inflation=0, one_time_expense=0, down_payment=0,rent=0):
        self.price = float(price)
        self.years = float(years)
        self.apr = float(apr)
        self.monthly_expense = float(monthly_expense)
        self.annual_expense_percent = float(annual_expense_percent)
        self.appreciation = float(appreciation)
        self.inflation = float(inflation)
        self.one_time_expense = float(one_time_expense)
        self.down_payment = float(down_payment)
        self.rent = float(rent)

    def get_noi(self, yr=1):
        if yr == 1:
            expense = self.down_payment + self.one_time_expense
        else:
            expense = 0
        expense += self.get_annual_expense(yr)
        expense += self.get_mortgage_payment() * 12
        income = self.get_rent(yr) * 12
        return income - expense

    def get_monthly_expense(self, yr=1):
        inflation_p = self.inflation / 100.0
        return self.monthly_expense * (1+inflation_p) ** (yr-1)

    def get_annual_expense(self, yr=1):
        return self.get_asset_value(yr)*self.annual_expense_percent / 100 + self.get_monthly_expense(yr)

    def get_asset_value(self, yr=1):
        return self.price * (1 + self.appreciation/100)**(yr-1)

    def get_rent(self,yr=1):
        return self.rent * (1 + self.inflation/100.0)**(yr-1)

    def get_mortgage_payment(self):
        mortgage_payment = calculate_monthly_payment(self.price-self.down_payment,self.years,self.apr)
        return mortgage_payment
