"""
Penson

created by Herman Tai 2008/03/26

Description:
    Gives TransactionGenerator for Penson
"""

import transaction
from transaction import Transaction,TransactionGenerator,TransactionGeneratorError
import csv
from datetime import datetime
from decimal import Decimal

class PensonTransactionGenerator(TransactionGenerator):
    """
    Implements TransactionGenerator for Penson
    """

    def __init__(self,file=None,delimiter=','):
        self.file = file
        self.delimiter = delimiter

    def get_transactions(self,file=None):
        if not file:
            file = self.file
        try:
            reader = csv.DictReader(file,delimiter=self.delimiter)
            transactions = []
            processingTrade = None
            for trade in reader:
                processingTrade = trade
                d = trade['TradeDate']
                t = trade['ExecutionTime']
                t_h = 0
                t_m = 0
                t_s = 0
                if len(t) > 4:
                    t_h = int(t[:-4])
                    t_m = int(t[-4:-2])
                    t_s = int(t[-2:])
                elif len(t) == 4:
                    t_h = int(t[0:2])
                    t_m = int(t[2:4])
                    
                d_struct = d.split('/')
                d_struct = list(map(int,d_struct))
                dt = datetime(d_struct[2],d_struct[0],d_struct[1],t_h,t_m,t_s)
                if 'Symbol' in trade:
                    # old version of Penson
                    symbol = trade['Symbol']
                else:
                    symbol = trade['CUSIPSymbol']
                price = Decimal(trade['Price'])
                quantity = abs(int(float(trade['Quantity'])))
                if trade['BuySellCode'] == 'B':
                    buy = True
                elif trade['BuySellCode'] == 'S':
                    buy = False
                else:
                    raise ValueError('BuySellCode has invalid value [%s]'%trade['BuySellCode'])
                net_amount = abs(Decimal(trade['NetAmount'])) 
                account_type = transaction.ACCOUNT_TYPE_LONG
                if 'AccountTypeDescription' in trade:
                    if trade['AccountTypeDescription'] == 'Short':
                        account_type = transaction.ACCOUNT_TYPE_SHORT              
                transactions.append(Transaction(symbol,
                                                buy,
                                                quantity,price,
                                                net_amount,dt,
                                                account_type))
        except Exception as ex:
            errMsg = "Illegal Penson data file."
            if processingTrade:
                errMsg += " Error row: %s. Error: %s" % (processingTrade, ex)
            raise TransactionGeneratorError(errMsg)
        file.close()
        return transactions

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print("Usage: program <file>")
        sys.exit()

    f = open(sys.argv[1],"r")
    ztg = PensonTransactionGenerator(f)
    for t in ztg.get_transactions():
        print(t)
