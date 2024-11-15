declare module 'mobx-form' {
  
  export type Ret = boolean | { error: string } | void;
  export interface IValidatorFn<FieldType, ModelType> {
    (field: IField<FieldType, ModelType>, fields: { [P in keyof ModelType]: IField<ModelType[P], ModelType> }, formModel: IFormModel<ModelType>): Promise<Ret> | Ret;
  }

  export interface IHasValueFn<T> {
    (value: T): boolean;
  }

  export interface IValidatorDescriptor<T, K> {
    waitForBlur?: boolean;

    disabled?: boolean;

    errorMessage?: string;

    validator?: IValidatorFn<T, K> | IValidatorFn<T, K>[];

    hasValue?: IHasValueFn<T>;

    value?: T;

    required?: boolean | string;

    autoValidate?: boolean;

    validationDebounceThreshold?: number;

    clearErrorOnValueChange?: boolean;

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

  export interface IField<T, K> {
    
    validatedAtLeastOnce: boolean;
    
    resetValidatedOnce(): void;
    
    waitForBlur: boolean;

    disabled: boolean;

    required: boolean | string;

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

    setRequired(value: boolean | string): void;

    setErrorMessage(message: string): void;

    new (model: IFormModel<K>, value: T, validatorDescriptor: IValidatorDescriptor<T, K>, fieldName: string): IField<T, K>;
  }

  export interface IFormModel<T> {
    validatedAtLeastOnce: boolean;
    
    dataIsReady: boolean;

    requiredFields: string[];

    requiredAreFilled: boolean;
    
    resetValidatedOnce(): void;

    fields: {
      [P in keyof T]: IField<T[P], T>;
    };

    valid: boolean;

    validating: boolean;

    interacted: boolean;

    dirty: boolean;

    commit(): void;

    restoreInitialValues(options?: SetValueFnArgs): void;

    resetInteractedFlag(options?: ResetInteractedFlagType): void;

    updateFrom(obj: Partial<T>, options?: SetValueFnArgs): void;

    enableFields(fieldNames: string[]): void;

    disableFields(fieldNames: string[]): void;

    summary: string[];

    validate(): Promise<void>;

    updateField(name: string, value: any, options?: SetValueFnArgs): void;

    serializedData: T;

    addFields(descriptors: Descriptors<T>, initialState: Partial<T>): void;

    new (descriptors: object, initialState: Partial<T>);
  }

  export interface ICreateModelOpts {
    throwIfMissingField?: boolean;
  }

  export type Descriptors<T> = IValidatorDescriptor<T[keyof T], T>[] | {
    [P in keyof T]: IValidatorDescriptor<T[P], T>;
  };

  export interface ICreateModelOptions<T> {
    descriptors: Descriptors<T>;
    initialState: Partial<T>;
    options?: ICreateModelOpts;
  }

  export declare function createModel<T>(options: ICreateModelOptions<T>): IFormModel<T>;

  export declare function createModelFromState<T>(initialState: Partial<T>, descriptors: Descriptors<T>): IFormModel<T>;
}
