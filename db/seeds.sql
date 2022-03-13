INSERT INTO departments (dept_name)
VALUES
  ('Sales'),
  ('Accounting'),
  ('Operations'),
  ('Shipping'),
  ('Executive'),
  ('Maintenance'),
  ('IT');

INSERT INTO roles (title, department_id, salary)
VALUES
  ('CEO', 3, 1000000.00),
  ('President', 3, 500000.00),
  ('Vice President', 3, 250000.00),
  ('Sales Manager', 1, 150000.00),
  ('Account Executive', 1, 100000.00),
  ('Sales Associate', 1, 75000.00),
  ('Sales Assistant', 1, 50000.00),
  ('Accounting Manager', 2, 150000.00),
  ('A/P Accountant', 2, 75000.00),
  ('A/R Accountant', 2, 75000.00),
  ('Accounting Assistant', 2, 50000.00);

INSERT INTO employees (first_name, last_name, role_id)
VALUES
  ('Fred', 'Johnson', 6),
  ('Steve', 'Hume', 5),
  ('Lisa', 'Lyons', 4),
  ('Maria', 'Wilson', 3),
  ('Charlie', 'Bebus', 2),
  ('Patrick', 'Lawler', 1),
  ('Supaporn', 'Hagen', 7),
  ('Katie', 'Hagen', 8),
  ('Frank', 'Zappa', 9),
  ('John', 'Smith', 10);

UPDATE employees SET manager_id = 1 WHERE role_id = 2;
UPDATE employees SET manager_id = 2 WHERE role_id = 3;
UPDATE employees SET manager_id = 3 WHERE role_id = 4;
UPDATE employees SET manager_id = 3 WHERE role_id = 8;
UPDATE employees SET manager_id = 4 WHERE role_id = 5;
UPDATE employees SET manager_id = 4 WHERE role_id = 6;
UPDATE employees SET manager_id = 4 WHERE role_id = 7;
UPDATE employees SET manager_id = 8 WHERE role_id = 9;
UPDATE employees SET manager_id = 8 WHERE role_id = 10;
UPDATE employees SET manager_id = 8 WHERE role_id = 11;
