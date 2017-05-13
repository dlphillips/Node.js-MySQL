// include required node packages
var inquirer = require('inquirer');
var mysql = require("mysql");
require("console.table");

// connect to database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: 'uncccbc',
    database: 'Bamazon'
});

connection.connect(function(err) {
    if (err) throw err;
    placeOrder(); // call placeOrder() upon connection 
});

// initialize variables
var selItem = "";
var selQty = 0;
var totalPurchase = 0;
var itemDept = '';


var placeOrder = function() {
    // query products table and display results using console.table
    connection.query("SELECT item_id as 'Item', product_name as 'Name', department_name as 'Department', concat('$', format(price, 2)) as 'Price' from products", function(err, res) {
        if (err) throw err;
        console.table(res);
        inquirer.prompt({ 
            name: "itemId",
            type: "input",
            message: "Enter the ID for the item you would like to purchase", //prompt user to id to buy
        }).then(function(answer) {
            selItem = answer.itemId; 
            inquirer.prompt({
                name: "qty",
                type: "input",
                message: "How many would you like?", // prompt user for quantity
            }).then(function(answer) {
                selQty = answer.qty;
                // query products table for quantity available for requested item and compare to quantity requested
                connection.query("SELECT department_name, quantity FROM products WHERE ? ", [{ item_id: selItem }], function(err, res) {
                    if (res[0].quantity < selQty) { // not enough product
                        console.log('');
                        console.log('**************************');
                        console.log('* Insufficient quantity! *');
                        console.log('**************************');
                        console.log('');
                        placeOrder(); // start purchase process again
                    } else { // 
                        itemDept = res[0].department_name; // determine dept name for requested item
                        // update inventory for requested item
                        connection.query("UPDATE products SET quantity = quantity - ? WHERE ?", [selQty, { item_id: selItem }], function(err, res) {
                            if (err) throw err;
                            // get numeric value for total purchase
                            connection.query("SELECT price * ? as 'tot_no_format' from products  WHERE ?", [selQty, { item_id: selItem }], function(err, res) {
                                if (err) throw err;
                                totalPurchase = res[0].tot_no_format;
                                // get formatted purchase total and display to console
                                connection.query("SELECT concat('$', format(price * ?, 2)) as 'Total_Paid' from products  WHERE ?", [selQty, { item_id: selItem }], function(err, res) {
                                    if (err) throw err;
                                    console.log('');
                                    console.table(res);
                                    // update sales in products table
                                    connection.query("UPDATE products SET product_sales = product_sales + ? WHERE ?", [totalPurchase, { item_id: selItem }], function(err, res) {
                                        if (err) throw err;
                                        // update sales in departments table
                                        connection.query("UPDATE departments SET total_sales = total_sales + ? WHERE ?", [totalPurchase, { department_name: itemDept }], function(err, res) {
                                            if (err) throw err;
                                            placeOrder(); // start purchase process again
                                        });
                                    });

                                });
                            });
                        });
                    }
                });
            });
        });
    });
};
