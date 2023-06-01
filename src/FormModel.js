import { observable, computed, extendObservable, action, toJS, makeObservable } from 'mobx';
import trim from 'jq-trim';
import Field from './Field';

const toString = Object.prototype.toString;

const isObject = o => o && toString.call(o) === '[object Object]';

/**
 * a helper class to generate a dynamic form
 * provided some keys and validators descriptors
 *
 * @export
 * @class FormModel
 */
export class FormModel {
  get validatedAtLeastOnce() {
    const keys = Object.keys(this.fields);
    return keys.every(key => this.fields[key].validatedAtLeastOnce);
  }

  get dataIsReady() {
    return this.interacted && this.requiredAreFilled && this.valid;
  }

  get requiredFields() {
    const keys = Object.keys(this.fields);
    return keys.filter(key => this.fields[key].required);
  }

  get requiredAreFilled() {
    const keys = Object.keys(this.fields);
    return keys.every(key => {
      const field = this.fields[key];
      if (field.required) {
        return !!field.hasValue;
      }
      return true;
    });
  }

  fields = {};

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
    const keys = Object.keys(this.fields);
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
    const keys = this._fieldKeys();
    return keys.some(key => {
      const field = this.fields[key];
      return !!field.interacted;
    });
  }

  /**
   * Restore the initial values set at the creation time of the model
   * */
  restoreInitialValues(opts) {
    this._eachField(field => field.restoreInitialValue(opts));
  }

  commit() {
    this._eachField(field => field.commit());
  }

  get dirty() {
    return this._fieldKeys().some(key => {
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
  updateFrom(obj, { resetInteractedFlag = true, ...opts } = {}) {
    Object.keys(obj).forEach(key => this.updateField(key, obj[key], { resetInteractedFlag, ...opts }));
  }

  /**
   * return the array of errors found. The array is an Array<String>
   * */
  get summary() {
    return this._fieldKeys().reduce((seq, key) => {
      const field = this.fields[key];
      if (field.errorMessage) {
        seq.push(field.errorMessage);
      }
      return seq;
    }, []);
  }

  setValidating = validating => {
    this._validating = validating;
  };

  get validating() {
    return (
      this._validating ||
      this._fieldKeys().some(key => {
        const f = this._getField(key);
        return f.validating;
      })
    );
  }

  /**
   * Manually perform the form validation
   * */
  validate() {
    this._validating = true;

    return Promise.all(
      this._fieldKeys().map(key => {
        const field = this.fields[key];
        return Promise.resolve(field.validate({ force: true }));
      }),
    )
      .then(() => {
        this.setValidating(false);
      })
      .catch(() => {
        this.setValidating(false);
      });
  }

  /**
   * Update the value of the field identified by the provided name.
   * Optionally if reset is set to true, interacted and
   * errorMessage are cleared in the Field.
   * */
  updateField(name, value, opts = {}) {
    const { throwIfMissingField, ...restOpts } = opts;
    const theField = this._getField(name, { throwIfMissingField });

    theField?.setValue(value, restOpts);
  }

  /**
   * return the data as plain Javascript object (mobx magic removed from the fields)
   * */
  get serializedData() {
    const keys = Object.keys(this.fields);
    return toJS(
      keys.reduce((seq, key) => {
        const field = this.fields[key];
        const value = toJS(field.value);
        // this is required to make sure forms that use the serializedData object
        // have the values without leading or trailing spaces
        seq[key] = typeof value === 'string' ? trim(value) : value;
        return seq;
      }, {}),
    );
  }

  /**
   * Creates an instance of FormModel.
   *
   * @param {Object|Array} [descriptors={}]
   * @param {Object} [initialState={}]
   *
   * initialState => an object which keys are the names of the fields and the values the initial values for the form.
   * validators => an object which keys are the names of the fields and the values are the descriptors for the validators
   */
  constructor({ descriptors = {}, initialState, options = {} } = {}) {
    makeObservable(this, {
      resetValidatedOnce: action,
      validatedAtLeastOnce: computed,
      dataIsReady: computed,
      requiredFields: computed,
      requiredAreFilled: computed,
      fields: observable,
      _validating: observable,
      setValidating: action,
      validating: computed,
      valid: computed,
      interacted: computed,
      restoreInitialValues: action,
      updateFrom: action,
      summary: computed,
      validate: action,
      updateField: action,
      serializedData: computed,
      resetInteractedFlag: action,
      disableFields: action,
      addFields: action,
      enableFields: action,
      commit: action,
      dirty: computed,
    });

    this.addFields(descriptors);
    initialState && this.updateFrom(initialState, { throwIfMissingField: options.throwIfMissingField, commit: true });
  }

  _getField(name, { throwIfMissingField = true } = {}) {
    const theField = this.fields[name];
    if (!theField && throwIfMissingField) {
      throw new Error(`Field "${name}" not found`);
    }
    return theField;
  }

  _eachField(cb) {
    Object.keys(this.fields).forEach(key => cb(this.fields[key]));
  }

  _fieldKeys() {
    return Object.keys(this.fields);
  }

  resetInteractedFlag() {
    this._eachField(field => field.resetInteractedFlag());
  }

  disableFields(fieldKeys) {
    if (!Array.isArray(fieldKeys)) throw new TypeError('fieldKeys should be an array with the names of the fields to disable');
    fieldKeys.forEach(key => {
      const field = this._getField(key);
      field.setDisabled(true);
    });
  }

  _createField({ value, name, descriptor }) {
    extendObservable(this.fields, {
      [name]: new Field(this, value, descriptor, name),
    });
  }

  addFields = fieldsDescriptor => {
    if (fieldsDescriptor == null || (!isObject(fieldsDescriptor) && !Array.isArray(fieldsDescriptor))) {
      throw new Error('fieldDescriptor has to be an Object or an Array');
    }

    if (Array.isArray(fieldsDescriptor)) {
      fieldsDescriptor.forEach(field => {
        const { value, name, ...descriptor } = field;
        this._createField({ value, name, descriptor });
      });
      return;
    }

    const fieldsToAdd = Object.keys(fieldsDescriptor);
    fieldsToAdd.forEach(key => {
      const { value, ...descriptor } = fieldsDescriptor[key];
      this._createField({ value, name: key, descriptor });
    });
  };

  enableFields(fieldKeys) {
    if (!Array.isArray(fieldKeys)) throw new TypeError('fieldKeys should be an array with the names of the fields to disable');
    fieldKeys.forEach(key => {
      const field = this._getField(key);
      field.setDisabled(false);
    });
  }

  resetValidatedOnce() {
    this._fieldKeys().forEach(key => {
      this.fields[key].resetValidatedOnce();
    });
  }
}

/**
 * return an instance of a FormModel refer to the constructor
 *
 * @param {Object|Array} fieldDescriptors
 * @param {Object} initialState
 * @param {Object} options
 */
export const createModel = ({ descriptors, initialState, options }) => new FormModel({ descriptors, initialState, options });

export const createModelFromState = (initialState = {}, validators = {}, options = {}) => {
  const stateKeys = Object.keys(initialState);
  const validatorsKeys = Object.keys(validators);

  const descriptors = Array.from(new Set([...stateKeys, ...validatorsKeys]), key => ({
    ...(validators[key] || {}),
    value: initialState[key],
    name: key,
  }));

  return createModel({ descriptors, options });
};
