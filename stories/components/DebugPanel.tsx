
import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { FormModel } from '../../src/FormModel';

interface DebugPanelProps {
  model: FormModel<any>;
}

export const DebugPanel = observer(({ model }: DebugPanelProps) => {
  return (
    <div style={{ 
      marginTop: '20px', 
      padding: '15px', 
      backgroundColor: 'var(--mf-debug-bg)', 
      border: '1px solid var(--mf-debug-border)', 
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      color: 'var(--mf-text)'
    }}>
      <h3>Debug Info</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h4>State Flags</h4>
          <ul>
            <li>Valid: <strong>{model.valid ? '✅ Yes' : '❌ No'}</strong></li>
            <li>Dirty: <strong>{model.dirty ? 'Yes' : 'No'}</strong></li>
            <li>Interacted: <strong>{model.interacted ? 'Yes' : 'No'}</strong></li>
            <li>Validating: <strong>{model.validating ? '⏳ Yes' : 'No'}</strong></li>
            <li>Data Ready: <strong>{model.dataIsReady ? '✅ Yes' : '❌ No'}</strong></li>
            <li>Validated Once: <strong>{model.validatedAtLeastOnce ? 'Yes' : 'No'}</strong></li>
          </ul>
        </div>
        <div>
          <h4>Serialized Data</h4>
          <pre style={{ overflow: 'auto', color: 'var(--mf-text-secondary)' }}>
            {JSON.stringify(model.serializedData, null, 2)}
          </pre>
        </div>
      </div>
      
      <h4>Required Fields</h4>
      <div style={{ color: 'var(--mf-text-secondary)' }}>{JSON.stringify(model.requiredFields)}</div>
    </div>
  );
});
