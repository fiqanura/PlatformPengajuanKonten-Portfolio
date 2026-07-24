import os
import re

# Fix MobileStepThree.tsx
mobile_step_three = r'components\forms\mobile\steps\MobileStepThree.tsx'
if os.path.exists(mobile_step_three):
    with open(mobile_step_three, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove fileId and onFileIdChange props
    content = re.sub(r'\s*fileId=\{[^\}]+\}', '', content)
    content = re.sub(r'\s*onFileIdChange=\{[^\}]+\}', '', content)
    
    with open(mobile_step_three, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed MobileStepThree.tsx")
