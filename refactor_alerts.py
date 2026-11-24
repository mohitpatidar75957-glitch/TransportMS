import os
import re

directory = 'c:/Users/pc/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/TMS/frontend/src/pages'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if we need to modify
    if 'alert(' not in content and 'confirm(' not in content and 'window.alert(' not in content and 'window.confirm(' not in content:
        return

    # Add import
    if 'useModal' not in content:
        import_stmt = "import { useModal } from '../context/ModalContext';\n"
        # Find last import
        last_import_match = list(re.finditer(r'^import .*;?$', content, flags=re.MULTILINE))
        if last_import_match:
            last_import = last_import_match[-1]
            content = content[:last_import.end()] + '\n' + import_stmt + content[last_import.end():]
        else:
            content = import_stmt + '\n' + content

    # Add useModal hook call inside the component
    # Find the main component definition
    comp_match = re.search(r'const\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*\([^)]*\)\s*=>\s*{', content)
    if comp_match:
        comp_start = comp_match.end()
        # insert hook
        if 'const { showAlert, showConfirm } = useModal();' not in content:
            content = content[:comp_start] + '\n  const { showAlert, showConfirm } = useModal();' + content[comp_start:]

    # Replace window.alert and window.confirm
    content = re.sub(r'window\.alert\s*\(', 'showAlert(', content)
    content = re.sub(r'(?<!show)alert\s*\(', 'showAlert(', content)
    
    # For confirm, replace with await showConfirm
    content = re.sub(r'window\.confirm\s*\(', 'await showConfirm(', content)
    content = re.sub(r'(?<!show)confirm\s*\(', 'await showConfirm(', content)

    # Now we need to ensure any function containing 'await showConfirm' is async.
    # This is a bit tricky with regex, but we can look for standard event handlers like handleXYZ = (...) => {
    # and add async.
    
    # Find all handler definitions that might contain await
    # Example: const handleDelete = (id) => {
    # or const handleDelete = id => {
    
    lines = content.split('\n')
    for i in range(len(lines)):
        if 'await showConfirm' in lines[i]:
            # trace back to find the function signature
            for j in range(i, -1, -1):
                if re.search(r'const\s+\w+\s*=\s*\(?[^)]*\)?\s*=>\s*{', lines[j]):
                    if 'async' not in lines[j]:
                        lines[j] = re.sub(r'(const\s+\w+\s*=\s*)(.*=>\s*{)', r'\1async \2', lines[j])
                    break
    
    content = '\n'.join(lines)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Refactored: {filepath}")

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))
