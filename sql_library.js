

const sql_statement = (option => {


    switch(option) {
        case 'add an employee':
        case 'delete an employee':
        case "update an employee's role":
        case "update an employee's manager":
        case 'view employees by manager':
        case 'view all employees':
            return `
            SELECT employees.id AS ID, employees.first_name AS First, employees.last_name AS Last, roles.title AS Title, departments.dept_name AS Department, roles.salary AS Salary,  CONCAT(managers.first_name, " " , managers.last_name) As Reports_to
            FROM employees
            LEFT JOIN employees AS managers ON employees.manager_id=managers.id
            LEFT JOIN roles ON employees.role_id=roles.id
            LEFT JOIN departments ON roles.department_id=departments.id
            ORDER BY employees.last_name
            `;
        
        case 'add a role':
        case 'delete a role':
        case 'view all roles':
            return `
            SELECT roles.title AS Title,  roles.id as ID, departments.dept_name as Department, roles.salary AS Salary
            FROM roles
            LEFT JOIN departments ON roles.department_id=departments.id
            ORDER BY roles.title
            `
        
        case 'add a department':
        case 'delete a department':
        case 'view all departments':
            return `
            SELECT departments.dept_name AS Department, departments.id AS ID
            FROM departments
            ORDER BY departments.dept_name
            `
        case 'employees by manager':
            return `
            SELECT employees.id AS ID, employees.first_name AS First, employees.last_name AS Last, roles.title AS Title, departments.dept_name AS Department, roles.salary AS Salary
            FROM employees
            LEFT JOIN employees AS managers ON employees.manager_id=managers.id
            LEFT JOIN roles ON employees.role_id=roles.id
            LEFT JOIN departments ON roles.department_id=departments.id
            WHERE employees.manager_id=`
        
        case 'view department utilized budget':
            return `
            SELECT departments.dept_name AS Department, COUNT(employees.id) AS Total_Employees, SUM(roles.salary) AS Total_Salaries
            FROM employees
            LEFT JOIN employees AS managers ON employees.manager_id=managers.id
            LEFT JOIN roles ON employees.role_id=roles.id
            LEFT JOIN departments ON roles.department_id=departments.id
            GROUP BY Department
            ORDER BY Department
            `
        case 'employees':
            return `
            SELECT CONCAT(first_name, " ", last_name) as Name, id as ID
            FROM employees
            ORDER BY last_name
            `
        case 'roles':
            return `
            SELECT roles.title AS Title, roles.id AS ID
            FROM roles
            ORDER BY roles.title
            `
        case 'departments':
            return `
            SELECT departments.dept_name AS Name, departments.id AS ID
            FROM departments
            ORDER by departments.dept_name
            `
        case 'managers':
            return `
            SELECT CONCAT(managers.first_name, " " , managers.last_name) As Manager, managers.id AS ID
            FROM employees as managers
            ORDER BY managers.last_name
            `
        case 'newEmployee':
            return `
            INSERT INTO employees (first_name, last_name, role_id, manager_id)
            VALUES`

        case 'newDepartment':
            return  `
            INSERT INTO departments (dept_name)
            VALUES  `

        case 'newRole':
            return  `
            INSERT INTO roles (title, department_id, salary)
            VALUES  `
        
        case 'deleteEmployee':
            return `
            DELETE FROM employees
            WHERE id=`
        
        case 'deleteDepartment':
            return `
            DELETE FROM departments
            WHERE id=`
    
        case 'deleteRole':
            return `
            DELETE FROM roles
            WHERE id=`
    }
});


 


module.exports = { sql_statement };