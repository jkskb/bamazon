let inquirer = require('inquirer');
let mysql = require('mysql');

let connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2272',
    database: process.env.DB_DATABASE || 'bamazon',
});

connection.connect(function(err) {
    if (err) throw err;
    console.log('connected as id: ' + connection.threadId)
    productDisplay();
});

let amountDue;
let department;
let updateProfits;


function productDisplay() {
    
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw err;

        console.log('*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/');
        console.log('***************BAMAZON PRODUCT LIST***************');
        console.log('/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*');

        for (let i = 0; i < res.length; i++) {

            console.log("Item ID: " + res[i].item_id + " || Product Name: " + res[i].product_name + " || Department: " + res[i].department_name + " || Price: $" + res[i].price + " || Quanitiy Available: " + res[i].stock_quantity);
        }
        customerSearch();
    });
}

function customerSearch() {
    inquirer.prompt([
        {
            name: "productId",
            type: "input",
            message: "Enter the ID of the item you would like to buy: ",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                } 
                    return 'Please enter a valid Item Id';
            }
        },
        {
            name: "enterQuantity",
            type: "input",
            message: "How many would you like to purchase? ",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                    return 'Please enter a valid number';
            }
        }
    ])

    .then(function(answer) {
        connection.query('SELECT * FROM products WHERE item_id = ?', [answer.productId], function(err, res) {
            if(answer.enterQuantity > res[0].stock_quantity){
                console.log('Insufficient quantity!');
                console.log('This order has been cancelled');
                orderAgain();
            } else {
                totalDue = res[0].price * answer.enterQuantity;
                department = res[0].department_name;
                console.log('Thank you for your order');
                console.log('$' + totalDue + ' due from customer');

                connection.query('UPDATE products SET ? WHERE ?', [{
                    stock_quantity: res[0].stock_quantity - answer.enterQuantity
            },{
                item_id: answer.productId
            }], function(err, res){});
                updateDepartment();
                orderAgain();
            }
        });  
    });
}

function updateDepartment(){
	connection.query('SELECT * FROM products WHERE department_name = ?', [department], function(err, res){
		updateProfits = res[0].totalSales + amountDue;
		updateDepartmentTable();
	})
};

function updateDepartmentTable(){
		connection.query('UPDATE departments SET ? WHERE ?', [{
		totalSales: updateProfits
	},{
		department_name: department
	}], function(err, res){});
};

function orderAgain(){
	inquirer.prompt([{
        name: 'startOver',
		type: 'confirm',
		message: 'Place another order?'
	}]).then(function(answer){
		if(answer.startOver){
			productDisplay();
		}
		else{
			console.log('Thanks for shopping with Bamazon!');
			connection.end();
		}
	})
};


        
    