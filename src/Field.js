import { observable, computed, action, makeObservable } from 'mobx';
import debounce from 'debouncy';
import trim from 'jq-trim';

const isNullishOrEmpty = value => typeof value === 'undefined' || value === null || value === '';

/**
 * Field class provides abstract the validation of a single field
 */

export default class Field {
  _disabled;

  _required;

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

  get hasValue() {
    if (this._hasValueFn) {
      return this._hasValueFn(this.value);
    }
    // consider the case where the value is an array
    // we consider it actually has a value if the value is defined
    // and the array is not empy
    if (Array.isArray(this.value)) {
      return this.value.length > 0;
    }

    return !isNullishOrEmpty(this.value);
  }

  /**
   * flag to know if a validation is in progress on this field
   */
  _validating = false;

  /**
   * field to store the initial value set on this field
   * */
  _initialValue;

  /**
   * the value of the field
   * */
  _value;

  /**
   * whether the user interacted with the field
   * this means if there is any value set on the field
   * either setting it using the `setValue` or using
   * the setter `value`. This is useful to know if
   * the user has interacted with teh form in any way
   */
  _interacted;

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

  /**
   * the error message associated with this field.
   * This is used to indicate what error happened during
   * the validation process
   */
  errorMessage;

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
  _originalErrorMessage;

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
  get value() {
    return this._value;
  }

  _setValueOnly(val) {
    if (!this._interacted) {
      this._interacted = true;
    }

    if (this._value === val) {
      return;
    }

    this._value = val;
  }

  _setValue(val) {
    if (this._value !== val && this._clearErrorOnValueChange && !this.valid) {
      this.clearValidation();
    }

    this._setValueOnly(val);

    if (this._autoValidate) {
      this._debouncedValidation();
    }
  }

  /**
   * setter for the value of the field
   */
  set value(val) {
    this._setValue(val);
  }

  /**
   * set the value of the field, optionaly
   * reset the errorMessage and interacted flags
   *
   * @param {any} value
   * @param { object} params the options object
   * @param {Boolean} params.resetInteractedFlag whether or not to reset the interacted flag
   *
   */
  setValue(value, { resetInteractedFlag, commit } = {}) {
    if (resetInteractedFlag) {
      this._setValueOnly(value);
      this.errorMessage = undefined;
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
  restoreInitialValue({ resetInteractedFlag = true } = {}) {
    this.setValue(this._initialValue, { resetInteractedFlag });
  }

  commit() {
    this._initialValue = this.value;
  }

  /**
   * clear the valid state of the field by
   * removing the errorMessage string. A field is
   * considered valid if the errorMessage is not empty
   */
  clearValidation() {
    this.errorMessage = undefined;
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

  async _doValidate() {
    const { _validateFn, model } = this;

    if (!_validateFn) return Promise.resolve(true);

    let ret;
    if (Array.isArray(_validateFn)) {
      for (let i = 0; i < _validateFn.length; i++) {
        const vfn = _validateFn[i];
        if (typeof vfn !== 'function') {
          throw new Error('Validator must be a function or a function[]  ');
        }
        try {
          ret = await vfn(this, model.fields, model);
          if (ret === false || ret?.error) {
            return ret;
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }
    } else {
      try {
        ret = _validateFn(this, model.fields, model);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return ret;
  }

  setDisabled(disabled) {
    if (disabled) {
      this.errorMessage = '';
    }
    this._disabled = disabled;
  }

  validate = opts => {
    this._debouncedValidation.cancel();
    return this._validate(opts);
  };

  get originalErrorMessage() {
    return this._originalErrorMessage || `Validation for "${this.name}" failed`;
  }

  setValidating = validating => {
    this._validating = validating;
  };

  get validating() {
    return this._validating;
  }

  /**
   * validate the field. If force is true the validation will be perform
   * even if the field was not initially interacted or blurred
   *
   * @param params {object} arguments object
   * @param params.force {boolean} [force=false]
   */
  _validate({ force = false } = {}) {
    const { required } = this;

    const shouldSkipValidation = this.disabled || (!required && !this._validateFn);

    if (shouldSkipValidation) return;

    if (!force) {
      const userDidntInteractedWithTheField = !this._interacted;

      if (userDidntInteractedWithTheField && !this.hasValue) {
        // if we're not forcing the validation
        // and we haven't interacted with the field
        // we asume this field pass the validation status
        this.errorMessage = undefined;
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
        this.errorMessage = typeof this._required === 'string' ? this._required : `Field: "${this.name}" is required`;
        return;
      }
      this.errorMessage = undefined;
    }

    this.setValidating(true);

    const validationTs = (this._validationTs = Date.now());

    const res = this._doValidate();

    // eslint-disable-next-line consistent-return
    return new Promise(resolve => {
      res.then(
        action(res_ => {
          if (validationTs !== this._validationTs) return; // ignore stale validations

          this.setValidating(false);
          // if the function returned a boolean we assume it is
          // the flag for the valid state
          if (typeof res_ === 'boolean') {
            this.errorMessage = res_ ? undefined : this.originalErrorMessage;
            resolve();
            return;
          }

          if (res_ && res_.error) {
            this.errorMessage = res_.error;
            resolve();
            return;
          }

          this.errorMessage = undefined;

          resolve(); // we use this to chain validators
        }),
        action((errorArg = {}) => {
          if (validationTs !== this._validationTs) return; // ignore stale validations
          this.setValidating(false);
          const { error, message } = errorArg;

          let errorMessageToSet = (error || message || '').trim() || this.originalErrorMessage;

          if (errorMessageToSet === '') {
            errorMessageToSet = undefined; // empty string is not longer a valid value for error message
          }

          this.errorMessage = errorMessageToSet;
          resolve(); // we use this to chain validators
        }),
      );
    });
  }

  setRequired = val => {
    this._required = val;
  };

  setErrorMessage(msg) {
    if (trim(msg) === '') {
      msg = undefined;
    }

    this.errorMessage = msg;
  }

  get error() {
    return this.errorMessage;
  }

  constructor(model, value, validatorDescriptor = {}, fieldName) {
    makeObservable(this, {
      _disabled: observable,
      _required: observable,
      waitForBlur: computed,
      disabled: computed,
      required: computed,
      resetInteractedFlag: action,
      hasValue: computed,
      _autoValidate: observable,
      _value: observable,
      _interacted: observable,
      _blurredOnce: observable,
      blurred: computed,
      errorMessage: observable,
      error: computed,
      autoValidate: computed,
      valid: computed,
      validating: computed,
      _validating: observable,
      setValidating: action,
      interacted: computed,
      _setValueOnly: action,
      _setValue: action,
      setValue: action,
      restoreInitialValue: action,
      commit: action,
      clearValidation: action,
      markBlurredAndValidate: action,
      _doValidate: action,
      setDisabled: action,
      validate: action,
      originalErrorMessage: computed,
      _validate: action,
      setRequired: action,
      setErrorMessage: action,
    });

    const DEBOUNCE_THRESHOLD = 300;

    this._value = value;
    this.model = model;
    this.name = fieldName;

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
