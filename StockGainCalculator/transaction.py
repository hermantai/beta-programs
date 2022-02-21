'''
Created on Jan 22, 2012

@author: htai
'''
from decimal import Decimal
from datetime import datetime
import xml.dom.minidom

ACCOUNT_TYPE_LONG = 0
ACCOUNT_TYPE_SHORT = 1

class Transaction:
    """
    symbol - a string, the symbol of the stock, it will become upper case in the Transaction
    buy - a boolean, indicate it's a buy or sell transaction, default True
    num_of_shares - an integer, number of shares involved in this transaction
    price_per_share - a Decimal, market price per share for this transaction, default 0
    net_amount - a Decimal, net amount of transaction, which includes every fees
    time - a datetime.datetime, execution time of the transaction, which has both date and time
    account_type - the kind of account, short or long
    """
    def __init__(self,symbol,buy=True,num_of_shares=0,price_per_share=Decimal('0'), net_amount=Decimal('0'),time=datetime(1900,1,1), account_type=ACCOUNT_TYPE_LONG):
        self.symbol = symbol.upper()
        self.buy = buy
        self.num_of_shares = num_of_shares
        self.price_per_share = price_per_share
        self.net_amount = net_amount
        self.time = time
        self.account_type = account_type

    def __lt__(self,y):
        if self.account_type < y.account_type:
            return True
        if self.account_type > y.account_type:
            return False
        if self.time < y.time:
            return True
        if self.time > y.time:
            return False
        if self.buy and not y.buy:
            return True
        if not self.buy and y.buy:
            return False
        return False

    def __repr__(self):
        return "%s %s %s %d %s"%(self.symbol, self.getTimeStr(), "buy" if self.buy else "sell", self.num_of_shares, self.price_per_share)

    def __eq__(self, other):
        return (self.symbol == other.symbol and
        self.buy == other.buy and
        self.num_of_shares == other.num_of_shares and
        self.price_per_share == other.price_per_share and
        self.net_amount == other.net_amount and
        self.time == other.time and
        self.account_type == other.account_type)

    def __ne__(self,other):
        return not self.__eq__(other)

    def getFees(self):
        if(self.buy):
            return self.net_amount-self.price_per_share*self.num_of_shares
        else:
            return self.price_per_share*abs(self.num_of_shares)-self.net_amount

    def getTimeStr(self):
        return self.time.strftime('%Y/%m/%d %H:%M:%S')

class TransactionGenerator:
    """
    Abstract class that is the base class for transaction generators.
    A transaction generator generates transactions from sources like files or strings. The file format is specific to the capability of the instance of the generator.

    """
    def __init__(self):
        pass
    def get_transactions(self,file=None):
        return []

class TransactionGeneratorError(Exception):
    def __init__(self,msg=""):
        self.message = msg
    def __str__(self):
        return self.message

class XMLTransactionGenerator(TransactionGenerator):
    def __init__(self,xml=None):
        TransactionGenerator.__init__(self)
        self.xml = xml

    def get_transactions(self,file=None):
        ret = []
        if file is not None:
            doc = xml.dom.minidom.parse(file)
        else:
            doc = xml.dom.minidom.parseString(self.xml)
        if doc.documentElement.tagName != "transactions":
            doc.unlink()
            return ret
        trans = doc.getElementsByTagName("transaction")
        for tran in trans:
            ret.append(self.__createTransaction(tran))
        doc.unlink()
        if file is not None:
            file.close()
        return ret

    def __createTransaction(self,tranDom):
        """
        Take a transaction represented by a dom object, return a Transaction object
        """
        symbol = self.__getTextFromNode(tranDom.getElementsByTagName("symbol")[0])
        symbol = symbol.strip()
        buy = self.__getTextFromNode(tranDom.getElementsByTagName("buy")[0])
        buy = True if buy.strip().lower() == "true" else False
        quantity = self.__getTextFromNode(tranDom.getElementsByTagName("quantity")[0])
        quantity = int(quantity)
        price = self.__getTextFromNode(tranDom.getElementsByTagName("price")[0])
        price = Decimal(price)
        net_amount = self.__getTextFromNode(tranDom.getElementsByTagName("net_amount")[0])
        net_amount = Decimal(net_amount)
        time = self.__getTextFromNode(tranDom.getElementsByTagName("time")[0])
        time = time.strip()
        time = datetime.strptime(time,"%Y/%m/%d %H:%M:%S")
        account_type_nodes = tranDom.getElementsByTagName("account_type")
        if account_type_nodes:
            account_type = self.__getTextFromNode(account_type_nodes[0])
            account_type = int(account_type)
        else:
            account_type = ACCOUNT_TYPE_LONG
        return Transaction(symbol,buy,quantity,price,net_amount,time, account_type)

    def __getTextFromNode(self,node):
        return self.__getText(node.childNodes)

    def __getText(self,nodelist):
        rc = []
        for node in nodelist:
            if node.nodeType == node.TEXT_NODE:
                rc.append(node.data)
        return ''.join(rc)

