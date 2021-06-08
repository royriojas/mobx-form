declare module 'mobx-form' {
  export interface IValidatorFn<FieldType, ModelType> {
    (field: IField<FieldType>, fields: { [P in keyof ModelType]: IField<ModelType[P]> }, formModel: IFormModel<ModelType>): Promise<void>;
  }

  export interface IHasValueFn<T> {
    (value: T): boolean;
  }

  export interface IValidatorDescriptor<T> {
    waitForBlur?: boolean;

    disabled?: boolean;

    errorMessage?: string;

    validator?: IValidatorFn | IValidatorFn[];

    hasValue?: IHasValueFn<T>;

    value?: T;

    required?: boolean | string;

    autoValidate?: boolean;

    validationDebounceThreshold?: number;

    meta?: Record<string, any>;
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
    (value: T, options?: SetValueFnArgs): void;
  }

  export interface IRestoreIntialValueFn {
    (options?: ResetInteractedFlagType): void;
  }

  export interface ISetDisabledFn {
    (options?: DisabledType): void;
  }

  export interface IField<T> {
    waitForBlur: boolean;

    disabled: boolean;

    required: boolean;

    resetInteractedFlag(): void;

    hasValue: boolean;

    blurred: boolean;

    errorMessage?: string;

    error?: string;

    autoValidate: boolean;

    valid: boolean;

    validating: boolean;

    interacted: boolean;

    value: T;

    setValue: ISetValueFn<T>;

    restoreInitialValue: IRestoreIntialValueFn;

    commit(): void;

    clearValidation(): void;

    markBlurredAndValidate(): void;

    setDisabled: ISetDisabledFn;

    validate(options?: ForceType): Promise<void>;

    originalErrorMessage: string;

    setRequired(value: T): void;

    setErrorMessage(message: string): void;

    new (model: IFormModel<any>, value: T, validatorDescriptor: IValidatorDescriptor<T>, fieldName: string): IField<T>;
  }

  export interface IFormModel<T> {
    dataIsReady: boolean;

    requiredFields: string[];

    requiredAreFilled: boolean;

    fields: {
      [P in keyof T]: IField<T[P]>;
    };

    valid: boolean;

    validating: boolean;

    interacted: boolean;

    restoreInitialValues(options?: ResetInteractedFlagType): void;

    resetInteractedFlag(options?: ResetInteractedFlagType): void;

    updateFrom(obj: T, options?: ResetInteractedFlagType): void;

    enableFields(fieldNames: string[]): void;

    disableFields(fieldNames: string[]): void;

    summary: string[];

    validate(): Promise<void>;

    updateField(name: string, value: any, options?: SetValueFnArgs): void;

    serializedData: T;

    addFields(descriptors: IValidatorDescriptor<T>[] | IValidatorDescriptorHash): void;

    new (descriptors: object, initialState: T);
  }

  export interface ICreateModelOpts {
    throwIfMissingField?: boolean = true;
  }

  export type Descriptors<T> = IValidatorDescriptor<T[keyof T]>[] | {
    [P in keyof T]: IValidatorDescriptor<T[P]>;
  };

  export interface ICreateModelOptions<T> {
    descriptors: Descriptors<T>;
    initialState: T;
    options?: ICreateModelOpts;
  }

  export declare function createModel<T>(options: ICreateModelOptions<T>): IFormModel<T>;

  export declare function createModelFromState<T>(initialState: T, descriptors: Descriptors<T>): IFormModel<T>;
}
