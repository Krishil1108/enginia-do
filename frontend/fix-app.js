const fs = require('fs');

let content = fs.readFileSync('src/App.js', 'utf8');

// Fix the template literals in AllTasksView by putting them on single lines
content = content.replace(
  /className=\{`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 \$\{\s+viewMode === 'cards'\s+\? 'bg-blue-600 text-white shadow-md'\s+: 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'\s+\}`\}/gs,
  "className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 \${viewMode === 'cards' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}\`}"
);

content = content.replace(
  /className=\{`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 \$\{\s+viewMode === 'table'\s+\? 'bg-blue-600 text-white shadow-md'\s+: 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'\s+\}`\}/gs,
  "className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 \${viewMode === 'table' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}\`}"
);

fs.writeFileSync('src/App.js', content);
console.log('Fixed App.js');
