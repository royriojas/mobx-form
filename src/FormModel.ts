import { observable, computed, extendObservable, action, makeObservable } from 'mobx';
import trim from 'lodash/trim';
import debounce from 'lodash/debounce';
import type { DebouncedFunc } from 'lodash';

const toString = Object.prototype.toString;

const isObject = (o: unknown) => o && toString.call(o) === '[object Object]';
const isNullishOrEmpty = (value: unknown): value is null | undefined | string => {
  return typeof value === 'undefined' || value === null || value === '';
};

export type Descriptors<T> = {
  [P in keyof T]: ValidatorDescriptor<T[P], T>;
};

export type FormModelArgs<T> = {
  descriptors: Descriptors<T>;
  initialState?: Partial<T>;
  options?: ThrowIfMissingFieldType;
};

export type ResultObj = { error: string };
export type ErrorLike = { message: string } | Error;
export type ValidatorResult = boolean | ResultObj;
export type ValidateFn<T, K> = ((field: Field<T, K>, fields: FormModel<K>['fields'], model: FormModel<K>) => Promise<ValidatorResult>);
export type ResetInteractedFlagType = {
  resetInteractedFlag?: boolean;
};

export type ThrowIfMissingFieldType = {
  throwIfMissingField?: boolean;
}

export interface ValidatorDescriptor<T, K> {
  waitForBlur?: boolean;

  disabled?: boolean;

  errorMessage?: string;

  validator?: ValidateFn<T,K> | ValidateFn<T,K>[];

  hasValue?: (value: T) => boolean

  value?: T;

  required?: boolean | string;

  autoValidate?: boolean;

  validationDebounceThreshold?: number;

  clearErrorOnValueChange?: boolean;

  meta?: Record<string, any>;
}

export type CommitType = {
  commit?: boolean;
};

export type ForceType = {
  force?: boolean;
};

export type SetValueFnArgs = ResetInteractedFlagType & CommitType;

/**
 * Field class provides abstract the validation of a single field
 */

export class Field<T, K> {
  _name: string;
  
  meta?: Record<string, any>;
  
  _model: FormModel<K>;
  
  _waitForBlur? = false
  
  _disabled? = false;

  _required?: boolean | string = false;

  _validatedOnce = false;
  
  _clearErrorOnValueChange? = false;
  
  _hasValueFn?: (value: T) => boolean;
  
  get name() {
    return this._name;
  }
  
  get model() {
    return this._model;
  }

  get validatedAtLeastOnce() {
    return this._validatedOnce;
  }

  get waitForBlur() {
    return !!this._waitForBlur;
  }

  get disabled() {
    return !!this._disabled;
  }

  get required() {
    if (this.disabled) return false;

    return !!this._required;
  }

  resetInteractedFlag() {
    this._interacted = false;
  }

  markAsInteracted() {
    this._interacted = true;
  }

  resetValidatedOnce() {
    this._validatedOnce = false;
  }

  get hasValue() {
    if (this._hasValueFn) {
      return this._hasValueFn(this.value!);
    }
    // consider the case where the value is an array
    // we consider it actually has a value if the value is defined
    // and the array is not empy
    if (Array.isArray(this.value)) {
      return this.value.length > 0;
    }

    return !isNullishOrEmpty(this.value);
  }
  
  _validationTs: number = 0;

  /**
   * flag to know if a validation is in progress on this field
   */
  _validating = false;

  /**
   * field to store the initial value set on this field
   * */
  _initialValue?: T;

  /**
   * the value of the field
   * */
  _value?: T;

  /**
   * whether the user interacted with the field
   * this means if there is any value set on the field
   * either setting it using the `setValue` or using
   * the setter `value`. This is useful to know if
   * the user has interacted with teh form in any way
   */
  _interacted = false;

  /**
   * whether the field was blurred at least once
   * usually validators should only start being applied
   * after the first blur, otherwise they become
   * too invasive. This flag be used to keep track of
   * the fact that the user already blurred of a field
   */
  _blurredOnce = false;

  get blurred() {
    return !!this._blurredOnce;
  }

  /** the raw error in caes validator throws a real error */
  rawError?: ErrorLike;

  /**
   * the error message associated with this field.
   * This is used to indicate what error happened during
   * the validation process
   */
  get errorMessage() {
    return (this.rawError as ErrorLike)?.message;
  }

  /**
   * whether the validation should be launch after a
   * new value is set in the field. This is usually associated
   * to forms that set the value on the fields after each
   * onChange event
   */
  _autoValidate = false;

  get autoValidate() {
    return this._autoValidate;
  }

  /**
   * used to keep track of the original message
   */
  _originalErrorMessage?: string;

  /**
   * whether the field is valid or not
   */
  get valid() {
    return !this.errorMessage;
  }

  /**
   * whether the user has interacted or not with the field
   */
  get interacted() {
    return this._interacted;
  }

  /**
   * get the value set on the field
   */
  get value(): T | undefined {
    return this._value;
  }

  _setValueOnly = (val?: T) => {
    if (!this._interacted) {
      this._interacted = true;
    }

    if (this._value === val) {
      return;
    }

    this._value = val;
  }

  _setValue = (val?: T) => {
    if (this._value !== val && this._clearErrorOnValueChange && !this.valid) {
      this.resetError();
    }

    this._setValueOnly(val);

    if (this._autoValidate) {
      this._debouncedValidation?.();
    }
  }

  /**
   * setter for the value of the field
   */
  set value(val: T) {
    this._setValue(val);
  }


  setValue = (value?: T, { resetInteractedFlag, commit }: SetValueFnArgs = {}) => {Set
    if (resetInteractedFlag) {
      this._setValueOnly(value);
      this.rawError = undefined;
      this._interacted = false;
    } else {
      this._setValue(value);
    }

    if (commit) {
      this.commit();
    }
  }

  /**
   * Restore the initial value of the field
   */
  restoreInitialValue = ({ resetInteractedFlag = true, commit = true }: SetValueFnArgs = {}) => {
    this.setValue(this._initialValue, { resetInteractedFlag, commit });
  }

  get dirty() {
    return this._initialValue !== this.value;
  }

  commit() {
    this._initialValue = this.value;
  }

  /**
   * clear the valid state of the field by
   * removing the errorMessage string. A field is
   * considered valid if the errorMessage is not empty
   */
  resetError() {
    this.rawError = undefined;
  }

  clearValidation() {
    this.resetError();
  }

  /**
   * mark the field as already blurred so validation can
   * start to be applied to  the field.
   */
  markBlurredAndValidate = () => {
    if (!this._blurredOnce) {
      this._blurredOnce = true;
    }

    this.validate();
  };
  
  _validateFn?: ValidateFn<T, K> | Array<ValidateFn<T, K>>;

  _doValidate = async (): Promise<ValidatorResult | undefined> => {
    const { _validateFn, model } = this;

    if (!_validateFn) return Promise.resolve(true);
    
    const invokeFn = async (vfn: ValidateFn<T, K> | undefined, field: Field<T, K>, fields: FormModel<K>['fields'], model: FormModel<K>) => {
      if (!vfn) return true;
      if (typeof vfn !== 'function') {
        throw new Error('Validator must be a function or a function[]');
      }
      
      ret = await vfn(this, model.fields, model);
      if (ret === false || (ret as ResultObj)?.error) {
        return ret;
      }
    };

    let ret: ValidatorResult | undefined;
    if (Array.isArray(_validateFn)) {
      for (let i = 0; i < _validateFn.length; i++) {
        const vfn = _validateFn[i];
        ret = await invokeFn(vfn, this, model.fields, model);
      }
    } else {
      ret = await invokeFn(_validateFn, this, model.fields, model);
    }
    return ret;
  }

  setDisabled(disabled: boolean) {
    if (disabled) {
      this.resetError();
    }
    this._disabled = disabled;
  }

  validate = async (opts?: ForceType) => {
    this._debouncedValidation?.cancel();
    return await this._validate(opts);
  };

  get originalErrorMessage() {
    return this._originalErrorMessage || `Validation for "${this.name}" failed`;
  }

  setValidating = (validating: boolean) => {
    this._validating = validating;
  };

  get validating() {
    return this._validating;
  }

  /**
   * validate the field. If force is true the validation will be perform
   * even if the field was not initially interacted or blurred
   *
   */
  _validate = async ({ force = false }: ForceType = {}) => {
    const { required } = this;

    if (!this._validatedOnce) {
      this._validatedOnce = true;
    }

    const shouldSkipValidation = this.disabled || (!required && !this._validateFn);

    if (shouldSkipValidation) return;

    if (!force) {
      const userDidntInteractedWithTheField = !this._interacted;

      if (userDidntInteractedWithTheField && !this.hasValue) {
        // if we're not forcing the validation
        // and we haven't interacted with the field
        // we asume this field pass the validation status
        this.resetError();
        return;
      }

      // if the field requires the user to lost focus before starting the validation
      // we wait until the field is marked as blurredOnce. Except in the case the
      // field has an error already in which case we do want to execute the validation
      if (this.waitForBlur && !this._blurredOnce && !this.errorMessage) {
        return;
      }
    } else {
      this._blurredOnce = true;
    }

    if (required) {
      if (!this.hasValue) {
        // we can indicate that the field is required by passing the error message as the value of
        // the required field. If we pass a boolean or a function then the value of the error message
        // can be set in the requiredMessage field of the validator descriptor
        this.setError({ message: typeof this._required === 'string' ? this._required : `Field: "${this.name}" is required` });
        return;
      }
      this.resetError();
    }

    this.setValidating(true);

    const validationTs = (this._validationTs = Date.now());

    let res: ValidatorResult | undefined;
    try {
      res = await this._doValidate();
      if (validationTs !== this._validationTs) return; // ignore stale validations

      this.setValidating(false);
      // if the function returned a boolean we assume it is
      // the flag for the valid state
      if (typeof res === 'boolean') {
        this.setErrorMessage(res ? undefined : this.originalErrorMessage);
        return;
      }

      if (res?.error) {
        this.setErrorMessage(res.error);
        return;
      }

      this.resetError();
    } catch (err) {
      const errorArg = err as ErrorLike | ResultObj;
      
      if (validationTs !== this._validationTs) return; // ignore stale validations
      
      this.setValidating(false);

      let errorToSet: ErrorLike | undefined = errorArg as ErrorLike;
      
      const message = (errorArg as ErrorLike).message; 

      if (!message) {
        errorToSet = {
          ...errorArg,
          message: message || this.originalErrorMessage,
        };
      }
      
      const error = (errorArg as ResultObj).error;

      if (error) {
        errorToSet = {
          ...errorToSet,
          message: error,
        };
      }

      this.setError(errorToSet!);
    }
  }

  setRequired = (val: boolean | string) => {
    this._required = val;
  };

  setErrorMessage = (msg?: string) => {
    if (trim(msg) === '') {
      msg = undefined;
    }

    if (!msg) {
      this.resetError();
    } else {
      this.setError({ message: msg });
    }
  }

  setError = (error: ErrorLike) => {
    this.rawError = error;
  }

  get error() {
    return this.errorMessage;
  }
  
  _debouncedValidation?: DebouncedFunc<Field<T, K>['_validate']>;

  constructor(model: FormModel<K>, value: T, validatorDescriptor: ValidatorDescriptor<T, K>, fieldName: string) {
    makeObservable(this, {
      _value: observable.ref,
      _initialValue: observable.ref,
    });

    const DEBOUNCE_THRESHOLD = 300;

    this._value = value;
    this._model = model;
    this._name = fieldName;

    this._initialValue = value;

    const {
      waitForBlur,
      disabled,
      errorMessage,
      validator,
      hasValue,
      required,
      autoValidate = true,
      meta,
      validationDebounceThreshold = DEBOUNCE_THRESHOLD,
      clearErrorOnValueChange,
    } = validatorDescriptor;

    this._debouncedValidation = debounce(this._validate, validationDebounceThreshold);

    this._waitForBlur = waitForBlur;
    this._originalErrorMessage = errorMessage;
    this._validateFn = validator;
    this._clearErrorOnValueChange = clearErrorOnValueChange;

    // useful to determine if the field has a value set
    // only used if provided
    this._hasValueFn = hasValue;

    this._required = required;
    this._autoValidate = autoValidate;
    this._disabled = disabled;

    this.meta = meta; // store other props passed on the fields
  }
}


/**
 * a helper class to generate a dynamic form
 * provided some keys and validators descriptors
 *
 * @export
 * @class FormModel
 */
export class FormModel<K> {
  
  
  
  get validatedAtLeastOnce() {
    const keys = this._fieldKeys;
    return keys.every(key => this.fields[key].validatedAtLeastOnce);
  }

  get dataIsReady() {
    return this.interacted && this.requiredAreFilled && this.valid;
  }

  get requiredFields() {
    const keys = this._fieldKeys;
    return keys.filter(key => this.fields[key].required);
  }

  get requiredAreFilled() {
    const keys = this._fieldKeys;
    return keys.every(key => {
      const field = this.fields[key];
      if (field.required) {
        return !!field.hasValue;
      }
      return true;
    });
  }

  fields: { [P in keyof K]: Field<K[P], K> } = {} as { [P in keyof K]: Field<K[P], K> };

  // whether or not the there is a validation
  // process running
  _validating = false;

  // flag to indicate whether the form is valid or not
  // since some of the validators might be async validators
  // this value might be false until the validation process finish
  get valid() {
    if (this._validating) {
      return false; // consider the form invalid until the validation process finish
    }
    const keys = this._fieldKeys;
    return keys.every(key => {
      const field = this.fields[key];
      return !!field.valid;
    });
  }

  /**
   * whether or not the form has been "interacted", meaning that at
   * least a value has set on any of the fields after the model
   * has been created
   */
  get interacted() {
    const keys = this._fieldKeys;
    return keys.some(key => {
      const field = this.fields[key];
      return !!field.interacted;
    });
  }

  /**
   * Restore the initial values set at the creation time of the model
   * */
  restoreInitialValues(opts: SetValueFnArgs) {
    this._eachField(field => field.restoreInitialValue(opts));
  }

  commit() {
    this._eachField(field => field.commit());
  }

  get dirty() {
    return this._fieldKeys.some(key => {
      const f = this._getField(key);
      return f.dirty;
    });
  }

  /**
   * Set multiple values to more than one field a time using an object
   * where each key is the name of a field. The value will be set to each
   * field and from that point on the values set are considered the new
   * initial values. Validation and interacted flags are also reset if the second argument is true
   * */
  updateFrom(obj: Partial<K>, { resetInteractedFlag = true, ...opts }: SetValueFnArgs & ThrowIfMissingFieldType = {}) {
    const keys = Object.keys(obj) as (keyof K)[];
    keys.forEach(key => this.updateField(key, obj[key], { resetInteractedFlag, ...opts }));
  }

  /**
   * return the array of errors found. The array is an Array<String>
   * */
  get summary() {
    return this._fieldKeys.reduce((seq, key) => {
      const field = this.fields[key];
      if (field.errorMessage) {
        seq.push(field.errorMessage);
      }
      return seq;
    }, [] as string[]);
  }

  setValidating = (validating: boolean) => {
    this._validating = validating;
  };

  get validating() {
    return (
      this._validating ||
      this._fieldKeys.some(key => {
        const f = this._getField(key);
        return f.validating;
      })
    );
  }

  /**
   * Manually perform the form validation
   * */
  validate = async () => {
    this._validating = true;

    try {
      await Promise.all(
        this._fieldKeys.map(key => {
          const field = this.fields[key];
          return field.validate({ force: true });
        }),
      );  
      this.setValidating(false);
    }
    catch(err) {
      this.setValidating(false);
    }
  }

  /**
   * Update the value of the field identified by the provided name.
   * Optionally if reset is set to true, interacted and
   * errorMessage are cleared in the Field.
   * */
  updateField = (name: keyof K, value?: K[keyof K], opts: SetValueFnArgs & ThrowIfMissingFieldType = {}) => {
    const { throwIfMissingField, ...restOpts } = opts;

    const theField = this._getField(name, { throwIfMissingField });

    theField?.setValue(value, restOpts);
  }

  /**
   * return the data as plain Javascript object (mobx magic removed from the fields)
   * */
  get serializedData() {
    const keys = this._fieldKeys;
    return keys.reduce((seq, key) => {
      const field = this.fields[key];
      const value = field.value;
      const valueToSet = typeof value === 'string' ? trim(value) : value;
      // this is required to make sure forms that use the serializedData object
      // have the values without leading or trailing spaces
      seq[key] = valueToSet as K[keyof K];
      
      return seq;
    }, {} as Partial<K>);
  }

  /**
   * Creates an instance of FormModel.
   * initialState => an object which keys are the names of the fields and the values the initial values for the form.
   * validators => an object which keys are the names of the fields and the values are the descriptors for the validators
   */
  constructor(args: FormModelArgs<K>) {
    const { descriptors = {} as Descriptors<K>, initialState, options = {} } = args || {};
  
    this.addFields(descriptors);
    initialState && this.updateFrom(initialState, { throwIfMissingField: options.throwIfMissingField, commit: true });
    
    makeObservable(this);
  }

  _getField(name: keyof K, { throwIfMissingField = true }: ThrowIfMissingFieldType = {}) {
    const theName = name as string;
    const theField = this.fields[name];
    
    if (!theField && throwIfMissingField) {
      throw new Error(`Field "${theName}" not found`);
    }
    return theField;
  }

  _eachField(cb: (field: Field<K[keyof K], K>) => void) {
    const keys = this._fieldKeys;
    keys.forEach(key => cb(this.fields[key]));
  }

  get _fieldKeys() {
    const keys: (keyof K)[] = Object.keys(this.fields) as (keyof K)[];
    return keys;
  }

  resetInteractedFlag() {
    this._eachField(field => field.resetInteractedFlag());
  }

  disableFields = (fieldKeys: keyof K[]) => {
    if (!Array.isArray(fieldKeys)) throw new TypeError('fieldKeys should be an array with the names of the fields to disable');
    fieldKeys.forEach(key => {
      const field = this._getField(key);
      field.setDisabled(true);
    });
  }

  _createField({ name, descriptor }: { name: keyof K, descriptor: ValidatorDescriptor<K[keyof K], K> }) {
    const { value, ...restDescriptor } = descriptor;
    extendObservable(this.fields, {
      [name]: new Field(this, value as K[keyof K], restDescriptor, name as string),
    });
  }

  addFields = (fieldsDescriptor: Descriptors<K>) => {
    if (fieldsDescriptor == null || !isObject(fieldsDescriptor)) {
      throw new Error('fieldDescriptor has to be an Object');
    }

    const fieldsToAdd = Object.keys(fieldsDescriptor) as (keyof K)[];
    fieldsToAdd.forEach(key => {
      this._createField({ name: key, descriptor: fieldsDescriptor[key] });
    });
  };

  enableFields(fieldKeys: (keyof K)[]) {
    if (!Array.isArray(fieldKeys)) throw new TypeError('fieldKeys should be an array with the names of the fields to disable');
    fieldKeys.forEach(key => {
      const field = this._getField(key);
      field.setDisabled(false);
    });
  }

  resetValidatedOnce() {
    this._fieldKeys.forEach(key => {
      this.fields[key].resetValidatedOnce();
    });
  }
}

/**
 * return an instance of a FormModel refer to the constructor
 *
 */
export const createModel = <T>(args: FormModelArgs<T> ) => new FormModel(args);

export const createModelFromState = <T>(initialState: Partial<T> = {}, validators: Descriptors<T>, options?: ThrowIfMissingFieldType) => {
  const theValidators = validators || {};
  
  const stateKeys = Object.keys(initialState);
  const validatorsKeys = Object.keys(theValidators);
  
  const descriptors = Array.from(new Set([...stateKeys, ...validatorsKeys])).reduce((seq, key) => {
    const res = theValidators[key as keyof T] || {};
    seq[key as keyof T] = res;
    return seq;
  }, {} as Descriptors<T>);

  return createModel({ initialState, descriptors, options });
};
