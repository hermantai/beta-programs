"""
TkWidget

created by Herman Tai 2008/03/27


Description:
    Provides resuable Tkinter widgets.
"""

from tkinter import *

class TkWidget(Frame):
    def __init__(self,parent=None,**options):
        Frame.__init__(self,parent,**options)
        self.widget = self

    def config(self,**options):
        self.widget.config(**options)

class ScrolledText(TkWidget):
    """
    The code is mostly from the book Programming Python, 3rd Edition by Mark Lutz
    Published by O'Reilly, August 2006.
    """

    def __init__(self,parent=None,text='',**options):
        TkWidget.__init__(self,parent)
        self.drawLayout(**options)
        self.set_text(text)

    def drawLayout(self,**options):
        sbar = Scrollbar(self)
        sbar.pack(side=RIGHT,fill=Y)
        text = Text(self,**options)
        text.pack(side=LEFT,expand=YES,fill=BOTH)
        sbar.config(command=text.yview)
        text.config(yscrollcommand=sbar.set)
        self.text = text
        self.widget = self.text

    def set_text(self,text=''):
        self.text.delete('1.0',END)
        self.text.insert('1.0',text)

    def get_text(self):
        return self.text.get('1.0',END)

    def append_text(self,text=''):
        self.text.insert(END,text)

class ScrolledList(TkWidget):
    """
    The code is mostly from the book Programming Python, 3rd Edition by Mark Lutz
    Published by O'Reilly, August 2006.
    """

    def __init__(self,parent=None,**options):
        TkWidget.__init__(self,parent)
        self.drawLayout(**options)

    def drawLayout(self,**options):
        sbar = Scrollbar(self)
        sbar.pack(side=RIGHT,fill=Y)
        listbox = Listbox(self,**options)
        self.listbox = listbox
        listbox.pack(side=LEFT,expand=YES,fill=BOTH)
        sbar.config(command=listbox.yview)
        listbox.config(yscrollcommand=sbar.set)

        self.widget = self.listbox

if __name__=='__main__':
    root = Tk()
    root.title('Show widgets')
    Button(root,text="Quit",command=root.quit,width=30).pack()

    scrolledTextWin = Toplevel()
    scrolledTextWin.title('ScrolledText')
    st = ScrolledText(scrolledTextWin,text='Default text.\n')
    st.pack(expand=YES,fill=BOTH)
    st.append_text('Appended text.')
    print(st.get_text())

    slwin = Toplevel()
    slwin.title('ScrolledList')
    sl = ScrolledList(slwin)
    sl.pack(expand=YES,fill=BOTH)
    for i in range(5):
        sl.widget.insert(END,i)

    root.focus()
    root.mainloop()

