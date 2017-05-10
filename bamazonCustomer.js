// include required node packages
var inquirer = require('inquirer');
var mysql = require("mysql");
require("console.table");


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: 'uncccbc',
    database: 'Bamazon'
});

connection.connect(function(err) {
    if (err) throw err;
    placeOrder();
});

var selItem = "";
var selQty = 0;

var placeOrder = function() {
    connection.query("SELECT item_id as 'Item', product_name as 'Name', department_name as 'Department', concat('$', format(price, 2)) as 'Price', quantity as 'Quantity' from products", function(err, res) {
        // connection.query("SELECT item_id as 'Item', product_name as 'Name', department_name as 'Department', concat('$', format(price, 2)) as 'Price' from products", function(err, res) {
        if (err) throw err;
        console.table(res);
        inquirer.prompt({
            name: "itemId",
            type: "input",
            message: "Enter the ID for the item you would like to purchase",
        }).then(function(answer) {
            selItem = answer.itemId;
            inquirer.prompt({
                name: "qty",
                type: "input",
                message: "How many would you like?",
            }).then(function(answer) {
                selQty = answer.qty;
                connection.query("SELECT quantity FROM products WHERE ? ", [{ item_id: selItem }], function(err, res) {
                    if (res[0].quantity < selQty) {
                        console.log('');
                        console.log('Insufficient quantity!');
                    } else {
                        connection.query("UPDATE products SET quantity = quantity - ? WHERE ?", [selQty, { item_id: selItem }], function(err, res) {
                            if (err) throw err;
                            console.log('');
                            console.log('Thank you for your purchase. Here is your receipt:');
                            connection.query("SELECT concat('$', format(price * ?, 2)) as 'Total' from products  WHERE ?", [selQty, { item_id: selItem }], function(err, res) {
                                if (err) throw err;
                                console.table(res);
                            });
                        });
	                    // placeOrder();
                    }
                });
            });
        });
    });
};
