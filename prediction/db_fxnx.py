import sqlite3
conn = sqlite3.connect('data.db',check_same_thread=False)
c = conn.cursor()

def create_table():
	c.execute('CREATE TABLE IF NOT EXISTS stockprice(stock_name TEXT,stock_price TEXT,date DATE)')

def add_data(stock_name,stock_price,date):
	c.execute('INSERT INTO stockprice(stock_name,stock_price,date) VALUES (?,?,?)',(stock_name,stock_price,date))
	conn.commit()

def view():
	c.execute('select * from stockprice')
	return c.fetchall()
