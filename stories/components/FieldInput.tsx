
import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { Field } from '../../src/FormModel';

interface FieldInputProps {
  field: Field<any, any>;
  label?: string;
  type?: string;
}

export const FieldInput = observer(({ field, label, type = 'text' }: FieldInputProps) => {
  const isCheckbox = type === 'checkbox';
  
  return (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
        {label || field.name}
        {field.required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
      </label>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type={type}
          value={isCheckbox ? undefined : (field.value ?? '')}
          checked={isCheckbox ? !!field.value : undefined}
          onChange={(e) => {
             const val = isCheckbox ? e.target.checked : e.target.value;
             field.setValue(val);
          }}
          onBlur={() => field.markBlurredAndValidate()}
          disabled={field.disabled}
          style={{
            width: isCheckbox ? 'auto' : '100%',
            padding: '8px',
            border: `1px solid ${field.error ? 'red' : field.interacted ? '#28a745' : '#ccc'}`,
            borderRadius: '4px',
            backgroundColor: field.disabled ? '#f0f0f0' : 'white'
          }}
        />
        {field.validating && <span style={{ marginLeft: '10px', color: '#666' }}>Validating...</span>}
      </div>

      {field.error && (
        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
          {field.error}
        </div>
      )}
      
      <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
        Dirty: {field.dirty ? 'Yes' : 'No'} | 
        Interacted: {field.interacted ? 'Yes' : 'No'} | 
        Blurred: {field.blurred ? 'Yes' : 'No'}
      </div>
    </div>
  );
});
