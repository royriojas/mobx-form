declare module 'mobx-form' {
  export interface IValidatorFn {
    (): Promise<void>;
  }

  export interface IFields {
    [key: string]: IField<any>;
  }

  export interface IHasValueFn<T> {
    (value: T): boolean;
  }

  export interface IValidatorDescriptor<T> {
    waitForBlur?: boolean;

    disabled?: boolean;

    errorMessage?: string;

    validator?: IValidatorFn;

    hasValue?: IHasValueFn<T>;

    value: T;

    required?: boolean | string;

    autoValidate?: boolean;

    meta?: object;
  }
  export interface IValidateFn {
    (): Promise<void>;
  }

  export type ResetInteractedFlagType = {
    resetInteractedFlag?: boolean;
  };

  export type CommitType = {
    commit?: boolean;
  };

  export type DisabledType = {
    disabled?: boolean;
  };

  export type ForceType = {
    force?: boolean;
  };

  export type SetValueFnArgs = ResetInteractedFlagType & CommitType;

  export interface ISetValueFn<T> {
    (value: T, options: SetValueFnArgs): void;
  }

  export interface IRestoreIntialValueFn {
    (options: ResetInteractedFlagType): void;
  }

  export interface ISetDisabledFn {
    (options: DisabledType): void;
  }

  export interface IField<T> {
    waitForBlur: boolean;

    disabled: boolean;

    required: boolean;

    resetInteractedFlag(): void;

    hasValue: boolean;

    blurred: boolean;

    errorMessage?: string;

    autoValidate: boolean;

    valid: boolean;

    interacted: boolean;

    value: T;

    setValue: ISetValueFn;

    restoreInitialValue: IRestoreIntialValueFn;

    commit(): void;

    clearValidation(): void;

    markBlurredAndValidate(): void;

    setDisabled: ISetDisabledFn;

    validate(options: ForceType): Promise<void>;

    originalErrorMessage: string;

    setRequired(value: T): void;

    setErrorMessage(message: string): void;

    new (model: IFormModel, value: T, validatorDescriptor: IValidatorDescriptor, fieldName: string): IFilter;
  }

  export interface IvalidatorDescriptorHash {
    [key: string]: IValidatorDescriptor<any>;
  }

  export interface IFormModel<T> {
    dataIsReady: boolean;

    requiredFields: string[];

    requiredAreFilled: boolean;

    fields: IFields;

    valid: boolean;

    interacted: boolean;

    restoreInitialValues(options: RestoreInitialValuesType): void;

    resetInteractedFlag(options: ResetInteractedFlagType): void;

    updateFrom(obj: T, ResetInteractedFlagType?): void;

    enableFields(fieldNames: string[]): void;

    disableFields(fieldNames: string[]): void;

    summary: string[];

    validate(): Promise<void>;

    updateField(name: string, value: any, SetValueFnArgs): void;

    serializedData: T;

    addFields(descriptors: IValidatorDescriptor[] | IValidatorDescriptorHash);

    new (descriptors: object, initialState: T);
  }

  export interface ICreateModelOptions<T> {
    descriptors: IValidatorDescriptor[] | IValidatorDescriptorHash;
    initialState: T;
  }

  export declare function createModel<T>(options: ICreateModelOptions<T>): IFormModel;

  export declare function createModelFromState<T>(initialState: T, descriptors: IValidatorDescriptor[] | IValidatorDescriptorHash);
}