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
    menu(); // call main function
});


// initialize variables
var selItem = "";
var selQty = 0;

var newName = "";
var newDepartment = "";
var newPrice = 0;
var newQuantity = 0;

// prompt user for what they want and switch based on response
var menu = function() {
    inquirer.prompt({
        name: "action",
        type: "rawlist",
        message: "What would you like to do?",
        choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add New Product",
            "Exit"
        ]
    }).then(function(answer) {
        switch (answer.action) {
            case "View Products for Sale":
                viewProducts();
                break;

            case "View Low Inventory":
                viewLow();
                break;

            case "Add to Inventory":
                addInventory();
                break;

            case "Add New Product":
                newItem();
                break;

            case "Exit":
                exitApp();
                break;
        }
    });
};

// exit function
var exitApp = function() {
    process.exit(0);
};

// simple function to show all data in products table
var viewProducts = function() {
    console.log('');
    console.log('***Full Inventory***');
    console.log('');
    connection.query("SELECT item_id as 'Item', product_name as 'Name', department_name as 'Department', concat('$', format(price, 2)) as 'Price', quantity as 'Quantity' from products", function(err, res) {
        if (err) throw err;
        console.table(res);
        menu();
    });
};

// query products table for items with less than five in stock
var viewLow = function() {
    console.log('');
    console.log('***LOW Inventory (quantity < 5)***');
    console.log('');
    connection.query("SELECT item_id as 'Item', product_name as 'Name', department_name as 'Department', concat('$', format(price, 2)) as 'Price', quantity as 'Quantity' from products WHERE quantity < 5", function(err, res) {
        if (err) throw err;
        console.table(res);
        menu();
    });
};

// prompt user for product and quantity and update matching record in products table
var addInventory = function() {
    connection.query("SELECT item_id as 'Item', product_name as 'Name', department_name as 'Department', concat('$', format(price, 2)) as 'Price', quantity as 'Quantity' from products", function(err, res) {
        if (err) throw err;
        console.table(res);
        inquirer.prompt({
            name: "itemId",
            type: "input",
            message: "Enter the ID for the item to add inventory",
        }).then(function(answer) {
            selItem = answer.itemId;
            inquirer.prompt({
                name: "qty",
                type: "input",
                message: "What quantity would you like to add?",
            }).then(function(answer) {
                selQty = answer.qty;

                connection.query("UPDATE products SET quantity = quantity + ? WHERE ?", [selQty, { item_id: selItem }], function(err, res) {
                    if (err) throw err;
                    connection.query("SELECT item_id as 'Item', product_name as 'Name', department_name as 'Department', concat('$', format(price, 2)) as 'Price', quantity as 'Quantity' from products", function(err, res) {
                        if (err) throw err;
                        console.log('');
                        console.log('***UPDATED Inventory Quantities***');
                        console.log('');
                        console.table(res);
                        menu();
                    });
                });
            });
        });
    });

};

// prompt user for new product information and add new record in products table
var newItem = function() {
inquirer.prompt({
    name: "itemName",
    type: "input",
    message: "Enter the new item name:",
}).then(function(answer) {
    newName = answer.itemName;
    inquirer.prompt({
        name: "itemDepartment",
        type: "input",
        message: "Enter the department:",
    }).then(function(answer) {
        newDepartment = answer.itemDepartment;
        inquirer.prompt({
            name: "itemPrice",
            type: "input",
            message: "What is the unit price?",
        }).then(function(answer) {
            newPrice = answer.itemPrice;
            inquirer.prompt({
                name: "itemQuantity",
                type: "input",
                message: "How many are in stock?",
            }).then(function(answer) {
                newQuantity = answer.itemQuantity;

                connection.query("INSERT INTO products (product_name, department_name, price, quantity) VALUES (?, ?, ?, ?)", [newName, newDepartment, newPrice, newQuantity], function(err, res) {
                    if (err) throw err;
                    connection.query("SELECT item_id as 'Item', product_name as 'Name', department_name as 'Department', concat('$', format(price, 2)) as 'Price', quantity as 'Quantity' from products", function(err, res) {
                        if (err) throw err;
                        console.log('');
                        console.log('***UPDATED Inventory with NEW ITEM***');
                        console.log('');
                        console.table(res);
                        menu();
                    });
                });
            });
        });
    });
});
};
