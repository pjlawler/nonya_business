const inquirer = require('inquirer');
const cTable = require('console.table');
const db = require('./db/connection');
const { sql_statement } = require('./sql_library');

function init() {
    console.clear();
    console.log(`
        =======================================
        =                                     =
        =  Welcome to the Nonya Business CMS  =
        =                                     =
        =======================================
        `)
        main_prompt();

}

function display_data(data) {

    if(data.main === 'Quit') { 
        db.end();
        console.log('Goodbye');
        return false;
    }
    
    console.clear();

    // Displays the proper table based on  what was selected from the main menu
    const selection = data.main.toLowerCase()
    const sql = sql_statement(selection);
    
    // Performs a query based on the selection to display the table data (i.e. add employee displays all employees)
    db.query(sql, (err, rows) => {
        
        if(err) throw err;

        // Displays respective tile and table data based on selection
        console.log(`\n${tableTitle(selection)}\n\n`, cTable.getTable(rows));

        // Remains in the main menu if one of the 'view all' or 'view department utilized budget' was selected
        if(selection.includes('view all') || selection.includes('view department utilized budget')) { main_prompt() }

        // If something else was selected, then the "else if" statements below determine which prompt(s) to be displayed for additional inputs
        else if (selection.includes('employees by manager')) {
            let managers;

            // Gets an array of the mangers from the db to be used for selecting in prompt
            db.query(sql_statement('managers'), (err, rows) => {
                if(err) throw err;
                managers = rows;
                selectManager_prompt(managers).then(manager => {
                    console.log(manager);
                    const sql = `${sql_statement('employees by manager')}${manager.manager.split(',')[0]} ORDER BY employees.last_name`
                    db.query(sql, (err, rows) => {
                        if(err) throw err;
                        // Displays respective title and table based on the selection
                        console.clear();
                        console.log(`\n${manager.manager.split(',')[1]}'s Direct Subordinates\n\n`, cTable.getTable(rows));
                        main_prompt();
                    })
                });
            })

        
        }
        else if (selection.includes('add an employee')) {
            let roles;
            let managers;

            // Gets an array of the roles from the db to be used for selecting in prompt
            db.query(sql_statement('roles'), (err, rows) => {
                if(err) throw err;
                roles = rows;

                // Gets an array of the managers from the db to be used for selecting in prompt
                db.query(sql_statement('managers'), (err, rows) => {
                    if(err) throw err;
                    managers = rows;
                    
                    // Calls the prompt to input the new data
                    newEmployee_prompt(managers, roles).then(employee => {

                        // Inserts the new data into the db once received from the prompt 
                        const sql = `${sql_statement('newEmployee')} ('${employee.first_name}', '${employee.last_name}', ${employee.role_id}, ${employee.manager_id})`
                        db.query(sql, (err) => {
                            if(err) throw err;
                            delayedMessage('New employee added successfully!');
                        })
                    })
                }); 
            });           
        }
        else if (selection.includes('add a department')) {
            newDepartment_prompt().then(department => {
                const sql = `${sql_statement('newDepartment')} ('${department.dept_name}')`
                db.query(sql, (err) => {
                    if(err) throw err;
                    delayedMessage('New department added successfully!');
                })
            })
        }
        else if (selection.includes('add a role')) {
            let departments;

            db.query(sql_statement('departments'), (err, rows) => {
                if(err) throw err;
                
                departments = rows;
                                    
                newRole_prompt(departments).then(role => {
                    const sql = `${sql_statement('newRole')} ('${role.title}', '${role.department_id}', ${parseInt(role.salary)})`
                    db.query(sql, (err) => {
                        if(err) throw err;
                        delayedMessage('New role added successfully!');
                    })
                })
            });
        }
        else if (selection.includes("update an employee's role")){
            let roles;
            let employees;
            db.query(sql_statement('roles'), (err, rows) => {
                if(err) throw err;
                roles = rows;
                db.query(sql_statement('employees'), (err, rows) => {
                    if(err) throw err;
                    employees = rows;
                        updateEmployeeRole_prompt(employees, roles).then(employee => {
                            const sql = `UPDATE employees SET role_id=${employee.role_id} WHERE id=${employee.employee_id}`
                            db.query(sql, (err, rows) => {
                                if(err) throw err;
                                delayedMessage(`Employee #${employee.employee_id} updated successfully`);
                            })
                        })
                });
            });

        }
        else if (selection.includes("update an employee's manager")) {

            let managers;
            let employees;
            db.query(sql_statement('managers'), (err, rows) => {
                if(err) throw err;
                managers = rows;
                db.query(sql_statement('employees'), (err, rows) => {
                    if(err) throw err;
                    employees = rows;
                    updateEmployeeManager_prompt(employees, managers).then(employee => {
                        const sql = `UPDATE employees SET manager_id=${employee.manager_id} WHERE id=${employee.employee_id}`
                        db.query(sql, (err, rows) => {
                            if(err) throw err;
                            delayedMessage(`Employee #${employee.employee_id} updated successfully`);
                        })
                    })
                });
            });
        }
        else if (selection.includes('delete an employee')) {

            let employees;

            db.query(sql_statement('employees'), (err, rows) => {
                if(err) throw err;
                
                employees = rows;

                selectEmployee_prompt(employees).then(employee => {
                    const sql = `${sql_statement('deleteEmployee')}${employee.id}`

                    db.query(sql, (err, rows) => {
                        if(err) throw err;
                        delayedMessage(`Employee #${employee.id} deleted successfully`)
                    })
                })
            })
        }
        else if (selection.includes('delete a role')) {
            let roles;
            db.query(sql_statement('roles'), (err, rows) => {
                if(err) throw err;
                roles = rows;
                selectRole_prompt(roles).then(role => {
                    const sql = `${sql_statement('deleteRole')}${role.id}`
                    db.query(sql, (err, rows) => {
                        if(err) throw err;
                        delayedMessage(`Role #${role.id} deleted successfully`);
                    })
                })
            })
        }
        else if (selection.includes('delete a department')) {
            let departments;
            db.query(sql_statement('departments'), (err, rows ) => {
                if(err) throw err;
                departments = rows;
                selectDepartment_prompt(departments).then(department => {
                    const sql = `${sql_statement('deleteDepartment')}${department.id}`
                    db.query(sql, (err, rows) => {
                        if(err) throw err;
                        delayedMessage(`Department #${department.id} deleted successfully`);
                    })
                })
            })
        }
        else {
            // Catchall in the event of an unfound selection
            console.log(`${selection} -- NOT FOUND`)
        }
    });
}

// Inquirer prompts which return data based on the users inputs
const main_prompt = () => {
    

    console.log(`
    Main Menu
    `);
    return inquirer.prompt([{
        name: 'main',
        message: 'Please select an opition?',
        type: 'list',
        choices: ['View all departments', 'View all roles', 'View all employees', 'View employees by manager', 'Add a department', 'Add a role', 'Add an employee', "Update an employee's role", "Update an employee's manager", 'Delete an employee', 'Delete a role', 'Delete a department', 'View department utilized budget', 'Quit']

    }]).then(data => display_data(data));
}
const newEmployee_prompt = (managers, roles) => {

    let manager_names = managers.map(item => item.Manager);
    manager_names.unshift('None');

    let role_names = roles.map(item => item.Title);
    role_names.unshift('None');

    return inquirer.prompt([
        {
            name: 'first_name',
            message: "Please enter the employee's first name",
            type: 'input',
            validate: inputValue => { return validateAnswer(inputValue, 'text_input', "You must enter a first name.")}
        },
        {
            name: 'last_name',
            message: "Please enter the employee's last name",
            type: 'input',
            validate: inputValue => { return validateAnswer(inputValue, 'text_input', "You must enter a last name.")}
        },
        {
            name: 'role_id',
            message: "Please select the new employee's role",
            type: 'list',
            choices: role_names,
            filter(input) {
                let role_id = null;
                roles.forEach(item => {
                    if(item.Title === input) {
                        role_id = item.ID
                    }
                });
                return role_id;
            }
        },
        {
            name: 'manager_id',
            message: "Please select the employee's manager",
            type: 'list',
            choices: manager_names,
            filter(input) {
                let manager_id = null;
                managers.forEach(item => {
                    if(item.Manager === input) {
                        manager_id = item.ID
                    }
                });
                return manager_id;
            }
        }
    ]);
}
const newDepartment_prompt = () => {
    return inquirer.prompt([
        {
            name: 'dept_name',
            message: "Please enter the name of the new department",
            type: 'input',
            validate: inputValue => { return validateAnswer(inputValue, 'text_input', "You must enter a department name.")}
        }
    ]);
}
const newRole_prompt = (departments) => {

    let department_names = departments.map(item => item.Name);

    return inquirer.prompt([
        {
            name: 'title',
            message: "Please enter the new role's title",
            type: 'input',
            validate: inputValue => { return validateAnswer(inputValue, 'text_input', "You must enter a department name.")}
        },
        {
            name: 'department_id',
            message: "Please select the department for the new role",
            type: 'list',
            choices: department_names,
            filter(input) {
                let department_id = null;
                departments.forEach(item => {
                    if(item.Name === input) {
                        department_id = item.ID
                    }
                });
                return department_id;
            }
        },
        {
            name: 'salary',
            message: "Please enter the salary for the new role",
            type: 'input',
            validate: inputValue => { return validateAnswer(inputValue, 'salary_input', "You must enter a valid salary (0 - 100000000)")},
        }
    ]);
}
const updateEmployeeRole_prompt = (employees, roles) => {

    let employee_names = employees.map(item => item.Name);

    let role_names = roles.map(item => item.Title);
    role_names.unshift('None');

    return inquirer.prompt([
        {
            name: 'employee_id',
            message: "Please select the employee you'd like to update",
            type: 'list',
            choices: employee_names,
            filter(input) {
                let employee_id = null;
                employees.forEach(item => {
                    if(item.Name === input) {
                        employee_id = item.ID
                    }
                });
                return employee_id;
            }
        },        
        {
            name: 'role_id',
            message: "Please select the employee's role",
            type: 'list',
            choices: role_names,
            filter(input) {
                let role_id = null;
                roles.forEach(item => {
                    if(item.Title === input) {
                        role_id = item.ID
                    }
                });
                return role_id;
            }
        }
    ]);

}
const updateEmployeeManager_prompt = (employees, managers) => {

    let employee_names = employees.map(item => item.Name);
    let manager_names = managers.map(item => item.Manager);
    manager_names.unshift('None');

    return inquirer.prompt([
        {
            name: 'employee_id',
            message: "Please select the employee you'd like to update",
            type: 'list',
            choices: employee_names,
            filter(input) {
                let employee_id = null;
                employees.forEach(item => {
                    if(item.Name === input) {
                        employee_id = item.ID
                    }
                });
                return employee_id;
            }
        },        
        {
            name: 'manager_id',
            message: "Please select the employee's manager",
            type: 'list',
            choices: manager_names,
            filter(input) {
                let manager_id = null;
                managers.forEach(item => {
                    if(item.Manager === input) {
                        manager_id = item.ID
                    }
                });
                return manager_id;
            }
        }
    ]);

}
const selectManager_prompt = (managers) => {
    let manager_names = managers.map(item => item.Manager);
    return inquirer.prompt([
        {
            name: 'manager',
            message: "Please select the manager to view their employees",
            type: 'list',
            choices: manager_names,
            filter(input) {
                let manager = null;
                managers.forEach(item => {
                    if(item.Manager === input) {
                        manager = `${item.ID},${item.Manager}` 
                    }
                });
                return manager;
            }
        }
    ]);
}
const selectEmployee_prompt = (employees) => {
    let employee_names = employees.map(item => item.Name);
    return inquirer.prompt([
        {
            name: 'id',
            message: 'Please select the employee you wish to delete',
            type: 'list',
            choices: employee_names,
            filter(input) {
                let id;
                employees.forEach(item => {
                    if(item.Name === input) {
                        id = item.ID
                    }
                });
                return id;
            }
        }
    ]);
}
const selectDepartment_prompt = (departments) => {
    let department_names = departments.map(item => item.Name);
    return inquirer.prompt([
        {
            name: 'id',
            message: 'Please select the department you wish to delete',
            type: 'list',
            choices: department_names,
            filter(input){
                let id;
                departments.forEach(item => {
                    if(item.Name === input) {
                        id = item.ID
                    }
                });
                return id;
            }
        }
    ]);
}
const selectRole_prompt = (roles) => {
    let role_titles = roles.map(item => item.Title);
    return inquirer.prompt([
        {
            name: 'id',
            message: 'Please select the role you wish to delete',
            type: 'list',
            choices: role_titles,
            filter(input) {
                let id;
                roles.forEach(item => {
                    if(item.Title === input) {
                        id = item.ID
                    }
                });
                return id;
            }
        }
    ]);
}

// Misc Functions
function validateAnswer(value, type, message) {
    // Validates the inquirer prompt is proper if needed
    switch(type) {
        case 'text_input':
            if(!value) { 
            console.log(message);
            return false;
        } else {
          return true;
        }
    case 'salary_input':
        const salary = parseInt(value);
        if(salary === NaN || value.includes(',')) { return false; }
        if(salary >= 0 && salary <= 100000000) {
            return true;
        }
        else {
            console.log(message);
            return false;
        }
    }
}
function delayedMessage(message) {
    // Displays a success message to the user for 1 sec after the db has been updated before going back to main menu.
    console.log(message)
    setTimeout( () => {
        init();
    }, 1000)
}
const tableTitle = (selection) => {
    // Dipslays the respective table title based on the users selection
    switch (true) {
        case selection.includes('view department utilized budget'):
            return "Displaying: Departments' Utilized Budgets";

        case selection.includes('employee'):
            return 'Displaying: All Employees';

        case selection.includes('role'):
            return 'Displaying: All Roles';

        default:
            return 'Displaying: All Departments';
    }

}
    
// Connects mysql2 server and runs init on startup
db.connect(err => {
    if (err) throw err;
    init();
});
