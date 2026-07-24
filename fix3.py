import os

mobile_step_three = r'components\forms\mobile\steps\MobileStepThree.tsx'
if os.path.exists(mobile_step_three):
    with open(mobile_step_three, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    for line in lines:
        if 'fileId={' in line or 'onFileIdChange={' in line:
            continue
        
        # Also fix imports and implicit any while we're at it
        if 'import type { FormData, FormContentItem } from "@/hooks/useFormHandler"' in line:
            line = line.replace('@/hooks/useFormHandler', '@/app/form-types')
        if '(item, index) => (' in line:
            line = line.replace('(item, index)', '(item: any, index: any)')
            
        new_lines.append(line)
        
    with open(mobile_step_three, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Fixed MobileStepThree.tsx")
