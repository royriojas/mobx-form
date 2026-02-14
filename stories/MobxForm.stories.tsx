
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { createModel, createModelFromState } from '../src/index';
import { FormWrapper } from './components/FormWrapper';
import { FieldInput } from './components/FieldInput';
import { DebugPanel } from './components/DebugPanel';
import { sleep } from '../src/resources/utils';

const meta: Meta = {
  title: 'MobxForm',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// --- 01. Simple Form ---
export const SimpleForm = () => {
  const model = useLocalObservable(() => 
    createModel({
      initialState: {
        username: '',
        password: '',
      },
      descriptors: {
        username: { required: 'Username is required' },
        password: { required: 'Password is required' },
      }
    })
  );

  return (
    <FormWrapper model={model} title="Simple Login Form" description="Basic form with two required fields.">
      <FieldInput field={model.fields.username} label="Username" />
      <FieldInput field={model.fields.password} label="Password" type="password" />
      <DebugPanel model={model} />
    </FormWrapper>
  );
};

// --- 02. Validation Types ---
export const ValidationTypes = () => {
  const model = useLocalObservable(() => 
    createModel({
      initialState: {
        email: '',
        age: '',
        bio: '',
      },
      descriptors: {
        email: {
          required: true,
          validator: (field) => {
            if (!field.value?.includes('@')) return { error: 'Must be a valid email' };
          }
        },
        age: {
          validator: (field) => {
            const num = Number(field.value);
            if (isNaN(num) || num < 18) throw new Error('Must be at least 18');
          }
        },
        bio: {
          required: 'Bio is required',
          validator: [
            (field) => { 
                if (field.value && field.value.length < 10) return { error: 'Bio too short (min 10 chars)' }; 
            },
            (field) => {
                if (field.value && field.value.includes('spam')) throw new Error('No spam allowed!');
            }
          ]
        }
      }
    })
  );

  return (
    <FormWrapper model={model} title="Validation Types" description="Demonstrates sync validators returning errors, throwing errors, and array of validators.">
      <FieldInput field={model.fields.email} label="Email (Return object)" />
      <FieldInput field={model.fields.age} label="Age (Throw error)" type="number" />
      <FieldInput field={model.fields.bio} label="Bio (Multiple validators)" />
      <DebugPanel model={model} />
    </FormWrapper>
  );
};

// --- 03. Async Validation ---
export const AsyncValidation = () => {
  const model = useLocalObservable(() => 
    createModel({
      initialState: {
        username: '',
      },
      descriptors: {
        username: {
          required: true,
          validator: async (field) => {
            await sleep(2000); // Simulate API call
            if (field.value === 'taken') {
              throw new Error('Username is already taken');
            }
          }
        }
      }
    })
  );

  return (
    <FormWrapper model={model} title="Async Validation" description="Type 'taken' to see async validation fail after 2 seconds.">
      <FieldInput field={model.fields.username} label="Username (Async check)" />
      <DebugPanel model={model} />
    </FormWrapper>
  );
};

// --- 04. Dirty Tracking & Commit ---
export const DirtyTracking = () => {
  const model = useLocalObservable(() => 
    createModel({
      initialState: {
        firstName: 'John',
        lastName: 'Doe',
      },
      descriptors: {
        firstName: {},
        lastName: {},
      }
    })
  );

  return (
    <FormWrapper 
      model={model} 
      title="Dirty Tracking" 
      description="Change values to see 'Dirty' flag. Commit to save new baseline. Restore to reset."
      onCommit={() => model.commit()}
      onRestore={() => model.restoreInitialValues()}
    >
      <FieldInput field={model.fields.firstName} label="First Name" />
      <FieldInput field={model.fields.lastName} label="Last Name" />
      <DebugPanel model={model} />
    </FormWrapper>
  );
};

// --- 05. Auto Validate Toggle ---
const AutoValidateLink = observer(({ model }: { model: any }) => (
    <div style={{ marginBottom: 10 }}>
        <label>
            <input type="checkbox" checked={model.fields.search.autoValidate} onChange={(e) => {
                // Changing autoValidate requires re-creating/updating field descriptor or internal flag
                // Field._autoValidate is internal but we can try to hack it or just show initial diff
                // Actually `field.autoValidate` is a getter only?
                // Looking at source: _autoValidate is internal, no setter. 
                // But we can create two fields, one with autoValidate: true, one false.
            }} disabled />
            Input below has autoValidate: {model.fields.search.autoValidate ? 'ON' : 'OFF'}
        </label>
    </div>
));

export const ManualValidation = () => {
  const model = useLocalObservable(() => 
    createModel({
      initialState: {
        autoField: '',
        manualField: '',
      },
      descriptors: {
        autoField: { autoValidate: true, required: true },
        manualField: { autoValidate: false, required: true },
      }
    })
  );

  return (
    <FormWrapper model={model} title="Auto vs Manual Validation" description="The first field validates on type. The second waits for blur or explicit validate click.">
      <FieldInput field={model.fields.autoField} label="Auto Validate (Default)" />
      <FieldInput field={model.fields.manualField} label="Manual Validate (autoValidate: false)" />
      <DebugPanel model={model} />
    </FormWrapper>
  );
};

// --- 06. Dynamic Fields ---
const DynamicFieldsComponent = observer(() => {
    const model = useLocalObservable(() => 
        createModel({
            initialState: {
                fixed: 'I am fixed',
            },
            descriptors: {
                fixed: { required: true },
            }
        })
    );

    const addField = () => {
        const id = `extra_${Date.now()}`;
        model.addFields({
            [id]: { required: true, value: '' }
        });
    };

    return (
        <FormWrapper model={model} title="Dynamic Fields" description="Click 'Add Field' to append new required fields to the model.">
            <FieldInput field={model.fields.fixed} label="Fixed Field" />
            
            {Object.keys(model.fields).filter(k => k.startsWith('extra_')).map(key => (
                <FieldInput key={key} field={(model.fields as any)[key]} label={`Dynamic Field ${key}`} />
            ))}

            <button type="button" onClick={addField} style={{ marginBottom: 15, padding: '5px 10px' }}>
                + Add Field
            </button>
            <DebugPanel model={model} />
        </FormWrapper>
    );
});

export const DynamicFields = () => <DynamicFieldsComponent />;


// --- 07. Cross Field Validation ---
export const CrossFieldValidation = () => {
  const model = useLocalObservable(() => 
    createModel({
      initialState: {
        password: '',
        confirmPassword: '',
      },
      descriptors: {
        password: { required: true },
        confirmPassword: { 
            required: true,
            validator: (field) => {
                if (field.value !== field.model.fields.password.value) {
                    return { error: 'Passwords must match' };
                }
            }
        },
      }
    })
  );

  return (
    <FormWrapper model={model} title="Cross-Field Validation & Dependencies" description="Confirm Password depends on Password field.">
      <FieldInput field={model.fields.password} label="Password" type="password" />
      <FieldInput field={model.fields.confirmPassword} label="Confirm Password" type="password" />
      <DebugPanel model={model} />
    </FormWrapper>
  );
};


// --- 08. Disable / Enable Fields ---
const DisableFieldsComponent = observer(() => {
    const model = useLocalObservable(() => 
        createModel({
            initialState: {
                email: 'test@example.com',
            },
            descriptors: {
                email: { required: true },
            }
        })
    );

    return (
        <FormWrapper model={model} title="Disable / Enable Fields" description="Disabled fields are excluded from validation.">
            <div style={{ marginBottom: 10 }}>
                <label>
                    <input 
                        type="checkbox" 
                        checked={model.fields.email.disabled} 
                        onChange={(e) => model.fields.email.setDisabled(e.target.checked)} 
                    />
                    Disable Email Field
                </label>
            </div>
            
            <FieldInput field={model.fields.email} label="Email" />
            <DebugPanel model={model} />
        </FormWrapper>
    );
});

export const DisableFields = () => <DisableFieldsComponent />;


// --- 09. Field Meta ---
export const FieldMeta = () => {
  const model = useLocalObservable(() => 
    createModel({
      initialState: {
        choice: '',
      },
      descriptors: {
        choice: { 
            required: true, 
            meta: { 
                options: ['Option A', 'Option B', 'Option C'],
                placeholder: 'Select one...'
            }
        },
      }
    })
  );

  const field = model.fields.choice;

  return (
    <FormWrapper model={model} title="Field Meta" description="Using meta to store options for a select input.">
      <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Choice *</label>
          <select 
            value={field.value as string} 
            onChange={(e) => field.setValue(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          >
              <option value="">{field.meta?.placeholder}</option>
              {field.meta?.options.map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
              ))}
          </select>
          {field.error && <div style={{ color: 'red' }}>{field.error}</div>}
      </div>
      <DebugPanel model={model} />
    </FormWrapper>
  );
};

// --- 10. Wait For Blur ---
export const WaitForBlur = () => {
  const model = useLocalObservable(() => 
    createModel({
      initialState: {
        text: '',
      },
      descriptors: {
        text: { 
            required: true,
            waitForBlur: true 
        },
      }
    })
  );

  return (
    <FormWrapper model={model} title="Wait For Blur" description="Validation only triggers after the field is blurred (focus out).">
      <FieldInput field={model.fields.text} label="Text (waitForBlur: true)" />
      <DebugPanel model={model} />
    </FormWrapper>
  );
};

// --- 11. Boolean and Array Values ---
export const BooleanAndArrays = () => {
  const model = useLocalObservable(() => 
    createModel({
      initialState: {
        isAgreed: false, // boolean
        tags: [] as string[], // array
      },
      descriptors: {
        isAgreed: { 
            required: 'You must agree to terms', 
            // booleans need custom check if "false" is considered "no value"? 
            // default behavior: false is a value. empty string/null/undefined is not.
            // But usually for "Agree" checkbox, false is invalid.
            validator: (field) => { if (field.value !== true) return { error: 'Must agree' }; }
        },
        tags: {
            required: 'At least one tag required',
            // Default hasValue for arrays checks length > 0
        }
      }
    })
  );

  return (
    <FormWrapper model={model} title="Boolean & Array Values" description="Handling checkboxes and array inputs.">
      <FieldInput field={model.fields.isAgreed} label="I Agree to Terms" type="checkbox" />
      
      <div style={{ marginBottom: 15 }}>
        <label style={{ fontWeight: 'bold' }}>Tags (comma separated)</label>
        <input 
            style={{ width: '100%', padding: 8 }}
            onChange={(e) => {
                const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                model.fields.tags.setValue(val);
            }} 
            placeholder="Type tags..."
        />
        <div style={{ fontSize: 12, color: '#666' }}>Current tags: {JSON.stringify(model.fields.tags.value)}</div>
        {model.fields.tags.error && <div style={{ color: 'red' }}>{model.fields.tags.error}</div>}
      </div>

      <DebugPanel model={model} />
    </FormWrapper>
  );
};

// --- 12. Clear Error On Value Change ---
export const ClearErrorOnValueChange = () => {
  const model = useLocalObservable(() => 
    createModel({
      initialState: {
        normal: '',
        autoClear: '',
      },
      descriptors: {
        normal: { 
            required: true,
            autoValidate: false 
        },
        autoClear: { 
            required: true,
            autoValidate: false,
            clearErrorOnValueChange: true 
        }
      }
    })
  );

  return (
    <FormWrapper model={model} title="Clear Error On Value Change" description="Field 2 clears its error immediately when you type, even without re-validating. Field 1 keeps the error until next validation.">
      <p>1. Click Validate to show errors.<br/>2. Type in fields.</p>
      <FieldInput field={model.fields.normal} label="Normal Field" />
      <FieldInput field={model.fields.autoClear} label="Auto Clear (clearErrorOnValueChange: true)" />
      <DebugPanel model={model} />
    </FormWrapper>
  );
};

// --- 13. Validated At Least Once ---
export const ValidatedAtLeastOnce = () => {
  const model = useLocalObservable(() => 
    createModel({
      initialState: {
        field1: '',
        field2: '',
      },
      descriptors: {
        field1: { required: true },
        field2: { required: true },
      }
    })
  );

  return (
    <FormWrapper model={model} title="Validated At Least Once" description="Track if the form (or field) has been validated at least once.">
      <FieldInput field={model.fields.field1} label="Field 1" />
      <FieldInput field={model.fields.field2} label="Field 2" />
      
      <div style={{ margin: '10px 0' }}>
        <strong>Model Validated Once?</strong> {model.validatedAtLeastOnce ? 'Yes' : 'No'}
        <br/>
        <button type="button" onClick={() => model.resetValidatedOnce()}>Reset Flag</button>
      </div>

      <DebugPanel model={model} />
    </FormWrapper>
  );
};
