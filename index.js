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

// Inquirer prompts and db functions
const main_prompt = () => {
    console.log(`
    Main Menu
    `);
    return inquirer.prompt([{
        name: 'main',
        message: 'Select opition?',
        type: 'rawlist',
        choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role', 'Quit']

    }]).then(data => {
        
        if(data.main === 'Quit') { 
            db.end();
            console.log('Goodbye');
            return false;
        }
        console.clear();
               
        // Displays the proper table based on  what was selected from the main menu
        const selection = data.main.toLowerCase()
        const sql = sql_statement(selection);

        db.query(sql, (err, rows) => {
            if(err) { 
                console.log(err.message);
                return false; 
            }

            // Displays respective tile and table based on the selection
            console.log(`\n${tableTitle(selection)}\n\n`, cTable.getTable(rows));

            // Remains in the main menu if a 'view' was selected
            if(selection.includes('view')) { main_prompt() }           
            

            // Performs "add new" selections
            else if (selection.includes('add an employee')) {
                let roles;
                let managers;
    
                db.query(sql_statement('roles'), (err, rows) => {
                    if(err) throw err;
                    roles = rows;
                    db.query(sql_statement('managers'), (err, rows) => {
                        if(err) throw err;
                        managers = rows;
                        newEmployee_prompt(managers, roles).then(employee => {
                            const sql = `${sql_statement('newEmployee')} ('${employee.first_name}', '${employee.last_name}', ${employee.role_id}, ${employee.manager_id})`
                            db.query(sql, (err) => {
                                if(err) throw err;
                                init();
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
                        init();
                    })
                })
            }
            else if (selection.includes('add a role')) {
                let departments;

                db.query(sql_statement('departments'), (err, rows) => {
                    if(err) throw err;
                    
                    departments = rows;
                                        
                    newRole_prompt(departments).then(role => {
                        const sql = `${sql_statement('newRole')} ('${role.title}', '${role.department_id}', ${role.salary})`
                        db.query(sql, (err) => {
                            if(err) throw err;
                            init();
                        })
                    })
                });
            }
            else if (selection.includes('update an employee role')){
                let roles;
                let employees;
                db.query(sql_statement('roles'), (err, rows) => {
                    if(err) throw err;
                    roles = rows;
                    db.query(sql_statement('employees'), (err, rows) => {
                        if(err) throw err;
                        employees = rows;
                            updateEmployeeRoll_prompt(employees, roles).then(employee => {
                                console.log(employee);
                                const sql = `UPDATE employees SET role_id = ${employee.role_id} WHERE id = ${employee.employee_id}`
                                db.query(sql, (err, rows) => {
                                    if(err) throw err;
                                    init();
                                })
                            })
                    });
                });

            }
        });
    });
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
            message: "Please enter the employee's role",
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
            message: "Please enter the employee's manager",
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
            filter (val) { return parseInt(val)},
            validate: inputValue => { return validateAnswer(inputValue, 'salary_input', "You must enter a valid salary (0 - 100,000,000)")}
        }
    ]);
}
const updateEmployeeRoll_prompt = (employees, roles) => {

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
            message: "Please enter the employee's role",
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


// Misc Functions
function validateAnswer(value, type, message) {
    switch(type) {
        case 'text_input':
            if(!value) { 
            console.log(message);
            return false;
        } else {
          return true;
        }
    case 'salary_input':
        const salary = value;
        if(salary >= 0 && salary <= 100000000) {
            return true;
        }
        else {
            console.log(message);
            return false;
        }
    }
  }
const tableTitle = (selection) => {
    switch (true) {
        case selection.includes('employee'):
            return 'Current Employees';
        case selection.includes('role'):
            return 'Current Roles';
        default:
            return 'Current Departments';
    }
}
    
// Connects mysql2 server and runs init on startup
db.connect(err => {
    if (err) throw err;
    init();
});

