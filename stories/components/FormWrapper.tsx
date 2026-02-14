
import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { FormModel } from '../../src/FormModel';

interface FormWrapperProps {
  model: FormModel<any>;
  children: React.ReactNode;
  title?: string;
  description?: string;
  onCommit?: () => void;
  onRestore?: () => void;
}

export const FormWrapper = observer(({ model, children, title, description, onCommit, onRestore }: FormWrapperProps) => {
  const handleResetErrors = () => {
    Object.values(model.fields).forEach((field: any) => field.resetError());
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      {title && <h2 style={{ marginTop: 0 }}>{title}</h2>}
      {description && <p style={{ color: '#666', marginBottom: '20px' }}>{description}</p>}

      {model.summary.length > 0 && (
        <div style={{ backgroundColor: '#fff0f0', color: '#d00', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
          <strong>Errors:</strong>
          <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
            {model.summary.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); }}>
        {children}

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={() => model.validate()} 
            disabled={model.validating}
            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {model.validating ? 'Validating...' : 'Validate'}
          </button>
          
          <button 
            type="button" 
            onClick={handleResetErrors} 
            style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Reset Errors
          </button>

          {onCommit && (
            <button 
              type="button" 
              onClick={onCommit}
              style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Commit
            </button>
          )}

          {onRestore && (
            <button 
              type="button" 
              onClick={onRestore}
              style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Restore Initial
            </button>
          )}
        </div>
      </form>
    </div>
  );
});
