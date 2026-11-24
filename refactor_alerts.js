const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/pc/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/TMS/frontend/src/pages';

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf-8');

    if (!content.includes('alert(') && !content.includes('confirm(')) {
        return;
    }

    if (!content.includes('useModal')) {
        const importStmt = "import { useModal } from '../context/ModalContext';\n";
        const importMatch = [...content.matchAll(/^import .*;?$/gm)];
        if (importMatch.length > 0) {
            const lastImport = importMatch[importMatch.length - 1];
            const insertIdx = lastImport.index + lastImport[0].length;
            content = content.slice(0, insertIdx) + '\n' + importStmt + content.slice(insertIdx);
        } else {
            content = importStmt + '\n' + content;
        }
    }

    const compMatch = content.match(/const\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*\([^)]*\)\s*=>\s*{/);
    if (compMatch) {
        const insertIdx = compMatch.index + compMatch[0].length;
        if (!content.includes('const { showAlert, showConfirm } = useModal();')) {
            content = content.slice(0, insertIdx) + '\n  const { showAlert, showConfirm } = useModal();' + content.slice(insertIdx);
        }
    }

    content = content.replace(/window\.alert\s*\(/g, 'showAlert(');
    content = content.replace(/(?<!show)alert\s*\(/g, 'showAlert(');
    
    content = content.replace(/window\.confirm\s*\(/g, 'await showConfirm(');
    content = content.replace(/(?<!show)confirm\s*\(/g, 'await showConfirm(');

    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('await showConfirm')) {
            for (let j = i; j >= 0; j--) {
                if (lines[j].match(/const\s+\w+\s*=\s*\(?[^)]*\)?\s*=>\s*{/)) {
                    if (!lines[j].includes('async ')) {
                        lines[j] = lines[j].replace(/(const\s+\w+\s*=\s*)(.*=>\s*{)/, '$1async $2');
                    }
                    break;
                }
            }
        }
    }

    fs.writeFileSync(filepath, lines.join('\n'), 'utf-8');
    console.log(`Refactored: ${filepath}`);
}

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat && stat.isDirectory()) {
            walk(filepath);
        } else if (file.endsWith('.jsx')) {
            processFile(filepath);
        }
    });
}

walk(directory);
