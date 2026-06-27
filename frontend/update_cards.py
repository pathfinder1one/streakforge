import os
import re

target_dir = r"c:\Users\chira\Downloads\streakforge_1\streakforge\frontend\src"

class_regex = re.compile(r'className="([^"]+)"')

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    def replacer(match):
        classes_str = match.group(1)
        classes = classes_str.split()
        
        is_bg = any(c in ['bg-base-900', 'bg-base-900/60', 'bg-base-950', 'bg-base-950/60', 'bg-base-950/50', 'bg-base-900/50'] for c in classes)
        is_border = any(c in ['border-base-800', 'border-base-700', 'border-base-800/50'] for c in classes)
        is_rounded = any(c.startswith('rounded-xl') or c.startswith('rounded-2xl') or c.startswith('rounded-3xl') for c in classes)
        
        if is_bg and is_border and is_rounded:
            # Revert old base-950 stuff if it exists
            classes = [c for c in classes if not c.startswith('bg-base-9') and not c.startswith('hover:border') and not c.startswith('border-base-') and not c.startswith('hover:shadow') and not c.startswith('hover:-translate') and not c.startswith('hover:scale')]
            
            # Apply premium gradient theme
            classes.append('bg-gradient-to-br')
            classes.append('from-base-950')
            classes.append('to-base-900')
            classes.append('border-ember-500/20')
            classes.append('border')
            
            # Apply hover effects
            new_classes = [
                'hover:-translate-y-1', 
                'hover:scale-[1.01]', 
                'hover:shadow-[0_0_20px_rgba(234,63,12,0.15)]', 
                'hover:border-ember-500/50', 
                'transition-all', 
                'duration-300',
                'shadow-sm'
            ]
            
            for nc in new_classes:
                if nc not in classes:
                    classes.append(nc)
                    
            if 'transition-colors' in classes and 'transition-all' in classes:
                classes.remove('transition-colors')
                
        return f'className="{" ".join(classes)}"'

    new_content = class_regex.sub(replacer, content)
    
    if new_content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

for root, _, files in os.walk(target_dir):
    for file in files:
        if file.endswith('.tsx') and file not in ['Profile.tsx', 'Assistant.tsx', 'HistoryCard.tsx', 'StreakCard.tsx']:
            process_file(os.path.join(root, file))

print("Done")
