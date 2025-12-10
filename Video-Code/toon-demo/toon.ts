import { encode } from '@toon-format/toon'

const data = {
  employees: [
    { id: 1, name: 'Alice', role: 'admin', department: 'IT', salary: 95000 },
    { id: 2, name: 'Bob', role: 'developer', department: 'Engineering', salary: 85000 },
    { id: 3, name: 'Charlie', role: 'manager', department: 'Sales', salary: 110000 },
    { id: 4, name: 'Diana', role: 'designer', department: 'Product', salary: 80000 },
    { id: 5, name: 'Eve', role: 'analyst', department: 'Finance', salary: 75000 }
  ]
}

console.log(encode(data))