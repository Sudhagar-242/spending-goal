import React, { useState, useRef, useEffect } from 'react';

const InlineEditableText = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    if (isEditing) {
      setIsEditing(false);
      if (inputValue.trim() !== value) {
        onSave(inputValue.trim());
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onSave(inputValue.trim());
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(value); // reset to original
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        readOnly={!isEditing}
        onDoubleClick={handleDoubleClick}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          border: isEditing ? '1px solid #ccc' : '1px solid transparent',
          background: isEditing ? '#fff' : 'transparent',
          cursor: isEditing ? 'text' : 'pointer',
          padding: '4px 6px',
          borderRadius: '4px',
          fontSize: '14px',
          outline: 'none',
          width: '100%',
        }}
      />
    </>
  );
};

export default InlineEditableText;

// import { useState } from 'react';
// import { Text, TextField, InlineStack } from '@shopify/polaris';

// //styles
// import styles from './inline-edit.module.css'

// function InlineEditableText({
//   value,
//   onSave,
// }: {
//   value: string;
//   onSave: (newVal: string) => void;
// }) {
//   const [editing, setEditing] = useState(false);
//   const [tempValue, setTempValue] = useState(value);

//   const handleSave = () => {
//     setEditing(false);
//     if (tempValue.trim() !== '') {
//       onSave(tempValue);
//     }
//   };

//   return (
//     <InlineStack align="start" gap="200">
//       {editing ? (
//         <div className={styles["custom-textfield"]}>
//           <TextField
//             value={tempValue}
//             onChange={setTempValue}
//             onBlur={handleSave}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter') handleSave();
//               if (e.key === 'Escape') setEditing(false);
//             }}
//           />
//         </div>
//       ) : (
//         <InlineStack gap="100" align="start">
//           <span onClick={() => setEditing(true)} style={{ cursor: 'pointer' }}>
//             <Text variant="headingMd" as="h3">
//               {value}
//             </Text>
//           </span>
//         </InlineStack>
//       )}
//     </InlineStack>
//   );
// }

// export default InlineEditableText;
