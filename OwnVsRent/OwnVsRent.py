"""
OwnVsRent2

created by Herman Tai 3/29/2008

Description:
    An application for comparing the net asset after years of renting or owning a house. This version differs from the previous version in that it starts from knowing the down payment and closing expense, then calculate the initial cash needed instead of doing the opposite. I found it's more intuitive in most of the cases.
"""

from Tkinter import *
from tkMessageBox import showerror
from Investment import *

class OwnVsRent2Gui(Frame):
    Title_Label = {'fg':'blue','font':('courier',16,'italic')}
    Subtitle_Label = {'fg':'purple','font':('courier',12,'normal')}
    def __init__(self, parent=None,text_length=600, **args):
        Frame.__init__(self,parent,**args)
        self.attributes = {}
        self.attrib_names = []
        self.text_length = text_length
        self.drawLayout()
        self.attrib_names.sort()

    def drawLayout(self):
        basicInfoFrame = Frame(self)
        basicInfoFrame.pack()

        houseInfoFrame = Frame(self)
        houseInfoFrame.pack()

        conclusionFrame = Frame(self)
        conclusionFrame.pack(fill=X)

        # basic info frame
        Label(basicInfoFrame,text="Basic information",**self.Title_Label).pack()
        biAttrFrame = Frame(basicInfoFrame)
        biAttrFrame.pack(side=LEFT)
        biInputFrame = Frame(basicInfoFrame)
        biInputFrame.pack()
        # // left side
        basicInfoLabels = "Monthly rent","After tax investment return (%)","Inflation rate (%)"
        for label in basicInfoLabels:
            Label(biAttrFrame,text=label+":").pack()
        # // right side
        basicInfoAttrs = "rent","investment_return","inflation_rate"
        self.attrib_names.extend(basicInfoAttrs)
        for attr in basicInfoAttrs:
            var = DoubleVar()
            Entry(biInputFrame,textvariable=var).pack()
            self.attributes[attr] = var
        
        # house info frame
        Label(houseInfoFrame,text="Property information",**self.Title_Label).pack()
        hiLeftFrame = Frame(houseInfoFrame)
        hiLeftFrame.pack(side=LEFT)
        hiRightFrame = Frame(houseInfoFrame)
        hiRightFrame.pack(side=RIGHT)
        # // left side
        hiLeftLabelsFrame = Frame(hiLeftFrame)
        hiLeftLabelsFrame.pack(side=LEFT)
        hiLeftEntriesFrame = Frame(hiLeftFrame)
        hiLeftEntriesFrame.pack(side=RIGHT)
        # // // labels
        hiLeftLabels = "Price","Down payment","Closing expense","Monthly expense","Other annual expense (% of property price)","Appreciation (%)","Selling expense (% of selling price)"
        for label in hiLeftLabels:
            Label(hiLeftLabelsFrame,text=label+":").pack()
        # // // entries
        hiLeftEntries = "price","down_payment","closing_exp","monthly_exp","annual_exp","appreciation","selling_exp_percent"
        self.attrib_names.extend(hiLeftEntries)
        for ent in hiLeftEntries:
            var = DoubleVar()
            Entry(hiLeftEntriesFrame,textvariable=var).pack()
            self.attributes[ent] = var
        # // right side
        hiRightLabelsFrame = Frame(hiRightFrame)
        hiRightLabelsFrame .pack(side=LEFT)
        hiRightEntriesFrame = Frame(hiRightFrame)
        hiRightEntriesFrame .pack(side=RIGHT)
        # // // labels
        hiRightLabels = "Mortgage rate (%)","Morgage term (years)","Income tax rate (%)","Cash needed","Mortgage","Monthly mortgage payment"
        for label in hiRightLabels:
            Label(hiRightLabelsFrame,text=label+":").pack()
        # // // entries
        hiRightEntries = "mortgage_rate","mortgage_term","income_tax_rate"
        self.attrib_names.extend(hiRightEntries)
        for ent in hiRightEntries:
            var = DoubleVar()
            Entry(hiRightEntriesFrame,textvariable=var).pack()
            self.attributes[ent] = var
        readOnlyEntries = "cash","mortgage","mortgage_payment"
        self.attrib_names.extend(readOnlyEntries)
        for ent in readOnlyEntries:
            var = StringVar()
            Entry(hiRightEntriesFrame,textvariable=var,state='disabled').pack()
            self.attributes[ent] = var

        # conclusion frame
        Label(conclusionFrame,text="Conclusion",**self.Title_Label).pack()
        controlFrame = Frame(conclusionFrame)
        controlFrame.pack()
        displayFrame = Frame(conclusionFrame)
        displayFrame.pack(fill=X)
        noteFont = ('times',10,'normal')
        notes = ["* Assume each year mortgage expense is reduced by the tax saved from interest expense"]
        notes.append("* Inflation is used to adjust rent, monthly expense")
        notes.append("* Each year, if the expense for owning a property is lower than renting, the difference will be put in other investment for the owning a property side, vice versa.")
        for n in notes:
            Message(conclusionFrame,text=n,font=noteFont,justify=LEFT,width=self.text_length).pack(anchor=W)
        # // control frame
        Label(controlFrame,text="You sell the house at year:").pack(side=LEFT)
        Scale(controlFrame,orient='horizontal',from_=0,to=50,showvalue=YES,command=self.make_conclusion,length=200).pack(side=LEFT)
        # // display frame
        ownFrame = Frame(displayFrame,bd=1,relief=SOLID)
        ownFrame.pack(side=LEFT,fill=BOTH,expand=YES,anchor=N,padx=2)
        rentFrame = Frame(displayFrame,bd=1,relief=SOLID)
        rentFrame.pack(side=RIGHT,fill=BOTH,expand=YES,anchor=N,padx=2)
        # // // own frame
        Label(ownFrame,text='Own',**self.Subtitle_Label).pack()
        ownLabelsFrame = Frame(ownFrame)
        ownLabelsFrame.pack(side=LEFT,anchor=N)
        ownValuesFrame = Frame(ownFrame)
        ownValuesFrame.pack(side=RIGHT,anchor=N)
        # // // // labels
        ownLabels = "Selling price","Selling expense","Mortgage balance","Cash from property sold","Other investment value","Net asset"
        for label in ownLabels:
            Label(ownLabelsFrame,text=label+":").pack()
        # // // // values
        ownValues = "selling_price","selling_exp","mortgage_balance","cash_from_property","own_investment_value","own_net_asset"
        self.attrib_names.extend(ownValues)
        for val in ownValues:
            var = StringVar()
            Label(ownValuesFrame,textvariable=var).pack()
            self.attributes[val] = var
        # // // rent frame
        Label(rentFrame,text='Rent',**self.Subtitle_Label).pack()
        rentLabelsFrame = Frame(rentFrame)
        rentLabelsFrame.pack(side=LEFT,anchor=N)
        rentValuesFrame = Frame(rentFrame)
        rentValuesFrame.pack(side=RIGHT,anchor=N)
        # // // // labels
        rentLabels = "Investment from initial cash","Other investment value","Net asset"
        for label in rentLabels:
            Label(rentLabelsFrame,text=label+":").pack()
        # // // // values
        rentValues = "initial_investment","rent_investment_value","rent_net_asset"
        self.attrib_names.extend(rentValues)
        for val in rentValues:
            var = StringVar()
            Label(rentValuesFrame,textvariable=var).pack()
            self.attributes[val] = var


        # debug
        #Button(self,text="Debug",command=self.debug).pack()
        
    def get_attr(self,attr):
        var = self.attributes[attr]
        return var.get()

    def set_attr(self,attr,val):
        var = self.attributes[attr]
        var.set(val)

    def adjust_inflation(self,val,yrs):
        inflation_rate = self.get_attr('inflation_rate') / 100.0
        return val * (1+inflation_rate)**yrs

    def make_conclusion(self,yrs):
        yrs = float(yrs)
        if not self.debug(): # check all values
            return

        # property information
        downPayment = self.get_attr('down_payment')
        cash_needed = downPayment + self.get_attr('closing_exp')
        self.set_attr('cash',self.format_money(cash_needed))
        mortgage = self.get_attr('price')-downPayment
        self.set_attr('mortgage',self.format_money(mortgage))
        try:
            pmt = calculate_monthly_payment(mortgage,self.get_attr('mortgage_term'),self.get_attr('mortgage_rate'))
        except ZeroDivisionError: # it has error at first time run
            pmt = 0
        self.set_attr('mortgage_payment',self.format_money(pmt))

        # own information
        sellPrice = self.get_attr('price')*(1+self.get_attr('appreciation')/100.0)**yrs
        self.set_attr('selling_price',self.format_money(sellPrice))
        sellingExpense = sellPrice * self.get_attr('selling_exp_percent')/100.0
        self.set_attr('selling_exp',self.format_money(sellingExpense))
        mortgageBalance = calculate_principle(pmt,max(self.get_attr('mortgage_term')-yrs,0),self.get_attr('mortgage_rate'))
        self.set_attr('mortgage_balance',self.format_money(mortgageBalance))
        cash = sellPrice-sellingExpense-mortgageBalance
        self.set_attr('cash_from_property',self.format_money(cash))
        own_other_investment = self.calculate_total_own_other_investment(yrs)
        self.set_attr('own_investment_value',self.format_money(own_other_investment))
        own_net_asset = cash+own_other_investment
        self.set_attr('own_net_asset',self.format_money(own_net_asset))

        # rent information
        initialInvestmentCurrentVal = cash_needed*(1+self.get_attr('investment_return')/100.0)**yrs
        self.set_attr('initial_investment',self.format_money(initialInvestmentCurrentVal))
        rent_other_investment = self.calculate_total_rent_other_investment(yrs)
        self.set_attr('rent_investment_value',self.format_money(rent_other_investment))
        rent_investment = initialInvestmentCurrentVal+rent_other_investment
        self.set_attr('rent_net_asset',self.format_money(rent_investment))

    def calculate_total_own_other_investment(self,yrs):
        total_investment = 0
        for yr in range(int(yrs)):
            invAtYr = max(0,self.rent_expense_at_year(yr)-self.own_expense_at_year(yr))
            total_investment += invAtYr*(1+self.get_attr('investment_return')/100)**(yrs-yr-1) # previous year left over start invested from current year, so -1
        return total_investment

    def calculate_total_rent_other_investment(self,yrs):
        total_investment = 0
        for yr in range(int(yrs)):
            invAtYr = max(0,self.own_expense_at_year(yr)-self.rent_expense_at_year(yr))
            total_investment += invAtYr*(1+self.get_attr('investment_return')/100)**(yrs-yr-1) # previous year left over start invested from current year, so -1
        return total_investment

    def own_expense_at_year(self,yr):
        # mortgage expense
        pmt = float(self.get_attr('mortgage_payment').replace(',',''))
        if yr >= self.get_attr('mortgage_term'):
            pmt = 0
        mortgageExp = pmt*12
        curMortgageBalance = calculate_principle(pmt,max(self.get_attr('mortgage_term')-yr,0),self.get_attr('mortgage_rate'))
        nextYearMortgageBalance = calculate_principle(pmt,max(self.get_attr('mortgage_term')-(yr+1),0),self.get_attr('mortgage_rate'))
        if yr >= self.get_attr('mortgage_term'):
            taxSaved = 0
        else:
            taxSaved = (pmt*12-(curMortgageBalance-nextYearMortgageBalance))*self.get_attr('income_tax_rate')/100.0
        adjustedMortgageExp = mortgageExp - taxSaved

        # other expense
        propertyValue = self.get_attr('price')*(1+self.get_attr('appreciation')/100.0)**yr
        otherExp = self.adjust_inflation(self.get_attr('monthly_exp'),yr)*12
        otherExp += propertyValue*self.get_attr('annual_exp')/100.0
        totalExp = adjustedMortgageExp + otherExp
        # print "own exp at yr %s:%s"%(yr,totalExp)
        return totalExp

    def rent_expense_at_year(self,yr):
        totalExp = self.adjust_inflation(self.get_attr('rent'),yr)*12
        # print "rent exp at yr %s:%s"%(yr,totalExp)
        return totalExp

    def debug(self):
        print "----------Debug----------"
        for attr in self.attrib_names:
            try:
                print attr,": ",self.get_attr(attr)
            except ValueError,e:
                msg_tuple = e.message.split(':')
                if len(msg_tuple) < 2:
                    showerror("Input error",msg_tuple[0])
                    return False
                val = msg_tuple[1].strip()
                showerror("Input error","[%s] is not a number"%val)
                return False
        return True
    def format_money(self,val):
        return number_format(val,2)


class InputError(Exception):
    Attribute = ""
    Value = ""
    def __init__(self,attr="Input",val=""):
        Attribute = attr
        Value = val

if __name__ == '__main__':
    mainwin = Tk()
    mainwin.title("Own Vs Rent 2")
    OwnVsRent2Gui(mainwin).pack(padx=3,pady=3)
    mainloop()
