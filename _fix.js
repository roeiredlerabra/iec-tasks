const fs = require('fs');
const file = String.raw`c:\Users\roei.redler\OneDrive - abra-IT\Documents\Github\iec-tasks\deployment.html`;
let content = fs.readFileSync(file, 'utf8');
const count = (content.match(/\(\$\{request\.id\}\)/g) || []).length;
content = content.replace(/\(\$\{request\.id\}\)/g, "('${request.id}')");
fs.writeFileSync(file, content, 'utf8');
console.log('Quoted ' + count + ' occurrences');
