"""
StockGainCalculator

created by Herman Tai 2008/03/25

A package for calculating short term and long term capital gain giving stock transactions defined in this package.
"""
from decimal import Decimal
import decimal
import logging
import xml.dom.minidom
import transaction

basic_format = '%(asctime)s %(levelname)s:%(module)s:%(message)s'
LOG_FILENAME = "StockGainCalculator.log"
logging.basicConfig(format=basic_format,filename=LOG_FILENAME,level=logging.DEBUG)
_LOGGER = logging.getLogger(__name__)
HKD_IN_USD = 7.76


class StockGainCalculator:
    def __init__(self,trans=[]):
        self.clear()
        self.add_transactions(trans)

    def clear(self):
        self.sale_history = {}
        self.transactions = {}
        self.short_gains = {}
        self.long_gains = {}
        self.proceeded = False
        self.remaining_inventory = {}

    def add_transaction(self, trans):
        if trans.symbol in self.transactions:
            trans_for_t = self.transactions[trans.symbol]
            trans_for_t.append(trans)
            trans_for_t.sort()
        else:
            self.transactions[trans.symbol] = [trans]

    def add_transactions(self,trans):
        for t in trans:
            self.add_transaction(t)

    def get_transactions_for(self,symbol):
        """
        Return a list of all transactions relate to the symbol
        """
        return self.transactions.get(symbol.upper(),[])

    def process_transactions(self):
        """
        inventory: [transaction, shares_in_inventory]
        """
        _LOGGER.debug("Transactions:")
        _LOGGER.debug(str(self.transactions))
        self.remaining_inventory.clear()
        for stock in self.transactions:
            if __debug__:
                _LOGGER.debug("Processing %s" % stock)
            trans = self.transactions[stock]
            inventory = []
            for t in trans:
                if t.buy:
                    inventory.append([t,t.num_of_shares])
                else:
                    _LOGGER.debug("inventory for %s" % stock)
                    _LOGGER.debug(str(inventory))
                    # this is a sale
                    sg,lg = self.__process_trade(t,inventory)
                    self.short_gains[t.time.year] = self.short_gains.get(t.time.year,Decimal(0)) + sg
                    self.long_gains[t.time.year] = self.long_gains.get(t.time.year,Decimal(0)) + lg
            # store the remaining inventory of the stock
            self.remaining_inventory[stock] = inventory
        self.proceeded = True

    def __process_trade(self,trade,inventory):
        """
        bought_history: each entry is (transaction, num_of_shares)
        each entry of history:(transaction, bought_history, short_gain, long_gain)
        """
        # determine short/long gain/loss
        t = trade
        if t.time.year in self.sale_history:
            history = self.sale_history[t.time.year]
        else:
            history = []
            self.sale_history[t.time.year] = history

        quantity = t.num_of_shares
        used_inv = []
        short_gain = Decimal(0)
        long_gain = Decimal(0)
        bought_history = []
        if t.account_type == transaction.ACCOUNT_TYPE_SHORT:
            history.append( (t,bought_history,short_gain,long_gain) )
            return short_gain,long_gain
        for inv in inventory:
            t_in_inv = inv[0]
            # determine the quantity used for this inventory
            if quantity > inv[1]:
                trade_quantity = inv[1]
                inv[1] = 0
                used_inv.append(inv)
            else:
                trade_quantity = quantity
                inv[1] -= quantity
                if inv[1] == 0: used_inv.append(inv)
            quantity -= trade_quantity
            bought_history.append((t_in_inv,trade_quantity))
            # put corresponding short/long gain
            cost = t_in_inv.net_amount * (Decimal(str(trade_quantity))/Decimal(str(t_in_inv.num_of_shares)))
            gain = t.net_amount * (Decimal(str(trade_quantity))/Decimal(str(t.num_of_shares)))-cost
            if is_short_term(t_in_inv.time,t.time):
                short_gain += gain
            else:
                long_gain += gain
            if quantity == 0: break
        if quantity != 0:
            raise StockGainCalculatorError(
                "Not enough inventory to handle transaction[%s]. Remaining quantity: %d."
                % (t, quantity))

        # remove used inventory
        for inv in used_inv:
            inventory.remove(inv)
        if trade.symbol.isdigit():
            # this is probably a HK stock, so need to convert gain/loss from
            # hkd to usd
            short_gain /= Decimal(HKD_IN_USD)
            long_gain /= Decimal(HKD_IN_USD)
        short_gain = roundToActual(short_gain)
        long_gain = roundToActual(long_gain)
        history.append( (t,bought_history,short_gain,long_gain) )
        return short_gain,long_gain

    def get_sale_history(self,yr):
        """
        Return a list of entry which represent one year's sale history
        Each entry in a year's history is
        (transaction, bought_history, short_gain, long_gain)
        """
        one_year_history = self.sale_history.get(yr,[])
        return one_year_history[:]

    def get_short_term_gain(self,yr):
        """
        Return a Decimal which presents the short term gain of the given year (yr)
        """
        if not self.proceeded: self.process_transactions()
        return self.short_gains.get(yr,0)

    def get_long_term_gain(self,yr):
        """
        Return a Decimal which presents the long term gain of the given year (yr)
        """
        if not self.proceeded: self.process_transactions()
        return self.long_gains.get(yr,0)

def get_sale_history_key(sh):
    return sh[0].time

def is_short_term(date1,date2):
    """
    Return True if it's a short term gain for buying at date1 and selling at date2
    """
    date1Months = date1.year*12+date1.month
    date2Months = date2.year*12+date2.month
    if date2Months - date1Months > 12:
        return False
    elif date2Months - date1Months == 12 and date2.day >date1.day:
        return False
    else:
        return True

class StockGainCalculatorError(Exception):
    def __init__(self,msg=""):
        self.message = msg
    def __str__(self):
        return self.message



def exportTransactions(trans, filename):
    """
    Given a list of transactions (trans) and a filename, export the transactions to the file with that filename. The format is in xml which can be read by XMLTransactionGenerator.
    """
    impl = xml.dom.minidom.getDOMImplementation()
    transDoc = impl.createDocument(None,"transactions",None)
    top_element = transDoc.documentElement
    for tran in trans:
        tranEle = __createTransactionElement(transDoc,tran)
        top_element.appendChild(tranEle)
    outputFile = open(filename,"w")
    transDoc.writexml(outputFile,newl="\n",addindent="    ",encoding="UTF-8")
    outputFile.close()

def __createTransactionElement(doc,tran):
    """
    Return a DOM element represents the transaction given (tran)
    """
    tranEle = doc.createElement("transaction")
    symbolEle = __createSimpleNodeWithText(doc, "symbol", tran.symbol)
    buyEle = __createSimpleNodeWithText(doc, "buy", "true" if tran.buy else "false")
    quantityEle = __createSimpleNodeWithText(doc, "quantity", str(tran.num_of_shares))
    priceEle = __createSimpleNodeWithText(doc, "price", str(tran.price_per_share))
    netAmountEle = __createSimpleNodeWithText(doc, "net_amount", str(tran.net_amount))
    timeEle = __createSimpleNodeWithText(doc, "time", tran.getTimeStr())
    accountTypeEle = __createSimpleNodeWithText(doc, "account_type", str(tran.account_type))
    tranEle.appendChild(symbolEle)
    tranEle.appendChild(buyEle)
    tranEle.appendChild(quantityEle)
    tranEle.appendChild(priceEle)
    tranEle.appendChild(netAmountEle)
    tranEle.appendChild(timeEle)
    tranEle.appendChild(accountTypeEle)
    return tranEle

def __createSimpleNodeWithText(doc, nodeName, text):
    """
    Return a node element with text in it. For example, if the nodeName is "color" and the text is "blue", the returned element is a represenatation of the following xml snippet:
    <color>blue</color>
    """
    newNode = doc.createElement(nodeName)
    textNode = doc.createTextNode(text)
    newNode.appendChild(textNode)
    return newNode

def roundToActual(d):
    return roundDecimal(d,2)

def roundDecimal(d,n):
    return d.quantize(Decimal(1)/(10**n),decimal.ROUND_HALF_UP)
