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

// initialize variables
var newDepartment = '';
var newOverhead = 0;

connection.connect(function(err) {
    if (err) throw err;
    menu(); // call main function
});

var menu = function() {
    inquirer.prompt({ // ask what user wants to do and switch based on selection
        name: "action", 
        type: "rawlist",
        message: "What would you like to do?",
        choices: [
            "View Product Sales by Department",
            "Create New Department",
            "Exit"
        ]
    }).then(function(answer) {
        switch (answer.action) {
            case "View Product Sales by Department":
                salesReport();
                break;

            case "Create New Department":
                newDept();
                break;

            case "Exit":
                exitApp();
                break;
        }
    });
};

// exit option
var exitApp = function() {
    process.exit(0);
};


// sales report option
var salesReport = function() {
    console.log('');
    console.log('***Product Sales by Department***');
    console.log('');
    // query departments table to get sales by department
    connection.query("SELECT department_name as 'Department', concat('$', format(over_head_costs, 2)) as 'Overhead_Costs', concat('$', format(total_sales, 2)) as 'Total_Sales', concat('$', format(total_sales - over_head_costs, 2)) as 'Total_Profit' from departments", function(err, res) {
        if (err) throw err;
        console.table(res);
        menu();
    });
};

// add a new dept
var newDept = function() {
    inquirer.prompt({
        name: "deptName",
        type: "input",
        message: "Enter the new department name:",
    }).then(function(answer) {
        newDepartment = answer.deptName;
        inquirer.prompt({
            name: "overHead",
            type: "input",
            message: "What is the total overhead cost for this new department?",
        }).then(function(answer) {
            newOverhead = answer.overHead;
            connection.query("INSERT INTO departments (department_name, over_head_costs, total_sales) VALUES (?, ?, ?)", [newDepartment, newOverhead, 0], function(err, res) {
                if (err) throw err;
                connection.query("SELECT department_name as 'Department', concat('$', format(over_head_costs, 2)) as 'Overhead_Costs', concat('$', format(total_sales, 2)) as 'Total_Sales', concat('$', format(total_sales - over_head_costs, 2)) as 'Total_Profit' from departments", function(err, res) {
                    if (err) throw err;
                    console.log('');
                    console.log('***UPDATED Departments table***');
                    console.log('');
                    console.table(res);
                    menu();

                });
            });
        });
    });
};
