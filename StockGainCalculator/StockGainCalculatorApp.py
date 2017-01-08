"""
StockGainCalculatorApp

created by Herman Tai 2008/03/26

Description:
    An application for calculating the short term or long term gain of the stock trade transactions.

Note:
    Right now it only takes care of sell and buy of shares transaction.

"""

from FirstSouthWest import FirstSouthWestTransactionGenerator
from HilltopSecurities import HilltopSecuritiesTransactionGenerator
from Penson import PensonTransactionGenerator

import StockGainCalculator
import transaction
from Tkinter import *
import _tkinter
from tkFileDialog import askopenfilenames, asksaveasfilename
from tkMessageBox import showerror,showinfo
import datetime
import os
from sorno.TkWidget import ScrolledList
import decimal
from decimal import Decimal
from xml.dom import minidom

class StockGainCalculatorGui(Frame):
    def __init__(self,parent=None):
        Frame.__init__(self,parent)
        self.initialdir = os.path.abspath(os.curdir)
        self.stockGainCalculator = StockGainCalculator.StockGainCalculator()
        self.data_sources = {}
        self.filepaths = ()
        self.filepaths_changed = False
        self.drawLayout()
        self.cost_history = {}

    def drawLayout(self):
        self.__drawMenu()

        # show selected file
        fileChooseFrame = Frame(self)
        fileChooseFrame.pack(fill=X,anchor=W)
        Label(fileChooseFrame,text='Data file:').pack(side=LEFT)
        self.fileLabel = Label(fileChooseFrame)
        self.fileLabel.pack(side=LEFT,fill=X)

        # show/select different kind of data source
        Label(self,text="Choose format of data file.").pack()
        dataSourceSl = ScrolledList(self,height=5,width=40)
        dataSourceSl.pack(expand=YES,fill=BOTH)
        self.data_source_sl = dataSourceSl

        self.add_data_sources()

        # calculate
        calFrame = Frame(self)
        calFrame.pack(fill=X,anchor=W)
        Label(calFrame,text="Year:").pack(side=LEFT)
        self.yearVar = IntVar()
        self.yearVar.set(datetime.date.today().year)
        Entry(calFrame,textvariable=self.yearVar,width=10).pack(side=LEFT)
        Button(calFrame,text="Calculate",command=self.calculate).pack(side=LEFT)

        self.__drawDisplay()

    def __drawMenu(self):
        try:
            self.master.config(menu=None) # check if menu option available
            menu = Menu(self.master)
            self.master.config(menu=menu)

            fileMenu = Menu(menu,tearoff=0)
            menu.add_cascade(label='File',menu=fileMenu,underline=0)
            fileMenu.add_command(label='Open',command=self.chooseFile)
            fileMenu.add_command(label='Export realized gain/loss XML file',command=self.choose_export_xml)
            fileMenu.add_command(label='Export realized gain/loss HTML file',command=self.choose_export_html)
            fileMenu.add_command(label='Export inventory (HTML)',command=self.choose_export_inventory_html)
            fileMenu.add_command(label='Export raw transactions', command=self.choose_export_transactions)
        except _tkinter.TclError: # master cannot add normal menu
            menuFrame = Frame(self)
            menuFrame.pack(side=TOP,fill=X)

            fButton = Menubutton(menuFrame,text='File',underline=0)
            fButton.pack(side=LEFT)
            fMenu = Menu(fButton,tearoff=0)
            fButton.config(menu=fMenu)
            fMenu.add_command(label='Open',command=self.chooseFile)
            fMenu.add_command(label='Export realized gain/loss XML file',command=self.choose_export_xml)
            fMenu.add_command(label='Export realized gain/loss HTML file',command=self.choose_export_html)
            fMenu.add_command(label='Export inventory (HTML)',command=self.choose_export_inventory_html)
            fMenu.add_command(label='Export raw transactions', command=self.choose_export_transactions)

    def __drawDisplay(self):
        displayFrame = Frame(self)
        displayFrame.pack(expand=YES,fill=BOTH)
        self.displayVar = StringVar()
        Label(displayFrame,textvariable=self.displayVar).pack(anchor=W)
        Label(displayFrame,text='Sell history:').pack(anchor=W)
        self.show_text_sl = ScrolledList(displayFrame,width=60)
        self.show_text_sl.pack(expand=YES,fill=BOTH)
        self.show_text_sl.widget.bind('<Double-1>',self.show_cost_history)
        Label(displayFrame,text='* Double click entry to view the cost history for the sale.').pack(anchor=W)

    def add_data_sources(self):
        self.__add_data_source(
            'Hilltop Securities csv with comma delimiter',
            HilltopSecuritiesTransactionGenerator()
        )
        self.__add_data_source('Penson csv with comma delimiter',PensonTransactionGenerator())
        self.__add_data_source('Stock Gain Calculator XML',transaction.XMLTransactionGenerator())
        self.__add_data_source(
            'FirstSouthWest csv with comma delimiter',
            FirstSouthWestTransactionGenerator()
        )

    def __add_data_source(self,name,transGen):
        self.data_sources[name] = transGen
        self.data_source_sl.widget.insert(END,name)

    def calculate(self):
        # prepare the transactions and process them
        if self.filepaths_changed: # only reprocess if filepaths changed
            self.process_transactions()
            self.filepaths_changed = False

        # get the result
        yr = self.yearVar.get()
        sg = self.get_short_term_gain(yr)
        lg = self.get_long_term_gain(yr)

        # show it
        self.displayVar.set("Short term gain: %.2f, long term gain: %.2f"%(sg,lg))
        self.show_text_sl.widget.delete(0,END)
        history = self.get_sale_history(yr)
        history.sort(key=StockGainCalculator.get_sale_history_key)
        self.cost_history = {}
        for index,h in enumerate(history):
            tran = h[0]
            symbol = tran.symbol
            dateStr = tran.time.strftime("%m/%d %X")
            price,quantity,short_g,long_g = (tran.price_per_share, tran.num_of_shares, h[2], h[3])
            self.cost_history[(str(index),)] = h[1]
            gain_str = "SG: %s, LG: %s" % (short_g,long_g)
            fees_per_share = tran.getFees()/quantity
            fees_for_this_tran = roundToActual(fees_per_share*quantity)
            short_sale_indicator = ''
            if tran.account_type == transaction.ACCOUNT_TYPE_SHORT:
                short_sale_indicator = '(Short Sale)'
            showText = "%s%s %-10s%s x %s - %s = %s; %30s" % (short_sale_indicator,
                                                              dateStr,
                                                              symbol,
                                                              price,
                                                              quantity,
                                                              fees_for_this_tran,
                                                              tran.net_amount,
                                                              gain_str)
            self.show_text_sl.widget.insert(END,showText)

    def chooseFile(self):
        filepaths = askopenfilenames(initialdir=self.initialdir)
        if filepaths:
            self.filepaths = self.tk.splitlist(filepaths)
            # add transactions
            self.clear_transactions()
            tg = self.getTransGen()
            for fp in self.filepaths:
                try:
                    self.add_transactions(tg.get_transactions(open(fp,"r")))
                except transaction.TransactionGeneratorError as e:
                    showerror('Data source error','%s: %s' % (e.message,fp))
                    return
            self.initialdir = os.path.dirname(self.filepaths[-1])
            files = map(lambda fp: os.path.basename(fp),self.filepaths)
            self.fileLabel.config(text=','.join(files))
            self.filepaths_changed = True # so calculate will reprocess trans

    def choose_export_xml(self):
        export_file = asksaveasfilename(initialdir=self.initialdir)
        if export_file:
            self.initialdir = os.path.dirname(export_file)
            try:
                self.export_xml_file(export_file,self.yearVar.get())
                showinfo("Export XML file", "The xml file is saved in %s"%export_file)
            except Exception as ex:
                showerror('Export XML file error', ex)

    def choose_export_html(self):
        export_file = asksaveasfilename(initialdir=self.initialdir)
        if export_file:
            self.initialdir = os.path.dirname(export_file)
            try:
                self.export_html_file(export_file,self.yearVar.get())
                showinfo("Export HTML file", "The html file is saved in %s"%export_file)
            except Exception as ex:
                showerror('Export HTML file error', ex)

    def choose_export_inventory_html(self):
        export_file = asksaveasfilename(initialdir=self.initialdir)
        if export_file:
            self.initialdir = os.path.dirname(export_file)
            try:
                self.export_inventory_html(export_file)
                showinfo("Export inventory (HTML)", "The file is saved in %s"%export_file)
            except Exception as ex:
                showerror('Export inventory (HTML) error', ex)

    def choose_export_transactions(self):
        export_file = asksaveasfilename(initialdir=self.initialdir)
        if export_file:
            self.initialdir = os.path.dirname(export_file)
            try:
                self.export_transactions(export_file)
                showinfo("Export transactions", "The file is saved in %s"%export_file)
            except Exception as ex:
                showerror('Export transactions error', ex)


    def getTransGen(self):
        ret = self.data_sources[self.data_source_sl.widget.get(ACTIVE)]
        return ret

    def show_cost_history(self,event):
        key = self.show_text_sl.widget.curselection()
        ent = self.show_text_sl.widget.get(key)
        win = Toplevel()
        win.title(ent)
        sl = ScrolledList(win,width=60,height=10)
        sl.pack(expand=YES,fill=BOTH)
        cost_history = self.cost_history.get(key,())
        for c in cost_history:
            shares = c[1]
            # get total cost per share
            t_per_share = roundDecimal(c[0].price_per_share + c[0].getFees()/c[0].num_of_shares,6)
            show_text = "%-20s %s (%s) x %d = %s" % (c[0].getTimeStr(),c[0].price_per_share, t_per_share,shares,roundToActual(t_per_share*shares))
            sl.widget.insert(END,show_text)

    def export_html_file(self, filename, yr):
        history = self.get_sale_history(yr)
        history.sort(key=StockGainCalculator.get_sale_history_key)
        outfile = open(filename,"w")
        outfile.write('<table border="1">\n')
        outfile.write('<tr>\n')
        titles = 'Time','Symbol','Price','Quantity','Fees','Net proceed','Short-term gain','Long-term gain'
        for header in titles:
            outfile.write('<th>%s</th>' % header)
        outfile.write('\n')
        outfile.write('</tr>\n')
        for i,h in enumerate(history):
            trans = h[0]
            symbol = trans.symbol
            if trans.account_type == transaction.ACCOUNT_TYPE_SHORT:
                symbol = "(Short Sale) " + symbol
            row = '<a href="#%s%d">'%('cost',i)+trans.getTimeStr()+'</a>',symbol,trans.price_per_share,trans.num_of_shares,trans.getFees(),trans.net_amount,h[2],h[3]
            outfile.write('<tr>\n')
            for col in row:
                outfile.write('<td>%s</td>' % col)
            outfile.write('\n')
            outfile.write('</tr>\n')
        outfile.write('</table>\n')
        outfile.write('<p>Total short-term gain: %s</p>\n' % self.get_short_term_gain(yr))
        outfile.write('<p>Total long-term gain: %s</p>\n' % self.get_long_term_gain(yr))
        outfile.write('<hr/>\n')

        for i,h in enumerate(history):
            outfile.write('<div id="cost%d">\n'%i)
            sale_time = h[0].getTimeStr()
            symbol = h[0].symbol
            outfile.write('<p>Cost basis for %s %s</p>\n' % (sale_time,symbol))
            cost_basis_history = h[1]
            outfile.write('<table border="1">\n')
            titles = 'Time','Price','Fees per share','Cost per share','Quanity','Total'
            outfile.write('<tr>\n');
            for t in titles:
                outfile.write('<th>%s</th>'%t)
            outfile.write('\n</tr>\n');
            totalCost = Decimal(0)
            for cost_basis in cost_basis_history:
                outfile.write('<tr>\n')
                buyTrans = cost_basis[0]
                shares = cost_basis[1]
                com_per_share = roundDecimal(buyTrans.getFees()/buyTrans.num_of_shares,6)
                t_per_share = com_per_share+buyTrans.price_per_share # total cost per share
                total = roundToActual(t_per_share*shares)
                row = buyTrans.getTimeStr(),buyTrans.price_per_share,com_per_share,t_per_share,shares,total
                for col in row:
                    outfile.write('<td>%s</td>'%col)
                outfile.write('\n</tr>\n')
                totalCost += total
            outfile.write('</tr>\n')
            outfile.write('</table>\n')
            outfile.write('<p>Total cost: %s</p>\n'%totalCost)
            outfile.write('</div>\n')
            outfile.write('<hr/>\n')
        outfile.close()

    def export_xml_file(self, filename, yr):
        """
        History is a list of:
        (transaction,bought_history,short_gain,long_gain) )
        """
        history = self.get_sale_history(yr)
        history.sort(key=StockGainCalculator.get_sale_history_key)
        impl = minidom.getDOMImplementation()
        doc = impl.createDocument(None, 'sales', None)
        top_element = doc.documentElement
        for sale in history:
            trans = sale[0]
            sale_element = doc.createElement('sale')
            top_element.appendChild(sale_element)
            symbol = trans.symbol
            if trans.account_type == transaction.ACCOUNT_TYPE_SHORT:
                symbol = "(Short Sale) " + symbol
            self._add_text_to_element(doc, sale_element, 'symbol', symbol)
            self._add_text_to_element(doc, sale_element, 'time', trans.getTimeStr())
            self._add_text_to_element(doc, sale_element, 'num_of_shares', trans.num_of_shares)
            self._add_text_to_element(doc, sale_element, 'price_per_share', trans.price_per_share)
            self._add_text_to_element(doc, sale_element, 'principal_amount', trans.principal_amount)
            self._add_text_to_element(doc, sale_element, 'net_amount', trans.net_amount)
            self._add_text_to_element(doc, sale_element, 'short_term_gain', sale[2])
            self._add_text_to_element(doc, sale_element, 'long_term_gain', sale[3])
            # add cost basis history
            cost_basis_history = doc.createElement('cost_basis_history')
            sale_element.appendChild(cost_basis_history)
            for cost_basis in sale[1]:
                cost_basis_node = doc.createElement('cost_basis')
                cost_trans = cost_basis[0]
                shares = cost_basis[1]
                total_cost_per_share = roundDecimal(cost_trans.price_per_share+cost_trans.getFees()/cost_trans.num_of_shares,6)
                cost_basis_history.appendChild(cost_basis_node)
                self._add_text_to_element(doc,cost_basis_node, 'time', cost_trans.getTimeStr())
                self._add_text_to_element(doc,cost_basis_node, 'num_of_shares', shares)
                self._add_text_to_element(doc,cost_basis_node, 'cost_per_share', total_cost_per_share)

        f = open(filename,"w")
        f.write(doc.toprettyxml())
        f.close()

    def _add_text_to_element(self,doc,container,name,text):
        newNode = doc.createElement(name)
        container.appendChild(newNode)
        newNode.appendChild(doc.createTextNode(str(text)))

    def add_transactions(self,transactions):
        self.stockGainCalculator.add_transactions(transactions)

    def add_transaction(self,transaction):
        self.stockGainCalculator.add_transaction(transaction)

    def clear_transactions(self):
        self.stockGainCalculator.clear()

    def process_transactions(self):
        self.stockGainCalculator.process_transactions()

    def get_sale_history(self,yr):
        return self.stockGainCalculator.get_sale_history(yr)

    def get_short_term_gain(self,yr):
        return self.stockGainCalculator.get_short_term_gain(yr)

    def get_long_term_gain(self,yr):
        return self.stockGainCalculator.get_long_term_gain(yr)

    def export_inventory_html(self,filename):
        outfile = open(filename,"w")
        outfile.write('<table border="1">\n')
        outfile.write('<tr>\n')
        titles = 'Time','Symbol','Price','Quantity','Fees for this lot','Total cost for this lot'
        for header in titles:
            outfile.write('<th>%s</th>' % header)
        outfile.write('\n')
        outfile.write('</tr>\n')
        for stock,inventory in self.stockGainCalculator.remaining_inventory.items():
            for inv in inventory:
                trans = inv[0]
                remaining_quantity = inv[1]
                portionOfThisLot = float_to_decimal(float(remaining_quantity)/trans.num_of_shares)
                row = trans.getTimeStr(),trans.symbol,trans.price_per_share,remaining_quantity,roundToActual(portionOfThisLot*trans.getFees()), roundToActual(portionOfThisLot*trans.net_amount)
                outfile.write('<tr>\n')
                for col in row:
                    outfile.write('<td>%s</td>' % col)
                outfile.write('\n')
                outfile.write('</tr>\n')
        outfile.write('</table>\n')
        outfile.close()

    def export_transactions(self,filename):
        transactions = []
        # the transactions in StockGainCalculator is a dict, so have to flatten in out to a list first
        for trans in self.stockGainCalculator.transactions.values():
            transactions.extend(trans)
        StockGainCalculator.exportTransactions(transactions, filename)

def roundToActual(d):
    return roundDecimal(d,2)

def roundDecimal(d,n):
    return d.quantize(Decimal(1)/(10**n),decimal.ROUND_HALF_UP)

def float_to_decimal(f):
    result = Decimal("%.10f"%f)
    return result

if __name__ == '__main__':
    win = Tk()
    win.minsize(500,300)
    win.title('StockGainCalculator')
    app = StockGainCalculatorGui(win)
    app.pack(padx=2,pady=2,expand=YES,fill=BOTH)
    app.mainloop()

