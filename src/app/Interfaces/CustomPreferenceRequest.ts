// custom-preference-request.model.ts
export interface CustomPreferenceRequest {
    items: {
      title: string;
      description: string;
      quantity: number;
      unitPrice: number;
      currencyId: string;
    }[];

    backUrls: {
      success: string;
      failure: string;
      pending: string;
    };
    autoReturn: string;
    externalReference:string;
  }
