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
    menu();
});

var selItem = "";
var selQty = 0;

var newName = "";
var newDepartment = "";
var newPrice = 0;
var newQuantity = 0;


// product_name, department_name, price, quantity
// newName, newDepartment, newPrice, newQuantity;


// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.

var menu = function() {
    inquirer.prompt({
        name: "action",
        type: "rawlist",
        message: "What would you like to do?",
        choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add New Product"
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
        }
    });
};

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
                message: "How many would you like to add?",
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

var newItem = function() {
inquirer.prompt({
    name: "itemName",
    type: "input",
    message: "What is the new item name",
}).then(function(answer) {
    newName = answer.itemName;
    inquirer.prompt({
        name: "itemDepartment",
        type: "input",
        message: "What department is this for?",
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

                // console.log(newName, newDepartment, newPrice, newQuantity);

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
