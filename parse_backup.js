const fs = require('fs');

const content = fs.readFileSync('backup_utf8.sql', 'utf8');
const lines = content.split(/\r?\n/);

const tableInserts = {};

for (const line of lines) {
  if (line.startsWith('INSERT INTO `')) {
    const endIdx = line.indexOf('`', 13);
    const tableName = line.substring(13, endIdx);
    if (!tableInserts[tableName]) {
      tableInserts[tableName] = [];
    }
    tableInserts[tableName].push(line);
  }
}

console.log('Tables and insert line counts:');
for (const [tbl, stmts] of Object.entries(tableInserts)) {
  console.log(`${tbl}: ${stmts.length} statement(s)`);
}
