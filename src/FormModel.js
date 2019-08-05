import { observable, computed, extendObservable, action, toJS } from 'mobx';
import clsc from 'coalescy';
import trim from 'jq-trim';
import Field from './Field';

/**
 * a helper class to generate a dynamic form
 * provided some keys and validators descriptors
 *
 * @export
 * @class FormModel
 */
export class FormModel {
  // TODO: what would be a better name for this??
  // I'm not convinced, but I guess this is good enough for now
  @computed
  get dataIsReady() {
    return this.interacted && this.requiredAreFilled && this.valid;
  }

  @computed
  get requiredFields() {
    const keys = Object.keys(this.fields);
    return keys.filter(key => this.fields[key].required);
  }

  @computed
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

  @computed
  get atLeastOneRequiredIsFilled() {
    return this.requiredFields.some(key => !!this.fields[key].hasValue);
  }

  @observable
  fields = {};

  // whether or not the there is a validation
  // process running
  @observable
  _validating = false;

  // flag to indicate whether the form is valid or not
  // since some of the validators might be async validators
  // this value might be false until the validation process finish
  @computed
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
  @computed
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
  @action
  restoreInitialValues() {
    this._eachField(field => field.restoreInitialValue());
  }

  /**
   * Set multiple values to more than one field a time using an object
   * where each key is the name of a field. The value will be set to each
   * field and from that point on the values set are considered the new
   * initial values. Validation and interacted flags are also reset if the second argument is true
   * */
  @action
  updateFrom(obj, reset = true) {
    Object.keys(obj).forEach(key => this.updateField(key, obj[key], reset));
  }

  /**
   * return the value of the field which name is provided. Aditionally a
   * default value can be provided.
   * */
  valueOf(name, defaultValue) {
    return clsc(this._getField(name).value, defaultValue);
  }

  /**
   * return the errorMessage of the field which name is provided.
   * */
  errorOf(name) {
    return this._getField(name).errorMessage;
  }

  /**
   * return the array of errors found. The array is an Array<String>
   * */
  @computed
  get summary() {
    return this._fieldKeys().reduce((seq, key) => {
      const field = this.fields[key];
      if (field.errorMessage) {
        seq.push(field.errorMessage);
      }
      return seq;
    }, []);
  }

  /**
   * Manually perform the form validation
   * */
  @action
  validate() {
    this.validating = true;

    return Promise.all(
      this._fieldKeys().map(key => {
        const field = this.fields[key];
        return Promise.resolve(field.validate(true));
      }),
    ).then(() => {
      this.validating = false;
      return Promise.resolve();
    });
  }

  /**
   * Update the value of the field identified by the provided name.
   * Optionally if reset is set to true, interacted and
   * errorMessage are cleared in the Field.
   * */
  @action
  updateField(name, value, reset) {
    const theField = this._getField(name);

    theField.setValue(value, reset);
  }

  /**
   * return the data as plain Javascript object (mobx magic removed from the fields)
   * */
  @computed
  get serializedData() {
    const keys = Object.keys(this.fields);
    return toJS(
      keys.reduce((seq, key) => {
        const field = this.fields[key];
        // this is required to make sure forms that use the serializedData object
        // have the values without leading or trailing spaces
        seq[key] = typeof field.value === 'string' ? trim(field.value) : field.value;
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
  constructor({ descriptors = {}, initialState } = {}) {
    this.addFields(descriptors);
    initialState && this.updateFrom(initialState);
  }

  _getField(name) {
    const theField = this.fields[name];
    if (!theField) {
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

  @action
  resetInteractedFlag() {
    this._eachField(field => field.resetInteractedFlag());
  }

  @action
  disableFields(fieldKeys = []) {
    fieldKeys.forEach(key => {
      const field = this.fields[key];
      if (!field) {
        throw new Error(`FormModel: Field ${key} not found`);
      }
      field.setDisabled(true);
    });
  }

  _createField({ value, name, descriptor }) {
    extendObservable(this.fields, {
      [name]: new Field(this, value, descriptor, name),
    });
  }

  @action
  addFields = fieldsDescriptor => {
    fieldsDescriptor = fieldsDescriptor || [];

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

  @action
  enableFields(fieldKeys = []) {
    fieldKeys.forEach(key => {
      const field = this.fields[key];
      if (!field) {
        throw new Error(`FormModel: Field ${key} not found`);
      }
      field.setDisabled(false);
    });
  }
}

/**
 * return an instance of a FormModel refer to the constructor
 *
 * @param {Object|Array} fieldDescriptors
 * @param {Object} initialState
 */
export const createModel = ({ descriptors, initialState }) => new FormModel({ descriptors, initialState });

export const createModelFromState = (initialState = {}, validators = {}) => {
  const stateKeys = Object.keys(initialState);
  const validatorsKeys = Object.keys(validators);

  const descriptors = Array.from(new Set([...stateKeys, ...validatorsKeys]), key => ({
    ...(validators[key] || {}),
    value: initialState[key],
    name: key,
  }));

  return createModel({ descriptors });
};
